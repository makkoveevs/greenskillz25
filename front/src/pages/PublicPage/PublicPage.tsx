import { Typography } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import { StyledButton, StyledFlex } from "./styles";
import { StyledLogo } from "src/components/StyledLogo";

const { Title } = Typography;

export const PublicPage = (): React.JSX.Element => (
  <StyledFlex vertical={true} justify={"center"} align={"center"} gap={88}>
    <Title style={{ color: "white" }} keyboard={true}>
      Это ты удачно зашёл...
    </Title>

    <Title
      level={3}
      style={{ color: "white", maxWidth: "600px", textAlign: "center" }}>
      Здесь ты за две минуты сможешь сделать то, на что раньше уходило 6
      световых лет
    </Title>
    <Link to={"app/profile"}>
      <StyledButton>
        <div className="text-bg">
          <div className="text">Попробовать</div>
        </div>
      </StyledButton>
    </Link>
    <StyledLogo width={100} />
  </StyledFlex>
);
