import { AxiosRequestConfig } from "axios";
import { api, TResponse } from "src/shared/apiService";
import { SERVER_URL_MANUAL } from "src/shared/constants";
import { TPrezData, TPrezStatusResponse } from "src/types";

class Api {
  private readonly api = api;

  public async postQuestion(
    theme: string,
    count_slides: number,
    config?: AxiosRequestConfig
  ): TResponse<TPrezStatusResponse> {
    const body = new FormData();
    body.set("data", JSON.stringify({ theme, count_slides }));
    return this.api.post(
      `${SERVER_URL_MANUAL}/api/v1/presentations/request/`,
      body,
      {
        ...config,
        headers: { "Content-Type": "multipart/form-data" }
      }
    );
  }

  public async postQuestionWithFiles(
    theme: string,
    count_slides: number,
    files: File[],
    config?: AxiosRequestConfig
  ): TResponse<TPrezStatusResponse> {
    const body = new FormData();
    body.set("data", JSON.stringify({ theme, count_slides }));
    files.forEach((file) => {
      body.append("new_files", file);
    });
    return this.api.post(
      `${SERVER_URL_MANUAL}/api/v1/presentations/request/`,
      body,
      {
        ...config,
        headers: { "Content-Type": "multipart/form-data" }
      }
    );
  }

  public async getPrezStatus(
    request_id: string,
    config?: AxiosRequestConfig
  ): TResponse<TPrezStatusResponse> {
    //ждём комплита или фэйл
    return this.api.get<TPrezStatusResponse>(
      `${SERVER_URL_MANUAL}/api/v1/presentations/request/${request_id}`,
      {},
      config
    );
  }

  public async getPrezData(
    presentation_id: string,
    config?: AxiosRequestConfig
  ): TResponse<TPrezData> {
    return this.api.get<TPrezData>(
      `${SERVER_URL_MANUAL}/api/v1/presentations/presentation/${presentation_id}`,
      {},
      config
    );
  }

  public async deletePresentation(
    request_id: string,
    config?: AxiosRequestConfig
  ): TResponse<void> {
    return this.api.delete<void>(
      `${SERVER_URL_MANUAL}/api/v1/presentations/request/${request_id}`,
      config
    );
  }

  public async savePresentaion(
    data: TPrezData,
    config?: AxiosRequestConfig
  ): TResponse<void> {
    return this.api.patch<void, TPrezData>(
      `${SERVER_URL_MANUAL}/api/v1/presentations/presentation/${data.presentation_id}`,
      { ...data },
      config
    );
  }
}

export default new Api();
