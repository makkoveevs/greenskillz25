export interface Block {
  id: number;
  label: string;
  type: string;
}

export interface Slide {
  id: number;
  x: number;
  y: number;
  block: Block;
}

export type TSlideElementTextType = "header" | "regular" | "list";

export type TSlideElementTextAlignment =
  | "center"
  | "left"
  | "right"
  | "justify";

export type TSlideElementTestStyle =
  | "style"
  | "bold"
  | "regular"
  | "bold"
  | "italic";

export type TSlideElement = {
  text_type: TSlideElementTextType;
  alignment: TSlideElementTextAlignment;
  style: TSlideElementTestStyle;
  size: number;
  content: string;
};

export type TSlide = {
  id: string;
  slide_number: number;
  elements: TSlideElement[];
};

export type TRequestStatus = "pending" | "processing" | "completed" | "failed";

export type TPrezResponse = {
  request_id: string;
  status: TRequestStatus;
  theme: string;
};

//это же в me
export type TPrezStatusResponse = {
  presentation_id: string | null;
  request_id: string;
  theme: string;
  status: TRequestStatus;
};

export type TPrezData = {
  presentation_id: string;
  theme: string;
  status: TRequestStatus;
  slides: TSlide[];
};

export type TLastPresentation = {
  presentation_id: string | null;
};

export type TMe = {
  username: string;
  presentation_list: TPrezStatusResponse[];
};
