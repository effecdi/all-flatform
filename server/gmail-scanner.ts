import { google } from "googleapis";
import { createOAuth2Client } from "./google-auth";
import { matchEmailToService, type EmailPattern } from "@shared/email-patterns";
import { logger } from "./logger";

export interface DiscoveredAccount {
  serviceName: string;
  serviceUrl: string;
  category: string;
  emailSubject: string;
  emailDate: string;
  fromAddress: string;
}

const SEARCH_QUERY =
  'subject:(가입 OR 회원가입 OR welcome OR "verify your" OR 인증 OR 확인 OR "sign up" OR "account created" OR "계정 생성" OR "가입을 환영" OR "회원가입을 축하")';

export async function scanGmail(accessToken: string): Promise<DiscoveredAccount[]> {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  // Search for registration-related emails
  const listRes = await gmail.users.messages.list({
    userId: "me",
    q: SEARCH_QUERY,
    maxResults: 200,
  });

  const messageIds = listRes.data.messages || [];
  if (messageIds.length === 0) return [];

  // Fetch headers for each message (batched)
  const discovered = new Map<string, DiscoveredAccount>();

  // Process in chunks of 20 to avoid rate limits
  const chunks: string[][] = [];
  for (let i = 0; i < messageIds.length; i += 20) {
    chunks.push(messageIds.slice(i, i + 20).map((m) => m.id!));
  }

  for (const chunk of chunks) {
    const results = await Promise.all(
      chunk.map((id) =>
        gmail.users.messages
          .get({
            userId: "me",
            id,
            format: "metadata",
            metadataHeaders: ["From", "Subject", "Date"],
          })
          .catch(() => null)
      )
    );

    for (const res of results) {
      if (!res?.data?.payload?.headers) continue;

      const headers = res.data.payload.headers;
      const from = headers.find((h) => h.name === "From")?.value || "";
      const subject = headers.find((h) => h.name === "Subject")?.value || "";
      const date = headers.find((h) => h.name === "Date")?.value || "";

      // Extract email address from "Name <email@domain>" format
      const emailMatch = from.match(/<(.+?)>/) || [null, from];
      const fromAddress = (emailMatch[1] || from).trim().toLowerCase();

      const matched = matchEmailToService(fromAddress);
      if (matched && !discovered.has(matched.serviceName)) {
        discovered.set(matched.serviceName, {
          serviceName: matched.serviceName,
          serviceUrl: matched.serviceUrl,
          category: matched.category,
          emailSubject: subject,
          emailDate: date,
          fromAddress,
        });
      }
    }
  }

  logger.info(`Gmail 스캔 완료: ${discovered.size}개 서비스 발견 (${messageIds.length}개 메일 검색)`);
  return Array.from(discovered.values());
}
