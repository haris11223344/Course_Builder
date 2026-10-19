import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryProvider } from "./components/providers/QueryProvider";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import { AuthProvider } from "./components/providers/AuthProvider";

import "./styles/globals.css";
import "./styles/animations.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  </React.StrictMode>
);
