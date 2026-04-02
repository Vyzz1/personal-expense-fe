import { getEnv } from "#/utils/envUtils";
import { type AuthProviderProps } from "react-oidc-context";

export const keycloakConfig: AuthProviderProps = {
  authority: getEnv("VITE_KEYCLOAK_REALM_URL"),

  client_id: getEnv("VITE_KEYCLOAK_CLIENT_ID"),

  redirect_uri: getEnv("VITE_KEYCLOAK_REDIRECT_URI"),

  post_logout_redirect_uri: getEnv("VITE_KEYCLOAK_POST_LOGOUT_REDIRECT_URI"),

  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};
