import { keycloakConfig } from "#/config/keycloak";
import { AuthProvider } from "react-oidc-context";

export default function AuthContext({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider {...keycloakConfig}>{children}</AuthProvider>;
}
