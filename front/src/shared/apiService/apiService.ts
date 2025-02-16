import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { LOGIN_PARAMS } from "../keycloak/config";
import { AxiosRequestConfigAdvanced, TApiParams, TResponse } from "./types";
import {
  handleRefreshToken,
  keycloak
} from "src/shared/keycloak/keycloakInstance";
import {
  API_SOURCE,
  DELAY_BETWEEN_RETRY_MS,
  DELTA_TOKEN_KEY,
  FLAG_IS_TOKEN_UPDATE,
  MAX_RETRY_COUNT,
  TIMEOUT_API,
  USE_KC
} from "src/shared/constants";

let axiosSingletoneInstance: ApiService | undefined;
export class ApiService {
  private readonly axios!: AxiosInstance;
  private retryCounter = 0;
  private readonly tokenType = "Bearer";

  constructor() {
    if (typeof axiosSingletoneInstance !== "undefined") {
      return axiosSingletoneInstance;
    }

    this.axios = axios.create({
      validateStatus: (status) => status >= 200 && status < 400,
      baseURL: API_SOURCE,
      timeout: TIMEOUT_API,
      headers: {
        Accept: "application/json",
        Authorization: `${this.tokenType} ${this.getToken()}`
      }
    });

    this.initRequestHeadersInterceptors();
    this.initResponseRefreshAccessTokenProcessInterceptors();

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    axiosSingletoneInstance = this;
    return axiosSingletoneInstance;
  }

  private readonly getToken = (): string | undefined => {
    if (USE_KC) {
      return keycloak.token;
    } else {
      const tkn = localStorage.getItem(DELTA_TOKEN_KEY);
      return tkn ?? undefined;
    }
  };

  private readonly initRequestHeadersInterceptors = (): void => {
    this.axios?.interceptors.request.use(
      (config) =>
        // config["delayed"] - кастомный ключ, говорящий о том, что данный запрос выполняется повторно
        // в случае наличия такого ключа делаем задержку DELAY_BETWEEN_RETRY_MS перед выполнением
        new Promise((resolve) =>
          setTimeout(
            () => {
              config.headers.set({
                ...config.headers,
                Authorization: `${this.tokenType} ${this.getToken()}`
              });
              resolve(config);
            },
            "delayed" in config && config["delayed"]
              ? DELAY_BETWEEN_RETRY_MS
              : 0
          )
        )
    );
  };

  private readonly initResponseRefreshAccessTokenProcessInterceptors =
    (): void => {
      this.axios?.interceptors.response.use(
        (response) => {
          this.retryCounter = 0;
          localStorage.removeItem(FLAG_IS_TOKEN_UPDATE);
          return response;
        },

        async (error) => {
          //запоминаем исходный запрос, чтобы позже повторить его
          const originalRequest = error.config as AxiosRequestConfig;

          if (error.response.status === 401) {
            if (!USE_KC) {
              localStorage.removeItem(DELTA_TOKEN_KEY);
              location.assign(API_SOURCE + "/login");
              return;
            } else {
              const refreshTokenFlag =
                localStorage.getItem(FLAG_IS_TOKEN_UPDATE);
              /**
               * проверить наличие флага обновления в сторадже
               *  1.флаг есть - (!== null)
               *    1.1.ждём Х секунд и повторяем проверку
               *  2.флага нет - (=== null)
               *    2.1.проверить можно ли обновить токен в кейклоке
               *      2.1.1.можно -
               *        a. повесить флаг обновления в сторадж
               *        b. дернуть ручку обновления
               *        c. успешно обновлено?
               *          c.1 ДА - дернуть запрос ещё раз
               *          c.2 НЕТ - средиректить на кейклок
               *      2.1.2.нельзя -
               *        a.средиректить на кейклок
               */
              if (refreshTokenFlag !== null) {
                if (this.retryCounter < MAX_RETRY_COUNT) {
                  this.retryCounter++;

                  (originalRequest as AxiosRequestConfigAdvanced)["delayed"] =
                    true;
                  return this.axios?.(originalRequest);
                } else {
                  this.retryCounter = 0;
                  localStorage.removeItem(FLAG_IS_TOKEN_UPDATE);
                  keycloak.login(LOGIN_PARAMS);
                  //TODO проверить - как тут throw будет себя вести
                  return Promise.reject(new Error("Go to login page"));
                }
              } else {
                if (!keycloak.refreshToken) {
                  localStorage.removeItem(FLAG_IS_TOKEN_UPDATE);
                  return Promise.reject(new Error("Not find refresh token"));
                }
                try {
                  // устанавливаем признак выполнения обновления токена и запускаем запрос на обновление токена
                  localStorage.setItem(FLAG_IS_TOKEN_UPDATE, "true");
                  await handleRefreshToken();
                  // снимаем признак выполнения обновления токена, обнуляем счётчик попыток и запускаем повторно исходный запрос
                  localStorage.removeItem(FLAG_IS_TOKEN_UPDATE);
                  this.retryCounter = 0;
                  return this.axios?.(originalRequest);
                } catch {
                  this.retryCounter = 0;
                  localStorage.removeItem(FLAG_IS_TOKEN_UPDATE);
                  keycloak.login(LOGIN_PARAMS);
                  return Promise.reject(
                    new Error("Error on access token refreshing process")
                  );
                }
              }
            }
          }

          if (error.status === 403) {
            //TODO
          }
          if (error.response.data.detail) {
            return Promise.reject(
              new Error(error.response.data.detail as string)
            );
          }
          return Promise.reject(new Error(error as string));
        }
      );
    };

  readonly get = <T, P = TApiParams>(
    path: string,
    params?: P,
    config?: AxiosRequestConfig
  ): TResponse<T> =>
    this.axios.get<T>(
      path,
      Object.assign({}, config, {
        params,
        paramsSerializer: {
          indexes: null
        }
      })
    );

  readonly post = <T, D>(
    path: string,
    data: D,
    config?: AxiosRequestConfig
  ): TResponse<T> => this.axios.post(path, data, config);

  readonly put = <T, D>(
    path: string,
    data: D,
    config?: AxiosRequestConfig
  ): TResponse<T> => this.axios.put(path, data, config);

  readonly delete = <T>(
    path: string,
    config?: AxiosRequestConfig
  ): TResponse<T> => this.axios.delete(path, config);

  readonly patch = <T, D>(
    path: string,
    data: D,
    config?: AxiosRequestConfig
  ): TResponse<T> => this.axios.patch(path, data, config);

  readonly sse = (path: string): EventSource =>
    new EventSource(`${API_SOURCE}${path}`);
}

export const api = new ApiService();
