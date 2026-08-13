import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyLimitReset extends Document {
  key: string;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

const dailyLimitResetSchema = new Schema<IDailyLimitReset>(
  {
    key: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

dailyLimitResetSchema.index({ key: 1, date: 1 }, { unique: true });

dailyLimitResetSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

const DailyLimitReset =
  mongoose.models.DailyLimitReset ||
  mongoose.model<IDailyLimitReset>('DailyLimitReset', dailyLimitResetSchema);

export default DailyLimitReset;