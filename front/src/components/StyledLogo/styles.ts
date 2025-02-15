import styled from "styled-components";

export const StyledLogoLayout = styled.div<{ width?: number }>`
  position: absolute;
  z-index: 2;
  bottom: 0px;
  right: 0px;
  width: ${({ width }) =>
    typeof width === "undefined" ? "100%" : `${width}px`};
  max-width: 200px;

  padding: 4px 4px 4px 8px;
  border-radius: 14px 0px 0px 0px;
  background: linear-gradient(135deg, #2a2a2a 0%, #4d4d4d 100%);
  color: gainsboro;

  font-family: "Arial Black", sans-serif;
  font-size: 1rem;
  text-shadow:
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000;
  letter-spacing: 0.5rem;
  opacity: 0.5;
`;
