import styled from "styled-components";

const TOOL_PANEL_WIDTH = 100;

export const MainCanvasLayout = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: calc(100% - ${TOOL_PANEL_WIDTH + 20}px);
  grid-template-rows: 100%;

  & > .main-canvas {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: none;
  }
  & > .tools {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;
  }
`;
