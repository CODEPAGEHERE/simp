import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="loader">
        <div className="intern">
        </div>
        <div className="external-shadow">
          <div className="central">
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9999;

  .loader {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    cursor: not-allowed;
    scale: 0.7;
  }

  .central {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 10em;
    height: 10em;
    border-radius: 50%;
    box-shadow: 0.5em 1em 1em red,
      -0.5em 0.5em 1em orange,
      0.5em -0.5em 1em orangered,
      -0.5em -0.5em 1em yellow;
  }

  .external-shadow {
    width: 10em;
    height: 10em;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    box-shadow: 0.5em 0.5em 3em red,
      -0.5em 0.5em 3em orange,
      0.5em -0.5em 3em orangered,
      -0.5em -0.5em 3em yellow;
    z-index: 999;
    animation: rotate 3s linear infinite;
    background-color: #212121;
  }

  .intern {
    position: absolute;
    color: white;
    z-index: 9999;
  }

  .intern::before {
    content: "100%";
    animation: percent 2s ease-in-out infinite;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }

    50% {
      transform: rotate(180deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes percent {
    0% {
      content: '0%';
    }

    25% {
      content: '25%';
    }

    33% {
      content: '33%';
    }

    42% {
      content: '42%';
    }

    51% {
      content: '51%';
    }

    67% {
      content: '67%';
    }

    74% {
      content: '74%';
    }

    75% {
      content: '75%';
    }

    86% {
      content: '86%';
    }

    95% {
      content: '95%';
    }

    98% {
      content: '98%';
    }

    99% {
      content: '99%';
    }
  }
`;

export default Loader;
