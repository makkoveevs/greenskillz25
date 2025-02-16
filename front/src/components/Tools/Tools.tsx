import {
  Button,
  Carousel,
  Flex,
  Modal,
  Tooltip,
  Typography,
  Input,
  Checkbox
} from "antd";
import { ToolsStyled } from "./styles";
import { observer } from "mobx-react-lite";
import Model from "src/stores";
import { useState } from "react";
import { API_SOURCE } from "src/shared/constants";
import { DislikeOutlined } from "@ant-design/icons";
const { Title } = Typography;
const { TextArea } = Input;

export const Tools = observer((): JSX.Element => {
  const {
    addSlide,
    removeCurrentSlide,
    addTitle,
    addText,
    savePresentation,
    exportPresentation,
    exportPresentation2,
    currentPresentation,
    regenerateSlide
  } = Model;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [regenData, setRegenData] = useState<string>("");
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [directDownload, setDirectDownload] = useState(false);

  const showRegenerateModal = () => {
    setIsRegenerateModalOpen(true);
  };

  const handleRegenerateOk = () => {
    regenerateSlide(regenData);
    setIsRegenerateModalOpen(false);
    setRegenData("");
  };

  const handleRegenerateCancel = () => {
    setRegenData("");
    setIsRegenerateModalOpen(false);
  };

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
    if (directDownload) {
      exportPresentation2(design).finally(() => {
        setIsLoading(false);
      });
    } else {
      exportPresentation(design).finally(() => {
        setIsLoading(false);
      });
    }
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
            <Tooltip
              title="Добавится слайд в конец презентации"
              placement="left">
              <Button type="default" onClick={addSlide}>
                Добавить
              </Button>
            </Tooltip>
            <Tooltip
              title="Если не нравится текущая генерация слайда, то здесь можно добавить информацию и перегенерировать слайд при помощи мощщщщного ИИ"
              placement="left">
              <Button type="default" onClick={showRegenerateModal}>
                <DislikeOutlined />
              </Button>
            </Tooltip>
            <Tooltip title="Удалится текущий слайд" placement="left">
              <Button
                disabled={(currentPresentation?.slides ?? []).length === 0}
                type="default"
                danger={true}
                onClick={removeCurrentSlide}>
                Удалить
              </Button>
            </Tooltip>
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
        title="Добавьте информацию для перегенерации"
        open={isRegenerateModalOpen}
        onOk={handleRegenerateOk}
        onCancel={handleRegenerateCancel}>
        <Flex>
          <TextArea
            rows={8}
            placeholder="Добавьте сюда всю необходимую информацию для перегенерации текущуго слайда"
            value={regenData}
            onChange={(e) => setRegenData(e.target.value)}
          />
        </Flex>
      </Modal>
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
        <Tooltip
          title="Если есть проблемы со скачиванием, то решить их не получится даже чекбоксом"
          placement="topLeft">
          <Checkbox
            checked={directDownload}
            onChange={(e) => {
              setDirectDownload(e.target.checked);
            }}>
            Прямое скачивание
          </Checkbox>
        </Tooltip>
      </Modal>
    </ToolsStyled>
  );
});
