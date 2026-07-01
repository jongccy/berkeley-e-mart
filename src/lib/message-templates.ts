export const LISTING_MESSAGE_TEMPLATES = [
  "Hi, is this still available?",
  "Can we meet at Sather Gate?",
  "I'm interested — when are you free to meet?",
] as const;

export function priceOfferTemplate(priceLabel: string): string {
  return `Would you take ${priceLabel}?`;
}
