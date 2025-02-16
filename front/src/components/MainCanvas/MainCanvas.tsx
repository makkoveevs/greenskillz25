import { observer } from "mobx-react-lite";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Model from "src/stores";
import { Flex, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const MainCanvas = observer((): React.JSX.Element => {
  const {
    currentPresentation,
    currentSlide,
    RATIO_W_H,
    editText,
    moveElement
  } = Model;
  const [slideSize, setSlideSize] = useState<{ w: number; h: number }>({
    // w: window.screen.width - 170 - 310,
    // h: window.screen.height
    w: 600,
    h: 600 * RATIO_W_H
  });

  const [dragging, setDragging] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Record<string, HTMLElement>>({});

  const startDrag = (e: React.MouseEvent, el_id: string) => {
    if (!containerRef.current) {
      return;
    }
    e.preventDefault();
    // const containerRect = containerRef.current.getBoundingClientRect();
    const blockRect = blockRefs.current?.[el_id]?.getBoundingClientRect();

    const offsetX = e.clientX - (blockRect?.left ?? 0);
    const offsetY = e.clientY - (blockRect?.top ?? 0);

    setOffset({ x: offsetX, y: offsetY });
    setDragging(el_id);
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (dragging === null || !containerRef.current) {
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();

    const newX = e.clientX - containerRect.left - offset.x;
    const newY = e.clientY - containerRect.top - offset.y;

    const newPosition = {
      x: Math.max(0, Math.min(newX, containerRect.width)),
      y: Math.max(0, Math.min(newY, containerRect.height))
    };
    const newPositionComputed = {
      x: Math.min(1, newPosition.x / slideSize.w),
      y: Math.min(1, newPosition.y / slideSize.h)
    };
    moveElement(dragging, newPositionComputed);
  };

  const stopDrag = () => {
    setDragging(null);
  };

  const elRef = useRef<HTMLDivElement>(null);

  if (!currentPresentation) {
    return <div>Ошибка</div>;
  }

  const calculateSlideSize = (): void => {
    if (elRef.current) {
      // const parentW = window.screen.width - 170 - 310;
      // const parentH = window.screen.height;
      // const parentW = elRef.current.offsetWidth
      // const parentH = elRef.current.offsetWidth;
      const parentW = elRef.current.clientWidth;
      const parentH = elRef.current.clientHeight;
      const byWidth = parentW / parentH;

      if (byWidth > RATIO_W_H) {
        const newSlideSize = { w: parentH / RATIO_W_H, h: parentH };
        setSlideSize(newSlideSize);
      } else {
        const newSlideSize = { w: parentW, h: parentW / RATIO_W_H };
        setSlideSize(newSlideSize);
      }
    }
  };

  useLayoutEffect(() => {
    if (elRef.current) {
      const observer = new ResizeObserver((entries) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const _entry of entries) {
          calculateSlideSize();
        }
      });

      observer.observe(elRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [RATIO_W_H, calculateSlideSize]);

  useEffect(() => {
    calculateSlideSize();
  }, []);

  if (!currentSlide) {
    return (
      <Flex align="center" justify="center">
        Загрузка
      </Flex>
    );
  }

  return (
    <Flex
      style={{ position: "relative", flexGrow: 1, flexShrink: 0 }}
      vertical={true}
      align="center"
      justify="center"
      ref={elRef}
      gap={20}>
      <Text>Слайд №{currentSlide.slide_number}</Text>
      <div
        style={{
          position: "relative",
          width: `${slideSize.w}px`,
          height: `${slideSize.h}px`,
          border: "1px solid gray",
          borderRadius: "2px"
        }}
        ref={containerRef}
        className="main-canvas"
        draggable={"false"}
        onMouseMove={handleDrag}
        onMouseUp={stopDrag}>
        {currentSlide.elements.map((el, index) => {
          if (el.text_type === "header" || el.text_type === "regular") {
            return (
              <Title
                key={el.id ?? `${index.toString()}${JSON.stringify(el)}`}
                style={{
                  position: "absolute",
                  cursor: "pointer",
                  left:
                    ((currentSlide?.elements ?? []).find((e) => e.id === el.id)
                      ?.x ?? 0) * slideSize.w,
                  top:
                    ((currentSlide?.elements ?? []).find((e) => e.id === el.id)
                      ?.y ?? 0) * slideSize.h,
                  padding: "0px"
                }}
                level={el.text_type === "regular" ? 5 : 1}
                editable={{
                  onChange: (e) => {
                    editText(el.id, e);
                  },
                  icon: (
                    <EditOutlined style={{ fontSize: "14px", color: "#08c" }} />
                  ),
                  tooltip: "Нажми, чтобы изменить текст",
                  enterIcon: null
                }}
                onMouseDown={(e) => startDrag(e, el.id)}
                id={`block-${index}`}
                ref={(ee) => (blockRefs.current[el.id] = ee!)}>
                {el.content}
              </Title>
            );
          } else {
            return <div key={JSON.stringify(el)}>НЕИЗВЕСТНЫЙ ТИП ЭЛЕМЕНТА</div>;
          }
        })}
      </div>
    </Flex>
  );
});
