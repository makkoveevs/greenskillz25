import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet
} from "react-router-dom";
import "antd/dist/reset.css";
import "./App.css";
import { Root } from "./Root";
import { ConfigProvider } from "antd";

const App = (): React.JSX.Element => {
  return (
    <ConfigProvider>
      <Router>
        <Outlet />
        <Routes>
          <Route path="/" element={<Root />} />
          <Route index element={<div>Start</div>} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
