/**
 * Curated marketplace synonym groups. Looking up any member expands to the
 * whole group (bidirectional).
 */
const SYNONYM_GROUPS: readonly (readonly string[])[] = [
  // Electronics / computing
  [
    "macbook",
    "mac",
    "laptop",
    "notebook",
    "computer",
    "pc",
    "chromebook",
    "ultrabook",
  ],
  ["iphone", "android", "phone", "smartphone", "cellphone", "mobile"],
  ["ipad", "tablet", "galaxy tab"],
  ["airpods", "earbuds", "earphones", "headphones", "headset"],
  ["monitor", "display", "screen"],
  ["keyboard", "mech keyboard", "mechanical keyboard"],
  ["mouse", "trackpad"],
  ["charger", "adapter", "cable", "usb-c", "usbc"],
  ["webcam", "camera"],
  ["speaker", "bluetooth speaker"],
  ["router", "wifi", "modem"],
  ["gpu", "graphics card", "graphics"],
  ["cpu", "processor"],

  // Furniture
  ["desk", "table", "workstation"],
  ["chair", "office chair", "desk chair", "stool"],
  ["couch", "sofa", "loveseat", "futon"],
  ["mattress", "bed", "bedframe", "bed frame", "twin", "queen", "full"],
  ["dresser", "drawer", "drawers", "chest"],
  ["shelf", "shelves", "bookshelf", "bookcase"],
  ["lamp", "lighting", "light"],
  ["rug", "carpet"],

  // Textbooks / school
  [
    "textbook",
    "textbooks",
    "book",
    "books",
    "novel",
    "reader",
    "course reader",
  ],
  ["notes", "lecture notes", "cheatsheet", "cheat sheet"],
  ["calculator", "graphing calculator", "ti-84", "ti84"],

  // Transportation
  ["bike", "bicycle", "cycle", "ebike", "e-bike", "electric bike"],
  ["scooter", "vespa", "moped"],
  ["skateboard", "longboard", "penny board"],
  ["helmet"],
  ["car", "vehicle", "auto", "automobile"],

  // Appliances / kitchen
  ["fridge", "refrigerator", "mini fridge", "minifridge"],
  ["microwave", "micro"],
  ["kettle", "electric kettle"],
  ["blender", "mixer"],
  ["fan", "air cooler", "ac", "air conditioner", "heater", "space heater"],
  ["vacuum", "vacuum cleaner"],
  ["washer", "dryer", "laundry"],

  // Clothing
  ["jacket", "coat", "hoodie", "sweatshirt", "parka"],
  ["shoes", "sneakers", "boots", "footwear"],
  ["jeans", "pants", "trousers"],
  ["shirt", "tee", "t-shirt", "tshirt", "top"],
  ["dress", "skirt"],

  // Tickets / events
  ["ticket", "tickets", "pass", "passes", "admission"],
  ["concert", "show", "gig", "festival"],
  ["sports ticket", "cal game", "football ticket", "basketball ticket"],

  // Housing
  ["apartment", "apt", "flat", "unit", "studio"],
  ["lease", "sublease", "sublet", "room", "roommate", "housing"],
  ["dorm", "residence hall"],

  // Misc campus
  ["backpack", "bag", "tote"],
  ["printer", "printing"],
  ["tv", "television"],
  ["console", "ps5", "playstation", "xbox", "switch", "nintendo"],
  ["game", "videogame", "video game", "gaming"],
];

const synonymLookup: Map<string, string[]> = (() => {
  const map = new Map<string, string[]>();
  for (const group of SYNONYM_GROUPS) {
    const normalized = group.map(normalizeToken).filter(Boolean);
    const unique = Array.from(new Set(normalized));
    for (const term of unique) {
      const existing = map.get(term) ?? [];
      map.set(term, Array.from(new Set([...existing, ...unique])));
    }
  }
  return map;
})();

export function normalizeToken(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9+\-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Expand a single token to itself plus synonym group members. */
export function expandToken(token: string): string[] {
  const key = normalizeToken(token);
  if (!key) return [];
  const synonyms = synonymLookup.get(key);
  if (!synonyms) return [key];
  return synonyms;
}

/**
 * Expand a full user query into unique search terms (original tokens + synonyms).
 */
export function expandSearchTerms(query: string): string[] {
  const tokens = normalizeToken(query)
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);

  const terms = new Set<string>();
  for (const token of tokens) {
    for (const expanded of expandToken(token)) {
      if (expanded.length >= 2) terms.add(expanded);
    }
  }

  // Also keep multi-word phrase pieces that appear as synonym keys (e.g. "mini fridge")
  const full = normalizeToken(query);
  if (full.length >= 2) {
    for (const expanded of expandToken(full)) {
      if (expanded.length >= 2) terms.add(expanded);
    }
  }

  return Array.from(terms);
}
