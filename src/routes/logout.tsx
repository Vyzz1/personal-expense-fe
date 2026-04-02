import { createFileRoute,  } from "@tanstack/react-router";
import { Button, Card, Typography } from "antd";
import { useAuth } from "react-oidc-context";

export const Route = createFileRoute("/logout")({
  component: RouteComponent,
});

function RouteComponent() {
  const { signinRedirect } = useAuth();


  return (
    <section className="px-4 py-12">
      <div className="max-w-sm mx-auto">
        <Card className="rounded-2xl p-6 sm:p-8">
          <Typography.Title level={2} className="text-center">
            You have been logged out.
          </Typography.Title>
          <Typography.Paragraph className="text-center">
            You can close this page now.
          </Typography.Paragraph>

          <span className="block mt-4 text-center text-sm text-muted-foreground">
            If you want to log in again, please click here
          </span>

          <div className="flex items-center justify-center">
            <Button
              type="primary"
              className="mt-4 mx-auto"
              onClick={() => {
                signinRedirect();
              }}
            >
              Login Again
            </Button>
         
          </div>
        </Card>
      </div>
    </section>
  );
}
