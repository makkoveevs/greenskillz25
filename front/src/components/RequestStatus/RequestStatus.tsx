import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  SmileTwoTone,
  SyncOutlined
} from "@ant-design/icons";
import { TRequestStatus } from "src/types";

export interface IRequestStatusProps {
  status: TRequestStatus;
}

export const RequestStatus = ({ status }: IRequestStatusProps): JSX.Element => {
  if (status === "completed") {
    return <CheckCircleTwoTone twoToneColor="#52c41a" />;
  } else if (status === "processing") {
    return <SmileTwoTone />;
  } else if (status === "pending") {
    return <SyncOutlined twoToneColor="#12959c" spin />;
  } else if (status === "failed") {
    return <CloseCircleTwoTone twoToneColor="#ce0909" />;
  }
  return <div></div>;
};
