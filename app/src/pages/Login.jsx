import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import '../App.css';
import './Login.css';
import Loader from '../components/Loader';
import phoneNumberUtil from 'google-libphonenumber';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const phoneUtil = phoneNumberUtil.PhoneNumberUtil.getInstance();

const usernameRegex = /^[a-zA-Z0-9]{5,20}$/;

const Login = () => {
    const Navigate = useNavigate();
    const FormContainerRef = useRef(null);
    const { login } = useAuth(); // Call useAuth here

    const [Identifier, setIdentifier] = useState('');
    const [Password, setPassword] = useState('');
    const [ShowPassword, setShowPassword] = useState(false);
    const [IsLoading, setIsLoading] = useState(false);

    const [Message, setMessage] = useState('');
    const [MessageType, setMessageType] = useState('');

    const ApiBaseUrl = import.meta.env.VITE_SIMP_API_POINT;

    useEffect(() => {
        gsap.fromTo(FormContainerRef.current,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );
    }, []);

    const HandleChange = (Event) => {
        const { name, value } = Event.target;
        if (name === 'identifier') {
            setIdentifier(value);
        } else if (name === 'password') {
            setPassword(value);
        }
        setMessage('');
    };

    const HandleSubmit = async (Event) => {
        Event.preventDefault();
        setMessage('');
        setMessageType('');

        setIsLoading(true);

        if (!Identifier.trim() || !Password.trim()) {
            setMessage('Please enter both your username/phone number and password.');
            setMessageType('danger');
            gsap.to(FormContainerRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
            setIsLoading(false);
            return;
        }

        try {
            if (usernameRegex.test(Identifier)) {
                // Identifier is a valid username
            } else {
                const phoneNumber = phoneUtil.parse(Identifier);
                if (!phoneUtil.isValidNumber(phoneNumber)) {
                    setMessage('Invalid username or phone number.');
                    setMessageType('danger');
                    gsap.to(FormContainerRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
                    setIsLoading(false);
                    return;
                }
            }
        } catch (Error) {
            setMessage('Invalid username or phone number.');
            setMessageType('danger');
            gsap.to(FormContainerRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
            setIsLoading(false);
            return;
        }

        if (Password.length < 6) {
            setMessage('Password must be at least 6 characters long.');
            setMessageType('danger');
            gsap.to(FormContainerRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
            setIsLoading(false);
            return;
        }

        try {
            const Response = await fetch(`${ApiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ identifier: Identifier.trim(), password: Password.trim() }),
            });

            if (Response.ok) {
                setMessage('Login successful!');
                setMessageType('success');
                login(); // Use the login function here
                setTimeout(() => {
                    setIsLoading(false);
                    Navigate('/dashboard', { replace: true });
                }, 1000);
            } else {
                const Data = await Response.json();
                let ErrorMessage = 'An unexpected error occurred. Please try again.';

                if (Response.status === 429) {
                    ErrorMessage = Data.Message || 'Too many requests. Please try again later.';
                } else if (Response.status === 401) {
                    ErrorMessage = Data.Message || 'Invalid username or password.';
                } else if (Data.Message) {
                    ErrorMessage = Data.Message;
                }

                setMessage(ErrorMessage);
                setMessageType('danger');
                gsap.to(FormContainerRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
                setIsLoading(false);
            }
        } catch (Error) {
            console.error('Network or unexpected error during login:', Error);
            setMessage('Failed to connect to the server. Please check your connection or try again later.');
            setMessageType('danger');
            gsap.to(FormContainerRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
            setIsLoading(false);
        }
    };

    return (
        <>
            {IsLoading && <Loader />}
            <div className="login-page-background">
                <Row className="justify-content-center w-100">
                    <Col xs={12} sm={8} md={5} lg={4} className="mt-5">
                        <Container ref={FormContainerRef} className="text-center p-8 p-md-4 rounded shadow-lg bg-whte form-container">
                            <h2 className="text-dark fw-bold mb-4">Login Your Simp Account</h2>

                            <Form onSubmit={HandleSubmit}>
                                <Form.Group className="mb-3 text-start" controlId="formIdentifier">
                                    <Form.Label className="text-dark">Username or Phone Number</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><i className="bi bi-person-circle"></i></InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            name="identifier"
                                            value={Identifier}
                                            onChange={HandleChange}
                                            placeholder="Enter username or phone number"
                                            required
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-4 text-start" controlId="formPassword">
                                    <Form.Label className="text-dark">Password</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type={ShowPassword ? "text" : "password"}
                                            name="password"
                                            value={Password}
                                            onChange={HandleChange}
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => setShowPassword(!ShowPassword)}
                                        >
                                            <i className={`bi ${ShowPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                        </Button>
                                    </InputGroup>
                                    <div className="text-end mt-1">
                                        <Link to="/forgot-password" className="text-decoration-none text-dark">
                                            Forgot Password?
                                        </Link>
                                    </div>
                                </Form.Group>

                                {Message && (
                                    <Alert variant={MessageType} className="mt-3">
                                        {Message}
                                    </Alert>
                                )}

                                <Button
                                    variant="secondary"
                                    type="submit"
                                    className="w-100"
                                    disabled={IsLoading}
                                >
                                    {IsLoading ? 'Logging In...' : 'Login'}
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
