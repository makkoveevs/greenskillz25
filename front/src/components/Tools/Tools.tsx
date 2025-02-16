import { Button, Flex, Typography } from "antd";
import { ToolsStyled } from "./styles";
import { observer } from "mobx-react-lite";
import Model from "src/stores";
import { useState } from "react";
const { Title } = Typography;

export const Tools = observer((): JSX.Element => {
  const {
    addSlide,
    removeCurrentSlide,
    addTitle,
    addText,
    savePresentation,
    exportPresentation
  } = Model;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSave = (): void => {
    setIsLoading(true);
    savePresentation().finally(() => setIsLoading(false));
  };
  const handleExport = (): void => {
    setIsLoading(true);
    exportPresentation().finally(() => setIsLoading(false));
  };

  return (
    <ToolsStyled>
      <Flex vertical={true} gap={30}>
        <Flex vertical={true} gap={8}>
          <Title level={5}>Слайд</Title>
          <Flex vertical={true} gap={4}>
            <Button type="default" onClick={addSlide}>
              Добавить
            </Button>
            <Button type="default" danger={true} onClick={removeCurrentSlide}>
              Удалить
            </Button>
          </Flex>
        </Flex>
        <Flex vertical={true} gap={8}>
          <Title level={5}>Заголовок</Title>
          <Flex vertical={true} gap={4}>
            <Button onClick={addTitle} type="default">
              Добавить
            </Button>
          </Flex>
        </Flex>
        <Flex vertical={true} gap={8}>
          <Title level={5}>Текст</Title>
          <Flex vertical={true} gap={4}>
            <Button onClick={addText} type="default">
              Добавить
            </Button>
          </Flex>
        </Flex>
        <Flex vertical={true} gap={8}>
          <Title level={5}>Презентация</Title>
          <Flex vertical={true} gap={4}>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              type="default"
              loading={isLoading}>
              Сохранить
            </Button>
            <Button
              onClick={handleExport}
              disabled={isLoading}
              type="default"
              loading={isLoading}>
              Экспорт
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </ToolsStyled>
  );
});
