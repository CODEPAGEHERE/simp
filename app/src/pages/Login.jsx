// src/pages/Login.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Image, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import '../App.css';
import Logo from '../assets/logoh.png';

const Login = () => {
    const navigate = useNavigate();
    const pageContentRef = useRef(null);
    const logoRef = useRef(null);

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const API_BASE_URL = import.meta.env.VITE_SIMP_API_POINT;

    useEffect(() => {
        if (logoRef.current) {
            gsap.to(logoRef.current, {
                rotation: 2,
                scale: 1.02,
                yoyo: true,
                repeat: -1,
                duration: 2,
                ease: "power1.inOut",
                transformOrigin: "center center"
            });
        }
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
            gsap.to(pageContentRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
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
                // <--- NEW: Store Token and Redirect ---
                if (data.token) {
                    localStorage.setItem('token', data.token); // Store the JWT
                }
                setTimeout(() => {
                    navigate('/dashboard'); // Redirect to dashboard
                }, 1000); // Shortened timeout slightly for quicker redirection
                // --- END NEW ---
            } else {
                setMessage(data.message || 'Login failed. Please check your credentials.');
                setMessageType('danger');
                gsap.to(pageContentRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
            }
        } catch (error) {
            console.error('Network or unexpected error during login:', error);
            setMessage('Failed to connect to the server. Please check your connection or try again later.');
            setMessageType('danger');
            gsap.to(pageContentRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
        }
    };

    return (
        // ... (rest of your Login.jsx JSX code remains the same) ...
        <div className="d-flex align-items-center justify-content-center vh-100" style={{ minHeight: '100vh' }}>
            <Container ref={pageContentRef} className="text-center p-4 p-md-5 rounded shadow-sm bg-white form-container">
                <Row className="justify-content-center mb-4">
                    <Col md={8}>
                        <Image
                            src={Logo}
                            alt="Project Logo"
                            className="mb-3"
                            style={{ maxWidth: '120px', height: 'auto' }}
                            ref={logoRef}
                        />
                        <h2 className="text-primary fw-bold">Login to Your Account</h2>
                    </Col>
                </Row>

                <Form onSubmit={handleSubmit}>
                    <Row className="justify-content-center">
                        <Col md={6}>
                            <Form.Group className="mb-3 text-start" controlId="formIdentifier">
                                <Form.Label>Username or Phone Number</Form.Label>
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
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col md={6}>
                            <Form.Group className="mb-4 text-start" controlId="formPassword">
                                <Form.Label>Password</Form.Label>
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
                                    <Link to="/forgot-password" className="text-decoration-none">
                                        Forgot Password?
                                    </Link>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>

                    {message && (
                        <Alert variant={messageType} className="mt-3">
                            {message}
                        </Alert>
                    )}

                    <Row className="justify-content-center">
                        <Col md={6}>
                            <Button variant="primary" type="submit" className="w-100">
                                Login
                            </Button>
                        </Col>
                    </Row>
                </Form>

                <Row className="justify-content-center mt-3">
                    <Col md={6}>
                        <p className="text-muted">
                            Don't have an account? <Link to="/signup">Sign Up Here</Link>
                        </p>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Login;