import { StyledLogoLayout } from "./styles";
export interface IStyledLogoProps {
  width?: number;
}

export const StyledLogo = ({ width }: IStyledLogoProps): React.JSX.Element => (
  <StyledLogoLayout width={width}>DELTA</StyledLogoLayout>
);
