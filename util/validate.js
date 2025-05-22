import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
axios.defaults.baseURL = "http://192.168.100.125:8000";

export async function validate(token) {
    await axios.post("/validate-token", {
        token,
    }, {
        headers: {
            "Content-Type": "application/json",
        },
    });
}
