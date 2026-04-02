import RequireAuth from "#/context/required-auth";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  );
}
