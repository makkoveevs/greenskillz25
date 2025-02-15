import { Flex } from "antd";
import { observer } from "mobx-react-lite";
import { PreviewList } from "src/components/PreviewList";
import Model from "src/stores";

export const Prez = observer((): React.JSX.Element => {
  const { currentPresentation } = Model;
  return (
    <Flex gap={20}>
      <PreviewList />
      {/* <Col span={6}>Preview</Col>
    <Col span={18}>Canvas</Col> */}
      <div>Canvas</div>
    </Flex>
  );
});
