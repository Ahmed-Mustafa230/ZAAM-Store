import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) {
      return errorResponse('Authentication required.', 401);
    }
    if (session.user.role !== 'admin') {
      return errorResponse('Access denied. Admin privileges required.', 403);
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'dashboard';

    const [
      paidOrdersAgg,
      customersCount,
      productsCount,
      recentOrders,
      topProductsAgg,
      monthlyRevenueAgg,
      customerGrowthAgg,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
      ]),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments(),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10),
      Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            name: { $first: '$items.name' },
            totalSold: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $nin: ['cancelled', 'refunded'] },
            createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) },
          },
        },
        {
          $group: {
            _id: { $month: '$createdAt' },
            revenue: { $sum: '$totalPrice' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $nin: ['cancelled', 'refunded'] },
            createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) },
          },
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: null,
            categories: { $addToSet: '$items.product' },
          },
        },
      ]),
      User.aggregate([
        {
          $match: {
            role: 'customer',
            createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) },
          },
        },
        {
          $group: {
            _id: { $month: '$createdAt' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const totalRevenue = paidOrdersAgg.length > 0 ? paidOrdersAgg[0].total : 0;
    const orderCount = paidOrdersAgg.length > 0 ? paidOrdersAgg[0].count : 0;

    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const monthlyRevenue = monthNames.map((month, i) => {
      const found = monthlyRevenueAgg.find((m: { _id: number }) => m._id === i + 1);
      return {
        month,
        revenue: found ? found.revenue : 0,
        orders: found ? found.orders : 0,
      };
    });

    const customerGrowth = monthNames.map((month, i) => {
      const found = customerGrowthAgg.find((m: { _id: number }) => m._id === i + 1);
      return {
        month,
        customers: found ? found.count : 0,
      };
    });

    const totalNewCustomers = customerGrowth.reduce((sum: number, m: { customers: number }) => sum + m.customers, 0);

    const recentOrdersData = recentOrders.map((order) => ({
      id: order._id,
      orderId: `#ZAAM-${String(order._id).slice(-6).toUpperCase()}`,
      customer: (order.user as { name?: string })?.name || 'Unknown',
      email: (order.user as { email?: string })?.email || '',
      date: order.createdAt.toISOString().split('T')[0],
      total: order.totalPrice,
      status: order.status,
      items: order.items.length,
    }));

    const topProducts = await Promise.all(
      topProductsAgg.map(async (item: { _id: string; name: string; totalSold: number; revenue: number }) => {
        const product = await Product.findById(item._id).select('images');
        const image = product?.images?.[0]?.secure_url || product?.images?.[0]?.url || '';
        return {
          _id: item._id,
          name: item.name,
          sales: item.totalSold,
          revenue: item.revenue,
          image,
        };
      })
    );

    const categoryBreakdown = await Order.aggregate([
      {
        $match: {
          status: { $nin: ['cancelled', 'refunded'] },
          createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) },
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$productInfo.category',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          count: { $sum: '$items.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    const totalCategoryRevenue = categoryBreakdown.reduce((sum: number, c: { revenue: number }) => sum + c.revenue, 0);

    const categoryData = categoryBreakdown.map((cat: { _id: string | null; revenue: number; count: number }) => ({
      category: cat._id || 'Uncategorized',
      revenue: cat.revenue,
      count: cat.count,
      percentage: totalCategoryRevenue > 0 ? Math.round((cat.revenue / totalCategoryRevenue) * 100) : 0,
    }));

    const statsCards = {
      totalRevenue,
      totalOrders: orderCount,
      totalCustomers: customersCount,
      totalProducts: productsCount,
      pendingOrders,
      newCustomersThisYear: totalNewCustomers,
    };

    if (type === 'analytics') {
      return successResponse({
        statsCards,
        monthlyRevenue,
        topProducts,
        categoryBreakdown: categoryData,
        customerGrowth,
      });
    }

    return successResponse({
      statsCards,
      recentOrders: recentOrdersData,
      topProducts,
      monthlyRevenue,
      categoryBreakdown: categoryData,
      customerGrowth,
    });
  } catch (error) {
    return handleError(error, 'fetching admin stats');
  }
}
