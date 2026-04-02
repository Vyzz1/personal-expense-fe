import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "antd";
import { useAuth } from "react-oidc-context";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const { signoutRedirect } = useAuth();
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <h1 className="mb-4 text-3xl font-bold">Welcome1 to TanStack Router!</h1>
      <Button
        onClick={async () => {
          await signoutRedirect({
          });
        }}
      >
        Logout
      </Button>

    </main>
  );
}
