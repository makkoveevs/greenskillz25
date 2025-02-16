import { Button, Flex, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainCanvas } from "src/components/MainCanvas";
import { PreviewList } from "src/components/PreviewList";
import { Tools } from "src/components/Tools";
import { ROUTES } from "src/shared/constants";
import Model from "src/stores";
import { TRequestStatus } from "src/types";
const { Title, Text } = Typography;

const REQUEST_STATUS_TIMEOUT = 1000;

export const Prez = observer((): React.JSX.Element => {
  const { request_id } = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const navigate = useNavigate();
  const {
    currentRequest,
    currentPresentation,
    deletePresentation,
    getRequestStatus,
    getPresentationData
  } = Model;
  const PENDING_STATUSES: TRequestStatus[] = ["pending", "processing"];
  const isTimeout = useRef<NodeJS.Timeout>();
  const stopTimeout = useRef<boolean>(false);

  const handleToMain = (): void => {
    navigate(ROUTES.APP);
  };

  const handleDelete = (): void => {
    if (!request_id) {
      return;
    }
    deletePresentation(request_id);
    navigate(ROUTES.PROFILE);
  };

  const createRequestTimeout = useCallback((): NodeJS.Timeout => {
    return setTimeout(() => {
      if (request_id) {
        getRequestStatus(request_id).then((res) => {
          clearTimeout(isTimeout.current);
          stopTimeout.current = res.status === "completed";
          if (res.status !== "completed") {
            isTimeout.current = createRequestTimeout();
          } else if (res.status === "completed" && res.presentation_id) {
            getPresentationData(res.presentation_id);
          }
        });
      }
    }, REQUEST_STATUS_TIMEOUT);
  }, [getPresentationData, getRequestStatus, request_id]);

  useEffect(() => {
    clearTimeout(isTimeout.current);
  });

  useEffect(() => {
    if (!request_id) {
      if (isTimeout.current) {
        clearTimeout(isTimeout.current);
        isTimeout.current = undefined;
      }
      return;
    }
    if (PENDING_STATUSES.includes(currentRequest?.status ?? "pending")) {
      setIsLoading(false);
      clearTimeout(isTimeout.current);
      isTimeout.current = createRequestTimeout();
      return;
    }
    if (currentRequest?.status === "failed") {
      clearTimeout(isTimeout.current);
      isTimeout.current = undefined;
      setIsLoading(false);
      return;
    }
    if (
      currentRequest?.status === "completed" &&
      currentRequest.presentation_id
    ) {
      if (!currentPresentation) {
        getPresentationData(currentRequest.presentation_id)
          .then(() => {
            setIsLoading(false);
            if (isTimeout.current) {
              clearTimeout(isTimeout.current);
              isTimeout.current = undefined;
            }
          })
          .catch(() => setIsLoading(false));
      }
    }
  }, [
    PENDING_STATUSES,
    createRequestTimeout,
    currentPresentation,
    currentRequest,
    getPresentationData,
    request_id
  ]);

  useEffect(
    () => () => {
      Model.setCurrentSlide(null);
      Model.setCurrentRequest(null);
      Model.setCurrentPresentation(null);
      clearTimeout(isTimeout.current);
    },
    []
  );

  if (!request_id) {
    return (
      <Flex vertical={true} align="center" justify="center" gap={20}>
        <Title level={3}>Ошибка</Title>
        <Text>Не найден id запроса</Text>
        <Button type="primary" onClick={handleToMain}>
          Создать новую презентацию
        </Button>
      </Flex>
    );
  }

  if (isLoading) {
    return (
      <Flex align="center" justify="center">
        Загрузка...
      </Flex>
    );
  }

  if (
    request_id &&
    request_id === currentRequest?.request_id &&
    PENDING_STATUSES.includes(currentRequest?.status)
  ) {
    return (
      <Flex vertical={true} align="center" justify="center" gap={20}>
        <Title level={3}>Осталось совсем немного</Title>
        <Text>Ваша презентация почти почти готова...</Text>
        <Button type="default" onClick={() => navigate(ROUTES.PROFILE)}>
          Не хочу ждать, пойду в профиль
        </Button>
      </Flex>
    );
  }

  if (
    request_id &&
    request_id === currentRequest?.request_id &&
    currentRequest.status === "failed"
  ) {
    if (isTimeout.current || stopTimeout.current) {
      clearTimeout(isTimeout.current);
      isTimeout.current = undefined;
    }
    return (
      <Flex vertical={true} align="center" justify="center" gap={20}>
        <Title level={3}>Ошибка</Title>
        <Text>Презентация не была создана</Text>
        <Button type="primary" onClick={handleToMain}>
          Создать новую презентацию
        </Button>
        <Button type="text" danger={true} onClick={handleDelete}>
          Удалить запись о ней
        </Button>
      </Flex>
    );
  }

  if (
    request_id &&
    request_id === currentPresentation?.request_id &&
    currentPresentation?.status === "completed"
  ) {
    if (isTimeout.current || stopTimeout.current) {
      clearTimeout(isTimeout.current);
      isTimeout.current = undefined;
    }

    return (
      <Flex gap={20}>
        <PreviewList />
        <MainCanvas />
        <Tools />
      </Flex>
    );
  }
  return <div>Подготовка...</div>;
});
