import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScheduleListItem from '../components/ScheduleListItem';
import Loader from '../components/Loader';
import './SaveSchedule.css';

const SaveSchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_SIMP_API_POINT;

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/schedules/user?page=${page}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/login');
          }
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch schedules: ${response.statusText}`);
        }

        const data = await response.json();
        setSchedules(data.schedules);
        setPagination(data.pagination);

      } catch (err) {
        console.error("Failed to fetch schedules:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [API_BASE_URL, navigate, page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
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
    <div className="save-schedule-page-wrapper">
      <div className="save-schedule-page-content">
        <h2 className="section-title">All Your Schedules</h2>
        {schedules.length > 0 ? (
          <div className="all-schedules-list-container">
            {schedules.map((schedule) => (
              <ScheduleListItem key={schedule.id} schedule={schedule} />
            ))}
          </div>
        ) : (
          <p className="no-schedules-message">You haven't saved any schedules yet.</p>
        )}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={pageNumber === pagination.currentPage ? 'active' : ''}
              >
                {pageNumber}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SaveSchedulePage;
