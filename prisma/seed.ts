// DowgNut seed script — idempotent (upsert by name).
// Run with:  bun prisma/seed.ts

import { db } from "../src/lib/db";

type SeedDonut = {
  name: string;
  description: string;
  price: number;
  type: "classic" | "sprinkled" | "stuffed" | "specialty";
  imgUrl: string;
  tags: string; // comma-separated
  rating: number;
  calories: number;
  stock: number;
  featured: boolean;
};

const BASE = "https://romanejaquez.github.io/flutter-codelab4/assets";

const img = (folder: string, n: number) =>
  `${BASE}/${folder}/${folder === "donutclassic" ? "donut_classic" : folder === "donutsprinkled" ? "donut_sprinkled" : "donut_stuffed"}${n}.png`;

const DONUTS: SeedDonut[] = [
  // ── Classic (5) ─────────────────────────────────────────────
  {
    name: "Classic Glazed",
    description:
      "The OG ring donut, hand-dipped in a thin vanilla glaze that crackles with every bite.",
    price: 1.95,
    type: "classic",
    imgUrl: img("donutclassic", 1),
    tags: "glazed,vanilla,classic",
    rating: 4.7,
    calories: 220,
    stock: 60,
    featured: true,
  },
  {
    name: "Chocolate Cake Classic",
    description:
      "Dense old-fashioned chocolate cake donut with a cocoa-rich crumb and a hint of espresso.",
    price: 2.25,
    type: "classic",
    imgUrl: img("donutclassic", 2),
    tags: "chocolate,cake,classic",
    rating: 4.6,
    calories: 290,
    stock: 50,
    featured: false,
  },
  {
    name: "Maple Bacon Bar",
    description:
      "Smoky maple glaze crowned with crispy applewood bacon bits — sweet meets savory in every bite.",
    price: 3.75,
    type: "classic",
    imgUrl: img("donutclassic", 3),
    tags: "maple,bacon,classic",
    rating: 4.8,
    calories: 380,
    stock: 35,
    featured: true,
  },
  {
    name: "Powdered Sugar Donut",
    description:
      "Pillow-soft yeast donut rolled in a snowdrift of powdered sugar. Simple, comforting bliss.",
    price: 1.75,
    type: "classic",
    imgUrl: img("donutclassic", 4),
    tags: "powdered,sugar,classic",
    rating: 4.4,
    calories: 240,
    stock: 70,
    featured: false,
  },
  {
    name: "Cinnamon Twist",
    description:
      "Hand-twisted yeast dough dusted in cinnamon sugar, with a tender pull-apart crumb.",
    price: 2.1,
    type: "classic",
    imgUrl: img("donutclassic", 5),
    tags: "cinnamon,sugar,classic",
    rating: 4.5,
    calories: 260,
    stock: 55,
    featured: false,
  },

  // ── Sprinkled (5) ───────────────────────────────────────────
  {
    name: "Rainbow Birthday Sprinkle",
    description:
      "Vanilla frosting smothered in rainbow jimmies — the life of every party, no invitation required.",
    price: 2.5,
    type: "sprinkled",
    imgUrl: img("donutsprinkled", 1),
    tags: "rainbow,sprinkled,vanilla",
    rating: 4.7,
    calories: 280,
    stock: 65,
    featured: true,
  },
  {
    name: "Chocolate Sprinkle Bomb",
    description:
      "Dark chocolate icing under a generous blanket of rainbow sprinkles. Maximum crunch, maximum cocoa.",
    price: 2.65,
    type: "sprinkled",
    imgUrl: img("donutsprinkled", 2),
    tags: "chocolate,sprinkled",
    rating: 4.6,
    calories: 300,
    stock: 60,
    featured: false,
  },
  {
    name: "Strawberry Funfetti",
    description:
      "Strawberry milkshake glaze with confetti sprinkles baked right into the dough.",
    price: 2.75,
    type: "sprinkled",
    imgUrl: img("donutsprinkled", 3),
    tags: "strawberry,sprinkled,funfetti",
    rating: 4.5,
    calories: 290,
    stock: 50,
    featured: false,
  },
  {
    name: "Vanilla Bean Jimmie",
    description:
      "Madagascar vanilla glaze topped with chocolate jimmies — for the purist who still wants crunch.",
    price: 2.4,
    type: "sprinkled",
    imgUrl: img("donutsprinkled", 4),
    tags: "vanilla,sprinkled,chocolate",
    rating: 4.4,
    calories: 270,
    stock: 70,
    featured: false,
  },
  {
    name: "Confetti Party Stack",
    description:
      "Triple-stack of mini sprinkled donuts, each a different frosting — birthday energy all year long.",
    price: 3.5,
    type: "sprinkled",
    imgUrl: img("donutsprinkled", 5),
    tags: "confetti,sprinkled,party",
    rating: 4.6,
    calories: 410,
    stock: 40,
    featured: false,
  },

  // ── Stuffed (5) ─────────────────────────────────────────────
  {
    name: "Boston Cream Bomb",
    description:
      "Yeast donut filled with silky vanilla custard, dipped in glossy dark chocolate ganache.",
    price: 3.25,
    type: "stuffed",
    imgUrl: img("donutstuffed", 1),
    tags: "cream,stuffed,chocolate",
    rating: 4.9,
    calories: 380,
    stock: 45,
    featured: true,
  },
  {
    name: "Jelly Burst",
    description:
      "Brimming with real raspberry jam that oozes with every bite, finished in a dusting of sugar.",
    price: 2.95,
    type: "stuffed",
    imgUrl: img("donutstuffed", 2),
    tags: "jelly,stuffed,raspberry",
    rating: 4.7,
    calories: 320,
    stock: 55,
    featured: false,
  },
  {
    name: "Cookies & Cream Fill",
    description:
      "Stuffed with crushed-cookie cream filling and topped with a cookies-and-cream glaze.",
    price: 3.45,
    type: "stuffed",
    imgUrl: img("donutstuffed", 3),
    tags: "cookies,cream,stuffed",
    rating: 4.8,
    calories: 420,
    stock: 40,
    featured: false,
  },
  {
    name: "Lemon Curd Pocket",
    description:
      "Bright, zesty lemon curd piped into a tender yeast shell, finished with a citrus glaze.",
    price: 3.1,
    type: "stuffed",
    imgUrl: img("donutstuffed", 4),
    tags: "lemon,stuffed,curd",
    rating: 4.6,
    calories: 300,
    stock: 50,
    featured: false,
  },
  {
    name: "Salted Caramel Cloud",
    description:
      "Filled with salted caramel cream, drizzled with caramel and a pinch of flaky sea salt.",
    price: 3.65,
    type: "stuffed",
    imgUrl: img("donutstuffed", 5),
    tags: "caramel,stuffed,salted",
    rating: 4.8,
    calories: 410,
    stock: 45,
    featured: false,
  },

  // ── Specialty (6, reusing image URLs) ───────────────────────
  {
    name: "Galaxy Glaze Special",
    description:
      "Mirror-glaze swirl of deep blue and violet, dusted with edible stars — a cosmic classic.",
    price: 4.25,
    type: "specialty",
    imgUrl: img("donutclassic", 3),
    tags: "galaxy,glazed,specialty",
    rating: 4.7,
    calories: 320,
    stock: 30,
    featured: false,
  },
  {
    name: "Matcha Mist Sprinkle",
    description:
      "Stone-ground matcha glaze with white chocolate sprinkles for an earthy-sweet bite.",
    price: 3.95,
    type: "specialty",
    imgUrl: img("donutsprinkled", 2),
    tags: "matcha,sprinkled,specialty",
    rating: 4.6,
    calories: 280,
    stock: 35,
    featured: false,
  },
  {
    name: "Triple Chocolate Lava",
    description:
      "Molten chocolate ganache core, dark cocoa glaze, and shaved chocolate on top — a chocoholic's dream.",
    price: 4.5,
    type: "specialty",
    imgUrl: img("donutstuffed", 4),
    tags: "chocolate,lava,stuffed,specialty",
    rating: 4.9,
    calories: 450,
    stock: 25,
    featured: true,
  },
  {
    name: "Cosmic Brownie Bite",
    description:
      "Fudgy brownie-style donut with cosmic candy crunch topping — straight from the lunchbox.",
    price: 3.8,
    type: "specialty",
    imgUrl: img("donutclassic", 4),
    tags: "brownie,specialty,chocolate",
    rating: 4.5,
    calories: 390,
    stock: 35,
    featured: false,
  },
  {
    name: "Piña Colada Twist",
    description:
      "Pineapple-coconut glaze with toasted coconut flakes — an island vacation in a donut.",
    price: 3.85,
    type: "specialty",
    imgUrl: img("donutsprinkled", 3),
    tags: "pineapple,coconut,specialty",
    rating: 4.4,
    calories: 310,
    stock: 30,
    featured: false,
  },
  {
    name: "Unicorn Dream Drizzle",
    description:
      "Cotton-candy-flavored cream filling, pastel glaze, and gold drizzle — pure magic in every bite.",
    price: 4.15,
    type: "specialty",
    imgUrl: img("donutstuffed", 5),
    tags: "unicorn,specialty,drizzle",
    rating: 4.7,
    calories: 360,
    stock: 30,
    featured: false,
  },
];

async function main() {
  console.log(`[seed] Upserting ${DONUTS.length} donuts…`);
  let created = 0;
  let updated = 0;

  for (const d of DONUTS) {
    const res = await db.donut.upsert({
      where: { name: d.name },
      update: {
        description: d.description,
        price: d.price,
        type: d.type,
        imgUrl: d.imgUrl,
        tags: d.tags,
        rating: d.rating,
        calories: d.calories,
        stock: d.stock,
        featured: d.featured,
      },
      create: {
        name: d.name,
        description: d.description,
        price: d.price,
        type: d.type,
        imgUrl: d.imgUrl,
        tags: d.tags,
        rating: d.rating,
        calories: d.calories,
        stock: d.stock,
        featured: d.featured,
      },
    });
    // detect insert vs update by checking createdAt vs updatedAt
    const isNew = res.createdAt.getTime() === res.updatedAt.getTime();
    if (isNew) created++;
    else updated++;
  }

  const total = await db.donut.count();
  console.log(
    `[seed] Done. Inserted ${created}, updated ${updated}. Total donuts in DB: ${total}`
  );
}

main()
  .catch((e) => {
    console.error("[seed] FAILED:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
