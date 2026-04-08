import { EventSourcePolyfill } from "event-source-polyfill";

import { useEffect, useRef } from "react";
import { notification } from "antd";
import { getEnv } from "#/utils/envUtils";
import { useAuth } from "react-oidc-context";
import { message } from "antd";
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
  const { user } = useAuth();

  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
  const queryClient = useQueryClient();
  const { play } = useNotificationSound();

  useEffect(() => {
    if (!user?.access_token) return;

    const es = new EventSourcePolyfill(`${baseURL}/notifications/subscribe`, {
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
      heartbeatTimeout: 60000,
    });

    eventSourceRef.current = es;

    es.onmessage = (event: any) => {
      console.log("Received event:", event.data);
      if (event.data && event.data !== "Connected") {
        console.log("Received notification data:", event.data);
        const data = JSON.parse(event.data) as InAppNotification;
        message.info(data.message);
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

    es.onerror = () => {
      console.log("SSE error, reconnecting...");
      es.close();

      setTimeout(() => {
        eventSourceRef.current = new EventSourcePolyfill(
          `${baseURL}/notifications/subscribe`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
            },
            heartbeatTimeout: 120000,
          },
        );
      }, 3000);
    };

    return () => {
      es.close();
    };
  }, [user?.access_token]);
};
