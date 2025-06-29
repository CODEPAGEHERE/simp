import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, InputGroup } from 'react-bootstrap';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import './SignUp.css';
import Loader from '../components/Loader';

const Signup = () => {
    const [Name, setName] = useState('');
    const [PhoneNo, setPhoneNo] = useState('+234');
    const [Username, setUsername] = useState('');
    const [Password, setPassword] = useState('');
    const [ShowPassword, setShowPassword] = useState(false);

    const [Message, setMessage] = useState('');
    const [MessageType, setMessageType] = useState('');
    const [IsLoading, setIsLoading] = useState(false);
    const [PasswordValidationMessage, setPasswordValidationMessage] = useState('');

    const PageContentRef = useRef();
    const Navigate = useNavigate();

    useEffect(() => {
        gsap.fromTo(PageContentRef.current,
            { opacity: 0, y: -50 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );
    }, []);

    const SimpApiPoint = import.meta.env.VITE_SIMP_API_POINT;

    const HandleChange = (Event) => {
        const { name, value } = Event.target;
        if (name === 'name') setName(value);
        else if (name === 'phoneNo') setPhoneNo(value);
        else if (name === 'username') setUsername(value);

        setMessage('');
        setMessageType('');
    };

    const HandlePasswordChange = (Event) => {
        const NewPassword = Event.target.value;
        setPassword(NewPassword);

        setMessage('');
        setMessageType('');

        const AllowedPasswordCharsRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]+$/;

        if (NewPassword.length > 0) {
            if (NewPassword.length < 10) {
                setPasswordValidationMessage('Password must be at least 10 characters long.');
            } else if (!AllowedPasswordCharsRegex.test(NewPassword)) {
                setPasswordValidationMessage('Password can only contain letters, numbers, and common special characters (e.g., !@#$%^&*). No spaces allowed.');
            } else {
                setPasswordValidationMessage('');
            }
        } else {
            setPasswordValidationMessage('');
        }
    };

    const HandleSubmit = async (Event) => {
        Event.preventDefault();

        setMessage('');
        setMessageType('');
        setPasswordValidationMessage('');

        setIsLoading(true);

        if (!Name || !PhoneNo || !Username || !Password) {
            setMessage('Please fill in all fields.');
            setMessageType('danger');
            gsap.to(PageContentRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
            setIsLoading(false);
            return;
        }

        const AllowedPasswordCharsRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]+$/;
        if (Password.length < 10) {
            setMessage('Password must be at least 9 characters long.');
            setMessageType('danger');
            gsap.to(PageContentRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
            setIsLoading(false);
            return;
        }
        if (!AllowedPasswordCharsRegex.test(Password)) {
            setMessage('Password can only contain letters, numbers, and common special characters (e.g., !@#$%^&*). No spaces allowed.');
            setMessageType('danger');
            gsap.to(PageContentRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
            setIsLoading(false);
            return;
        }
        if (Username.toLowerCase().trim() === Password.trim()) {
            setMessage('Username and password cannot be the same.');
            setMessageType('danger');
            gsap.to(PageContentRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
            setIsLoading(false);
            return;
        }

        try {
            const Response = await fetch(`${SimpApiPoint}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Name: Name, PhoneNo: PhoneNo, Username: Username, Password: Password }) // FIX: Changed keys to PascalCase
            });

            const Data = await Response.json(); // Changed 'data' to 'Data'

            if (Response.ok) {
                setMessage(Data.Message || 'Signup successful! Redirecting to login...'); // FIX: Changed 'data.message' to 'Data.Message'
                setMessageType('success');
                setName('');
                setPhoneNo('+234');
                setUsername('');
                setPassword('');
                setPasswordValidationMessage('');

                setTimeout(() => {
                    setIsLoading(false);
                    Navigate('/login');
                }, 2000);

            } else {
                setMessage(Data.Message || 'An error occurred during signup.'); // FIX: Changed 'data.message' to 'Data.Message'
                setMessageType('danger');
                gsap.to(PageContentRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
                setIsLoading(false);
            }
        } catch (Error) { // Changed 'error' to 'Error'
            console.error('Network or unexpected error:', Error);
            setMessage('Failed to connect to the server. Please check your internet connection or try again later.');
            setMessageType('danger');
            gsap.to(PageContentRef.current, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
            setIsLoading(false);
        }
    };

    return (
        <div className="signup-page-wrapper">
            {IsLoading && <Loader />}

            <div className="signup-content-offset">
                <Container className="py-5" ref={PageContentRef}>
                    <Row className="justify-content-md-center">
                        <Col md={9} lg={8}>
                            <div className="p-4 border rounded shadow-sm bg-white">
                                <h2 className="text-center mb-4">Create Simp Account</h2>

                                {Message && (
                                    <Alert variant={MessageType} className="mb-3 text-center">
                                        {Message}
                                    </Alert>
                                )}

                                <Form onSubmit={HandleSubmit}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="formName">
                                                <Form.Label>
                                                    <i className="bi bi-person-fill me-2"></i>Full Name
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    placeholder="Enter your full name"
                                                    value={Name}
                                                    onChange={HandleChange}
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
                                                    name="phoneNo"
                                                    placeholder="e.g., +2348123456789 or 08123456789"
                                                    value={PhoneNo}
                                                    onChange={HandleChange}
                                                    required
                                                />
                                                <Form.Text className="text-muted"></Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="formUsername">
                                                <Form.Label>
                                                    <i className="bi bi-person-circle me-2"></i>Username
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="username"
                                                    placeholder="Enter a unique username"
                                                    value={Username}
                                                    onChange={HandleChange}
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
                                                        type={ShowPassword ? "text" : "password"}
                                                        name="password"
                                                        placeholder="Enter your password"
                                                        value={Password}
                                                        onChange={HandlePasswordChange}
                                                        required
                                                    />
                                                    <Button
                                                        variant="outline-secondary"
                                                        onClick={() => setShowPassword(!ShowPassword)}
                                                    >
                                                        <i className={`bi ${ShowPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                                    </Button>
                                                </InputGroup>
                                                {PasswordValidationMessage && (
                                                    <Form.Text className="text-danger">
                                                        {PasswordValidationMessage}
                                                    </Form.Text>
                                                )}
                                                {!PasswordValidationMessage && (
                                                    <Form.Text className="text-muted">
                                                        
                                                    </Form.Text>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Button variant="secondary" type="submit" className="w-100 mt-3" disabled={IsLoading}>
                                        <i className="bi bi-check-circle-fill me-2"></i>
                                        {IsLoading ? 'Signing Up...' : 'Sign Up'}
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