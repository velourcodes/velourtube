import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, logoutUser, getCurrentUser, registerUser } from "../api/user.api";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuth = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const response = await getCurrentUser();
            if (response.data?.data) {
                setUser(response.data.data);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Authentication check failed", error);
            setUser(null);
            setIsAuthenticated(false);
            // If checkAuth fails (e.g. 401 even after refresh), clear tokens
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (data) => {
        try {
            const response = await loginUser(data);
            const { user, accessToken, refreshToken } = response.data.data;

            // Save tokens
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);

            setUser(user);
            setIsAuthenticated(true);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            // Always clean up local state
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const register = async (data) => {
        try {
            const response = await registerUser(data);
            // Registration does not auto-login in this backend (returns createdUser but no tokens)
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        register,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
