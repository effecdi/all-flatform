import { google } from "googleapis";
import { config } from "./config";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

export function createOAuth2Client() {
  return new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
    config.googleRedirectUri
  );
}

export function getAuthUrl(): string {
  const client = createOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
}

export async function getTokensFromCode(code: string) {
  const client = createOAuth2Client();
  const { tokens } = await client.getToken(code);
  return tokens;
}

// Simple in-memory token store per session (in production, use a proper session store)
const tokenStore = new Map<string, { access_token: string; refresh_token?: string }>();

export function storeTokens(
  sessionId: string,
  tokens: { access_token?: string | null; refresh_token?: string | null }
) {
  if (tokens.access_token) {
    tokenStore.set(sessionId, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? undefined,
    });
  }
}

export function getStoredTokens(sessionId: string) {
  return tokenStore.get(sessionId);
}

export function clearTokens(sessionId: string) {
  tokenStore.delete(sessionId);
}
