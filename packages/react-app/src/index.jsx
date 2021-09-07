import React from "react";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";

const themes = {
  dark: `${process.env.PUBLIC_URL}/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/light-theme.css`,
};

const prevTheme = window.localStorage.getItem("theme");

ReactDOM.render(
  <ThemeSwitcherProvider themeMap={themes} defaultTheme={prevTheme || "light"}>
    <App />
  </ThemeSwitcherProvider>,
  document.getElementById("root"),
);
