import { HOUSING_CATEGORY } from "@/lib/constants";

const VAGUE_LOCATION_PATTERNS = [
  /^(north|south|east|west)(\s+berkeley|\s+side|\s+campus)?$/i,
  /^(near|around|close to)\s/i,
  /^(berkeley|campus|downtown)(\s+area|\s+vicinity)?$/i,
  /^(telegraph|shattuck)(\s+area)?$/i,
  /\bneighborhood\b/i,
  /\bgeneral\s+location\b/i,
  /\barea\s+only\b/i,
];

export function isHousingListing(category: string): boolean {
  return category === HOUSING_CATEGORY;
}

export function validateExactHousingLocation(value: string): string | null {
  const location = value.trim();
  if (!location) {
    return "Exact location is required for housing listings.";
  }
  if (location.length < 10) {
    return "Enter the full street address, not a general area.";
  }

  const lower = location.toLowerCase();
  for (const pattern of VAGUE_LOCATION_PATTERNS) {
    if (pattern.test(lower)) {
      return "Enter the exact street address, not a neighborhood or general area.";
    }
  }

  const hasStreetNumber =
    /^\d+\s+\S/.test(location) ||
    /#\s*\d+/.test(location) ||
    /\b\d{1,5}\s+[a-z]/i.test(location);

  if (!hasStreetNumber) {
    return "Include the street number in the exact address.";
  }

  return null;
}
