import type { Locale } from "./types";

export const messages = {
  en: {
    explore: "Explore",
    pricing: "Pricing",
    about: "About",
    dashboard: "Dashboard",
    signIn: "Sign in",
    startCampaign: "Start a campaign",
    language: "Filipino",
    allOrNothing: "All-or-nothing funding",
    beta: "Closed beta",
    backCampaign: "Back this campaign",
    verified: "Verified business",
    daysLeft: "days left",
    backers: "backers",
    raised: "raised",
  },
  fil: {
    explore: "Tuklasin",
    pricing: "Presyo",
    about: "Tungkol",
    dashboard: "Dashboard",
    signIn: "Mag-sign in",
    startCampaign: "Magsimula ng kampanya",
    language: "English",
    allOrNothing: "Lahat-o-walang pondohan",
    beta: "Saradong beta",
    backCampaign: "Suportahan ang kampanya",
    verified: "Beripikadong negosyo",
    daysLeft: "araw na lang",
    backers: "sumuporta",
    raised: "nalikom",
  },
} as const;

export type MessageKey = keyof (typeof messages)["en"];
export function translate(locale: Locale, key: MessageKey): string {
  return messages[locale][key];
}
