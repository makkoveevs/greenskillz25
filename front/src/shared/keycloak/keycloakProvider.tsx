import { PropsWithChildren } from "react";
import { AuthClientEvent } from "@react-keycloak/core";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { KC_INIT_OPTIOINS, TOKEN_VALIDATION_TIME } from "./config";
import { handleRefreshToken, keycloak } from "./keycloakInstance";
import React from "react";

export const KCProvider = ({
  children
}: PropsWithChildren): React.JSX.Element => {
  const handleKCEvent = (e: AuthClientEvent, err: unknown): void => {
    window.console.log("KCEvent", e, err);
    switch (e) {
      case "onAuthSuccess":
      case "onAuthRefreshSuccess":
        {
          const tokenLifeTime =
            (keycloak.tokenParsed?.exp ?? 0) - (keycloak.tokenParsed?.iat ?? 0);

          if (
            tokenLifeTime > TOKEN_VALIDATION_TIME &&
            keycloak.isTokenExpired(TOKEN_VALIDATION_TIME)
          ) {
            setTimeout(
              () => {
                handleRefreshToken(TOKEN_VALIDATION_TIME);
              },
              (tokenLifeTime - TOKEN_VALIDATION_TIME) * 1000
            );
          }
        }
        break;
      case "onTokenExpired":
        handleRefreshToken(TOKEN_VALIDATION_TIME);
        break;
      case "onInitError":
        window.console.log(
          "Ошибка инициализации авторизации. Страница должна быть перезагружена.",
          err
        );
        if (
          window.confirm(
            "Ошибка инициализации авторизации. Страница должна быть перезагружена."
          )
        ) {
          location.reload();
        }
        break;
      case "onAuthRefreshError":
        break;
      default:
      //
    }
  };

  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{ ...KC_INIT_OPTIOINS, onLoad: "login-required" }}
      autoRefreshToken={true}
      onEvent={handleKCEvent}
      LoadingComponent={<div>Подготовка авторизации</div>}>
      {children}
    </ReactKeycloakProvider>
  );
};
