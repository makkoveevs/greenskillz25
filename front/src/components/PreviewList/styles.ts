import styled from "styled-components";

export const PreviewListStyled = styled.div`
  position: relative;
  width: 120px;
  height: calc(100vh - 20px);
  overflow: auto;
  flex-shrink: 0;

  & > .preview-item {
    margin-bottom: 10px;
  }
`;
