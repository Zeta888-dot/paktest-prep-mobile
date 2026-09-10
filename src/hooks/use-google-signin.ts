import { useCallback, useState } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { apiFetch } from "../lib/api";
import { useAuth } from "../store/auth";
import { useHistory } from "../store/history";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
};

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "";

function generateNonce() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function useGoogleSignIn() {
  const [error, setError] = useState<string | null>(null);
  const setSession = useAuth((s) => s.setSession);
  const setSigningIn = useAuth((s) => s.setSigningIn);

  const redirectUri = AuthSession.makeRedirectUri();

  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ["openid", "profile", "email"],
      redirectUri,
      responseType: AuthSession.ResponseType.IdToken,
      extraParams: {
        nonce: generateNonce(),
      },
    },
    discovery
  );

  const signIn = useCallback(async () => {
    setError(null);
    setSigningIn(true);
    try {
      const result = await promptAsync();
      if (result.type !== "success") {
        setSigningIn(false);
        return;
      }
      const idToken = result.params.id_token;
      if (!idToken) throw new Error("No ID token returned");

      const res = await apiFetch("/api/mobile-auth", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign-in failed");

      await setSession(data.token, data.user);
      await useHistory.getState().load();
    } catch (e: any) {
      setError(e.message || "Something went wrong");
      setSigningIn(false);
    }
  }, [promptAsync, setSession, setSigningIn]);

  return { signIn, ready: !!request, error };
}