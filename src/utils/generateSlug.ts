import prisma from "../lib/db";
import slugify from "slugify";

export async function ensureUniqueSlug(baseName: string): Promise<string> {
  let slug = slugify(baseName, { lower: true, strict: true });
  let counter = 1;
  let isUnique = false;

  // Loop until a unique slug is found
  while (!isUnique) {
    const existingSpace = await prisma.space.findUnique({
      where: { slug: slug },
    });

    if (!existingSpace) {
      isUnique = true; // Slug is unique!
    } else {
      // Slug already exists, append a number and try again
      slug = `${slugify(baseName)}-${counter}`;
      counter++;
    }
  }
  return slug;
}
