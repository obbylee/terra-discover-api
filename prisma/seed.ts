import { PrismaClient, Prisma } from "../src/generated/prisma";
import { hashPassword } from "../src/utils/password";
import slugify from "slugify";

const prisma = new PrismaClient();

// Utility function to ensure slug uniqueness by checking the database
async function ensureUniqueSlug(baseName: string): Promise<string> {
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

async function main() {
  console.log("Start seeding...");

  // 1. Seed Space Types
  const parkType = await prisma.spaceType.upsert({
    where: { name: "Park" },
    update: {},
    create: {
      name: "Park",
      description:
        "An area of natural, semi-natural, or planted space set aside for human recreation.",
    },
  });

  const landmarkType = await prisma.spaceType.upsert({
    where: { name: "Landmark" },
    update: {},
    create: {
      name: "Landmark",
      description:
        "A recognizable natural or artificial feature used for navigation or as a point of reference.",
    },
  });

  const historicalSiteType = await prisma.spaceType.upsert({
    where: { name: "Historical Site" },
    update: {},
    create: {
      name: "Historical Site",
      description:
        "A place of local, national, or international historical significance.",
    },
  });

  const hiddenGemType = await prisma.spaceType.upsert({
    where: { name: "Hidden Gem" },
    update: {},
    create: {
      name: "Hidden Gem",
      description:
        "A lesser-known but highly worthwhile place, often off the beaten path.",
    },
  });

  console.log("Seeded Space Types");

  // 2. Seed Space Categories
  const recreationalCategory = await prisma.spaceCategory.upsert({
    where: { name: "Recreational" },
    update: {},
    create: {
      name: "Recreational",
      description: "Suitable for leisure activities and sports.",
    },
  });

  const historicalCategory = await prisma.spaceCategory.upsert({
    where: { name: "Historical" },
    update: {},
    create: {
      name: "Historical",
      description: "Pertaining to history or past events.",
    },
  });

  const naturalCategory = await prisma.spaceCategory.upsert({
    where: { name: "Natural" },
    update: {},
    create: {
      name: "Natural",
      description: "Featuring natural landscapes, flora, or fauna.",
    },
  });

  const architecturalCategory = await prisma.spaceCategory.upsert({
    where: { name: "Architectural" },
    update: {},
    create: {
      name: "Architectural",
      description: "Notable for its unique design or structure.",
    },
  });

  const culturalCategory = await prisma.spaceCategory.upsert({
    where: { name: "Cultural" },
    update: {},
    create: {
      name: "Cultural",
      description: "Reflecting local customs, arts, or traditions.",
    },
  });

  console.log("Seeded Space Categories");

  // 3. Seed Space Features
  const wifiFeature = await prisma.spaceFeature.upsert({
    where: { name: "Wi-Fi" },
    update: {},
    create: {
      name: "Wi-Fi",
      description: "Wireless internet access available.",
    },
  });

  const restroomsFeature = await prisma.spaceFeature.upsert({
    where: { name: "Restrooms" },
    update: {},
    create: {
      name: "Restrooms",
      description: "Public toilet facilities available.",
    },
  });

  const playgroundFeature = await prisma.spaceFeature.upsert({
    where: { name: "Playground" },
    update: {},
    create: {
      name: "Playground",
      description: "Area designed for children to play.",
    },
  });

  const seatingFeature = await prisma.spaceFeature.upsert({
    where: { name: "Seating" },
    update: {},
    create: {
      name: "Seating",
      description: "Benches or other seating arrangements available.",
    },
  });

  const foodStallsFeature = await prisma.spaceFeature.upsert({
    where: { name: "Food Stalls" },
    update: {},
    create: {
      name: "Food Stalls",
      description: "Various food vendors present.",
    },
  });

  const accessibleFeature = await prisma.spaceFeature.upsert({
    where: { name: "Wheelchair Accessible" },
    update: {},
    create: {
      name: "Wheelchair Accessible",
      description: "Easily accessible for individuals using wheelchairs.",
    },
  });

  console.log("Seeded Space Features");

  // 4. Seed 1 User
  const hashedPassword = await hashPassword("john.doe@mail.com");

  const user = await prisma.user.upsert({
    where: { email: "john.doe@mail.com" },
    update: {},
    create: {
      username: "johndoe",
      email: "john.doe@mail.com",
      passwordHash: hashedPassword,
      profilePicture: "https://i.pravatar.cc/150?img=68",
      bio: "An avid explorer of unique urban and natural spaces in Surabaya and beyond.",
    },
  });

  console.log(`Seeded user: ${user.username}`);

  // 5. Seed 10 Space Data
  const rawSpacesData = [
    {
      name: "Taman Bungkul",
      alternateNames: ["Bungkul Park"],
      description:
        "A popular urban park in Surabaya, known for its vibrant atmosphere, street food, and free Wi-Fi.",
      activities: [
        "picnic",
        "jogging",
        "people_watching",
        "photography",
        "street food tasting",
      ],
      typeId: parkType.id,
      categoryIds: [recreationalCategory.id, naturalCategory.id],
      featureIds: [
        wifiFeature.id,
        restroomsFeature.id,
        foodStallsFeature.id,
        seatingFeature.id,
      ],
      submittedById: user.id,
      operatingHours: { daily: "24/7" },
      entranceFee: { amount: 0, currency: "IDR", notes: "Free entry" },
      contactInfo: {
        phone: "+62315678900",
        website: "https://tamabungkul.surabaya.go.id",
      },
      accessibility: {
        wheelchair_accessible: true,
        notes: "Ramps available for most areas.",
      },
    },
    {
      name: "Monumen Kapal Selam",
      alternateNames: ["Submarine Monument"],
      description:
        "A real Russian submarine converted into a museum, offering a unique historical experience in Surabaya.",
      activities: ["history exploration", "photography"],
      typeId: landmarkType.id,
      categoryIds: [historicalCategory.id, culturalCategory.id],
      featureIds: [restroomsFeature.id],
      submittedById: user.id,
      operatingHours: { daily: "08:00-22:00" },
      entranceFee: { amount: 20000, currency: "IDR", notes: "Per person" },
      historicalContext:
        "A former Soviet submarine, KRI Pasopati 410, used by the Indonesian Navy.",
      contactInfo: { phone: "+62315495449", email: "info@monkasel.com" },
      accessibility: {
        wheelchair_accessible: false,
        notes:
          "Limited accessibility inside the submarine due to narrow spaces.",
      },
    },
    {
      name: "House of Sampoerna",
      alternateNames: ["Sampoerna Museum"],
      description:
        "A well-preserved Dutch colonial-style building that serves as a cigarette museum and art gallery, showcasing the history of Sampoerna.",
      activities: [
        "museum visit",
        "history exploration",
        "photography",
        "cultural experience",
      ],
      typeId: historicalSiteType.id,
      categoryIds: [
        historicalCategory.id,
        culturalCategory.id,
        architecturalCategory.id,
      ],
      featureIds: [
        restroomsFeature.id,
        foodStallsFeature.id,
        seatingFeature.id,
      ],
      submittedById: user.id,
      operatingHours: { daily: "09:00-22:00" },
      entranceFee: { amount: 0, currency: "IDR", notes: "Free entry" },
      historicalContext:
        "Built in 1862, it was originally an orphanage and later became the first Sampoerna cigarette factory.",
      architecturalStyle: "Dutch Colonial",
      contactInfo: {
        phone: "+62313539000",
        website: "https://www.houseofsampoerna.museum",
      },
      accessibility: {
        wheelchair_accessible: true,
        notes: "Ground floor and main exhibition areas are accessible.",
      },
    },
    {
      name: "Surabaya Zoo",
      alternateNames: ["Kebun Binatang Surabaya"],
      description:
        "One of the oldest and largest zoos in Southeast Asia, home to a diverse collection of animals.",
      activities: ["animal viewing", "family outing", "education"],
      typeId: parkType.id,
      categoryIds: [recreationalCategory.id, naturalCategory.id],
      featureIds: [
        restroomsFeature.id,
        foodStallsFeature.id,
        playgroundFeature.id,
      ],
      submittedById: user.id,
      operatingHours: { daily: "08:00-16:00" },
      entranceFee: { amount: 15000, currency: "IDR", notes: "Per person" },
      contactInfo: {
        phone: "+62315672900",
        website: "https://surabayazoo.co.id",
      },
      accessibility: {
        wheelchair_accessible: true,
        notes: "Paths are generally flat, but some areas might have inclines.",
      },
    },
    {
      name: "Tugu Pahlawan",
      alternateNames: ["Heroes Monument"],
      description:
        "An iconic monument symbolizing the struggle of Indonesian heroes during the Battle of Surabaya.",
      activities: ["history exploration", "photography"],
      typeId: landmarkType.id,
      categoryIds: [historicalCategory.id, architecturalCategory.id],
      featureIds: [seatingFeature.id],
      submittedById: user.id,
      operatingHours: { daily: "24/7" },
      entranceFee: { amount: 0, currency: "IDR", notes: "Free entry" },
      historicalContext: "Commemorates the 1945 Battle of Surabaya.",
      contactInfo: Prisma.JsonNull,
      accessibility: {
        wheelchair_accessible: true,
        notes: "Open public space with wide walkways.",
      },
    },
    {
      name: "Kya-Kya Kembang Jepun",
      alternateNames: ["Chinatown Surabaya"],
      description:
        "A vibrant historical street market in Surabaya, famous for its Chinese-influenced architecture and diverse street food scene.",
      activities: [
        "street food tasting",
        "cultural experience",
        "photography",
        "shopping",
      ],
      typeId: hiddenGemType.id,
      categoryIds: [culturalCategory.id, historicalCategory.id],
      featureIds: [foodStallsFeature.id, seatingFeature.id],
      submittedById: user.id,
      operatingHours: { daily: "17:00-23:00" },
      entranceFee: {
        amount: 0,
        currency: "IDR",
        notes: "Free entry, food costs apply",
      },
      contactInfo: { email: "info@kyakya.com" },
      accessibility: {
        wheelchair_accessible: true,
        notes: "Flat street, but can be crowded, especially during peak hours.",
      },
    },
    {
      name: "Suroboyo Carnival Park",
      alternateNames: ["Surabaya Night Carnival"],
      description:
        "An entertainment park offering various rides, games, and performances, primarily active at night.",
      activities: ["rides", "games", "family fun"],
      typeId: parkType.id,
      categoryIds: [recreationalCategory.id],
      featureIds: [
        restroomsFeature.id,
        foodStallsFeature.id,
        playgroundFeature.id,
      ],
      submittedById: user.id,
      operatingHours: { "Mon-Fri": "17:00-23:00", "Sat-Sun": "16:00-23:00" },
      entranceFee: { amount: 60000, currency: "IDR", notes: "Basic ticket" },
      contactInfo: {
        phone: "+623199017777",
        website: "https://suroboyocarnival.com",
      },
      accessibility: {
        wheelchair_accessible: true,
        notes: "Most paved areas are accessible.",
      },
    },
    {
      name: "Masjid Nasional Al Akbar",
      alternateNames: ["Great Mosque of Surabaya"],
      description:
        "The second largest mosque in Indonesia, known for its distinctive large blue dome and impressive architecture.",
      activities: ["spiritual visit", "architectural viewing", "photography"],
      typeId: landmarkType.id,
      categoryIds: [architecturalCategory.id, culturalCategory.id],
      featureIds: [restroomsFeature.id, accessibleFeature.id],
      submittedById: user.id,
      operatingHours: { daily: "04:00-22:00" },
      entranceFee: { amount: 0, currency: "IDR", notes: "Free entry" },
      architecturalStyle: "Islamic Contemporary",
      contactInfo: { phone: "+62318289852", email: "info@masjidalakbar.or.id" },
      accessibility: {
        wheelchair_accessible: true,
        notes: "Ramps and elevators available for most floors.",
      },
    },
    {
      name: "Jembatan Merah",
      alternateNames: ["Red Bridge"],
      description:
        "A historic bridge in Surabaya with a rich past, significant during the Indonesian struggle for independence.",
      activities: ["history exploration", "photography", "walking"],
      typeId: historicalSiteType.id,
      categoryIds: [historicalCategory.id, culturalCategory.id],
      featureIds: [seatingFeature.id],
      submittedById: user.id,
      operatingHours: { daily: "24/7" },
      entranceFee: { amount: 0, currency: "IDR", notes: "Free entry" },
      historicalContext:
        "Site of intense fighting during the Battle of Surabaya in 1945.",
      contactInfo: Prisma.JsonNull,
      accessibility: {
        wheelchair_accessible: true,
        notes: "Sidewalks are generally accessible.",
      },
    },
    {
      name: "Hutan Mangrove Wonorejo",
      alternateNames: ["Wonorejo Mangrove Forest"],
      description:
        "A protected mangrove forest offering boardwalks for nature walks, bird watching, and eco-tourism activities.",
      activities: [
        "nature walk",
        "bird watching",
        "photography",
        "eco-tourism",
      ],
      typeId: hiddenGemType.id,
      categoryIds: [naturalCategory.id, recreationalCategory.id],
      featureIds: [restroomsFeature.id, seatingFeature.id],
      submittedById: user.id,
      operatingHours: { daily: "07:00-17:00" },
      entranceFee: { amount: 10000, currency: "IDR", notes: "Per person" },
      contactInfo: {
        phone: "+6281234567890",
        website: "http://mangrove.surabaya.go.id",
      },
      accessibility: {
        wheelchair_accessible: true,
        notes: "Elevated boardwalks are mostly flat.",
      },
    },
  ];

  for (const rawSpaceData of rawSpacesData) {
    const uniqueSlug = await ensureUniqueSlug(rawSpaceData.name);

    const space = await prisma.space.upsert({
      where: { slug: uniqueSlug },
      update: {
        slug: uniqueSlug,
        description: rawSpaceData.description,
        alternateNames: rawSpaceData.alternateNames,
        activities: rawSpaceData.activities,
        historicalContext: rawSpaceData.historicalContext,
        architecturalStyle: rawSpaceData.architecturalStyle,
        operatingHours: rawSpaceData.operatingHours,
        entranceFee: rawSpaceData.entranceFee,
        contactInfo: rawSpaceData.contactInfo,
        accessibility: rawSpaceData.accessibility,
        type: { connect: { id: rawSpaceData.typeId } },
        categories: { connect: rawSpaceData.categoryIds.map((id) => ({ id })) },
        features: { connect: rawSpaceData.featureIds.map((id) => ({ id })) },
        submittedBy: { connect: { id: rawSpaceData.submittedById } },
      },
      create: {
        name: rawSpaceData.name,
        slug: uniqueSlug,
        alternateNames: rawSpaceData.alternateNames,
        description: rawSpaceData.description,
        activities: rawSpaceData.activities,
        historicalContext: rawSpaceData.historicalContext,
        architecturalStyle: rawSpaceData.architecturalStyle,
        operatingHours: rawSpaceData.operatingHours,
        entranceFee: rawSpaceData.entranceFee,
        contactInfo: rawSpaceData.contactInfo,
        accessibility: rawSpaceData.accessibility,
        type: { connect: { id: rawSpaceData.typeId } },
        categories: { connect: rawSpaceData.categoryIds.map((id) => ({ id })) },
        features: { connect: rawSpaceData.featureIds.map((id) => ({ id })) },
        submittedBy: { connect: { id: rawSpaceData.submittedById } },
      },
    });
    console.log(`Seeded space: ${space.name} (Slug: ${space.slug})`);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
