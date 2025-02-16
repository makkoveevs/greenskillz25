import React from "react";
import { KCProvider } from "src/shared/keycloak";
import Layout from "../Layout";
import { DELTA_TOKEN_KEY, ROUTES, USE_KC } from "src/shared/constants";
import { Navigate } from "react-router-dom";

const Private = (): React.JSX.Element => {
  const token = localStorage.getItem(DELTA_TOKEN_KEY);
  if (USE_KC) {
    return (
      <KCProvider>
        <Layout />
      </KCProvider>
    );
  } else if (token) {
    return <Layout />;
  } else {
    return <Navigate to={ROUTES.LOGIN} />;
  }
};

export default Private;
