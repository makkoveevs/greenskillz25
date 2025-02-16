import { makeAutoObservable } from "mobx";
import QuestionApi from "src/components/Question/api";
import {
  TPrezData,
  TPrezStatusResponse,
  TSlide,
  TSlideElement
} from "src/types";
import { v4 as uuidv4 } from "uuid";

class MainModel {
  public readonly RATIO_W_H = 11887200 / 6686550;
  public readonly DEFAULT_SLIDES_NUM: number = 6;
  public text: string = "1";
  public slidesNum: number = this.DEFAULT_SLIDES_NUM;
  public files: File[] = [];
  public currentRequest: TPrezStatusResponse | null = null;
  public currentPresentation: TPrezData | null = null;
  public currentSlide: TSlide | null = null;

  public isLoading: boolean = false;

  private readonly api = QuestionApi;

  constructor() {
    makeAutoObservable(this, {});
  }

  public reset = (): void => {
    this.setText("");
    this.setSlidesNum(this.DEFAULT_SLIDES_NUM);
    this.setFiles([]);
    this.setCurrentRequest(null);
    this.setCurrentPresentation(null);
    this.setCurrentPresentation(null);
    this.setCurrentSlide(null);
  };

  public setText = (data: string): void => {
    this.text = data;
  };
  public setSlidesNum = (data: number): void => {
    this.slidesNum = data;
  };
  public setFiles = (data: File[]): void => {
    this.files = data;
  };
  public addFiles = (data: File[]): void => {
    this.files = this.files.concat(data);
  };
  public removeFile = (idx: number): void => {
    this.files = this.files.splice(idx, 1);
  };
  public setCurrentSlide = (data: TSlide | null): void => {
    this.currentSlide = data;
  };
  public setCurrentPresentation = (data: TPrezData | null): void => {
    this.currentPresentation = data;
    if (this.currentSlide?.id) {
      this.setCurrentSlide(
        this.currentPresentation?.slides.find(
          (sl) => sl.id === this.currentSlide?.id
        ) ?? null
      );
    }
  };
  public setCurrentRequest = (data: TPrezStatusResponse | null): void => {
    this.currentRequest = data;
  };
  public deletePresentation = (request_id: string): void => {
    this.api.deletePresentation(request_id);
  };

  public getRequestStatus = (
    request_id: TPrezStatusResponse["request_id"]
  ): Promise<TPrezStatusResponse> => {
    return this.api
      .getPrezStatus(request_id)
      .then((res) => {
        this.setCurrentRequest(res.data);
        return res.data;
      })
      .catch(() => {
        // this.setCurrentRequest(MOCK_REQ);
        return Promise.reject();
      });
  };

  public getPresentationData = (
    presentation_id: TPrezData["presentation_id"]
  ): Promise<TPrezData> => {
    return this.api
      .getPrezData(presentation_id)
      .then((res) => {
        this.setCurrentPresentation(res.data);
        this.setCurrentSlide(res.data.slides[0] ?? null);
        return res.data;
      })
      .catch(() => {
        // this.setCurrentPresentation(MOCK_PRES);
        // this.setCurrentSlide(MOCK_PRES.slides[0] ?? null);
        return Promise.reject(new Error("Ошибка получения данных"));
      });
  };

  public postQuestion = (): Promise<string> => {
    if (this.text.trim().length === 0) {
      return Promise.reject(new Error("Не указана тема"));
    }
    if (this.files.length > 0) {
      this.isLoading = true;
      return this.api
        .postQuestionWithFiles(this.text, this.slidesNum, this.files)
        .then((res) => {
          this.setCurrentRequest(res.data);
          return Promise.resolve(res.data.request_id);
        })
        .catch(() => {
          this.setCurrentRequest(null);
          return Promise.reject(new Error("Ошибка при выполнении запроса"));
        })
        .finally(() => (this.isLoading = false));
    } else if (this.files.length === 0) {
      this.isLoading = true;
      return this.api
        .postQuestion(this.text, this.slidesNum)
        .then((res) => {
          this.setCurrentRequest(res.data);
          return Promise.resolve(res.data.request_id);
        })
        .catch(() => {
          this.setCurrentRequest(null);
          return Promise.reject(new Error("Ошибка при выполнении запроса"));
        })
        .finally(() => (this.isLoading = false));
    }
    return Promise.reject(new Error("Необработанный случай"));
  };

  public addSlide = (): void => {
    if (!this.currentPresentation) {
      return;
    }
    const uuid = uuidv4();
    const newSlide: TSlide = {
      id: uuid,
      slide_number: (this.currentPresentation.slides.length ?? 0) + 1,
      elements: []
    };
    const newSlides = (this.currentPresentation?.slides ?? []).concat([
      newSlide
    ]);
    this.setCurrentPresentation({
      ...this.currentPresentation,
      slides: newSlides
    });
  };

  public addTitle = (): void => {
    if (!this.currentPresentation || !this.currentSlide) {
      return;
    }
    const uuid = uuidv4();

    const newElements: TSlideElement[] = [...this.currentSlide.elements];
    newElements.push({
      id: uuid,
      content: "Заголовок",
      text_type: "header",
      alignment: "center",
      size: 28,
      style: "regular",
      x: 0.5,
      y: 0.5,
      h: 0,
      w: 0
    });

    const newSlides = this.currentPresentation.slides.map((sl) =>
      sl.id === this.currentSlide?.id ? { ...sl, elements: newElements } : sl
    );

    this.setCurrentPresentation({
      ...this.currentPresentation,
      slides: newSlides
    });
  };
  public addText = (): void => {
    if (!this.currentPresentation || !this.currentSlide) {
      return;
    }
    const uuid = uuidv4();

    const newElements: TSlideElement[] = [...this.currentSlide.elements];
    newElements.push({
      id: uuid,
      content: "Текст",
      text_type: "regular",
      alignment: "center",
      size: 16,
      style: "regular",
      x: 0.5,
      y: 0.5,
      h: 0,
      w: 0
    });

    const newSlides = this.currentPresentation.slides.map((sl) =>
      sl.id === this.currentSlide?.id ? { ...sl, elements: newElements } : sl
    );

    this.setCurrentPresentation({
      ...this.currentPresentation,
      slides: newSlides
    });
  };

  public removeCurrentSlide = (): void => {
    if (!this.currentPresentation || !this.currentSlide) {
      return;
    }
    const newSlides = (this.currentPresentation?.slides ?? []).filter(
      (e) => e.id !== this.currentSlide?.id
    );
    this.setCurrentPresentation({
      ...this.currentPresentation,
      slides: newSlides
    });
    if (newSlides.length > 0) {
      this.setCurrentSlide(this.currentPresentation.slides[0]);
    } else {
      this.setCurrentSlide(null);
    }
  };

  public editText = (element_id: string, text: string): void => {
    if (!this.currentSlide || !this.currentPresentation) {
      return;
    }
    const editedElementIndex = this.currentSlide.elements.findIndex(
      (e) => e.id === element_id
    );
    if (editedElementIndex === -1) {
      return;
    }
    const editedElement = this.currentSlide.elements[editedElementIndex];

    const editedElementWithNewText: TSlideElement = {
      ...editedElement,
      content: text
    };

    const curSlideWithNewText: TSlide = {
      ...this.currentSlide,
      elements: [...this.currentSlide.elements].splice(
        editedElementIndex,
        1,
        editedElementWithNewText
      )
    };
    const newSlides = (this.currentPresentation?.slides ?? []).map((p) =>
      p.id === this.currentSlide?.id ? curSlideWithNewText : p
    );
    this.setCurrentPresentation({
      ...this.currentPresentation,
      slides: newSlides
    });
  };

  public moveElement = (
    element_id: string,
    // editedElementIndex: number,
    { x, y }: { x: number; y: number }
  ): void => {
    if (!this.currentSlide || !this.currentPresentation) {
      return;
    }
    const editedElementIndex = this.currentSlide.elements.findIndex(
      (e) => e.id === element_id
    );
    if (editedElementIndex === -1) {
      return;
    }
    const editedElement = this.currentSlide.elements[editedElementIndex];

    const editedElementWithNewCoords: TSlideElement = {
      ...editedElement,
      x,
      y
    };

    const curSlideWithNewData: TSlide = {
      ...this.currentSlide,
      elements: [...this.currentSlide.elements].splice(
        editedElementIndex,
        1,
        editedElementWithNewCoords
      )
    };
    const newSlides = (this.currentPresentation?.slides ?? []).map((sl) =>
      sl.id === this.currentSlide?.id ? curSlideWithNewData : sl
    );

    this.setCurrentPresentation({
      ...this.currentPresentation,
      slides: newSlides
    });
  };

  public savePresentation = (): Promise<void> => {
    if (!this.currentPresentation) {
      return Promise.reject();
    } else {
      return this.api
        .savePresentaion(this.currentPresentation)
        .then((res) => res.data);
    }
  };

  public exportPresentation = (): Promise<void> => {
    //TODO
    return this.savePresentation();
  };
}

export default new MainModel();
