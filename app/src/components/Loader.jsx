// src/components/Loader.jsx
import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="spinner">
        <div className="spinner1" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* Overlay styles - CRITICAL for covering the screen */
  position: fixed; /* Position fixed to cover the entire viewport */
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6); /* Semi-transparent dark background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Ensure it's on top of everything else */

  /* Spinner styles (as you provided) */
  .spinner {
    background-image: linear-gradient(rgb(186, 66, 255) 35%,rgb(0, 225, 255));
    width: 100px;
    height: 100px;
    animation: spinning82341 1.7s linear infinite;
    text-align: center;
    border-radius: 50px;
    filter: blur(1px);
    box-shadow: 0px -5px 20px 0px rgb(186, 66, 255), 0px 5px 20px 0px rgb(0, 225, 255);
    position: relative; /* Needed for positioning spinner1 inside */
  }

  .spinner1 {
    background-color: rgb(36, 36, 36);
    width: 100px; /* Same size as parent to fully cover */
    height: 100px; /* Same size as parent to fully cover */
    border-radius: 50px;
    filter: blur(10px);
    position: absolute; /* Position absolutely within .spinner */
    top: 0;
    left: 0;
  }

  @keyframes spinning82341 {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default Loader;