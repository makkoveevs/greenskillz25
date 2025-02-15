import { Button, Flex } from "antd";
import styled from "styled-components";

export const StyledFlex = styled(Flex)`
  @keyframes shakePageBackground {
    0% {
      background-position: 50% 50%;
      background-size: 110vw 110vh;
    }
    25% {
      background-position: 45% 45%;
      background-size: 120vw 120vh;
    }
    75% {
      background-position: 60% 60%;
      background-size: 100vw 100vh;
    }
    100% {
      background-position: 50% 50%;
      background-size: 110vw 110vh;
    }
  }

  position: relative;
  width: 100%;
  height: 100%;
  background-color: "#46484a";
  /* background: url("src/assets/im2.png"); */
  background: url("im2.png");
  background-size: 100% 100%;

  animation-name: shakePageBackground;
  animation-duration: 30s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  -moz-animation-name: rotate;
  -moz-animation-duration: 30s;
  -moz-animation-iteration-count: infinite;
  -moz-animation-timing-function: ease-in-out;
`;

export const StyledButton = styled(Button)`
  @keyframes neonGlow {
    0% {
      background-color: #66f;
      color: #fff;
    }
    25% {
      background-color: #ff9;
      color: #fff;
    }
    50% {
      background-color: #66f;
      color: #fff;
    }
    75% {
      background-color: #9ff;
      color: #fff;
    }
    100% {
      background-color: #66f;
      color: #fff;
    }
  }

  @keyframes hoverGlow {
    0% {
      background-color: #66f;
      color: #fff;
      transform: scale(1);
    }
    50% {
      background-color: #9ff;
      color: #fff;
      transform: scale(1.05);
    }
    100% {
      background-color: #66f;
      color: #fff;
      transform: scale(1);
    }
  }

  @keyframes shakeBackground {
    0% {
      background-position: 50% 50%;
      background-size: 100vw 100vh;
    }
    25% {
      background-position: 45% 45%;
      background-size: 200vw 200vh;
    }
    75% {
      background-position: 60% 60%;
      background-size: 50vw 50vh;
    }
    100% {
      background-position: 50% 50%;
      background-size: 100vw 100vh;
    }
  }

  width: 300px;
  height: 100px;
  border: none;
  border-radius: 40px;
  outline: none;
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  background-color: #66f;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 0 20px #66f,
    0 0 40px #66f,
    0 0 60px #66f,
    0 0 80px #66f;
  animation: neonGlow 3s ease-in-out infinite alternate;
  transition: all 0.3s ease;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(farthest-corner at center, #66f, transparent);
    transform: rotate(45deg);
    animation: hoverGlow 3s linear infinite;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }

  &:hover {
    box-shadow:
      0 0 40px #66f,
      0 0 80px #66f,
      0 0 120px #66f,
      0 0 160px #66f;
    color: #9ff;

    & > .text-bg {
      animation-name: shakeBackground;
      animation-duration: 30s;
      animation-iteration-count: infinite;
      animation-timing-function: ease-in-out;
      -moz-animation-name: rotate;
      -moz-animation-duration: 30s;
      -moz-animation-iteration-count: infinite;
      -moz-animation-timing-function: ease-in-out;
    }
  }
  & > .text-bg {
    position: relative;
    padding: 20px 43px;
    border-radius: 30px;
    /* background: url("src/assets/im2.png"); */
    background: url("im2.png");
    background-size: 100vw 100vh;
    background-position: 50% 50%;
    color: white;
    text-decoration: solid;
    text-transform: uppercase;
    transition: transform 1s;
  }
`;
