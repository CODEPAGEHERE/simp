// app/src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap'; // Import GSAP
import localforage from 'localforage'; // Import localforage

import './App.css'; // Or your custom CSS file

function App() {
  const appTitleRef = useRef(null); // Ref for GSAP animation target
  const [tasks, setTasks] = useState([]); // State to hold tasks

  // --- IndexedDB/Localforage Setup ---
  useEffect(() => {
    // Configure localforage for your specific IndexedDB database
    localforage.config({
      name: 'MyScheduleAppDB', // Name of your IndexedDB database
      storeName: 'tasksStore', // Name of the object store for tasks
      version: 1, // Database version
    });

    // Function to load tasks from IndexedDB on component mount
    const loadTasks = async () => {
      try {
        // 'myScheduleTasks' is the key under which tasks are stored
        const savedTasks = await localforage.getItem('myScheduleTasks');
        if (savedTasks) {
          setTasks(savedTasks);
        }
      } catch (error) {
        console.error("Error loading tasks from IndexedDB:", error);
      }
    };
    loadTasks(); // Call the load function

    // This effect runs once on mount to load data
  }, []);

  // Effect to save tasks to IndexedDB whenever the 'tasks' state changes
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await localforage.setItem('myScheduleTasks', tasks);
        console.log("Tasks saved to IndexedDB.");
      } catch (error) {
        console.error("Error saving tasks to IndexedDB:", error);
      }
    };
    // Only save if tasks array is not null/undefined to avoid initial unnecessary writes
    if (tasks !== null) {
      saveTasks();
    }
  }, [tasks]); // Dependency array: runs when 'tasks' state changes

  // --- GSAP Animation for Title ---
  useEffect(() => {
    // Animate the title to fade in and slide down
    gsap.fromTo(
      appTitleRef.current,
      { opacity: 0, y: -50 }, // Starting state
      { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' } // Ending state and animation properties
    );
  }, []); // Empty dependency array means this runs once on mount

  // --- Example Task Management Functions (for local state/IndexedDB) ---
  const addTask = (title) => {
    if (!title.trim()) return; // Prevent adding empty tasks
    const newTask = { id: Date.now(), title: title.trim(), completed: false };
    setTasks(prevTasks => [...prevTasks, newTask]); // Add new task to state
  };

  const toggleTaskCompletion = (id) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task // Toggle completed status
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id)); // Remove task by ID
  };

  // --- Rendered UI with Bootstrap classes ---
  return (
    <div className="App container mt-5"> {/* Bootstrap container with top margin */}
      <h1 ref={appTitleRef} className="text-primary text-center mb-4">
        {/* You'll need to install 'bootstrap-icons' if you use i.e. <i className="bi bi-calendar-check me-2"></i> */}
        My Schedule App
      </h1>

      <div className="card p-4 shadow-sm mb-4"> {/* Card for input */}
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Add a new task..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addTask(e.target.value);
                e.target.value = ''; // Clear input after adding
              }
            }}
          />
          <button
            className="btn btn-success"
            onClick={() => {
              const input = document.querySelector('.form-control');
              addTask(input.value);
              input.value = ''; // Clear input after adding
            }}
          >
            Add Task
          </button>
        </div>
      </div>

      <div className="list-group"> {/* List group for tasks */}
        {tasks.length === 0 ? (
          <p className="text-center text-muted">No tasks yet. Add one above!</p>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span
                className={task.completed ? 'text-decoration-line-through text-muted' : ''}
                style={{ cursor: 'pointer' }}
                onClick={() => toggleTaskCompletion(task.id)}
              >
                {task.title}
              </span>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => deleteTask(task.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;