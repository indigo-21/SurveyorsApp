import axiosInstance from "./axiosInstance";

export async function login(email, password) {
    // First get CSRF cookie
    await axiosInstance.get("/sanctum/csrf-cookie");

    // Then perform login
    const response = await axiosInstance.post("/api/login-api", {
        email,
        password,
    });

    const propertyInspectorData = response.data;

    return propertyInspectorData;
}

export async function logout(id) {
    const response = await axiosInstance.post("/api/logout-api", {
        id,
    });

    return response.data;
}

export async function sendSMS(id) {
    
    const response = await axiosInstance.post("/api/send-sms", {
        id,
    });

    return response.data;
}

export async function verifyOTP(id, otp) {
    const response = await axiosInstance.post("/api/verify-otp", {
        id,
        otp,
    });

    return response.data;
}