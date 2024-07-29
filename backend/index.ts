import express, { Request, Response } from 'express';
import http from 'http';
import socketIo, { Server as SocketIOServer, Socket } from 'socket.io';
import cors from 'cors';
import Task from './models/Task';
import { redisClient, mongoose } from './config';

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  'http://localhost:3000', 
  'https://fullstack-task-sravani.vercel.app'
];
const io: SocketIOServer = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  }
});
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(express.json());

const TASK_KEY = 'FULLSTACK_TASK_SRAVANI';
let tasks: any[] = [];

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

  app.get('/fetchAllTasks', (req: Request, res: Response) => {
    res.json(tasks);
  });
  

io.on('connection', (socket:Socket) => {
    console.log('New client connected');
  
    socket.on('addTask', async (task:any) => {
      tasks.push(task);
      console.log('Task added:', task);
      await saveTasksToRedis();
      await moveTasksToMongoDB();
      io.emit('taskList', tasks);
    });
  
    socket.on('deleteTask', async (taskId:string) => {
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
