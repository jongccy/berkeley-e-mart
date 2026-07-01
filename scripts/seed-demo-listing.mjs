import { createClient } from "@supabase/supabase-js";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const SEED_DIR = resolve(root, "public/seed");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  const missing = [];
  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  console.error(`Missing in .env.local: ${missing.join(", ")}`);
  if (!serviceRoleKey) {
    console.error(
      "\nAdd this line to .env.local (not .env.local.example):\n"
    );
    console.error(
      "SUPABASE_SERVICE_ROLE_KEY=paste-your-service-role-key-here\n"
    );
    console.error(
      "Find it in Supabase → Project Settings → API → Project API keys → service_role"
    );
  }
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_SELLERS = [
  {
    email: "demo.seller@berkeley.edu",
    profile: {
      display_name: "Homestead Furnishings",
      marketplace_alias: "Homestead Furnishings",
      show_real_name: false,
      bio: "Specializing in high-quality, sustainable outdoor furniture and home decor. We pride ourselves on durable pieces that bring comfort to your backyard.",
    },
  },
  {
    email: "demo.books@berkeley.edu",
    profile: {
      display_name: "Berkeley Book Exchange",
      marketplace_alias: "Berkeley Book Exchange",
      show_real_name: false,
      bio: "Affordable textbooks and course readers for Cal students. Fast pickup near campus, most books under $50.",
    },
  },
];

const DEMO_LISTINGS = [
  {
    id: "b0000000-0000-4000-8000-000000000001",
    sellerEmail: "demo.seller@berkeley.edu",
    imageFile: "armchair.jpg",
    imageUrl:
      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=1200&q=80",
    listing: {
      title: "Classic Teak Outdoor Armchair with Cream Cushion",
      description:
        "Elegant armchair crafted from weather-resistant teak with a natural light-brown finish. Includes a thick cream seat cushion, vertical slat backrest, and curved armrests. Great for patios, decks, or outdoor dining areas.",
      price_cents: 14999,
      category: "furniture",
      quality_rating: 5,
      tags: ["furniture", "outdoor", "patio", "teak", "armchair", "garden"],
      seller_display_mode: "profile",
      seller_display_name: null,
      status: "active",
    },
  },
  {
    id: "b0000000-0000-4000-8000-000000000002",
    sellerEmail: "demo.books@berkeley.edu",
    imageFile: "textbook.jpg",
    imageUrl:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1200&q=80",
    listing: {
      title: "EECS 61B Textbook — Data Structures (Like New)",
      description:
        "Barely used copy of the EECS 61B course reader. No highlighting or torn pages. Pickup near Sather Gate or Moffitt. Perfect for spring semester.",
      price_cents: 4500,
      category: "textbooks",
      quality_rating: 4,
      tags: ["textbook", "eecs", "cs", "61b", "data structures"],
      seller_display_mode: "profile",
      seller_display_name: null,
      status: "active",
    },
  },
];

async function getOrCreateDemoSeller(email, userMetadataName) {
  const { data: existingUsers, error: listError } =
    await supabase.auth.admin.listUsers();

  if (listError) throw listError;

  const existing = existingUsers.users.find((user) => user.email === email);
  if (existing) return existing.id;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { name: userMetadataName },
  });

  if (error) throw error;
  return data.user.id;
}

async function ensureSeedImage(fileName, imageUrl) {
  mkdirSync(SEED_DIR, { recursive: true });
  const imagePath = resolve(SEED_DIR, fileName);

  if (!existsSync(imagePath)) {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Could not download seed image: ${imageUrl}`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    writeFileSync(imagePath, bytes);
  }

  return imagePath;
}

async function insertListingWithLegacyFallback(listingPayload) {
  let { error: listingError } = await supabase
    .from("listings")
    .insert(listingPayload);

  if (listingError?.message?.includes('column "type"')) {
    ({ error: listingError } = await supabase.from("listings").insert({
      ...listingPayload,
      type: "item",
    }));
  }

  if (listingError) {
    if (listingError.message.includes("quality_rating")) {
      throw new Error(
        `${listingError.message}\n\nRun migration 008 in Supabase SQL Editor (see supabase/migrations/008_listing_quality_rating.sql).`
      );
    }
    if (listingError.message.includes("tags")) {
      throw new Error(
        `${listingError.message}\n\nRun migration 009 in Supabase SQL Editor (see supabase/migrations/009_listing_tags.sql).`
      );
    }
    if (listingError.message.includes('column "type"')) {
      throw new Error(
        `${listingError.message}\n\nRun migration 007 in Supabase SQL Editor to remove the legacy type column.`
      );
    }
    throw listingError;
  }
}

async function seedDemoListing({ id, sellerEmail, imageFile, imageUrl, listing }) {
  const sellerConfig = DEMO_SELLERS.find((s) => s.email === sellerEmail);
  if (!sellerConfig) {
    throw new Error(`Unknown demo seller email: ${sellerEmail}`);
  }

  const sellerId = await getOrCreateDemoSeller(
    sellerEmail,
    sellerConfig.profile.marketplace_alias
  );

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: sellerId,
    ...sellerConfig.profile,
  });

  if (profileError) throw profileError;

  await supabase.from("listing_images").delete().eq("listing_id", id);
  await supabase.from("listings").delete().eq("id", id);

  await insertListingWithLegacyFallback({
    id,
    seller_id: sellerId,
    ...listing,
  });

  const imagePath = await ensureSeedImage(imageFile, imageUrl);
  const imageBytes = readFileSync(imagePath);
  const storagePath = `${sellerId}/${id}/0.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("listing-images")
    .upload(storagePath, imageBytes, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { error: imageRowError } = await supabase.from("listing_images").insert({
    listing_id: id,
    storage_path: storagePath,
    sort_order: 0,
  });

  if (imageRowError) throw imageRowError;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    url: `${siteUrl}/listings/${id}`,
    seller: sellerConfig.profile.marketplace_alias,
    email: sellerEmail,
  };
}

async function main() {
  const results = [];

  for (const demo of DEMO_LISTINGS) {
    const result = await seedDemoListing(demo);
    results.push(result);
    console.log(`Seeded: ${result.seller} → ${result.url}`);
  }

  console.log("\nDemo listings ready:");
  for (const result of results) {
    console.log(`- ${result.url} (${result.seller}, ${result.email})`);
  }
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
