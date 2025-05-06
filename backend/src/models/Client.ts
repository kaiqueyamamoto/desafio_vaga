import mongoose, { Document, Schema } from 'mongoose';

export interface IClient extends Document {
  name: string;
  cpfCnpj: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  cpfCnpj: {
    type: String,
    required: true,
    unique: true,
  }
}, {
  timestamps: true
});

export const Client = mongoose.model<IClient>('Client', ClientSchema); 