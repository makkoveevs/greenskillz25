import { Layout } from "antd";
import styled from "styled-components";

const { Sider, Content } = Layout;

export const SIDEBAR_WIDTH = 170;

export const StyledLayout = styled(Layout)`
  position: relative;
  border-radius: 8;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
`;

export const StyledSider = styled(Sider)`
  position: relative;
  text-align: "center";
  padding: 10px;
  overflow: auto;

  .link {
    color: #c0d3de;
    &:hover {
      color: #fafbfb;
      font-weight: 800;
    }
  }
`;

export const StyledContent = styled(Content)`
  position: relative;
  background-color: #f0f3f7;
  overflow: auto;
  padding: 8px;
`;
