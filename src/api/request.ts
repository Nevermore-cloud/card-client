import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";

// 创建 Axios 实例
const service: AxiosInstance = axios.create({
  baseURL: "/api", // 全局请求前缀，可根据环境变量配置
  timeout: 5000, // 超时时间 ms
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 如果有 token，可以在这里统一加到 headers
    // config.headers.Authorization = `Bearer ${getToken()}`
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 可以在这里统一处理响应，比如只返回 data
    return response.data;
  },
  (error) => {
    // 可统一处理错误
    return Promise.reject(error);
  }
);

export default service;
