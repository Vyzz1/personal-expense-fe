import { EventSourcePolyfill } from "event-source-polyfill";
import { useEffect, useRef } from "react";
import { notification, message } from "antd";
import { getEnv } from "#/utils/envUtils";
import { useAuth } from "react-oidc-context";
import { useQueryClient } from "@tanstack/react-query";
import {
  InAppNotificationEventTypes,
  type InAppNotification,
} from "#/models/notification";
import { useNotificationSound } from "./useNotificationSound";

export const useNewNotifications = () => {
  const baseURL = getEnv("VITE_API_URL", {
    parse: String,
  });
  const { user, signinSilent } = useAuth();
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
  const queryClient = useQueryClient();
  const { play } = useNotificationSound();

  useEffect(() => {
    if (!user?.access_token) return;

    const connect = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = new EventSourcePolyfill(`${baseURL}/notifications/subscribe`, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
        heartbeatTimeout: 45000,
      });

      es.onmessage = (event: any) => {
        if (event.data && event.data !== "Connected successfully") {
          try {
            const data = JSON.parse(event.data) as InAppNotification;
            message.info(data.message);
          } catch (e) {
            console.error(e);
          }
        }
      };

      es.addEventListener(
        InAppNotificationEventTypes.TRANSACTION_BATCH_PROCESSED,
        (event: any) => {
          if (event.data) {
            const data = JSON.parse(event.data) as InAppNotification;
            notification.success({
              message: data.message,
              description: data.description,
            });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
          }
        },
      );

      es.addEventListener(
        InAppNotificationEventTypes.EXPENSE_CALCULATED,
        (event: any) => {
          if (event.data) {
            play();
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
          }
        },
      );

      es.onerror = async (err: any) => {
        es.close();

        if (err.status === 401) {
          try {
            await signinSilent();
          } catch (e) {
            console.error("Silent refresh failed", e);
          }
        } else {
          setTimeout(() => {
            connect();
          }, 5000);
        }
      };

      eventSourceRef.current = es;
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [user?.access_token, baseURL, queryClient, play, signinSilent]);
};
