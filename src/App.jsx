// src/App.jsx
import "./index.css";
import AppRouter from "./router";
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <AppRouter />
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;
