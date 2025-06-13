import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext({
    token: '',
    isAuthenticated: false,
    isInitializing: true,
    authenticate: (token, propertyInspectorData) => { },
    logout: () => { },
    propertyInspector: '',
    updatePropertyInspector: (otp, otp_verified_at) => { },
});

function AuthContextProvider({ children }) {
    const [authToken, setAuthToken] = useState(null);
    const [propertyInspector, setPropertyInspector] = useState({});
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const loadToken = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const propertyInspectorData = await AsyncStorage.getItem('piData');
                if (token && propertyInspectorData) {
                    setAuthToken(token);
                    setPropertyInspector(JSON.parse(propertyInspectorData));
                }
            } catch (e) {
                console.error('Failed to load token:', e);
            } finally {
                setIsInitializing(false); // done loading
            }
        };

        loadToken();

    }, []);

    const authenticate = async (token, propertyInspectorData) => {
        try {
            await AsyncStorage.setItem('authToken', token);
            await AsyncStorage.setItem('piData', JSON.stringify(propertyInspectorData));
            setAuthToken(token);
            setPropertyInspector(propertyInspectorData);
        } catch (e) {
            console.error('Failed to save token:', e);
        }
    };

    const updatePropertyInspector = async (otp, otp_verified_at) => {
        setPropertyInspector(prev => {
            const updated = {
                ...prev,
                user: {
                    ...prev.user,
                    otp,
                    otp_verified_at,
                },
            };
            // Save to AsyncStorage outside of setState to avoid side effects in render
            AsyncStorage.setItem('piData', JSON.stringify(updated));
            return updated;
        });
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('piData');
            await AsyncStorage.setItem("db_initialized", "");
            setAuthToken(null);
            setPropertyInspector('');
        } catch (e) {
            console.error('Failed to remove token:', e);
        }
    };

    const value = {
        token: authToken,
        isAuthenticated: !!authToken,
        isInitializing,
        authenticate: authenticate,
        logout: logout,
        propertyInspector: propertyInspector,
        updatePropertyInspector: updatePropertyInspector,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContextProvider;