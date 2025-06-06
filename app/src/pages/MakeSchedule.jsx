// src/pages/MakeSchedule.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Alert } from 'react-bootstrap';
import Nav from '../components/Nav';
import '../App.css';
import './makeschedule.css';

const MakeSchedule = () => {
    const navigate = useNavigate();

    const [mainTask, setMainTask] = useState({
        name: '',
        totalDuration: { hh: '', mm: '', ss: '' },
    });

    const [subTasks, setSubTasks] = useState([
        {
            name: '',
            duration: { hh: '', mm: '', ss: '' },
        },
    ]);

    const [isLoading, setIsLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'danger'

    const API_BASE_URL = import.meta.env.VITE_SIMP_API_POINT;

    const handleLogout = () => {
        console.log("DEBUG(MakeSchedule): Attempting to log out.");
        localStorage.removeItem('jwtToken');
        navigate('/login');
    };

    // --- State Change Handlers (No changes here, they are fine) ---
    const handleMainTaskNameChange = (e) => {
        setMainTask((prevTask) => ({
            ...prevTask,
            name: e.target.value,
        }));
    };

    const handleMainTaskDurationChange = (e) => {
        const { name, value } = e.target;
        setMainTask((prevTask) => {
            const parsedValue = parseInt(value, 10);
            let updatedValue = value;

            if (!isNaN(parsedValue)) {
                if (name === 'mm' || name === 'ss') {
                    updatedValue = String(Math.max(0, Math.min(59, parsedValue))).padStart(2, '0');
                } else if (name === 'hh') {
                    updatedValue = String(Math.max(0, parsedValue)).padStart(2, '0');
                }
            } else if (value !== '') {
                updatedValue = '';
            }

            return {
                ...prevTask,
                totalDuration: {
                    ...prevTask.totalDuration,
                    [name]: updatedValue,
                },
            };
        });
    };

    const handleSubTaskNameChange = (index, e) => {
        const newSubTasks = [...subTasks];
        newSubTasks[index].name = e.target.value;
        setSubTasks(newSubTasks);
    };

    const handleSubTaskDurationChange = (index, e) => {
        const { name, value } = e.target;
        setSubTasks((prevSubTasks) => {
            const newSubTasks = [...prevSubTasks];
            const currentDuration = newSubTasks[index].duration;
            const parsedValue = parseInt(value, 10);
            let updatedValue = value;

            if (!isNaN(parsedValue)) {
                if (name === 'mm' || name === 'ss') {
                    updatedValue = String(Math.max(0, Math.min(59, parsedValue))).padStart(2, '0');
                } else if (name === 'hh') {
                    updatedValue = String(Math.max(0, parsedValue)).padStart(2, '0');
                }
            } else if (value !== '') {
                updatedValue = '';
            }

            newSubTasks[index].duration = {
                ...currentDuration,
                [name]: updatedValue,
            };
            return newSubTasks;
        });
    };

    const addSubTask = () => {
        setSubTasks((prevSubTasks) => [
            ...prevSubTasks,
            { name: '', duration: { hh: '', mm: '', ss: '' } },
        ]);
    };

    // --- Core API Submission Logic ---
    // This function now always sends the schedule to be saved
    const sendSaveScheduleToBackend = async (redirectAfterSave = false) => {
        setIsLoading(true);
        setResponseMessage('');
        setMessageType('');

        const token = localStorage.getItem('jwtToken');
        if (!token) {
            setResponseMessage('Authentication required. Please log in.');
            setMessageType('danger');
            setIsLoading(false);
            navigate('/login');
            return;
        }

        // Basic client-side validation
        if (!mainTask.name.trim()) {
            setResponseMessage('Main task name is required.');
            setMessageType('danger');
            setIsLoading(false);
            return;
        }
        if (subTasks.some(sub => !sub.name.trim())) {
             setResponseMessage('All sub-task names are required.');
             setMessageType('danger');
             setIsLoading(false);
             return;
        }
        // You might want to add more robust validation for durations here if needed.
        // E.g., if a sub-task has a name, it must have at least one duration component.

        const payload = {
            mainTask: {
                name: mainTask.name,
                totalDuration: mainTask.totalDuration,
            },
            subTasks: subTasks.map(sub => ({
                name: sub.name,
                duration: sub.duration,
            })),
            // No 'status' field sent from frontend for initial creation, backend handles it
        };

        try {
            // Use the single backend endpoint for creating schedules
            const response = await fetch(`${API_BASE_URL}/api`, { // Changed endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                setResponseMessage(data.message || 'Schedule saved successfully!');
                setMessageType('success');
                console.log("DEBUG(MakeSchedule): Schedule saved success:", data);

                // Handle redirection based on which button was clicked
                if (redirectAfterSave) {
                    setTimeout(() => {
                        navigate('/saved-schedules'); // Redirect to saved schedules page
                    }, 1500); // Give user a moment to see success message
                } else {
                    // For 'Save Schedule' button, clear form and show success message
                    setMainTask({ name: '', totalDuration: { hh: '', mm: '', ss: '' } });
                    setSubTasks([{ name: '', duration: { hh: '', mm: '', ss: '' } }]);
                }

            } else {
                setResponseMessage(data.message || 'Failed to save schedule.');
                setMessageType('danger');
                console.error("DEBUG(MakeSchedule): Schedule save failed:", response.status, data);
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('jwtToken');
                    navigate('/login');
                }
            }
        } catch (error) {
            console.error('DEBUG(MakeSchedule): Network or unexpected error:', error);
            setResponseMessage('Network error or server unavailable. Please try again.');
            setMessageType('danger');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSchedule = (e) => {
        e.preventDefault();
        sendSaveScheduleToBackend(false); // Do NOT redirect after saving
    };

    const handleStartSchedule = (e) => {
        e.preventDefault();
        sendSaveScheduleToBackend(true); // Redirect to /saved-schedules after saving
    };

    return (
        <div>
            <Nav onLogout={handleLogout} />

            <div className="make-schedule-page-content">
                <div className="form-container">
                    <h2 className="form-heading">Create Schedule</h2>

                    {responseMessage && (
                        <Alert variant={messageType} className="mb-3 text-center">
                            {responseMessage}
                        </Alert>
                    )}

                    <form>
                        {/* Main Task Name and Total Duration */}
                        <div className="input-group-row">
                            <div className="input-field-half">
                                <label htmlFor="taskName">Task Name / Purpose:</label>
                                <input
                                    type="text"
                                    id="taskName"
                                    name="name"
                                    value={mainTask.name}
                                    onChange={handleMainTaskNameChange}
                                    className="form-input"
                                    placeholder="e.g., Inter-house Sports Event"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="input-field-half">
                                <label>Total Duration (HH : MM : SS):</label>
                                <div className="time-inputs-group">
                                    <input type="number" name="hh" value={mainTask.totalDuration.hh} onChange={handleMainTaskDurationChange} className="form-input time-input" placeholder="HH" min="0" disabled={isLoading} />
                                    <span>:</span>
                                    <input type="number" name="mm" value={mainTask.totalDuration.mm} onChange={handleMainTaskDurationChange} className="form-input time-input" placeholder="MM" min="0" max="59" disabled={isLoading} />
                                    <span>:</span>
                                    <input type="number" name="ss" value={mainTask.totalDuration.ss} onChange={handleMainTaskDurationChange} className="form-input time-input" placeholder="SS" min="0" max="59" disabled={isLoading} />
                                </div>
                            </div>
                        </div>

                        <hr className="bold-hr" />

                        {/* Sub-Tasks Section */}
                        <h3 className="sub-heading">Breakdown of Units:</h3>
                        {subTasks.map((subTask, index) => (
                            <div key={index} className="sub-task-item">
                                <div className="input-group-row">
                                    <div className="input-field-half">
                                        <label>Sub-Task {index + 1} Name:</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={subTask.name}
                                            onChange={(e) => handleSubTaskNameChange(index, e)}
                                            className="form-input"
                                            placeholder="e.g., Running"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="input-field-half">
                                        <label>Allocated Time (HH : MM : SS):</label>
                                        <div className="time-inputs-group">
                                            <input type="number" name="hh" value={subTask.duration.hh} onChange={(e) => handleSubTaskDurationChange(index, e)} className="form-input time-input" placeholder="HH" min="0" disabled={isLoading} />
                                            <span>:</span>
                                            <input type="number" name="mm" value={subTask.duration.mm} onChange={(e) => handleSubTaskDurationChange(index, e)} className="form-input time-input" placeholder="MM" min="0" max="59" disabled={isLoading} />
                                            <span>:</span>
                                            <input type="number" name="ss" value={subTask.duration.ss} onChange={(e) => handleSubTaskDurationChange(index, e)} className="form-input time-input" placeholder="SS" min="0" max="59" disabled={isLoading} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button type="button" onClick={addSubTask} className="plus-button" title="Add another sub-task" disabled={isLoading}>
                            +
                        </button>

                        <hr className="bold-hr" />

                        {/* Buttons for Save and Start */}
                        <div className="button-group">
                            <button
                                type="submit"
                                onClick={handleSaveSchedule}
                                className="save-button"
                                disabled={isLoading}
                            >
                                {isLoading && !responseMessage ? ( // Show spinner only if no response message yet
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                ) : (
                                    'Save Schedule'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleStartSchedule}
                                className="start-button"
                                disabled={isLoading}
                            >
                                {isLoading && !responseMessage ? ( // Show spinner only if no response message yet
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                ) : (
                                    'Start Schedule Now'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MakeSchedule;