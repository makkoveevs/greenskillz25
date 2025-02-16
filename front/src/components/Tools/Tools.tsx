import { Button, Carousel, Flex, Modal, Typography } from "antd";
import { ToolsStyled } from "./styles";
import { observer } from "mobx-react-lite";
import Model from "src/stores";
import { useState } from "react";
import { API_SOURCE } from "src/shared/constants";
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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    handleExport();
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleSave = (): void => {
    setIsLoading(true);
    savePresentation().finally(() => setIsLoading(false));
  };
  const handleExport = (): void => {
    setIsLoading(true);
    exportPresentation(design).finally(() => {
      setIsLoading(false);
    });
  };
  const [design, setDesign] = useState<number>(1);
  const onChange = (currentSlide: number) => {
    setDesign(currentSlide);
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
              onClick={showModal}
              disabled={isLoading}
              type="default"
              loading={isLoading}>
              Экспорт
            </Button>
          </Flex>
        </Flex>
      </Flex>
      <Modal
        title="Выбери тему"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}>
        <Carousel
          afterChange={onChange}
          arrows={true}
          dotPosition="left"
          draggable={true}
          dots={{ className: "dot" }}>
          {new Array(7).fill(1).map((e, i) => (
            <div
              style={{
                margin: 0,
                color: "#fff",
                lineHeight: "600px"
              }}
              key={e * i}>
              <img
                src={`${API_SOURCE}/${e * (i + 1)}.png`}
                width={470}
                height={300}
                alt={`${e * (i + 1)}`}
              />
            </div>
          ))}
        </Carousel>
      </Modal>
    </ToolsStyled>
  );
});
