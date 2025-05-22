import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext({
    token: '',
    isAuthenticated: false,
    authenticate: (token, propertyInspectorData) => { },
    logout: () => { },
    propertyInspector: '',
    updatePropertyInspector: (propertyInspectorData) => { },
});

function AuthContextProvider({ children }) {
    const [authToken, setAuthToken] = useState(null);
    const [propertyInspector, setPropertyInspector] = useState({});

    useEffect(() => {
        const loadToken = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const propertyInspectorData = await AsyncStorage.getItem('piData');
                if (token && propertyInspectorData) {
                    setAuthToken(token); // or your auth context shape
                    setPropertyInspector(JSON.parse(propertyInspectorData));
                }
            } catch (e) {
                console.error('Failed to load token:', e);
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

    const updatePropertyInspector = async (updater) => {
        try {
            setPropertyInspector((prev) => {
                const updated =
                    typeof updater === "function" ? updater(prev) : updater;

                AsyncStorage.setItem("piData", JSON.stringify(updated));
                return updated;
            });
        } catch (e) {
            console.error("Failed to update property inspector:", e);
        }
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
        authenticate: authenticate,
        logout: logout,
        propertyInspector: propertyInspector,
        updatePropertyInspector: updatePropertyInspector,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContextProvider;