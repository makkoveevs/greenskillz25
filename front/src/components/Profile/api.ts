import { AxiosRequestConfig } from "axios";
import { api, TResponse } from "src/shared/apiService";
import { TMe } from "src/types";

class Api {
  private readonly api = api;

  public async me(config?: AxiosRequestConfig): TResponse<TMe> {
    return this.api.get<TMe>(`/api/v1/auth/me`, {}, config);
  }
}

export default new Api();
