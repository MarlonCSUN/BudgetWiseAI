import React from "react";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes";
import "./styles/globals.css";
import { NotificationProvider } from './context/NotificationContext';
import ToastContainer from './components/layout/ToastContainer';

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer />
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;