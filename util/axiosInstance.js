import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create an Axios instance
const axiosInstance = axios.create({
    withCredentials: true,
    withXSRFToken: true,
});

// Add a request interceptor to dynamically set baseURL
axiosInstance.interceptors.request.use(
    async (config) => {
        const baseURL = await AsyncStorage.getItem('scannedData');
        const token = await AsyncStorage.getItem('authToken');
        if (!baseURL) {
            throw new Error("BASE_URL not set in AsyncStorage");
        }

        config.baseURL = JSON.parse(baseURL).url;
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;
