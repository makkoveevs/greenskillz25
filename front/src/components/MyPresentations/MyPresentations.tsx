import { Button, Flex, Tooltip, Typography } from "antd";
import { observer } from "mobx-react-lite";
import ProfileModel from "src/pages/Profile/model";
import { RequestStatus } from "../RequestStatus";
import Model from "src/stores";
import { generatePath, useNavigate } from "react-router-dom";
import { TPrezStatusResponse } from "src/types";
import { ROUTES } from "src/shared/constants";
import { DeleteOutlined } from "@ant-design/icons";
import { useEffect } from "react";

const { Title, Text } = Typography;

export const MyPresentations = observer((): JSX.Element => {
  const { profile, getMe } = ProfileModel;
  const navigate = useNavigate();
  const { setCurrentRequest, deletePresentation } = Model;

  useEffect(() => {
    getMe();
  }, [getMe]);

  const handleDelete = (e: TPrezStatusResponse["request_id"]): void => {
    deletePresentation(e);
  };

  const handleClickPrez = (e: TPrezStatusResponse): void => {
    setCurrentRequest(e);
    navigate(generatePath(ROUTES.PRESENTATION, { request_id: e.request_id }));
  };
  return (
    <Flex align={"flex-start"} justify={"flex-start"} vertical={true} gap={20}>
      <Title level={3}>Мои презентации</Title>
      <Flex
        align={"flex-start"}
        justify={"flex-start"}
        vertical={true}
        gap={20}>
        {(profile?.presentation_list ?? []).map((e) => (
          <Flex
            align={"center"}
            justify={"flex-start"}
            gap={30}
            key={e.request_id}>
            <Flex align={"center"} justify={"flex-start"} gap={10}>
              <RequestStatus status={e.status} />
              <Tooltip
                title={"Статус презентации: " + e.status}
                placement="right">
                <Text
                  style={{ cursor: "pointer" }}
                  onClick={() => handleClickPrez(e)}>
                  {e.theme}
                </Text>
              </Tooltip>
            </Flex>

            <Tooltip title={"Удалить"} placement="right">
              <DeleteOutlined
                style={{ color: "red", cursor: "pointer" }}
                onClick={() => handleDelete(e.request_id)}
              />
            </Tooltip>
          </Flex>
        ))}
      </Flex>
      {(profile?.presentation_list ?? []).length === 0 && (
        <Button type="primary" onClick={() => navigate(ROUTES.APP)}>
          Создать новую
        </Button>
      )}
    </Flex>
  );
});
