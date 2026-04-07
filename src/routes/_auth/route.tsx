import RequireAuth from "#/context/required-auth";
import { AppLayout } from "#/components/layout/AppLayout";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useNewNotifications } from "#/hooks/useNewNotification";
import { notification } from "antd";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  const [_, contextHolder] = notification.useNotification();

  useNewNotifications();

  return (
    <RequireAuth>
      {contextHolder}
      <AppLayout>
        <Outlet />
      </AppLayout>
    </RequireAuth>
  );
}
