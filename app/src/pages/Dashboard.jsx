import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { isAuthenticated } = useAuth();

    const [allDashboardSchedules, setAllDashboardSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_SIMP_API_POINT;

    useEffect(() => {
        const FetchDashboardSchedules = async () => {
            if (!isAuthenticated) return;

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`${API_BASE_URL}/dashboard`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    const combinedSchedules = [
                        ...(data.past3Days || []).map(s => ({ ...s, type: 'past' })),
                        ...(data.next7Days || []).map(s => ({ ...s, type: 'next' }))
                    ];

                    combinedSchedules.sort((a, b) => {
                        const dateA = a.startDate || a.createdAt;
                        const dateB = b.startDate || b.createdAt;
                        return new Date(dateA) - new Date(dateB);
                    });

                    setAllDashboardSchedules(combinedSchedules);
                    setError(null);
                } else {
                    const errorData = await response.json();
                    setError(errorData.error || errorData.message || 'Failed to load dashboard schedules.');
                }
            } catch (err) {
                setError('Network error or server unavailable when fetching dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        FetchDashboardSchedules();
    }, [isAuthenticated, API_BASE_URL]);

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
                    <Col xs={12} md={10} lg={10}>
                        <h2 className="text-light text-center mb-4">Your Recent Schedules</h2>
                        {error && <Alert variant="danger" className="mb-4 text-center">{error}</Alert>}

                        <div className="recent-schedules-scroll-container">
                            <Row className="flex-nowrap overflow-x-auto pb-3">
                                {allDashboardSchedules.length > 0 ? (
                                    allDashboardSchedules.map(schedule => (
                                        <Col xs={12} sm={6} md={4} lg={3} className="mb-4 d-flex" key={schedule.id}>
                                            <Card className="h-100 shadow-sm dashboard-card">
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
                                        </Col>
                                    ))
                                ) : (
                                    <Col xs={12}>
                                        <Alert variant="info" className="text-center">No recent schedules found.</Alert>
                                    </Col>
                                )}
                            </Row>
                        </div>

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
