import { Locale, getMessages } from "@/i18n/messages";

export type PricingPlan = {
  name: string;
  audience: string;
  price: string;
  description: string;
  highlights: string[];
  featured?: boolean;
};

export const getPricingPlans = (locale: Locale): PricingPlan[] =>
  getMessages(locale).pricingPlans;