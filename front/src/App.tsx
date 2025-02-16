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
import { Login } from "./pages/Login/Login";

const Private = lazy(() => import("./pages/Private/Private"));
const Profile = lazy(() => import("src/pages/Profile"));
const Prez = lazy(() => import("src/pages/Prez"));
const PresentationsList = lazy(() => import("src/components/MyPresentations"));
const Main = lazy(() => import("src/pages/Main"));

const App = (): React.JSX.Element => {
  return (
    <ConfigProvider>
      <Router>
        <Outlet />
        <Routes>
          <Route path={ROUTES.MAIN} element={<Root />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route index element={<PublicPage />} />
          <Route path={ROUTES.APP} element={<Private />}>
            <Route index element={<Main />} />
            <Route
              path={ROUTES.PRESENTATIONS_LIST}
              element={<PresentationsList />}
            />
            <Route path={ROUTES.PROFILE} element={<Profile />} />
            <Route path={ROUTES.PRESENTATION} element={<Prez />} />
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
