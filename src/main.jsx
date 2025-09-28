import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { NotificationProvider } from "./contexts/NotificationContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FavoritesProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </FavoritesProvider>
  </StrictMode>
);
