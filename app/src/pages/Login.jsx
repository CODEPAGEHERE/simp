// src/pages/Login.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import '../App.css';
import Navbar from '../components/Navbar';

const Login = () => {
    const navigate = useNavigate();
    const formContainerRef = useRef(null);

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const API_BASE_URL = import.meta.env.VITE_SIMP_API_POINT;

    useEffect(() => {
        // No logo animation useEffect as logo is removed
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'identifier') {
            setIdentifier(value);
        } else if (name === 'password') {
            setPassword(value);
        }
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!identifier.trim() || !password.trim()) {
            setMessage('Please enter both your username/phone number and password.');
            setMessageType('danger');
            gsap.to(formContainerRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
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

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Login successful!');
                setMessageType('success');
                if (data.token) {
                    // FIX: Store the token with the correct key 'jwtToken'
                    localStorage.setItem('jwtToken', data.token); // <--- FIX IS HERE!
                }
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            } else {
                setMessage(data.message || 'Login failed. Please check your credentials.');
                setMessageType('danger');
                gsap.to(formContainerRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
            }
        } catch (error) {
            console.error('Network or unexpected error during login:', error);
            setMessage('Failed to connect to the server. Please check your connection or try again later.');
            setMessageType('danger');
            gsap.to(formContainerRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
        }
    };

    return (
        <>
            <Navbar />

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
                                            type="password"
                                            name="password"
                                            value={password}
                                            onChange={handleChange}
                                            placeholder="Enter your password"
                                            required
                                        />
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

                                <Button variant="secondary" type="submit" className="w-100">
                                    Login
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