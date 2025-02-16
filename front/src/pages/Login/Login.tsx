import { Button, Flex, Input, Typography } from "antd";
import { useState } from "react";
import model from "../Profile/model";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "src/shared/constants";
const { Title } = Typography;

export const Login = observer((): React.JSX.Element => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { login } = model;
  const navigate = useNavigate();

  const handleLogin = (): void => {
    login({ username, password }).then(() => {
      navigate(ROUTES.PRESENTATIONS_LIST);
    });
  };

  return (
    <Flex
      align="center"
      justify="center"
      vertical={true}
      style={{ backgroundColor: "whitesmoke", width: "100%", height: "100%" }}
      gap={40}>
      <Title level={3}>Нужно авторизоваться</Title>
      <Flex
        vertical={true}
        align="center"
        justify="center"
        gap={20}
        style={{ backgroundColor: "whitesmoke", maxWidth: "500px" }}>
        <Input
          placeholder="Логин"
          autoFocus={true}
          tabIndex={1}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.code === "Enter" && handleLogin()}
        />
        <Input.Password
          placeholder="Пароль"
          value={password}
          tabIndex={2}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.code === "Enter" && handleLogin()}
        />
        <Button
          tabIndex={3}
          disabled={username.trim().length === 0}
          onClick={handleLogin}>
          Войти
        </Button>
      </Flex>
    </Flex>
  );
});
