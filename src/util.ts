import { format } from "date-fns";

export function formattedDate(date: Date) {
  function getOrdinal(num: number) {
    const suffixes = ["th", "st", "nd", "rd"];
    const val = num % 100;
    return num + (suffixes[(val - 20) % 10] || suffixes[val] || suffixes[0]);
  }

  const formattedDate = `${
    format(date, "MMMM ") + getOrdinal(date.getDate())
  } ${format(date, "yyyy")}`;

  return formattedDate;
}

export function getTimeNow() {
  return new Date().toLocaleTimeString("en-GB", {
    timeZone: "Europe/London",
    hour12: true,
    hour: "numeric",
    minute: "numeric",
  });
}

interface Member {
  name: string;
  url: string;
}

export async function getWebring(
  url: URL,
  webringUrl: URL = new URL("https://webring.hackclub.com/members.json"),
) {
  // The members list rarely changes and its origin sends max-age=0, so cache it
  // in Cloudflare's edge cache for 5 minutes instead of hitting it every request
  const init = {
    cf: { cacheTtl: 300, cacheEverything: true },
  } as RequestInit;
  const response = await fetch(webringUrl, init);
  const members = (await response.json()) as Member[];

  const siteIndex = members.findIndex(
    (member) => new URL(member.url).hostname === url.hostname,
  );
  const previousIndex = (siteIndex - 1 + members.length) % members.length;
  const nextIndex = (siteIndex + 1) % members.length;
  const previous = members[previousIndex];
  const next = members[nextIndex];

  return { previous, next };
}
