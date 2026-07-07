import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";

// Types
export interface CarouselSlide {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string;
  date: string;
}

export interface AppDb {
  carousel: CarouselSlide[];
  blogs: BlogPost[];
}

// Default Data
const DEFAULT_CAROUSEL: CarouselSlide[] = [
  {
    id: "slide-1",
    imageUrl: "/images/Afforestation.jpeg",
    title: "Protecting Our Forests",
    description:
      "Restoring native trees to fight climate change and reverse land degradation in Bono East and beyond.",
  },
  {
    id: "slide-2",
    imageUrl: "/images/CleanWater.jpg",
    title: "Clean Water For All",
    description:
      "Ensuring access to safe water and sanitation through sustainable community-driven infrastructure.",
  },
  {
    id: "slide-3",
    imageUrl: "/images/CapacityBuilding.jpg",
    title: "Empowering Local Communities",
    description:
      "Building capacity and public awareness to secure environmental stewardship for future generations.",
  },
];

const DEFAULT_BLOGS: BlogPost[] = [
  {
    id: "blog-1",
    title: "Afforestation Initiative Launches in Bono East",
    excerpt:
      "How our latest tree planting project is restoring degraded landscapes and engaging local schools in environmental stewardship.",
    content:
      "Our team has officially launched a new community afforestation project in the Bono East Region of Ghana. In collaboration with local schools, youth groups, and traditional leaders, we aim to plant over 10,000 native saplings this season.\n\nRestoring tree cover is essential for tackling the severe soil erosion and climate variability affecting local farming. Through hands-on public education, students are learning about forest ecology and taking ownership of their school's woodlots. This ensures long-term care and high survival rates for the planted trees.",
    imageUrl: "/images/Afforestation.jpeg",
    author: "Michael Mustapha",
    date: "2026-06-15",
  },
  {
    id: "blog-2",
    title: "Empowering Communities through Clean Water Access",
    excerpt:
      "Safe water is the foundation of health and economic growth. Read about our latest borehole installation and training sessions.",
    content:
      "We are thrilled to announce the completion of a new hand-pumped borehole, providing safe drinking water directly to more than 800 community members.\n\nPreviously, residents had to walk hours to fetch water from seasonal streams. In addition to hardware installation, we trained a local Water and Sanitation (WASH) committee to manage and maintain the system. By building community capacity, we ensure the infrastructure remains functional and clean for years to come.",
    imageUrl: "/images/CleanWater.jpg",
    author: "Yong Osman Husen",
    date: "2026-06-28",
  },
  {
    id: "blog-3",
    title: "The Role of Public Education in Wildlife Conservation",
    excerpt:
      "Why changing hearts and minds is just as important as physical restoration for protecting Ghana's unique biodiversity.",
    content:
      "Conservation is not just about fences and rangers; it is about community pride and understanding. Our latest public awareness campaign across Techiman has brought together elders, hunters, and youth to discuss biodiversity.\n\nBy highlighting the ecological benefits of local species—such as pest control and seed dispersal—we are building a shared commitment to protect our remaining wildlife habitats. Education is the key to coexisting with nature sustainably.",
    imageUrl: "/images/Conservation.jpg",
    author: "Enock Mustapha",
    date: "2026-07-02",
  },
];

const getDbPath = () => {
  const dataDir = path.resolve(process.cwd(), "src/data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, "db.json");
};

const readDbFile = (): AppDb => {
  const dbPath = getDbPath();
  if (!fs.existsSync(dbPath)) {
    const defaultDb: AppDb = { carousel: DEFAULT_CAROUSEL, blogs: DEFAULT_BLOGS };
    fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2), "utf8");
    return defaultDb;
  }
  try {
    const data = fs.readFileSync(dbPath, "utf8");
    const parsed = JSON.parse(data);
    // Ensure both keys exist
    return {
      carousel: parsed.carousel || DEFAULT_CAROUSEL,
      blogs: parsed.blogs || DEFAULT_BLOGS,
    };
  } catch (err) {
    console.error("Failed to read DB file, returning defaults:", err);
    return { carousel: DEFAULT_CAROUSEL, blogs: DEFAULT_BLOGS };
  }
};

const writeDbFile = (db: AppDb) => {
  const dbPath = getDbPath();
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
};

// SERVER FUNCTIONS
export const getAppDb = createServerFn({ method: "GET" }).handler(async (): Promise<AppDb> => {
  return readDbFile();
});

export const updateCarousel = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    return z
      .array(
        z.object({
          id: z.string(),
          imageUrl: z.string(),
          title: z.string(),
          description: z.string(),
        }),
      )
      .parse(data);
  })
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    try {
      const db = readDbFile();
      db.carousel = data;
      writeDbFile(db);
      return { success: true };
    } catch (err: unknown) {
      console.error("Failed to update carousel:", err);
      throw new Error("Failed to save carousel");
    }
  });

export const saveBlogPost = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    return z
      .object({
        id: z.string().optional(),
        title: z.string().trim().min(1),
        excerpt: z.string().trim().min(1),
        content: z.string().trim().min(1),
        imageUrl: z.string().trim().min(1),
        author: z.string().trim().min(1),
        date: z.string().trim().min(1),
      })
      .parse(data);
  })
  .handler(async ({ data }): Promise<{ success: boolean; post: BlogPost }> => {
    try {
      const db = readDbFile();
      let savedPost: BlogPost;

      if (data.id) {
        // Edit existing
        const idx = db.blogs.findIndex((b) => b.id === data.id);
        if (idx === -1) {
          throw new Error("Blog post not found");
        }
        savedPost = {
          id: data.id,
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          imageUrl: data.imageUrl,
          author: data.author,
          date: data.date,
        };
        db.blogs[idx] = savedPost;
      } else {
        // Create new
        savedPost = {
          id: `blog-${Date.now()}`,
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          imageUrl: data.imageUrl,
          author: data.author,
          date: data.date,
        };
        db.blogs.unshift(savedPost); // Add at beginning of list (newest first)
      }

      writeDbFile(db);
      return { success: true, post: savedPost };
    } catch (err: unknown) {
      console.error("Failed to save blog post:", err);
      const msg = err instanceof Error ? err.message : "Failed to save blog post";
      throw new Error(msg);
    }
  });

export const deleteBlogPost = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    try {
      const db = readDbFile();
      db.blogs = db.blogs.filter((b) => b.id !== data.id);
      writeDbFile(db);
      return { success: true };
    } catch (err: unknown) {
      console.error("Failed to delete blog post:", err);
      throw new Error("Failed to delete blog post");
    }
  });
