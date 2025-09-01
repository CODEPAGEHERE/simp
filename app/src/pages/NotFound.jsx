import React, { useEffect, useRef } from 'react'
import { Container, Row, Col, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../App.css';
import Logo from "../assets/logoh.png";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(TextPlugin);

const NotFound = () => {
  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const messageRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    gsap.to(logoRef.current, {
      duration: 1,
      rotation: 360,
      repeat: -1,
      ease: 'linear',
    });

    const timeline = gsap.timeline();

    timeline
      .to(titleRef.current, {
        duration: 2,
        text: '404',
        ease: 'power1.in',
        stagger: 0.05,
      })
      .to(messageRef.current, {
        duration: 3,
        text: 'TimeOut - Page Not Found. Oops! <br> The page you\'re looking for doesn\'t exist. It might have been moved or deleted.',
        ease: 'power1.in',
        stagger: 0.05,
      })
      .fromTo(buttonRef.current, {
        opacity: 0,
        y: 50,
      }, {
        duration: 1,
        opacity: 1,
        y: 0,
        ease: 'power4.out',
      });
  }, []);

  return (
    <Container className="align-items-center justify-content-center vh-100">
      <Row className="justify-content-center">
        <Col md={8} className="text-center">
          {/* Project Logo */}
          <Image
            ref={logoRef}
            src={Logo}
            alt="Project Logo"
            className="mb-4"
            style={{ maxWidth: '150px', height: 'auto' }}
          />

          {/* 404 Message */}
          <h1 ref={titleRef} className="display-1 fw-bold text-dark"></h1>
          <p ref={messageRef} className="lead mb-4 text-dark"></p>

          {/* Go to Homepage Button */}
          <Button ref={buttonRef} as={Link} to="/" variant="dark" size="lg">
            <i className="bi bi-arrow-left me-2"></i>Go to Homepage
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
