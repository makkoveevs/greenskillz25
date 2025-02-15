import React, { lazy } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet
} from "react-router-dom";
import "antd/dist/reset.css";
import "./App.css";
import { PublicPage } from "./pages/PublicPage/PublicPage";
import { Root } from "./Root";
import { ConfigProvider } from "antd";
import { ROUTES } from "./shared/constants";

const Private = lazy(() => import("./pages/Private/Private"));
const Profile = lazy(() => import("src/pages/Profile"));
const Prez = lazy(() => import("src/pages/Prez"));
const Main = lazy(() => import("src/pages/Main"));

const App = (): React.JSX.Element => {
  return (
    <ConfigProvider>
      <Router>
        <Outlet />
        <Routes>
          <Route path={ROUTES.MAIN} element={<Root />} />
          <Route index element={<PublicPage />} />
          <Route path={ROUTES.APP} element={<Private />}>
            <Route index element={<Main />} />
            <Route path={ROUTES.PROFILE} element={<Profile />} />
            <Route path={ROUTES.PRESENTATION} element={<Prez />} />
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
