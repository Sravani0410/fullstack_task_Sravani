const io = require('socket.io-client');
const socket = io('http://localhost:4000');

socket.on('connect', () => {
  console.log('Connected to WebSocket server');

  const newTask = { name: 'Test Task from Script' };
  socket.emit('addTask', newTask);

  socket.on('taskList', (tasks) => {
    console.log('Received task list:', tasks);
    socket.disconnect();
  });
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});

socket.on('connect_error', (err) => {
  console.error('WebSocket connection error:', err);
});
