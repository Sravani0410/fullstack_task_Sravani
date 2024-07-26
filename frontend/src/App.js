import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './index.css';

// const socket = io('http://localhost:4000');
const socket = io('https://fullstack-task-sravani-backend-app.onrender.com');
// const socket = io('https://fullstack-sravani-backend.onrender.com');

function App() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // axios.get('https://fullstack-sravani-backend.onrender.com/fetchAllTasks')
    // axios.get('http://localhost:4000/fetchAllTasks')
    axios.get('https://fullstack-task-sravani-backend-app.onrender.com/fetchAllTasks')
      .then(response => {
        setTasks(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
        setError('Error fetching tasks');
        setLoading(false);
      });

    socket.on('taskList', (tasks) => {
        console.log("tasks",tasks)
      setTasks(tasks);
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      setError('WebSocket connection error');
    });

    return () => {
      socket.off('taskList');
      socket.off('connect_error');
    };
  }, []);

  const handleAddTask = () => {
    if (!task.trim()) {
      setError('Task cannot be empty');
      return;
    }
    const newTask = { id: new Date() , name: task };
    socket.emit('addTask', newTask); 
    setTask('');
    setError(null);
  };

  const handleDeleteTask = (taskId) => {
    socket.emit('deleteTask', taskId);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          <span className="mr-2">📓</span> Note App
        </h1>
        <div className="flex mb-4">
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="New Note..."
            className="border rounded-l p-2 flex-grow"
          />
          <button 
            onClick={handleAddTask}
            className="bg-orange-500 text-white p-2 rounded-r"
          >
            + Add
          </button>
        </div>
        {loading ? (
          <p className="text-gray-500">Loading tasks...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <h2 className="font-bold mb-2">Notes</h2>
            <ul className="list-disc pl-5 overflow-y-auto h-40">
              {tasks.map(task => (
                <li key={task.id} className="flex justify-between items-center mb-2">
                  <div>
                    <strong className="text-lg">{task.name}</strong>
                    <span className="block text-gray-500 text-sm">
                      {new Date(task.id).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="bg-red-500 text-white p-1 rounded ml-4"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
