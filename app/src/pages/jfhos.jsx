import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, InputGroup } from 'react-bootstrap';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import './SignUp.css';
import Loader from '../components/Loader'; // Adjusted import path for Loader component

const Signup = () => {
    const [name, setName] = useState('');
    const [phoneNo, setPhoneNo] = useState('+234');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // New state for inline password validation messages
    const [passwordValidationMessage, setPasswordValidationMessage] = useState('');

    const pageContentRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        gsap.fromTo(pageContentRef.current,
            { opacity: 0, y: -50 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );
    }, []);

    const SIMP_API_POINT = import.meta.env.VITE_SIMP_API_POINT;

    // Handler for all input changes except password (which has its own)
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'name') setName(value);
        else if (name === 'phoneNo') setPhoneNo(value);
        else if (name === 'username') setUsername(value);

        // Clear general messages when other inputs change
        setMessage('');
        setMessageType('');
    };

    // Dedicated handler for password input changes with real-time validation feedback
    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);

        // Clear general messages and previous password specific messages on typing
        setMessage('');
        setMessageType('');

        // Client-side password validation logic (mimics backend validation)
        // This regex allows letters, numbers, and common special characters. No spaces.
        const allowedPasswordCharsRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]+$/;

        if (newPassword.length > 0) {
            if (newPassword.length < 10) { // Enforce minimum 10 characters
                setPasswordValidationMessage('Password must be at least 10 characters long.');
            } else if (!allowedPasswordCharsRegex.test(newPassword)) {
                setPasswordValidationMessage('Password can only contain letters, numbers, and common special characters (e.g., !@#$%^&*). No spaces allowed.');
            } else {
                setPasswordValidationMessage(''); // Password is valid according to client-side rules
            }
        } else {
            setPasswordValidationMessage(''); // Clear message if password field is empty
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Clear any previous messages before attempting submission
        setMessage('');
        setMessageType('');
        setPasswordValidationMessage(''); // Also clear password specific message

        setIsLoading(true);

        // --- Frontend Form Validation before sending to backend ---
        if (!name || !phoneNo || !username || !password) {
            setMessage('Please fill in all fields.');
            setMessageType('danger');
            gsap.to(pageContentRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
            setIsLoading(false);
            return;
        }

        // Re-run password validation specifically for submission, showing general alert if invalid
        const allowedPasswordCharsRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]+$/;
        if (password.length < 10) {
            setMessage('Password must be at least 9 characters long.');
            setMessageType('danger');
            gsap.to(pageContentRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
            setIsLoading(false);
            return;
        }
        if (!allowedPasswordCharsRegex.test(password)) {
            setMessage('Password can only contain letters, numbers, and common special characters (e.g., !@#$%^&*). No spaces allowed.');
            setMessageType('danger');
            gsap.to(pageContentRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
            setIsLoading(false);
            return;
        }
        // Prevent username and password from being identical (backend also checks this)
        if (username.toLowerCase().trim() === password.trim()) {
            setMessage('Username and password cannot be the same.');
            setMessageType('danger');
            gsap.to(pageContentRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
            setIsLoading(false);
            return;
        }
        // --- End Frontend Form Validation ---

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
                setMessage(data.message || 'Signup successful! Redirecting to login...');
                setMessageType('success');
                // Clear form fields on successful signup
                setName('');
                setPhoneNo('+234');
                setUsername('');
                setPassword('');
                setPasswordValidationMessage(''); // Ensure password validation message is cleared

                setTimeout(() => {
                    setIsLoading(false);
                    navigate('/login'); // Redirect to login page after success
                }, 2000); // 2-second delay for user to read success message

            } else {
                // Display error message from backend
                setMessage(data.message || 'An error occurred during signup.');
                setMessageType('danger');
                gsap.to(pageContentRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" }); // Shake effect for error
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Network or unexpected error:', error);
            setMessage('Failed to connect to the server. Please check your internet connection or try again later.');
            setMessageType('danger');
            gsap.to(pageContentRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" }); // Shake effect for error
            setIsLoading(false);
        }
    };

    return (
        <div className="signup-page-wrapper">
            {/* Conditionally render the Loader component */}
            {isLoading && <Loader />}

            <div className="signup-content-offset">
                <Container className="py-5" ref={pageContentRef}>
                    <Row className="justify-content-md-center">
                        <Col md={9} lg={8}>
                            <div className="p-4 border rounded shadow-sm bg-white">
                                <h2 className="text-center mb-4">Create Simp Account</h2>

                                {/* Alert for general messages (success/danger) */}
                                {message && (
                                    <Alert variant={messageType} className="mb-3 text-center">
                                        {message}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    {/* Full Name & Phone Number */}
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="formName">
                                                <Form.Label>
                                                    <i className="bi bi-person-fill me-2"></i>Full Name
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name" // Added name prop
                                                    placeholder="Enter your full name"
                                                    value={name}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <Form.Text className="text-muted"></Form.Text>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="formPhoneNo">
                                                <Form.Label>
                                                    <i className="bi bi-phone-fill me-2"></i>Phone Number
                                                </Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    name="phoneNo" // Added name prop
                                                    placeholder="e.g., +2348123456789 or 08123456789"
                                                    value={phoneNo}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <Form.Text className="text-muted"></Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* Username & Password */}
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="formUsername">
                                                <Form.Label>
                                                    <i className="bi bi-person-circle me-2"></i>Username
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="username" // Added name prop
                                                    placeholder="Enter a unique username"
                                                    value={username}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <Form.Text className="text-muted"></Form.Text>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-4" controlId="formPassword">
                                                <Form.Label>
                                                    <i className="bi bi-lock-fill me-2"></i>Password
                                                </Form.Label>
                                                <InputGroup>
                                                    <Form.Control
                                                        type={showPassword ? "text" : "password"}
                                                        name="password" // Added name prop
                                                        placeholder="Enter your password"
                                                        value={password}
                                                        onChange={handlePasswordChange} // Use new dedicated handler
                                                        required
                                                    />
                                                    <Button
                                                        variant="outline-secondary"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                                    </Button>
                                                </InputGroup>
                                                {/* Display inline password validation message */}
                                                {passwordValidationMessage && (
                                                    <Form.Text className="text-danger">
                                                        {passwordValidationMessage}
                                                    </Form.Text>
                                                )}
                                                {/* Display general password hint if no validation error */}
                                                {!passwordValidationMessage && (
                                                    <Form.Text className="text-muted">
                                                        
                                                    </Form.Text>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Button variant="secondary" type="submit" className="w-100 mt-3" disabled={isLoading}>
                                        <i className="bi bi-check-circle-fill me-2"></i>
                                        {isLoading ? 'Signing Up...' : 'Sign Up'}
                                    </Button>
                                </Form>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default Signup;