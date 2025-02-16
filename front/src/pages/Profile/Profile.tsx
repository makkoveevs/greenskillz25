import { useKeycloak } from "@react-keycloak/web";
import { Button, Flex, Typography } from "antd";
import { observer } from "mobx-react-lite";
import ProfileModel from "./model";
import { useNavigate } from "react-router-dom";
import { DELTA_TOKEN_KEY, ROUTES, USE_KC } from "src/shared/constants";
import { MyPresentations } from "src/components/MyPresentations";

const { Title, Text } = Typography;

export const Profile = observer((): React.JSX.Element => {
  const { profile } = ProfileModel;
  const navigate = useNavigate();
  if (USE_KC) {
    const { keycloak } = useKeycloak();

    return (
      <Flex
        align={"flex-start"}
        justify={"flex-start"}
        vertical={true}
        gap={40}>
        <Flex
          align={"flex-start"}
          justify={"flex-start"}
          vertical={true}
          gap={20}>
          <Title level={3}>Профиль</Title>
          <Text>{profile?.username ?? "Имя пользователя"}</Text>
        </Flex>
        <MyPresentations />

        <Button
          type="primary"
          onClick={() => {
            navigate(ROUTES.MAIN);
            keycloak.logout();
          }}>
          Выйти
        </Button>
      </Flex>
    );
  } else {
    return (
      <Flex
        align={"flex-start"}
        justify={"flex-start"}
        vertical={true}
        gap={40}>
        <Flex
          align={"flex-start"}
          justify={"flex-start"}
          vertical={true}
          gap={20}>
          <Title level={3}>Профиль</Title>
          <Text>{profile?.username ?? "Имя пользователя"}</Text>
        </Flex>
        <MyPresentations />

        <Button
          type="primary"
          onClick={() => {
            localStorage.removeItem(DELTA_TOKEN_KEY);
            navigate(ROUTES.MAIN);
            setTimeout(() => {
              location.reload();
            }, 333);
          }}>
          Выйти
        </Button>
      </Flex>
    );
  }
});
