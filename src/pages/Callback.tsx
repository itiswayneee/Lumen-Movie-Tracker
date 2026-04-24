import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { exchangeToken, clearStoredState, setAccessToken, setRefreshToken } from "@/lib/trakt";

const Callback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorDesc = searchParams.get("error_description");

    if (errorDesc) {
      setError(errorDesc);
      return;
    }

    if (!code) {
      setError("No authorization code received.");
      return;
    }

    const storedState = localStorage.getItem("trakt_oauth_state");
    if (state !== storedState) {
      setError("Invalid state. Please try signing in again.");
      return;
    }

    const doExchange = async () => {
      try {
        clearStoredState();
        const tokens = await exchangeToken(code);
        setAccessToken(tokens.access_token, tokens.expires_in);
        setRefreshToken(tokens.refresh_token);
        navigate("/", { replace: true });
      } catch (e) {
        setError((e as Error).message);
      }
    };

    doExchange();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="grain flex min-h-screen items-center justify-center">
        <div className="glass mx-auto max-w-md rounded-2xl p-8 text-center">
          <h2 className="mb-2 font-display text-xl font-semibold text-destructive">
            Sign In Failed
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">{error}</p>
          <a
            href="/"
            className="text-sm text-primary hover:text-primary-glow"
          >
            Go back
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="grain flex min-h-screen items-center justify-center">
      <div className="glass mx-auto max-w-md rounded-2xl p-8 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <h2 className="mt-4 font-display text-xl font-semibold">
          Signing you in...
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please wait while we complete the sign in process.
        </p>
      </div>
    </div>
  );
};

export default Callback;