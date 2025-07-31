import axios from "axios";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5173/api" : "/api";

const axiosintance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 20000,
});

// 添加响应拦截器，处理 token 过期自动刷新
axiosintance.interceptors.response.use(
    (response) => {
        return response;
    },
    // async (error) => {
    //     const originalRequest = error.config;

    //     // 如果是 401 错误且没有重试过
    //     if (error.response?.status === 401 && !originalRequest._retry) {
    //         originalRequest._retry = true;

    //         try {
    //             // 尝试刷新 token
    //             await axiosintance.get('/auth/refresh');
    //             // 刷新成功后，重试原始请求
    //             return axiosintance(originalRequest);
    //         } catch (refreshError) {
    //             // 刷新失败，重定向到登录页
    //             window.location.href = '/login';
    //             return Promise.reject(refreshError);
    //         }
    //     }

    //     return Promise.reject(error);
    // }
);

export default axiosintance;