import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { useAxios } from "#/hooks/useAxios";
import type { AxiosRequestConfig, AxiosError } from "axios";

type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

interface UseApiMutationOptions<TData, TError, TVariables, TContext>
  extends Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    "mutationFn"
  > {
  axiosConfig?: AxiosRequestConfig;
}

/**
 * A generic React Query mutation hook that uses our authenticated Axios instance.
 *
 * @param url The API endpoint or a function that returns the endpoint based on variables
 * @param method The HTTP method to use (default: POST)
 * @param options React Query mutation options and optional Axios config
 */
export function useApiMutation<
  TData = unknown,
  TError = AxiosError,
  TVariables = unknown,
  TContext = unknown,
>(
  url: string | ((variables: TVariables) => string),
  method: HttpMethod = "POST",
  options?: UseApiMutationOptions<TData, TError, TVariables, TContext>,
) {
  const api = useAxios();
  const { axiosConfig, ...reactQueryOptions } = options || {};

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn: async (variables: TVariables) => {
      try {
        const endpoint = typeof url === "function" ? url(variables) : url;

        const requestConfig: AxiosRequestConfig = {
          url: endpoint,
          method,
          ...axiosConfig,
        };

        if (method !== "DELETE") {
          requestConfig.data = variables;
        }

        const response = await api.request<TData>(requestConfig);
        return response.data;
      } catch (err) {
        const axiosError = err as AxiosError;
        throw axiosError.response?.data || axiosError;
      }
    },
    ...reactQueryOptions,
  });
}
