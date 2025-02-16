import {
  Button,
  Card,
  Flex,
  Input,
  InputNumber,
  Tooltip,
  Typography,
  Upload,
  message
} from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import { observer } from "mobx-react-lite";
import Model from "src/stores";
import { generatePath, useNavigate } from "react-router-dom";
import { ROUTES } from "src/shared/constants";
import { useEffect } from "react";

const { Title, Text } = Typography;
const { TextArea } = Input;

const ALLOWED_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odt: "application/vnd.oasis.opendocument.text",
  odp: "application/vnd.oasis.opendocument.presentation",
  ods: "application/vnd.oasis.opendocument.spreadsheet"
};

export const Question = observer((): React.JSX.Element => {
  const {
    text,
    setFiles,
    slidesNum,
    setSlidesNum,
    setText,
    postQuestion,
    isLoading
  } = Model;
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const handlePostQuestion = (): void => {
    postQuestion()
      .then(
        (request_id) =>
          request_id &&
          navigate(generatePath(ROUTES.PRESENTATION, { request_id }))
      )
      .catch((e) => {
        messageApi.error(e.message);
      });
  };

  useEffect(
    () => () => {
      setText("");
      setFiles([]);
      setSlidesNum(Model.DEFAULT_SLIDES_NUM);
    },
    []
  );

  return (
    <Flex vertical={true} justify={"stretch"} align={"center"} gap={"large"}>
      <Title style={{ textAlign: "center" }}>
        Искусство создания презентаций здесь
      </Title>
      {contextHolder}
      <Flex vertical={true} gap={10} justify={"stretch"} align={"center"}>
        <Card size="small" title="Введите тему" style={{ width: "100%" }}>
          <TextArea
            rows={4}
            value={text}
            style={{ width: "100%", maxWidth: "800px" }}
            allowClear={true}
            placeholder="Введите тему"
            onChange={(e) => setText(e.target.value)}
          />
        </Card>

        <Card
          size="small"
          title="Укажите количество слайдов"
          style={{ width: "100%" }}>
          <InputNumber
            style={{ width: "100%" }}
            value={slidesNum}
            onChange={(e) => setSlidesNum(e ?? Model.DEFAULT_SLIDES_NUM)}
          />
        </Card>
        <Card
          size="small"
          title="Материалы для презентации (опционально)"
          style={{ width: "100%" }}>
          <Flex vertical={true} gap={20}>
            <Text type="secondary">
              Разрешённые типы: {Object.keys(ALLOWED_TYPES).join(", ")}
            </Text>
            <Tooltip
              title={`Добавить файлы для создания презентации на основе данных из этих файлов. Поддерживаемые типы: ${Object.keys(ALLOWED_TYPES).join(", ")}`}
              placement="left">
              <Upload
                beforeUpload={(file) => {
                  const isAllowType = Object.values(ALLOWED_TYPES).includes(
                    file.type
                  );

                  if (!isAllowType) {
                    message.error(
                      `${file.name} не поддерживается. Разрешенные типы: ${Object.keys(ALLOWED_TYPES).join(", ")}`
                    );
                    return Upload.LIST_IGNORE;
                  }
                  return false;
                }}
                listType="text"
                onChange={(data) => {
                  setFiles(data.fileList.map((f) => f.originFileObj as File));
                }}>
                <Button type="default" icon={<CloudUploadOutlined />}>
                  Добавить
                </Button>
              </Upload>
            </Tooltip>
          </Flex>
        </Card>
        <Button
          style={{ width: "100%" }}
          disabled={text.trim().length === 0 || isLoading}
          type="primary"
          loading={isLoading}
          onClick={handlePostQuestion}>
          Создать
        </Button>
      </Flex>
    </Flex>
  );
});
