export interface EmailPattern {
  domain: string;
  serviceName: string;
  serviceUrl: string;
  category: string;
}

export const EMAIL_PATTERNS: EmailPattern[] = [
  // ──────── SNS ────────
  { domain: "mail.instagram.com", serviceName: "Instagram", serviceUrl: "https://www.instagram.com", category: "sns" },
  { domain: "facebookmail.com", serviceName: "Facebook", serviceUrl: "https://www.facebook.com", category: "sns" },
  { domain: "twitter.com", serviceName: "Twitter / X", serviceUrl: "https://x.com", category: "sns" },
  { domain: "x.com", serviceName: "Twitter / X", serviceUrl: "https://x.com", category: "sns" },
  { domain: "tiktok.com", serviceName: "TikTok", serviceUrl: "https://www.tiktok.com", category: "sns" },
  { domain: "linkedin.com", serviceName: "LinkedIn", serviceUrl: "https://www.linkedin.com", category: "sns" },
  { domain: "threads.net", serviceName: "Threads", serviceUrl: "https://www.threads.net", category: "sns" },

  // ──────── 쇼핑 ────────
  { domain: "coupang.com", serviceName: "쿠팡", serviceUrl: "https://www.coupang.com", category: "shopping" },
  { domain: "naver.com", serviceName: "네이버", serviceUrl: "https://www.naver.com", category: "other" },
  { domain: "11st.co.kr", serviceName: "11번가", serviceUrl: "https://www.11st.co.kr", category: "shopping" },
  { domain: "gmarket.co.kr", serviceName: "G마켓", serviceUrl: "https://www.gmarket.co.kr", category: "shopping" },
  { domain: "musinsa.com", serviceName: "무신사", serviceUrl: "https://www.musinsa.com", category: "shopping" },
  { domain: "ohou.se", serviceName: "오늘의집", serviceUrl: "https://ohou.se", category: "shopping" },
  { domain: "amazon.com", serviceName: "Amazon", serviceUrl: "https://www.amazon.com", category: "shopping" },
  { domain: "aliexpress.com", serviceName: "AliExpress", serviceUrl: "https://www.aliexpress.com", category: "shopping" },
  { domain: "baemin.com", serviceName: "배달의민족", serviceUrl: "https://www.baemin.com", category: "shopping" },
  { domain: "woowahan.com", serviceName: "배달의민족", serviceUrl: "https://www.baemin.com", category: "shopping" },

  // ──────── 금융 ────────
  { domain: "toss.im", serviceName: "토스", serviceUrl: "https://toss.im", category: "finance" },
  { domain: "kakaobank.com", serviceName: "카카오뱅크", serviceUrl: "https://www.kakaobank.com", category: "finance" },
  { domain: "kakaopay.com", serviceName: "카카오페이", serviceUrl: "https://www.kakaopay.com", category: "finance" },
  { domain: "naverfincorp.com", serviceName: "네이버페이", serviceUrl: "https://pay.naver.com", category: "finance" },
  { domain: "tosspayments.com", serviceName: "토스페이먼츠", serviceUrl: "https://www.tosspayments.com", category: "finance" },

  // ──────── 엔터테인먼트 ────────
  { domain: "netflix.com", serviceName: "Netflix", serviceUrl: "https://www.netflix.com", category: "entertainment" },
  { domain: "youtube.com", serviceName: "YouTube Premium", serviceUrl: "https://www.youtube.com/premium", category: "entertainment" },
  { domain: "spotify.com", serviceName: "Spotify", serviceUrl: "https://www.spotify.com", category: "entertainment" },
  { domain: "watcha.com", serviceName: "왓챠", serviceUrl: "https://watcha.com", category: "entertainment" },
  { domain: "wavve.com", serviceName: "웨이브", serviceUrl: "https://www.wavve.com", category: "entertainment" },
  { domain: "disneyplus.com", serviceName: "Disney+", serviceUrl: "https://www.disneyplus.com", category: "entertainment" },
  { domain: "bugs.co.kr", serviceName: "벅스", serviceUrl: "https://www.bugs.co.kr", category: "entertainment" },
  { domain: "melon.com", serviceName: "멜론", serviceUrl: "https://www.melon.com", category: "entertainment" },
  { domain: "tving.com", serviceName: "티빙", serviceUrl: "https://www.tving.com", category: "entertainment" },
  { domain: "apple.com", serviceName: "Apple", serviceUrl: "https://www.apple.com", category: "other" },

  // ──────── 업무 ────────
  { domain: "slack.com", serviceName: "Slack", serviceUrl: "https://slack.com", category: "work" },
  { domain: "notion.so", serviceName: "Notion", serviceUrl: "https://www.notion.so", category: "work" },
  { domain: "getnotion.com", serviceName: "Notion", serviceUrl: "https://www.notion.so", category: "work" },
  { domain: "google.com", serviceName: "Google", serviceUrl: "https://www.google.com", category: "other" },
  { domain: "microsoft.com", serviceName: "Microsoft 365", serviceUrl: "https://www.microsoft365.com", category: "work" },
  { domain: "figma.com", serviceName: "Figma", serviceUrl: "https://www.figma.com", category: "work" },
  { domain: "zoom.us", serviceName: "Zoom", serviceUrl: "https://zoom.us", category: "work" },

  // ──────── 게임 ────────
  { domain: "steampowered.com", serviceName: "Steam", serviceUrl: "https://store.steampowered.com", category: "gaming" },
  { domain: "epicgames.com", serviceName: "Epic Games", serviceUrl: "https://www.epicgames.com", category: "gaming" },
  { domain: "nexon.com", serviceName: "넥슨", serviceUrl: "https://www.nexon.com", category: "gaming" },
  { domain: "netmarble.com", serviceName: "넷마블", serviceUrl: "https://www.netmarble.com", category: "gaming" },
  { domain: "kakaogames.com", serviceName: "카카오게임즈", serviceUrl: "https://www.kakaogames.com", category: "gaming" },
  { domain: "riotgames.com", serviceName: "Riot Games", serviceUrl: "https://www.riotgames.com", category: "gaming" },
  { domain: "blizzard.com", serviceName: "Blizzard", serviceUrl: "https://www.blizzard.com", category: "gaming" },
  { domain: "ea.com", serviceName: "EA", serviceUrl: "https://www.ea.com", category: "gaming" },

  // ──────── 교육 ────────
  { domain: "udemy.com", serviceName: "Udemy", serviceUrl: "https://www.udemy.com", category: "education" },
  { domain: "class101.net", serviceName: "클래스101", serviceUrl: "https://class101.net", category: "education" },
  { domain: "inflearn.com", serviceName: "인프런", serviceUrl: "https://www.inflearn.com", category: "education" },
  { domain: "coursera.org", serviceName: "Coursera", serviceUrl: "https://www.coursera.org", category: "education" },
  { domain: "duolingo.com", serviceName: "Duolingo", serviceUrl: "https://www.duolingo.com", category: "education" },

  // ──────── 클라우드 ────────
  { domain: "dropbox.com", serviceName: "Dropbox", serviceUrl: "https://www.dropbox.com", category: "cloud" },
  { domain: "icloud.com", serviceName: "iCloud", serviceUrl: "https://www.icloud.com", category: "cloud" },

  // ──────── 개발 ────────
  { domain: "github.com", serviceName: "GitHub", serviceUrl: "https://github.com", category: "dev" },
  { domain: "gitlab.com", serviceName: "GitLab", serviceUrl: "https://gitlab.com", category: "dev" },
  { domain: "vercel.com", serviceName: "Vercel", serviceUrl: "https://vercel.com", category: "dev" },
  { domain: "amazonaws.com", serviceName: "AWS", serviceUrl: "https://aws.amazon.com", category: "dev" },
  { domain: "netlify.com", serviceName: "Netlify", serviceUrl: "https://www.netlify.com", category: "dev" },
  { domain: "heroku.com", serviceName: "Heroku", serviceUrl: "https://www.heroku.com", category: "dev" },
  { domain: "digitalocean.com", serviceName: "DigitalOcean", serviceUrl: "https://www.digitalocean.com", category: "dev" },
  { domain: "fly.io", serviceName: "Fly.io", serviceUrl: "https://fly.io", category: "dev" },
  { domain: "railway.app", serviceName: "Railway", serviceUrl: "https://railway.app", category: "dev" },
  { domain: "render.com", serviceName: "Render", serviceUrl: "https://render.com", category: "dev" },
  { domain: "npmjs.com", serviceName: "npm", serviceUrl: "https://www.npmjs.com", category: "dev" },
  { domain: "docker.com", serviceName: "Docker", serviceUrl: "https://www.docker.com", category: "dev" },

  // ──────── 기타 플랫폼 ────────
  { domain: "kakao.com", serviceName: "카카오톡", serviceUrl: "https://www.kakaocorp.com", category: "other" },
  { domain: "daum.net", serviceName: "다음/카카오", serviceUrl: "https://www.daum.net", category: "other" },
  { domain: "paypal.com", serviceName: "PayPal", serviceUrl: "https://www.paypal.com", category: "finance" },
  { domain: "stripe.com", serviceName: "Stripe", serviceUrl: "https://stripe.com", category: "finance" },
  { domain: "airbnb.com", serviceName: "Airbnb", serviceUrl: "https://www.airbnb.com", category: "other" },
  { domain: "uber.com", serviceName: "Uber", serviceUrl: "https://www.uber.com", category: "other" },
  { domain: "grab.com", serviceName: "Grab", serviceUrl: "https://www.grab.com", category: "other" },
  { domain: "pinterest.com", serviceName: "Pinterest", serviceUrl: "https://www.pinterest.com", category: "sns" },
  { domain: "reddit.com", serviceName: "Reddit", serviceUrl: "https://www.reddit.com", category: "sns" },
  { domain: "discord.com", serviceName: "Discord", serviceUrl: "https://discord.com", category: "sns" },
  { domain: "discordapp.com", serviceName: "Discord", serviceUrl: "https://discord.com", category: "sns" },
  { domain: "twitch.tv", serviceName: "Twitch", serviceUrl: "https://www.twitch.tv", category: "entertainment" },
  { domain: "canva.com", serviceName: "Canva", serviceUrl: "https://www.canva.com", category: "work" },
  { domain: "trello.com", serviceName: "Trello", serviceUrl: "https://trello.com", category: "work" },
  { domain: "atlassian.com", serviceName: "Atlassian", serviceUrl: "https://www.atlassian.com", category: "work" },
  { domain: "asana.com", serviceName: "Asana", serviceUrl: "https://asana.com", category: "work" },
  { domain: "medium.com", serviceName: "Medium", serviceUrl: "https://medium.com", category: "other" },
  { domain: "velog.io", serviceName: "velog", serviceUrl: "https://velog.io", category: "dev" },
  { domain: "tistory.com", serviceName: "티스토리", serviceUrl: "https://www.tistory.com", category: "other" },
  { domain: "yes24.com", serviceName: "YES24", serviceUrl: "https://www.yes24.com", category: "shopping" },
  { domain: "interpark.com", serviceName: "인터파크", serviceUrl: "https://www.interpark.com", category: "shopping" },
  { domain: "ssg.com", serviceName: "SSG닷컴", serviceUrl: "https://www.ssg.com", category: "shopping" },
  { domain: "lotteon.com", serviceName: "롯데ON", serviceUrl: "https://www.lotteon.com", category: "shopping" },
  { domain: "oliveyoung.co.kr", serviceName: "올리브영", serviceUrl: "https://www.oliveyoung.co.kr", category: "shopping" },
  { domain: "kurly.com", serviceName: "마켓컬리", serviceUrl: "https://www.kurly.com", category: "shopping" },
  { domain: "auction.co.kr", serviceName: "옥션", serviceUrl: "https://www.auction.co.kr", category: "shopping" },
];

/**
 * Given a "From" email address, find the matching service by domain.
 * e.g. "no-reply@coupang.com" → matches "coupang.com"
 */
export function matchEmailToService(
  fromAddress: string
): EmailPattern | undefined {
  const domain = fromAddress.split("@")[1]?.toLowerCase();
  if (!domain) return undefined;
  return EMAIL_PATTERNS.find(
    (p) => domain === p.domain || domain.endsWith("." + p.domain)
  );
}
