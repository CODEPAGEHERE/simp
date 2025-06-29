import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Your main app styles
import { useAuth } from '../context/AuthContext'; // Import useAuth to get user data

const Dashboard = () => {
    const navigate = useNavigate();
    const { userData, isAuthenticated, authToken } = useAuth();

    const [allDashboardSchedules, setAllDashboardSchedules] = useState([]); // Combined list
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_SIMP_API_POINT; // Your API base URL

    useEffect(() => {
        const FetchDashboardSchedules = async () => { // PascalCase function name
            if (!isAuthenticated || !authToken) {
                console.warn("DEBUG: Dashboard: Not authenticated or token missing.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                console.log("DEBUG: Dashboard useEffect: Attempting to fetch /dashboard...");
                const response = await fetch(`${API_BASE_URL}/dashboard`, { // Correct endpoint
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("DEBUG: Dashboard schedules fetched:", data);

                    const combinedSchedules = [
                        ...(data.past3Days || []).map(s => ({ ...s, type: 'past' })), // Add a 'type' for differentiation
                        ...(data.next7Days || []).map(s => ({ ...s, type: 'next' }))
                    ];

                    // Sort combined schedules: future schedules first by startDate, then past by createdAt
                    combinedSchedules.sort((a, b) => {
                        const dateA = a.startDate || a.createdAt;
                        const dateB = b.startDate || b.createdAt;
                        return new Date(dateA) - new Date(dateB);
                    });

                    setAllDashboardSchedules(combinedSchedules);
                    setError(null);
                } else {
                    const errorData = await response.json();
                    console.error("DEBUG: Dashboard schedules fetch failed:", response.status, errorData);
                    setError(errorData.error || errorData.message || 'Failed to load dashboard schedules.');
                }
            } catch (err) {
                console.error('DEBUG: Dashboard fetch: Network or unexpected error:', err);
                setError('Network error or server unavailable when fetching dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        FetchDashboardSchedules();
    }, [isAuthenticated, authToken, API_BASE_URL]);

    const DisplayUserName = userData?.name || userData?.username || 'User';
    const DisplayUserPhone = userData?.phoneNo ? ` (${userData.phoneNo})` : '';

    // No longer a separate renderScheduleList, directly render in the main return
    // Function to render individual card content (keeping it concise)
    const RenderCardContent = (schedule) => (
        <Card className="h-100 shadow-sm dashboard-card"> {/* Styles applied here */}
            <Card.Body>
                <Card.Title className="text-dark">{schedule.title || 'Untitled Schedule'}</Card.Title>
                <Card.Text className="text-muted">
                    {schedule.description && (
                        <>
                            {schedule.description.substring(0, 70)}...<br />
                        </>
                    )}
                    {schedule.type === 'past' && schedule.createdAt && (
                        <span>Created: {new Date(schedule.createdAt).toLocaleDateString()}</span>
                    )}
                    {schedule.type === 'next' && schedule.startDate && (
                        <span>Starts: {new Date(schedule.startDate).toLocaleDateString()}</span>
                    )}
                </Card.Text>
                <Link to={`/schedule/${schedule.id}`} className="btn btn-primary btn-sm">View Details</Link>
            </Card.Body>
        </Card>
    );


    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#333333' }}>
                <Spinner animation="border" role="status" variant="light">
                    <span className="visually-hidden">Loading dashboard...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <div className="dashboard-page-background">
            <Container className="py-4 dashboard-container">
                <Row className="justify-content-center">
                    <Col xs={12} md={10} lg={10}> {/* Wider column for the horizontal scroll */}
                        {/* Custom Greeting Message with Username and Phone Number */}
                        <h1 className="text-light text-center mb-4">Welcome, {DisplayUserName}{DisplayUserPhone}!</h1>
                        {error && <Alert variant="danger" className="mb-4 text-center">{error}</Alert>}

                        {/* Unified Section for Recent Schedules - One Horizontal Line */}
                        <h2 className="text-light text-center mb-4">Your Recent Schedules</h2>
                        <div className="recent-schedules-scroll-container"> {/* Custom container for scroll */}
                            <Row className="flex-nowrap overflow-x-auto pb-3"> {/* Bootstrap classes for horizontal scroll */}
                                {allDashboardSchedules.length > 0 ? (
                                    allDashboardSchedules.map(schedule => (
                                        <Col xs={12} sm={6} md={4} lg={3} className="mb-4 d-flex" key={schedule.id}>
                                            {/* xs=12, sm=6, md=4, lg=3 ensures responsive sizing without breaking the row */}
                                            {RenderCardContent(schedule)}
                                        </Col>
                                    ))
                                ) : (
                                    <Col xs={12}>
                                        <Alert variant="info" className="text-center">No recent schedules found.</Alert>
                                    </Col>
                                )}
                            </Row>
                        </div>

                        {/* Buttons for navigation */}
                        <div className="text-center mt-4">
                            <Link to="/make-schedule" className="btn btn-success me-2">Create New Schedule</Link>
                            <Link to="/saved-schedule" className="btn btn-outline-info">View All Saved Schedules</Link>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Dashboard;