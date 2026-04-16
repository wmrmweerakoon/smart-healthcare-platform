const axios = require('axios');

const axiosClient = axios.create({
    timeout: 10000, // 10 seconds timeout
});

// Request Interceptor to log or manipulate requests globally
axiosClient.interceptors.request.use(
    (config) => {
        // You can attach global headers here if required for inter-service communication
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor to handle errors globally
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('Axios Error:', error.message);
        return Promise.reject(error);
    }
);

module.exports = axiosClient;
