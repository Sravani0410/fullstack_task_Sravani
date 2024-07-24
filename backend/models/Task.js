const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    name: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
});

const Task = mongoose.model('assignment_SRAVANI', taskSchema);

module.exports = Task;
