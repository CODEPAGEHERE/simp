// src/components/ScheduleListItem.jsx
import React from 'react';
import './ScheduleListItem.css'; // Styles for individual list item

const ScheduleListItem = ({ schedule, onView, onEdit, onDelete }) => {
    // Assuming schedule object properties like _id, title, description, createdAt, lastUsedAt
    // Adjust these based on your actual backend data structure.
    const { _id, title, description, createdAt, lastUsedAt } = schedule;

    // Helper to format dates nicely
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (e) {
            return 'Invalid Date'; // Handle potential invalid date strings
        }
    };

    return (
        <div className="schedule-list-item">
            <div className="schedule-details">
                <h3 className="schedule-title">{title || 'Untitled Schedule'}</h3>
                {description && <p className="schedule-description">{description}</p>}
                <p className="schedule-meta">Created: {formatDate(createdAt)}</p>
                {lastUsedAt && <p className="schedule-meta">Last Used: {formatDate(lastUsedAt)}</p>}
            </div>
            <div className="schedule-actions">
                <button onClick={() => onView(_id)} className="action-button view-button">View</button>
                <button onClick={() => onEdit(_id)} className="action-button edit-button">Edit</button>
                <button onClick={() => onDelete(_id)} className="action-button delete-button">Delete</button>
            </div>
        </div>
    );
};

export default ScheduleListItem;