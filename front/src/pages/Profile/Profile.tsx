import { useKeycloak } from "@react-keycloak/web";
import { Alert, Button, Flex, Typography } from "antd";
import { observer } from "mobx-react-lite";
import ProfileModel from "./model";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "src/shared/constants";

const { Title, Text } = Typography;

export const Profile = observer((): React.JSX.Element => {
  const { keycloak } = useKeycloak();
  const { profile } = ProfileModel;
  const navigate = useNavigate();

  return (
    <Flex align={"flex-start"} justify={"flex-start"} vertical={true} gap={40}>
      <Flex
        align={"flex-start"}
        justify={"flex-start"}
        vertical={true}
        gap={20}>
        <Title level={3}>Профиль</Title>
        <Text>{profile?.username ?? "Имя пользователя"}</Text>
      </Flex>
      <Flex
        align={"flex-start"}
        justify={"flex-start"}
        vertical={true}
        gap={20}>
        <Title level={3}>Мои презентации</Title>
        <Flex
          align={"flex-start"}
          justify={"flex-start"}
          vertical={true}
          gap={8}>
          {(profile?.presentation_list ?? []).map((e) => (
            <Link to={"app/prez/" + e.request_id}>
              <Flex align={"cente"} justify={"flex-start"} gap={10}>
                <Alert message={e.status} type="info" />
                <Text>{e.theme}</Text>
              </Flex>
            </Link>
          ))}
        </Flex>
      </Flex>

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
});
