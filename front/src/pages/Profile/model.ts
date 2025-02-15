import { makeAutoObservable } from "mobx";
import Api from "./api";
import { TMe } from "src/types";

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

  public getMe = (): void => {
    if (!this.profile) {
      return;
    }
    this.api
      .me()
      .then((res) => this.setProfile(res.data))
      .catch(() => this.setProfile(null));
  };
}

export default new ProfileModel();
