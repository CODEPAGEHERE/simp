import React from 'react';
import { Container, Row, Col, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../App.css';
import Logo from '../assets/logoh.png';

const NotFound = () => {
  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Container className="text-center p-5 rounded shadow-sm bg-white">
        <Row className="justify-content-center">
          <Col md={8}>
            {/* Project Logo */}
            <Image
              src={Logo}
              alt="Project Logo"
              className="mb-4"
              style={{ maxWidth: '150px', height: 'auto' }} 
            />

            {/* 404 Message */}
            <h1 className="display-1 fw-bold text-secondary">404</h1>
            <h2 className="mb-3 text-secondary">TimeOut - Page Not Found</h2>
            <p className="lead mb-4">
              Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
            </p>

            {/* Go to Homepage Button */}
            <Button as={Link} to="/" variant="outline-secondary" size="lg">
              <i className="bi bi-arrow-left me-2"></i>Go to Homepage
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NotFound;