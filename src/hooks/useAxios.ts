import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "react-oidc-context";
import { api } from "#/lib/axios";
import type {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

interface QueueItem {
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}

export const useAxios = () => {
  const auth = useAuth();
  const isRefreshing = useRef(false);
  const failedQueue = useRef<QueueItem[]>([]);

  const processQueue = useCallback((error: unknown, token: string | null) => {
    failedQueue.current.forEach(({ resolve, reject }) => {
      if (token) resolve(token);
      else reject(error);
    });
    failedQueue.current = [];
  }, []);

  const refreshToken = useCallback(async (): Promise<string> => {
    try {
      const user = await auth.signinSilent();
      if (!user?.access_token)
        throw new Error("Silent refresh returned no token");
      return user.access_token;
    } catch (err) {
      await auth.removeUser();
      auth.signinRedirect();

      throw err;
    }
  }, [auth]);

  useEffect(() => {
    const requestIntercept = api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (!config.headers.Authorization && auth.user?.access_token) {
          config.headers.Authorization = `Bearer ${auth.user.access_token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseIntercept = api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status !== 401 || originalRequest._retry) {
          return Promise.reject(error);
        }

        if (isRefreshing.current) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.current.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing.current = true;

        try {
          const newToken = await refreshToken();
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing.current = false;
        }
      },
    );

    return () => {
      api.interceptors.request.eject(requestIntercept);
      api.interceptors.response.eject(responseIntercept);
    };
  }, [auth, processQueue, refreshToken]);

  return api;
};
