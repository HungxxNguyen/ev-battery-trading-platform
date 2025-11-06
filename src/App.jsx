// src/App.jsx
import "./index.css";
import AppRouter from "./router";
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { MessageProvider } from "./contexts/MessageContext";

function App() {
  return (
    <AuthProvider>
      <MessageProvider>
        <FavoritesProvider>
          <AppRouter />
        </FavoritesProvider>
      </MessageProvider>
    </AuthProvider>
  );
}

export default App;
