// src/pages/MakeSchedule.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Alert } from 'react-bootstrap';
import Nav from '../components/nav';
import '../App.css'; // Assuming this imports global styles
import './makeschedule.css'; // Your specific styles for this page

const MakeSchedule = () => {
    const navigate = useNavigate();

    const [mainTask, setMainTask] = useState({
        name: '',
        totalDuration: { hh: '', mm: '', ss: '' },
    });

    const [subTasks, setSubTasks] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const API_BASE_URL = import.meta.env.VITE_SIMP_API_POINT;

    // Add first sub-task when component mounts
    useEffect(() => {
        if (subTasks.length === 0) {
            addSubTask();
        }
    }, []);

    // Helper to convert duration object to total seconds for CLIENT-SIDE validation
    const convertDurationToSeconds = (durationObj) => {
        const hh = parseInt(durationObj.hh, 10);
        const mm = parseInt(durationObj.mm, 10);
        const ss = parseInt(durationObj.ss, 10);

        const hours = isNaN(hh) ? 0 : hh;
        const minutes = isNaN(mm) ? 0 : mm;
        const seconds = isNaN(ss) ? 0 : ss;

        if (minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
            return null; // Invalid MM or SS
        }

        return (hours * 3600) + (minutes * 60) + seconds;
    };

    // --- Event Handlers for Input Changes ---
    const handleLogout = () => {
        console.log("DEBUG(MakeSchedule): Attempting to log out.");
        localStorage.removeItem('jwtToken');
        navigate('/login');
    };

    const handleMainTaskNameChange = (e) => {
        setMainTask((prevTask) => ({
            ...prevTask,
            name: e.target.value,
        }));
        setResponseMessage('');
    };

    const handleMainTaskDurationChange = (e) => {
        const { name, value } = e.target;
        setMainTask((prevTask) => {
            const parsedValue = value === '' ? '' : parseInt(value, 10);
            let updatedValue = value;

            if (!isNaN(parsedValue) && value !== '') {
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
        setResponseMessage('');
    };

    const handleSubTaskNameChange = (index, e) => {
        const newSubTasks = [...subTasks];
        newSubTasks[index].name = e.target.value;
        setSubTasks(newSubTasks);
        setResponseMessage('');
    };

    const handleSubTaskDurationChange = (index, e) => {
        const { name, value } = e.target;
        setSubTasks((prevSubTasks) => {
            const newSubTasks = [...prevSubTasks];
            const currentDuration = newSubTasks[index].duration;
            const parsedValue = value === '' ? '' : parseInt(value, 10);
            let updatedValue = value;

            if (!isNaN(parsedValue) && value !== '') {
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
        setResponseMessage('');
    };

    const addSubTask = () => {
        setSubTasks((prevSubTasks) => [
            ...prevSubTasks,
            { name: '', duration: { hh: '', mm: '', ss: '' } },
        ]);
        setResponseMessage('');
    };

    const removeSubTask = (index) => {
        if (subTasks.length === 1) {
            setResponseMessage('You must have at least one sub-task.');
            setMessageType('danger');
            return;
        }
        setSubTasks((prevSubTasks) => prevSubTasks.filter((_, i) => i !== index));
        setResponseMessage('');
    };

    // --- Core API Submission Logic ---
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

        // --- Client-Side Validation ---
        if (!mainTask.name.trim()) {
            setResponseMessage('Main task name is required.');
            setMessageType('danger');
            setIsLoading(false);
            return;
        }

        const totalDurationSecondsForValidation = convertDurationToSeconds(mainTask.totalDuration);
        if (totalDurationSecondsForValidation === null) {
            setResponseMessage('Main task duration has invalid minutes or seconds (0-59 allowed for MM/SS).');
            setMessageType('danger');
            setIsLoading(false);
            return;
        }
        if (mainTask.name.trim() && totalDurationSecondsForValidation === 0 &&
            (mainTask.totalDuration.hh === '' && mainTask.totalDuration.mm === '' && mainTask.totalDuration.ss === '')) {
            setResponseMessage('Main task with a name requires a total duration (HH:MM:SS).');
            setMessageType('danger');
            setIsLoading(false);
            return;
        }

        let sumOfSubTaskDurations = 0;
        const subTasksForPayload = [];

        for (const sub of subTasks) {
            if (!sub.name.trim()) {
                setResponseMessage('All sub-task names are required.');
                setMessageType('danger');
                setIsLoading(false);
                return;
            }

            const subTaskDurationSecondsForValidation = convertDurationToSeconds(sub.duration);
            if (subTaskDurationSecondsForValidation === null) {
                setResponseMessage(`Sub-task "${sub.name}" has invalid minutes or seconds (0-59 allowed for MM/SS).`);
                setMessageType('danger');
                setIsLoading(false);
                return;
            }
            if (sub.name.trim() && subTaskDurationSecondsForValidation === 0 &&
                (sub.duration.hh === '' && sub.duration.mm === '' && sub.duration.ss === '')) {
                setResponseMessage(`Sub-task "${sub.name}" requires an allocated time (HH:MM:SS).`);
                setMessageType('danger');
                setIsLoading(false);
                return;
            }

            sumOfSubTaskDurations += subTaskDurationSecondsForValidation;

            subTasksForPayload.push({
                name: sub.name,
                duration: sub.duration,
            });
        }

        if (sumOfSubTaskDurations > totalDurationSecondsForValidation) {
            setResponseMessage('The total duration of all sub-tasks cannot exceed the main schedule\'s total duration.');
            setMessageType('danger');
            setIsLoading(false);
            return;
        }

        const payload = {
            mainTask: {
                name: mainTask.name,
                totalDuration: mainTask.totalDuration,
            },
            subTasks: subTasksForPayload,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api`, {
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

                if (redirectAfterSave) {
                    setTimeout(() => {
                        navigate('/saved-schedules');
                    }, 1500);
                } else {
                    setMainTask({ name: '', totalDuration: { hh: '', mm: '', ss: '' } });
                    setSubTasks([]);
                }
            } else {
                setResponseMessage(data.error || data.message || 'Failed to save schedule.');
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
        sendSaveScheduleToBackend(false);
    };

    const handleStartSchedule = (e) => {
        e.preventDefault();
        sendSaveScheduleToBackend(true);
    };

    return (
        <div>
            <Nav onLogout={handleLogout} />

            <div className="make-schedule-page-content">
                <div className="form-container">
                    {/* These elements are OUTSIDE the scrolling form content, so they stay fixed at the top of the form container */}
                    <h2 className="form-heading">Create Schedule</h2>

                    {responseMessage && (
                        <Alert variant={messageType} className="mb-3 text-center">
                            {responseMessage}
                        </Alert>
                    )}

                    {/* The <form> tag itself is now a flex container */}
                    <form className="main-schedule-form">
                        {/* THIS DIV IS NOW THE SCROLLABLE AREA */}
                        <div className="form-scrollable-area">
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
                                        {subTasks.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeSubTask(index)}
                                                className="remove-subtask-button"
                                                title="Remove this sub-task"
                                                disabled={isLoading}
                                            >
                                                X
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addSubTask} className="plus-button" title="Add another sub-task" disabled={isLoading}>
                                +
                            </button>
                        </div> {/* END of form-scrollable-area */}

                        {/* Buttons for Save and Start - These will stay fixed at the bottom of the form */}
                        <hr className="bold-hr" /> {/* Placed outside scrollable area for fixed position */}
                        <div className="button-group">
                            <button
                                type="submit"
                                onClick={handleSaveSchedule}
                                className="save-button"
                                disabled={isLoading}
                            >
                                {isLoading && !responseMessage ? (
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
                                {isLoading && !responseMessage ? (
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