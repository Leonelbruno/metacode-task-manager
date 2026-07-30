import { BrowserRouter, Routes, Route, Navigate, } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import TasksPage from "../pages/TasksPage";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />
                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route
                    path="/register"
                    element={<RegisterPage />} />


                <Route
                    path="/tasks"
                    element={
                        <ProtectedRoute>
                            <TasksPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="*"
                    element={<Navigate to="/login" replace />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;