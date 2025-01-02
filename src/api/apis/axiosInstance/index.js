import axios from "axios";
import config from "../../../utils/config";
import store from "../../../utils/store/Store";
import { isLoggedIn } from "../../../utils/store/reducers/UserSlice";
import { Navigate } from "react-router";

const createAxiosInstance = (baseURL) => {
  const axiosInstance = axios.create({
    baseURL,
  });

  axiosInstance.interceptors.request.use(
    (conf) => {
      if (localStorage.getItem("access_token")) {
        try {
          const token = localStorage.getItem("access_token");
          if (token && token !== null) {
            conf.headers["Authorization"] = token;
          }
        } catch (error) {
          console.error("Error decrypting or parsing access token:", error);
        }
      }
      return conf;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    failedQueue = [];
  };

  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      if (error?.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = token;
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          if (localStorage.getItem("refresh_token")) {
            const refreshToken = localStorage.getItem("refresh_token");
            const response = await axios.get(config.authUrl + "/refresh", {
              headers: {
                Authorization: refreshToken,
                "Content-Type": "application/json",
              },
            });
            if (response.status === 200) {
              const newAccessToken = response?.access_token;
              const newRefreshToken = response?.access_token;
              localStorage.setItem("access_token", newAccessToken);
              localStorage.setItem("refresh_token", newRefreshToken);

              axiosInstance.defaults.headers["Authorization"] = newAccessToken;
              originalRequest.headers["Authorization"] = newAccessToken;

              processQueue(null, newAccessToken);

              return axiosInstance(originalRequest);
            }
          }
          processQueue(error, null);
          return Promise.reject(error);
        } catch (refreshError) {
          processQueue(refreshError, null);
          store.dispatch(isLoggedIn(false));
          localStorage.clear();
          return <Navigate to={"/login"} />;
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export const authAxiosInstance = createAxiosInstance(config.authUrl);
export const pipelineAxiosInstance = createAxiosInstance(config.pipelineUrl);
