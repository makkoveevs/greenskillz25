import React from "react";
import { KCProvider } from "src/shared/keycloak";
import Layout from "../Layout";

const Private = (): React.JSX.Element => (
  <KCProvider>
    <Layout />
  </KCProvider>
);

export default Private;
