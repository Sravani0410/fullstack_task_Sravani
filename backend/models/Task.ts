import mongoose, { Document, Schema } from 'mongoose';

interface ITask extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema: Schema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Task = mongoose.model<ITask>('assignment_SRAVANI', taskSchema);

export default Task;
