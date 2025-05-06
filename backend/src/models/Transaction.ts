import mongoose, { Document, Schema } from 'mongoose';
import { IClient } from './Client';

export interface ITransaction extends Document {
  transactionId: string;
  client: IClient['_id'];
  date: Date;
  value: number;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  }
}, {
  timestamps: true
});

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema); 