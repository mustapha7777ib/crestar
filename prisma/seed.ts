// Loads the starting catalogue (src/data/products.ts) into the database.
//
//   npm run db:seed           add products that are missing; never touches edits
//   npm run db:seed -- --reset   overwrite every seeded product with the file's version
//
// After the first run the database is the source of truth: edit products in /admin.

import { PrismaClient } from "@prisma/client";
import { seedProducts } from "../src/data/products";

const db = new PrismaClient();
const reset = process.argv.includes("--reset");

async function main() {
  let created = 0;
  let updated = 0;
  for (const [index, p] of seedProducts.entries()) {
    const data = {
      category: p.category,
      sort: index,
      nameEn: p.name.en,
      nameAr: p.name.ar,
      taglineEn: p.tagline.en,
      taglineAr: p.tagline.ar,
      storyEn: p.story.en,
      storyAr: p.story.ar,
      town: p.town,
      badgeEn: p.badge?.en ?? null,
      badgeAr: p.badge?.ar ?? null,
      featured: p.featured ?? null,
      handmade: p.handmade ?? false,
      images: p.images,
      details: p.details,
      bundle: p.bundle ?? [],
    };
    const variants = p.variants.map((v, i) => ({
      code: v.id,
      labelEn: v.label.en,
      labelAr: v.label.ar,
      price: v.price,
      stock: v.stock,
      weight: v.weight,
      sort: i,
    }));

    const existing = await db.product.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      await db.product.create({ data: { slug: p.slug, ...data, variants: { create: variants } } });
      created++;
    } else if (reset) {
      await db.$transaction([
        db.variant.deleteMany({ where: { productId: existing.id } }),
        db.product.update({ where: { id: existing.id }, data: { ...data, variants: { create: variants } } }),
      ]);
      updated++;
    }
  }
  console.log(`Catalogue: ${created} created, ${updated} reset, ${seedProducts.length} in seed file.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
