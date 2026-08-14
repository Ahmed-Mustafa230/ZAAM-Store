import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  waitQueueTimeoutMS: 10000,
};

if (!uri) {
  throw new Error(
    'MongoDB connection string is missing. Define MONGODB_URI in your .env.local file.'
  );
}

type MongoClientPromise = Promise<MongoClient>;

declare global {
  var _mongoClientPromise: MongoClientPromise | undefined;
}

let clientPromise: MongoClientPromise | null = null;

function createClientPromise(): MongoClientPromise {
  const client = new MongoClient(uri!, options);
  const promise = client.connect();

  void promise.catch(() => {
    if (clientPromise === promise) {
      clientPromise = null;
    }
    if (global._mongoClientPromise === promise) {
      global._mongoClientPromise = undefined;
    }
  });

  return promise;
}

function getClientPromise(): MongoClientPromise {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createClientPromise();
    }
    return global._mongoClientPromise;
  }

  if (!clientPromise) {
    clientPromise = createClientPromise();
  }
  return clientPromise;
}

const clientPromiseExport = {
  then<TResult1 = MongoClient, TResult2 = never>(
    onFulfilled?: ((value: MongoClient) => TResult1 | PromiseLike<TResult1>) | null,
    onRejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return getClientPromise().then(onFulfilled, onRejected);
  },
} as unknown as MongoClientPromise;

export default clientPromiseExport;