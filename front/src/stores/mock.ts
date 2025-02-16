import { TPrezData, TPrezStatusResponse } from "src/types";

export const MOCK_PRES_ID = "preses1";
export const MOCK_REQ_ID = "re4";

export const MOCK_REQ: TPrezStatusResponse = {
  presentation_id: null,
  request_id: MOCK_REQ_ID,
  status: "pending",
  theme: "miasdlkjns lkj "
};

export const MOCK_PRES: TPrezData = {
  theme: "Ght",
  status: "completed",
  request_id: MOCK_REQ_ID,
  presentation_id: MOCK_PRES_ID,
  slides: [
    {
      slide_number: 1,
      elements: [
        {
          id: "1",
          text_type: "header",
          content: "Дворцовый переворот",
          x: 0.1,
          y: 0.1,
          w: 0.8,
          h: 0.2,
          alignment: "left",
          size: 26,
          style: "regular"
        },
        {
          id: "2",
          text_type: "regular",
          content: "Шальная императрица",
          x: 0.2,
          y: 0.3,
          w: 0.8,
          h: 0.2,
          alignment: "left",
          size: 20,
          style: "regular"
        },
        {
          id: "3",
          text_type: "regular",
          content: "История одного крестьянина",
          x: 0.2,
          y: 0.4,
          w: 0.8,
          h: 0.2,
          alignment: "left",
          size: 20,
          style: "regular"
        }
      ],
      id: "1 s"
    },
    { slide_number: 2, elements: [], id: "2 ds" },
    { slide_number: 3, elements: [], id: "3 sd" },
    { slide_number: 4, elements: [], id: "4 s" },
    { slide_number: 5, elements: [], id: "5 ds" },
    { slide_number: 6, elements: [], id: "6 sd" },
    { slide_number: 7, elements: [], id: "7 s" },
    { slide_number: 8, elements: [], id: "8 ds" },
    { slide_number: 9, elements: [], id: "9 sd" },
    { slide_number: 10, elements: [], id: "10 s" },
    { slide_number: 11, elements: [], id: "11 ds" },
    { slide_number: 12, elements: [], id: "12 sd" },
    { slide_number: 13, elements: [], id: "13 s" },
    { slide_number: 14, elements: [], id: "14 ds" },
    { slide_number: 15, elements: [], id: "15 sd" },
    { slide_number: 16, elements: [], id: "16 s" },
    { slide_number: 17, elements: [], id: "17 ds" },
    { slide_number: 18, elements: [], id: "18 sd" },
    { slide_number: 19, elements: [], id: "19 s" },
    { slide_number: 20, elements: [], id: "20 ds" },
    { slide_number: 21, elements: [], id: "21 sd" }
  ]
};
