import { AxiosRequestConfig } from "axios";
import { api, TResponse } from "src/shared/apiService";
import { SERVER_URL_MANUAL } from "src/shared/constants";
import { TMe } from "src/types";

class Api {
  private readonly api = api;

  public async me(config?: AxiosRequestConfig): TResponse<TMe> {
    return this.api.get<TMe>(`${SERVER_URL_MANUAL}/api/v1/auth/me`, {}, config);
  }
  public async login(
    { username, password }: { username: string; password: string },
    config?: AxiosRequestConfig
  ): TResponse<{ access_token: string; refresh_token: string }> {
    return this.api.post<
      { access_token: string; refresh_token: string },
      { username: string; password: string }
    >(`${SERVER_URL_MANUAL}/api/v1/auth/login`, { username, password }, config);
  }
}

export default new Api();
