'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/api/axiosInstance';

interface TokenContextType {
    accessToken: string | null;
    digitalToken: string | null;
    digitalTokenExpiry: string | null;
    accessTokenExpiry: string | null;

    setAccessToken: (token: string | null, expiry?: string | null) => void;
    setDigitalToken: (token: string | null, expiry?: string | null) => void;
    clearTokens: () => void;

    fetchTokens: (
        userId: number,
        latitude: number,
        longitude: number
    ) => Promise<{ success: boolean; status: string }>;

    isTokensReady: boolean;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [accessToken, setAccessTokenState] = useState<string | null>(null);
    const [digitalToken, setDigitalTokenState] = useState<string | null>(null);
    const [digitalTokenExpiry, setDigitalTokenExpiry] = useState<string | null>(null);
    const [accessTokenExpiry, setAccessTokenExpiry] = useState<string | null>(null);
    const [isTokensReady, setIsTokensReady] = useState(false);

    const getCookie = (name: string): string | null => {
        if (typeof window === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        return parts.length === 2 ? parts.pop()!.split(';').shift() ?? null : null;
    };

    useEffect(() => {
        const cookieToken = getCookie('token');
        if (cookieToken) setAccessTokenState(cookieToken);

        const storedDigitalToken = localStorage.getItem('digitalToken');
        const storedDigitalTokenExpiry = localStorage.getItem('digitalTokenExpiry');

        if (storedDigitalToken) setDigitalTokenState(storedDigitalToken);
        if (storedDigitalTokenExpiry) setDigitalTokenExpiry(storedDigitalTokenExpiry);

        setIsTokensReady(true);
    }, []);

    const fetchTokens = async (
        userId: number,
        latitude: number,
        longitude: number
    ) => {
        try {
            console.log("🔑 Fetching digital token...");
            // Mock API or actual backend lookup
            const mockToken = "mock_digital_token_" + Math.random().toString(36).substring(7);
            setDigitalToken(mockToken, new Date(Date.now() + 3600 * 1000).toISOString());
            return { success: true, status: "SUCCESS" };
        } catch (error) {
            console.error("🚨 fetchTokens failed:", error);
            throw error;
        }
    };

    const setAccessToken = (token: string | null, expiry: string | null = null) => {
        setAccessTokenState(token);
        setAccessTokenExpiry(expiry);

        if (token) {
            localStorage.setItem('accessToken', token);
            if (expiry) localStorage.setItem('accessTokenExpiry', expiry);
        } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('accessTokenExpiry');
        }
    };

    const setDigitalToken = (token: string | null, expiry: string | null = null) => {
        setDigitalTokenState(token);
        setDigitalTokenExpiry(expiry);

        if (token) {
            localStorage.setItem('digitalToken', token);
            if (expiry) localStorage.setItem('digitalTokenExpiry', expiry);
        } else {
            localStorage.removeItem('digitalToken');
            localStorage.removeItem('digitalTokenExpiry');
        }
    };

    const clearTokens = () => {
        setAccessTokenState(null);
        setDigitalTokenState(null);
        setDigitalTokenExpiry(null);
        setAccessTokenExpiry(null);

        localStorage.removeItem('accessToken');
        localStorage.removeItem('digitalToken');
        localStorage.removeItem('digitalTokenExpiry');
        localStorage.removeItem('accessTokenExpiry');
    };

    return (
        <TokenContext.Provider
            value={{
                accessToken,
                digitalToken,
                digitalTokenExpiry,
                accessTokenExpiry,
                setAccessToken,
                setDigitalToken,
                clearTokens,
                fetchTokens,
                isTokensReady,
            }}
        >
            {children}
        </TokenContext.Provider>
    );
};

export const useTokens = () => {
    const context = useContext(TokenContext);
    if (!context) {
        throw new Error('useTokens must be used within a TokenProvider');
    }
    return context;
};
