import { Spin } from "antd";
import { useEffect, useState } from "react";
import { hasAuthParams, useAuth } from "react-oidc-context";

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  const [hasTriedSignin, setHasTriedSignin] = useState(false);

  useEffect(() => {
    if (
      !hasAuthParams() &&
      !auth.isAuthenticated &&
      !auth.activeNavigator &&
      !auth.isLoading &&
      !hasTriedSignin
    ) {
      auth.signinRedirect();
      setHasTriedSignin(true);
    }
  }, [auth, hasTriedSignin]);

  if (auth.error) {
    return (
      <div>
        <h2>Lỗi trao đổi Token!</h2>
        <p>{auth.error.message}</p>
      </div>
    );
  }
  if (auth.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
