import { Theme } from "@radix-ui/themes";
import React from "react";
import ReactDOM from "react-dom/client";
import "@radix-ui/themes/styles.css";
import { App } from "./views/App";
import "./styles/tokens.css";
import "./styles/app.css";
import "./styles/shell.css";

const root = document.getElementById("root");
if (!root) throw new Error("Application root is missing");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Theme accentColor="teal" grayColor="sage" radius="none" scaling="90%">
      <App />
    </Theme>
  </React.StrictMode>,
);
