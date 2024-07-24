const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const Task = require('./models/Task');
const { redisClient, mongoose } = require('./config');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const TASK_KEY = 'FULLSTACK_TASK_SRAVANI';
let tasks = [];

async function loadTasksFromRedis() {
  const tasksData = await redisClient.get(TASK_KEY);
  tasks = tasksData ? JSON.parse(tasksData) : [];
}

loadTasksFromRedis();

async function saveTasksToRedis() {
    await redisClient.set(TASK_KEY, JSON.stringify(tasks));
    console.log('Tasks saved to Redis:', tasks);
}

async function moveTasksToMongoDB() {
    if (tasks.length >= 50) {
      console.log('Moving tasks to MongoDB:', tasks);
      try {
        await Task.insertMany(tasks);
        tasks = [];
        await redisClient.del(TASK_KEY);
        console.log('Tasks moved to MongoDB and Redis cache cleared');
      } catch (error) {
        console.error('Error moving tasks to MongoDB:', error);
      }
    }
  }

app.get('/fetchAllTasks', (req, res) => {
  res.json(tasks);
});

io.on('connection', (socket) => {
    console.log('New client connected');
  
    socket.on('addTask', async (task) => {
      tasks.push(task);
      console.log('Task added:', task);
      await saveTasksToRedis();
      await moveTasksToMongoDB();
      io.emit('taskList', tasks);
    });
  
    socket.on('deleteTask', async (taskId) => {
      tasks = tasks.filter(task => task.id !== taskId);
      console.log('Task deleted:', taskId);
      await saveTasksToRedis();
      io.emit('taskList', tasks);
    });
  
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
  

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
