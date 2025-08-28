import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, InputGroup } from 'react-bootstrap';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import './SignUp.css';
import Loader from '../components/Loader';
import validator from 'validator';
import phoneUtil from 'google-libphonenumber';

const phoneNumberUtil = phoneUtil.PhoneNumberUtil.getInstance();


const Signup = () => {
    const [Name, setName] = useState('');
    const [PhoneNo, setPhoneNo] = useState('');
    const [Email, setEmail] = useState('');
    const [Username, setUsername] = useState('');
    const [Password, setPassword] = useState('');
    const [ShowPassword, setShowPassword] = useState(false);
    const [Category, setCategory] = useState('');
    const [Categories, setCategories] = useState([]);

    const [Message, setMessage] = useState('');
    const [MessageType, setMessageType] = useState('');
    const [IsLoading, setIsLoading] = useState(false);

    const PageContentRef = useRef();
    const Navigate = useNavigate();

    useEffect(() => {
        gsap.fromTo(PageContentRef.current,
            { opacity: 0, y: -50 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );

        // Fetch categories from database
        const fetchCategories = async () => {
            try {
                const Response = await fetch(`${import.meta.env.VITE_SIMP_API_POINT}/categories`);
                const Data = await Response.json();
                setCategories(Data);
            } catch (Error) {
                console.error('Error fetching categories:', Error);
            }
        };
        fetchCategories();
    }, []);

    const HandleChange = (Event) => {
        const { name, value } = Event.target;
        if (name === 'name') setName(value);
        else if (name === 'phoneNo') setPhoneNo(value);
        else if (name === 'email') setEmail(value);
        else if (name === 'username') setUsername(value);
        else if (name === 'password') setPassword(value);
        else if (name === 'category') setCategory(value);
    };

    const HandleSubmit = async (Event) => {
      Event.preventDefault();

      const nameRegex = /^[a-zA-Z\s]{5,}$/;
      const emailRegex = /^[a-z-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const usernameRegex = /^[a-zA-Z0-9]{5,}$/;
      const passwordRegex = /^.{6,}$/;

      if (!Name || !PhoneNo || !Username || !Password || !Category || !Email) {
          setMessage('Please fill in all fields.');
          setMessageType('danger');
          return;
      }

      if (!nameRegex.test(Name)) {
          setMessage('Full name must be at least 5 characters long and contain only alphabets.');
          setMessageType('danger');
          return;
      }

      try {
          const phoneNumber = phoneNumberUtil.parse(PhoneNo);
          if (!phoneNumberUtil.isValidNumber(phoneNumber)) {
              setMessage('Invalid phone number. Please enter a valid phone number.');
              setMessageType('danger');
              return;
          }
      } catch (Error) {
          setMessage('Invalid phone number. Please enter a valid phone number.');
          setMessageType('danger');
          return;
      }

      if (!emailRegex.test(Email) || !validator.isEmail(Email)) {
          setMessage('Invalid email address.');
          setMessageType('danger');
          return;
      }

      if (!usernameRegex.test(Username.replace(/\s+/g, '').toLowerCase()) || !validator.isAlphanumeric(Username.replace(/\s+/g, ''))) {
          setMessage('Username must be at least 5 characters long and contain only alphabets and numbers.');
          setMessageType('danger');
          return;
      }

      if (Username === Password.replace(/\s+/g, '').toLowerCase()) {
          setMessage('Username and password cannot be the same.');
          setMessageType('danger');
          return;
      }

      if (!passwordRegex.test(Password.replace(/\s+/g, '')) || Password.length < 6) {
          setMessage('Password must be at least 6 characters long and contain no spaces.');
          setMessageType('danger');
          return;
      }

  const newName = Name.toLowerCase();
  const newEmail = Email.trim().toLowerCase().replace(/\s+/g, '');
  const newUsername = Username.replace(/\s+/g, '').toLowerCase();
  const newPassword = Password.replace(/\s+/g, '');

  setIsLoading(true);

  try {
      const Response = await fetch(`${import.meta.env.VITE_SIMP_API_POINT}/auth/signup`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              Name: newName,
              PhoneNo,
              Username: newUsername,
              Password: newPassword,
              Category,
              Email: newEmail
          })
      });

          const Data = await Response.json();

            if (Response.ok) {
                setMessage(Data.Message || 'Signup successful! Redirecting to login...');
                setMessageType('success');

                gsap.to(PageContentRef.current, {
                    opacity: 0,
                    duration: 0.5,
                    ease: "power3.out",
                    onComplete: () => {
                        setIsLoading(false);
                        Navigate('/login');
                    }
                });

            } else {
                setMessage(Data.Message || 'An error occurred during signup.');
                setMessageType('danger');
                setIsLoading(false);
            }
            } catch (Error) {
                console.error('Network or unexpected error:', Error);
                setMessage('Failed to connect to the server. Please check your internet connection or try again later.');
                setMessageType('danger');
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
                          <div className="p-5 border rounded shadow-lg bg-whte lx">
                              <h2 className="text-center mb-4">Create A Simp Account</h2>

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
                                                  <i className="bi bi-person-fill me-2"></i>
                                                  {(Category === 'personal' || Category === 'event planner') ? 'Full Name' : 'Assembly Name'}
                                              </Form.Label>
                                              <Form.Control
                                                  type="text"
                                                  name="name"
                                                  placeholder={(Category === 'personal' || Category === 'event planner') ? 'Enter your full name' : 'Enter your assembly name'}
                                                  value={Name}
                                                  onChange={HandleChange}
                                                  required
                                              />
                                          </Form.Group>
                                      </Col>
                                      <Col md={6}>
                                          <Form.Group className="mb-3" controlId="formCategory">
                                              <Form.Label>
                                                  <i className="bi bi-tag-fill me-2"></i>
                                                  Category
                                              </Form.Label>
                                              <Form.Select
                                                  name="category"
                                                  value={Category}
                                                  onChange={HandleChange}
                                                  required
                                              >
                                                  <option value="">Select a category</option>
                                                  {Categories.map((category) => (
                                                      <option key={category.id} value={category.name}>{category.name}</option>
                                                  ))}
                                              </Form.Select>
                                          </Form.Group>
                                      </Col>
                                  </Row>

                                  <Row>
                                      <Col md={6}>
                                          <Form.Group className="mb-3" controlId="formPhoneNo">
                                              <Form.Label>
                                                  <i className="bi bi-phone-fill me-2"></i>
                                                  Phone Number
                                              </Form.Label>
                                              <Form.Control
                                                  type="tel"
                                                  name="phoneNo"
                                                  placeholder="+23481..., +1415..., +442... "
                                                  value={PhoneNo}
                                                  onChange={HandleChange}
                                                  required
                                              />
                                          </Form.Group>
                                      </Col>
                                      <Col md={6}>
                                          <Form.Group className="mb-3" controlId="formEmail">
                                              <Form.Label>
                                                  <i className="bi bi-envelope-fill me-2"></i>
                                                  Email
                                              </Form.Label>
                                              <Form.Control
                                                  type="email"
                                                  name="email"
                                                  placeholder="Enter your email address"
                                                  value={Email}
                                                  onChange={HandleChange}
                                                  required
                                              />
                                          </Form.Group>
                                      </Col>
                                  </Row>

                                  <Row>
                                      <Col md={6}>
                                          <Form.Group className="mb-3" controlId="formUsername">
                                              <Form.Label>
                                                  <i className="bi bi-person-circle me-2"></i>
                                                  Username
                                              </Form.Label>
                                              <Form.Control
                                                  type="text"
                                                  name="username"
                                                  placeholder="Enter a unique username"
                                                  value={Username}
                                                  onChange={HandleChange}
                                                  required
                                              />
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
                                                      onChange={HandleChange}
                                                      required
                                                  />
                                                  <Button
                                                      variant="outline-secondary"
                                                      onClick={() => setShowPassword(!ShowPassword)}
                                                  >
                                                      <i className={`bi ${ShowPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                                  </Button>
                                              </InputGroup>
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
