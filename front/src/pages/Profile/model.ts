import { makeAutoObservable } from "mobx";
import Api from "./api";
import { TMe } from "src/types";
import { DELTA_TOKEN_KEY } from "src/shared/constants";

class ProfileModel {
  public profile: TMe | null = null;

  private readonly api = Api;

  constructor() {
    makeAutoObservable(this, {});
  }

  public reset = (): void => {
    this.setProfile(null);
  };

  public setProfile = (data: TMe | null): void => {
    this.profile = data;
  };

  public getMe = (): Promise<void> => {
    return this.api
      .me()
      .then((res) => this.setProfile(res.data))
      .catch(() => this.setProfile(null));
  };

  public login = (data: {
    username: string;
    password: string;
  }): Promise<void> => {
    return this.api
      .login(data)
      .then((res) => {
        localStorage.setItem(DELTA_TOKEN_KEY, res.data?.access_token);
        return this.getMe();
      })
      .catch(() => Promise.reject());
  };
}

export default new ProfileModel();
