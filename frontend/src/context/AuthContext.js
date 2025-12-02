import React, { createContext, useState, useEffect } from 'react';
import storage from '../utils/storage';
import client from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const login = async (username, password) => {
        try {
            const response = await client.post('/auth/token', {
                username,
                password,
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            const { access_token } = response.data;
            setUserToken(access_token);
            await storage.setItem('token', access_token);
        } catch (e) {
            console.log(e);
            throw e;
        }
    };

    const signup = async (username, email, password, fullName) => {
        try {
            await client.post('/auth/signup', {
                username,
                email,
                password,
                full_name: fullName,
            });
        } catch (e) {
            console.log(e);
            throw e;
        }
    };

    const logout = async () => {
        setUserToken(null);
        await storage.deleteItem('token');
    };

    const isLoggedIn = async () => {
        try {
            let token = await storage.getItem('token');
            setUserToken(token);
            setIsLoading(false);
        } catch (e) {
            console.log(`isLoggedIn error ${e}`);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ login, signup, logout, isLoading, userToken }}>
            {children}
        </AuthContext.Provider>
    );
};
