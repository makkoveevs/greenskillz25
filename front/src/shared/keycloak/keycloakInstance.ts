// import {
// KeycloakClient,
// KeycloakInitOptions
// } from "@react-keycloak/keycloak-ts";
import KeycloakClient from "keycloak-js";
import { KC_INIT_CONFIG, TOKEN_VALIDATION_TIME } from "./config";
import { KC_URL_MANUAL } from "../constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const keycloak = new (KeycloakClient as any)({
  // url: window.KC_AUTH_SERVER,
  url: `${KC_URL_MANUAL}`,
  ...KC_INIT_CONFIG
}) as Keycloak.KeycloakInstance;

export const handleRefreshToken = async (
  minValidity: number = TOKEN_VALIDATION_TIME
): Promise<boolean> =>
  keycloak.updateToken(minValidity) as unknown as Promise<boolean>;
