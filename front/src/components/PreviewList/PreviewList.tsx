import { PreviewListStyled } from "./styles";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DraggingStyle,
  NotDraggingStyle,
  DropResult
} from "react-beautiful-dnd";
import { observer } from "mobx-react-lite";
import Model from "src/stores/AppStore";
import { TSlide } from "src/types";
import { Flex, Typography } from "antd";

const { Text } = Typography;

const grid = 8;

export const PreviewList = observer((): JSX.Element => {
  const { currentPresentation, setCurrentPresentation } = Model;
  const reorder = (list: TSlide[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const getItemStyle = (
    isDragging: boolean,
    draggableStyle: DraggingStyle | NotDraggingStyle | undefined
  ): React.CSSProperties => ({
    userSelect: "none",
    padding: "2px",
    margin: `0 0 ${grid}px 0`,

    width: "100px",
    height: "80px",
    border: "1px solid grey",
    borderRadius: "4px",

    background: isDragging ? "lightgrey" : "transparent",

    ...draggableStyle
  });

  const getListStyle = (isDraggingOver: boolean): React.CSSProperties => ({
    border: isDraggingOver ? "1px solid grey" : "none",
    borderRadius: "8px",
    boxSizing: "border-box",
    padding: "10px"
  });

  const onDragEnd = (result: DropResult): void => {
    if (!result.destination || !currentPresentation) {
      return;
    }

    const reorderedItems = reorder(
      currentPresentation?.slides,
      result.source.index,
      result.destination.index
    ).map((e, i) => ({ ...e, slide_number: i + 1 }));
    setCurrentPresentation({ ...currentPresentation, slides: reorderedItems });
  };

  const { setCurrentSlide } = Model;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <PreviewListStyled
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}>
            {(currentPresentation?.slides ?? []).map((e, i) => (
              <Draggable key={i + e.id} draggableId={i + e.id} index={i}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    key={i + e.id}
                    style={getItemStyle(
                      snapshot.isDragging,
                      provided.draggableProps.style
                    )}
                    onClick={() => {
                      setCurrentSlide(null);
                      setCurrentSlide(e);
                    }}>
                    <Flex
                      vertical={true}
                      align="flex-start"
                      justify="flex-start"
                      gap={2}>
                      <Text>{e.slide_number}</Text>
                      {e.elements
                        .filter((elm) => elm.text_type === "header")
                        .map((elm) => (
                          <Text
                            key={elm.id}
                            style={{
                              fontSize: "8px",
                              width: "90%",
                              marginLeft: "10%",
                              marginTop: "10%"
                            }}
                            ellipsis={true}>
                            {elm.content}
                          </Text>
                        ))}
                    </Flex>
                  </div>
                )}
              </Draggable>
            ))}
          </PreviewListStyled>
        )}
      </Droppable>
    </DragDropContext>
  );
});
