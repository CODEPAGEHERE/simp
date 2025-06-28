import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import '../App.css';
import './login.css';
import Loader from '../components/Loader'; // Ensure this path is correct
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const formContainerRef = useRef(null);
    const { login: authContextLogin } = useAuth();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const API_BASE_URL = import.meta.env.VITE_SIMP_API_POINT;

    useEffect(() => {
        gsap.fromTo(formContainerRef.current,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'identifier') {
            setIdentifier(value);
        } else if (name === 'password') {
            setPassword(value);
        }
        setMessage(''); // Clear message on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        setIsLoading(true);

        if (!identifier.trim() || !password.trim()) {
            setMessage('Please enter both your username/phone number and password.');
            setMessageType('danger');
            gsap.to(formContainerRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ identifier, password }),
            });

            // Always attempt to parse the JSON response
            const data = await response.json();

            if (response.ok) {
                // --- Login Success ---
                setMessage(data.message || 'Login successful!');
                setMessageType('success');
                if (data.token) {
                    authContextLogin(data.token, data.person); // Update global auth state
                }

                setTimeout(() => {
                    setIsLoading(false);
                    navigate('/dashboard'); // Redirect to dashboard
                }, 1000);

            } else {
                // --- Handle Errors ---
                let errorMessage = 'An unexpected error occurred. Please try again.'; // Default generic message

                // Check for rate limit error (status 429)
                if (response.status === 429) {
                    errorMessage = data.Message || 'Too many requests. Please try again later.'; // Use data.Message as defined in RateLimiter.js
                } else if (response.status === 401) {
                    // Unauthorized (e.g., invalid credentials)
                    errorMessage = data.message || 'Invalid username or password.';
                } else if (data.message) {
                    // Fallback to message from API if available for other client errors
                    errorMessage = data.message;
                }

                setMessage(errorMessage);
                setMessageType('danger');
                gsap.to(formContainerRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Network or unexpected error during login:', error);
            setMessage('Failed to connect to the server. Please check your connection or try again later.');
            setMessageType('danger');
            gsap.to(formContainerRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
            setIsLoading(false);
        }
    };

    return (
        <>
            {isLoading && <Loader />}

            <div className="login-page-background">
                <Row className="justify-content-center w-100">
                    <Col xs={12} sm={8} md={5} lg={4} className="mt-5">
                        <Container ref={formContainerRef} className="text-center p-4 p-md-5 rounded shadow-sm bg-white form-container">
                            <h2 className="text-dark fw-bold mb-4">Login to Simp Account</h2>

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3 text-start" controlId="formIdentifier">
                                    <Form.Label className="text-dark">Username or Phone Number</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><i className="bi bi-person-circle"></i></InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            name="identifier"
                                            value={identifier}
                                            onChange={handleChange}
                                            placeholder="Enter username or phone number"
                                            required
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-4 text-start" controlId="formPassword">
                                    <Form.Label className="text-dark">Password</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><i className="bi bi-lock"></i></InputGroup.Text>
                                        <Form.Control
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={password}
                                            onChange={handleChange}
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                        </Button>
                                    </InputGroup>
                                    <div className="text-end mt-1">
                                        <Link to="/forgot-password" className="text-decoration-none text-dark">
                                            Forgot Password?
                                        </Link>
                                    </div>
                                </Form.Group>

                                {message && (
                                    <Alert variant={messageType} className="mt-3">
                                        {message}
                                    </Alert>
                                )}

                                <Button
                                    variant="secondary"
                                    type="submit"
                                    className="w-100"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Logging In...' : 'Login'}
                                </Button>
                            </Form>

                            <p className="text-dark mt-3">
                                Don't have an account? <Link to="/register" className="text-dark">Sign Up Here</Link>
                            </p>
                        </Container>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default Login;