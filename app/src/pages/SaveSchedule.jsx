import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Nav from '../components/Nav';
import ScheduleListItem from '../components/ScheduleListItem'; 
import './SaveSchedulePage.css'; 

const SaveSchedulePage = () => {
    const [schedules, setSchedules] = useState([]);
    const [recentSchedules, setRecentSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

   
    const API_BASE_URL = import.meta.env.VITE_SIMP_API_POINT;

    useEffect(() => {
        const fetchSchedules = async () => {
            setLoading(true);
            setError(null);
            try {
                // Get JWT token from localStorage (adjust key if yours is different)
                const token = localStorage.getItem('authToken'); // Example key

                if (!token) {
                    // Redirect to login if not authenticated
                    navigate('/login');
                    return;
                }

                // Fetch all schedules for the user
                const response = await fetch(`${API_BASE_URL}/api/schedules/user`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, // Send token for authentication
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        // Token expired or invalid, redirect to login
                        navigate('/login');
                    }
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Failed to fetch schedules: ${response.statusText}`);
                }

                const data = await response.json(); // Assuming data is an array of schedule objects

                // Set all schedules
                setSchedules(data);

                // --- Logic to determine recent schedules ---
                // Assuming 'lastUsedAt' is a timestamp string from your backend (e.g., ISO 8601)
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // Get date 7 days ago

                const recent = data
                    .filter(schedule => {
                        if (!schedule.lastUsedAt) return false; // Exclude if no lastUsedAt
                        const scheduleDate = new Date(schedule.lastUsedAt);
                        return scheduleDate > oneWeekAgo; // Filter for schedules used within the last week
                    })
                    .sort((a, b) => new Date(b.lastUsedAt) - new Date(a.lastUsedAt)); // Sort by most recent first

                setRecentSchedules(recent.slice(0, 5)); // Display top 5 recent schedules

            } catch (err) {
                console.error("Failed to fetch schedules:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, [API_BASE_URL, navigate]); // Dependencies for useEffect

    // --- Handlers for schedule actions ---
    const handleViewDetails = (id) => {
        navigate(`/schedule/${id}`); // Example route for viewing details
    };

    const handleEditSchedule = (id) => {
        navigate(`/schedule/edit/${id}`); // Example route for editing
    };

    const handleDeleteSchedule = async (id) => {
        if (!window.confirm("Are you sure you want to delete this schedule? This action cannot be undone.")) {
            return;
        }
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/schedules/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to delete schedule: ${response.statusText}`);
            }

            // Update state to remove the deleted schedule without refetching all data
            setSchedules(prevSchedules => prevSchedules.filter(s => s._id !== id));
            setRecentSchedules(prevRecent => prevRecent.filter(s => s._id !== id)); // Also update recent list

            alert('Schedule deleted successfully!');

        } catch (err) {
            console.error("Error deleting schedule:", err);
            setError(`Failed to delete: ${err.message}`);
        }
    };

    // --- Render Logic ---
    if (loading) {
        return (
            <div className="save-schedule-loading-state">
                <p>Loading your schedules...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="save-schedule-error-state">
                <p>Oops! There was an error loading your schedules: {error}</p>
                <button onClick={() => window.location.reload()} className="retry-button">Try Again</button>
            </div>
        );
    }

    return (
        <div className="save-schedule-page-wrapper">
            {/* Your <Nav /> component should be rendered here or in your main App layout,
                ensuring it's fixed and covers the top of the page. */}

            <div className="save-schedule-page-content">
                <h1 className="page-title">Your Saved Schedules</h1>

                {/* --- Recent Schedules Section --- */}
                <div className="recent-schedules-section">
                    <h2 className="section-title">Recently Used Schedules</h2>
                    {recentSchedules.length > 0 ? (
                        <div className="recent-schedules-list-container">
                            {recentSchedules.map(schedule => (
                                <ScheduleListItem
                                    key={schedule._id} // Use _id from MongoDB if applicable
                                    schedule={schedule}
                                    onView={handleViewDetails}
                                    onEdit={handleEditSchedule}
                                    onDelete={handleDeleteSchedule}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="no-schedules-message">No recently used schedules to display.</p>
                    )}
                </div>

                <hr className="section-divider" />

                {/* --- All Schedules Section (The Main Scrollable List) --- */}
                <div className="all-schedules-section">
                    <h2 className="section-title">All Your Schedules</h2>
                    {schedules.length > 0 ? (
                        <div className="all-schedules-list-container"> {/* This is the scrollable container */}
                            {schedules.map(schedule => (
                                <ScheduleListItem
                                    key={schedule._id} // Use _id from MongoDB if applicable
                                    schedule={schedule}
                                    onView={handleViewDetails}
                                    onEdit={handleEditSchedule}
                                    onDelete={handleDeleteSchedule}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="no-schedules-message">You haven't saved any schedules yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SaveSchedulePage;