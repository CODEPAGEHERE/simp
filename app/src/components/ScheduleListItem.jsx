// src/components/ScheduleListItem.jsx
import React from 'react';
import './ScheduleListItem.css'; // Styles for individual list item

const ScheduleListItem = ({ schedule, isRecent, onView, onEdit, onDelete, onStart, onComplete }) => {
    // Assuming schedule object properties like id, title, description,
    // createdAt, updatedAt (for lastUsedAt), totalDurationSeconds, status, subTasks (array)
    // Adjust these based on your actual backend data structure.
    const { id, title, description, createdAt, updatedAt, totalDurationSeconds, status, subTasks } = schedule;

    // Helper to format dates nicely (e.g., "Monday, June 17, 2024")
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (e) {
            return 'Invalid Date';
        }
    };

    // Helper to format time (e.g., "01:30 PM")
    const formatTime = (dateString) => {
        if (!dateString) return '';
        try {
            const options = { hour: '2-digit', minute: '2-digit', hour12: true };
            return new Date(dateString).toLocaleTimeString(undefined, options);
        } catch (e) {
            return '';
        }
    };

    // Helper to format duration from seconds to HH:MM:SS
    const formatDuration = (totalSeconds) => {
        if (typeof totalSeconds !== 'number' || isNaN(totalSeconds) || totalSeconds < 0) return '00:00:00';
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const pad = (num) => num.toString().padStart(2, '0');
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    // Determine the class name based on isRecent prop
    const itemClassName = `schedule-list-item ${isRecent ? 'recent-item' : 'all-item'}`;

    return (
        <div className={itemClassName}>
            {isRecent ? (
                <>
                    {/* Content for Recent Schedule Item (based on Figma) */}
                    <div className="recent-item-header">
                        <h3 className="schedule-title">{title || 'Untitled Schedule'}</h3>
                        <p className="recent-item-duration">{formatDuration(totalDurationSeconds)}</p>
                    </div>
                    <p className="recent-item-date">{formatDate(updatedAt || createdAt)}</p> {/* Using updatedAt for recency */}
                    <p className="recent-item-subtasks-count">{subTasks ? subTasks.length : 0} Schedules</p> {/* Assuming this means subtasks */}
                    <div className="recent-item-actions">
                        <button onClick={() => onView(id)} className="action-button recent-edit-button">Edit</button>
                        <button onClick={() => onStart(id)} className="action-button recent-start-button">Start</button>
                    </div>
                </>
            ) : (
                <>
                    {/* Content for All Schedule Item (based on Figma) */}
                    <div className="all-item-main-info">
                        <h3 className="schedule-title">{title || 'Untitled Schedule'}</h3>
                        <p className="all-item-subtasks-count">{subTasks ? subTasks.length : 0} Schedules</p>
                    </div>
                    <div className="all-item-meta-info">
                        <p className="all-item-date">{formatDate(updatedAt || createdAt)}</p>
                        <span className="all-item-time">{formatTime(updatedAt || createdAt)}</span>
                        <span className={`all-item-status status-${status ? status.toLowerCase() : 'pending'}`}>{status || 'PENDING'}</span>
                    </div>
                    <div className="all-item-actions">
                        <button onClick={() => onEdit(id)} className="action-button all-edit-button">Edit</button>
                        <button onClick={() => onStart(id)} className="action-button all-start-button">Start</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ScheduleListItem;