import { KeycloakInitOptions } from "@react-keycloak/keycloak-ts";
// import Keycloak from "keycloak-js";

export const KC_INIT_CONFIG: Keycloak.KeycloakInitOptions &
  Record<string, unknown> = {
  realm: "myrealm",
  clientId: "myclient",
  onLoad: "login-required",
  flow: "standard",
  pkceMethod: "S256"
};

export const KC_INIT_OPTIOINS: KeycloakInitOptions & Record<string, unknown> = {
  realm: "myrealm",
  flow: "standard"
};

export const TOKEN_VALIDATION_TIME = 36000; //TODO установить в 60

export const LOGIN_PARAMS = { locale: "ru" };
