import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, InputGroup } from 'react-bootstrap';
import { gsap } from 'gsap';
import Navbar from '../components/Navbar';
import '../App.css';
import './signup.css';
// Ensure 'bootstrap-icons/font/bootstrap-icons.css' is imported somewhere globally,
// like in your src/index.js or App.js, if it's not already.

const Signup = () => {
    const [name, setName] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const pageContentRef = useRef();

    useEffect(() => {
        gsap.fromTo(pageContentRef.current,
            { opacity: 0, y: -50 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );
    }, []);

    const SIMP_API_POINT = import.meta.env.VITE_SIMP_API_POINT;

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage('');
        setMessageType('');

        if (!name || !phoneNo || !username || !password) {
            setMessage('Please fill in all fields.');
            setMessageType('danger');
            gsap.to(pageContentRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
            return;
        }

        try {
            const response = await fetch(`${SIMP_API_POINT}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, phoneNo, username, password })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Signup successful!');
                setMessageType('success');
                setName('');
                setPhoneNo('');
                setUsername('');
                setPassword('');
            } else {
                setMessage(data.message || 'An error occurred during signup.');
                setMessageType('danger');
                gsap.to(pageContentRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
            }
        } catch (error) {
            console.error('Network or unexpected error:', error);
            setMessage('Failed to connect to the server. Please check your internet connection or try again later.');
            setMessageType('danger');
            gsap.to(pageContentRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
        }
    };

    return (
        <div className="signup-page-wrapper">
            {/* Navbar is fixed to the top */}
            <Navbar fixed="top" />

            {/* This div will push the content below the fixed Navbar */}
            <div className="signup-content-offset">
                {/* Re-added py-5 for top/bottom padding and kept ref */}
                <Container className="py-5" ref={pageContentRef}>
                    <Row className="justify-content-md-center">
                        {/* NEW: Adjusted Col size to make the form wider */}
                        <Col md={9} lg={8}>
                            <div className="p-4 border rounded shadow-sm bg-white">
                                <h2 className="text-center mb-4">Sign Up With Simp</h2>

                                {message && (
                                    <Alert variant={messageType} className="mb-3 text-center">
                                        {message}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    {/* First Row / "Page": Full Name & Phone Number */}
                                    <Row>
                                        <Col md={6}> {/* Half width on medium and larger screens */}
                                            <Form.Group className="mb-3" controlId="formName">
                                                <Form.Label>
                                                    <i className="bi bi-person-fill me-2"></i>Full Name
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Enter your full name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    required
                                                />
                                                <Form.Text className="text-muted">
                                                    Lowercase, 5-50 characters, alphabets only.
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}> {/* Half width on medium and larger screens */}
                                            <Form.Group className="mb-3" controlId="formPhoneNo">
                                                <Form.Label>
                                                    <i className="bi bi-phone-fill me-2"></i>Phone Number
                                                </Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    placeholder="e.g., +2348123456789 or 08123456789"
                                                    value={phoneNo}
                                                    onChange={(e) => setPhoneNo(e.target.value)}
                                                    required
                                                />
                                                <Form.Text className="text-muted">
                                                    Nigeria number. Normalized to +234XXXXXXXXXX.
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* Second Row / "Page": Username & Password */}
                                    <Row>
                                        <Col md={6}> {/* Half width on medium and larger screens */}
                                            <Form.Group className="mb-3" controlId="formUsername">
                                                <Form.Label>
                                                    <i className="bi bi-person-circle me-2"></i>Username
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Enter a unique username"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    required
                                                />
                                                <Form.Text className="text-muted">
                                                    Lowercase, letters and numbers only.
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}> {/* Half width on medium and larger screens */}
                                            <Form.Group className="mb-4" controlId="formPassword">
                                                <Form.Label>
                                                    <i className="bi bi-lock-fill me-2"></i>Password
                                                </Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    placeholder="Enter your password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                />
                                                <Form.Text className="text-muted">
                                                    Minimum 8 characters, letters and numbers only.
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Button variant="primary" type="submit" className="w-100 mt-3">
                                        <i className="bi bi-check-circle-fill me-2"></i>Sign Up
                                    </Button>
                                </Form>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div> {/* End signup-content-offset */}
        </div>
    );
};

export default Signup;