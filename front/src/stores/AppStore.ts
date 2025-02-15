import { makeAutoObservable } from "mobx";
import QuestionApi from "src/components/Question/api";
import { TPrezData, TPrezResponse } from "src/types";

class MainModel {
  public readonly DEFAULT_SLIDES_NUM: number = 6;
  public text: string = "1";
  public slidesNum: number = this.DEFAULT_SLIDES_NUM;
  public files: File[] = [];
  public currentRequest: TPrezResponse | null = null;
  public currentPresentation: TPrezData | null = null;
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
  public setCurrentPresentation = (data: TPrezData | null): void => {
    this.currentPresentation = data;
  };
  public setCurrentRequest = (data: TPrezResponse | null): void => {
    this.currentRequest = data;
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
}

export default new MainModel();
