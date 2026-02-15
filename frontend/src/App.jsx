import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upload from "./pages/Upload";
import History from "./pages/History";
import View from "./pages/View";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 transition-all">
      
      <Navbar />

      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
        />

        <Route
          path="/register"
          element={!isAuthenticated ? <Register /> : <Navigate to="/" />}
        />

        <Route
          path="/"
          element={isAuthenticated ? <Upload /> : <Navigate to="/login" />}
        />

        <Route
          path="/history"
          element={isAuthenticated ? <History /> : <Navigate to="/login" />}
        />

        <Route path="/view/:id" element={<View />} />
      </Routes>
    </div>
  );
}

export default App;
