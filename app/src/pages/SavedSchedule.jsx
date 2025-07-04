// File: frontend/src/pages/SaveSchedulePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScheduleListItem from '../components/ScheduleListItem';
import Loader from '../components/Loader';
import './SaveSchedule.css';

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
                const token = localStorage.getItem('jwtToken');

                if (!token) {
                    navigate('/login'); // Redirect to login if not authenticated
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/api/schedules/user`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        navigate('/login'); // Token expired or invalid, redirect
                    }
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Failed to fetch schedules: ${response.statusText}`);
                }

                const data = await response.json();

                setSchedules(data);

                // Logic for recent schedules (used within the last week, top 5)
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                const recent = data
                    .filter(schedule => {
                        // Assuming 'lastUsedAt' is the correct field for recency and exists
                        if (!schedule.lastUsedAt) return false;
                        const scheduleDate = new Date(schedule.lastUsedAt);
                        return scheduleDate > oneWeekAgo;
                    })
                    .sort((a, b) => new Date(b.lastUsedAt) - new Date(a.lastUsedAt));

                setRecentSchedules(recent.slice(0, 5));

            } catch (err) {
                console.error("Failed to fetch schedules:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, [API_BASE_URL, navigate]);

    // Handlers for schedule actions
    const handleViewDetails = (id) => {
        navigate(`/schedule/${id}`);
    };

    const handleEditSchedule = (id) => {
        navigate(`/schedule/edit/${id}`);
    };

    const handleDeleteSchedule = async (id) => {
        // TODO: Replace window.confirm with a custom modal for better UX
        if (!window.confirm("Are you sure you want to delete this schedule? This action cannot be undone.")) {
            return;
        }
        try {
            const token = localStorage.getItem('jwtToken');

            if (!token) {
                navigate('/login');
                return;
            }

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

            // Update state by filtering out the deleted schedule. Assuming 'id' is the unique identifier
            setSchedules(prevSchedules => prevSchedules.filter(s => s.id !== id));
            setRecentSchedules(prevRecent => prevRecent.filter(s => s.id !== id));

            // TODO: Replace with custom modal for success message
            // alert('Schedule deleted successfully!');

        } catch (err) {
            console.error("Error deleting schedule:", err);
            setError(`Failed to delete: ${err.message}`);
        }
    };

    // Render Logic for Loading/Error states
    if (loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="save-schedule-error-state">
                <p>Oops! There was an error loading your schedules: {error}</p>
                <button onClick={() => window.location.reload()} className="retry-button">Try Again</button>
            </div>
        );
    }

    // Main Page Content
    return (
        <>
            <div className="save-schedule-page-wrapper">
                <div className="save-schedule-page-content">

                    {/* --- Recent Schedules Section --- */}
                    <div className="recent-schedules-section">
                        <h2 className="section-title">Recently Used Schedules</h2>
                        {recentSchedules.length > 0 ? (
                            <div className="recent-schedules-list-container">
                                {recentSchedules.map(schedule => (
                                    <ScheduleListItem
                                        key={schedule.id}
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
                            <div className="all-schedules-list-container">
                                {schedules.map(schedule => (
                                    <ScheduleListItem
                                        key={schedule.id}
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
        </>
    );
};

export default SaveSchedulePage;