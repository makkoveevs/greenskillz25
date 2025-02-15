import { PriviewStyled } from "./styles";

export interface IPreviewProps {
  id: string;
}

export const Preview = ({ id }: IPreviewProps): JSX.Element => {
  return <PriviewStyled className="preview-item">{id}</PriviewStyled>;
};
