import { Flex, Layout } from "antd";
import { Link, Outlet } from "react-router-dom";
import {
  SIDEBAR_WIDTH,
  StyledContent,
  StyledLayout,
  StyledSider
} from "./styles";
import { ROUTES } from "src/shared/constants";
import { StyledLogo } from "src/components/StyledLogo";

export const LayoutPage = (): React.JSX.Element => (
  <StyledLayout>
    <StyledSider width={SIDEBAR_WIDTH}>
      <Flex vertical gap={12} align="center" justify="flex-start">
        {/* <Link className="link" to={ROUTES.MAIN} >
          На главную
        </Link> */}
        <Link className="link" to={ROUTES.APP}>
          Создать новую
        </Link>
        <Link className="link" to={ROUTES.PRESENTATIONS_LIST}>
          Мои презентации
        </Link>
        <Link className="link" to={ROUTES.PROFILE}>
          Профиль
        </Link>
      </Flex>
      <StyledLogo width={SIDEBAR_WIDTH} />
    </StyledSider>
    <Layout>
      <StyledContent>
        <Outlet />
      </StyledContent>
    </Layout>
  </StyledLayout>
);
