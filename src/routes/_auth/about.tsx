import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "antd";
import { useAuth } from "react-oidc-context";

export const Route = createFileRoute("/_auth/about")({
  component: About,
});

function About() {
  const { signoutRedirect } = useAuth();
  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">About</p>
        <h1 className="display-title mb-3 text-4xl font-bold sm:text-5xl">
          A small starter with room to grow.
        </h1>
        <Button
          type="primary"
          onClick={async () => {
            await signoutRedirect({
              post_logout_redirect_uri: "http://localhost:3000/logout",
            });
          }}
        >
          Logout
        </Button>
        <p className="m-0 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
          TanStack Start gives you type-safe routing, server functions, and
          modern SSR defaults. Use this as a clean foundation, then layer in
          your own routes, styling, and add-ons.
        </p>
      </section>

      
         <Link to="/category" className="ml-4 text-sm text-muted-foreground">
              Categories
            </Link>
    </main>
  );
}
