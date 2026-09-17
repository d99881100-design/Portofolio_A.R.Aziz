// Informasi identitas dan ringkasan profesional pemilik portfolio.
export const personalInfo = {
  name: "Akhmad Roufun Aziz",
  role: "AI Engineer",
  location: "Pasuruan, Indonesia",
  availability: "Available for select projects",
  email: "akhmadroufun@gmail.com",
  bio: "I design and build digital products that make complex ideas feel simple. My work sits at the intersection of thoughtful interfaces, robust engineering, and a little bit of curiosity.",
  education: "SMK Negri 1 Pasuruan",
  focus: "AI-driven solutions",
  Download_CV: "/images/projects/CV.pdf",
};

// Statistik singkat yang ditampilkan pada bagian ringkasan portfolio.
export const stats = [
  ["03", "Selected projects"],
  ["01+", "Years learning"],
  ["2", "Tools explored"],
  ["∞", "Curiosity level"],
];

// Kelompok teknologi yang dikuasai, dikelompokkan berdasarkan area penggunaannya.
export const skills = [
  {
    category: "Frontend",
    items: ["HTML", "CSS", "JavaScript", "React", "Next.js"],
  },
  { category: "Backend", items: ["Node.js", "Python"] },
  { category: "Data", items: ["MySQL", "Supabase"] },
  { category: "Tools", items: ["Git", "GitHub", "VS Code", "Figma"] },
];

// Riwayat pengalaman belajar dan bekerja beserta teknologi yang digunakan.
export const experience = [
  {
    year: "June 2025",
    role: "Starting My Journey in Software Engineering",
    company: "Discovering the World of Software Development",
    description:
      "I began my journey into coding in 2025 after being accepted into SMKN 1 Pasuruan, where I chose to major in Software Engineering. This marked the beginning of my journey into technology and software development.",
    tools: ["HTML", "CSS", "Python"],
  },
  {
    year: "September 2025",
    role: "Exploring the Software Industry",
    company: "Expanding My Coding Skills with UBIG",
    description:
      "I continued developing my coding skills through hands-on learning and direct guidance from PT. Universal BIG Data (UBIG). This experience gave me valuable insights into the software industry and strengthened my foundation in programming.",
    tools: ["ShadCN UI", "Tailwind CSS", "Supabase"],
  },
  {
    year: "March 2026",
    role: "Building My First Website with Next.js",
    company: "Exploring Modern Web Development",
    description:
      "I developed a responsive website using Next.js and successfully deployed it with Vercel. Through this project, I strengthened my understanding of modern web development and gained practical experience in building and deploying web applications.",
    tools: ["Figma", "Next.js", "React"],
  },
];

// Daftar project yang ditampilkan pada halaman utama dan halaman detail.
export const projects = [
  {
    slug: "NewsAzz",
    number: "01",
    title: "NewsAzz",
    category: "Trusted News Platform",
    description:
      "A platform for viewing the latest, trusted news, tracking momentum, and making progress clearly visible.",
    image: "/images/projects/web_berita.png",
    technologies: ["HTML", "CSS"],
    liveUrl: "https://example.com",
    featured: true,
    color: "lime",
  },
  {
    slug: "lifechoice",
    number: "02",
    title: "LifeChoice",
    category: "Life management",
    description:
      "A simple dashboard for turning daily intentions into decisions you can actually act on.",
    image: "/images/projects/LifeChoice.png",
    technologies: ["React", "Node.js", "Supabase"],
    githubUrl: "https://github.com/",
    liveUrl: "https://example.com",
    featured: false,
    color: "peach",
  },
  {
    slug: "management-ekskul",
    number: "03",
    title: "Management Ekskul",
    category: "Student Activity Management",
    description:
      "A platform for managing student activities and events within the school.",
    image: "/images/projects/management-ekskul.png",
    technologies: ["Next.js", "ShadCN UI", "CSS", "Supabase"],
    githubUrl: "https://github.com/",
    liveUrl: "https://example.com",
    featured: false,
    color: "blue",
  },
];

export const validProjectCategories = ["all", "web", "mobile"] as const;

export function normalizeProjectCategory(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

export function normalizeProjectSearch(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

export function matchesProjectCategory(project: (typeof projects)[number], selected: string) {
  const haystack = [
    project.category,
    project.title,
    project.description,
    ...project.technologies,
  ]
    .join(" ")
    .toLowerCase();

  if (selected === "web") {
    return (
      haystack.includes("news") ||
      haystack.includes("management") ||
      haystack.includes("next.js") ||
      haystack.includes("html") ||
      haystack.includes("css") ||
      haystack.includes("platform")
    );
  }

  if (selected === "mobile") {
    return (
      haystack.includes("life") ||
      haystack.includes("react") ||
      haystack.includes("node.js") ||
      haystack.includes("supabase")
    );
  }

  return true;
}

export function filterProjects(
  list = projects,
  { category, q }: { category?: string; q?: string } = {},
) {
  const selectedCategory = normalizeProjectCategory(category);
  const normalizedQuery = normalizeProjectSearch(q);
  const activeCategory = validProjectCategories.includes(
    selectedCategory as (typeof validProjectCategories)[number],
  )
    ? selectedCategory
    : "all";

  const categoryFiltered =
    activeCategory === "all"
      ? list
      : list.filter((project) => matchesProjectCategory(project, activeCategory));

  if (!normalizedQuery) {
    return categoryFiltered;
  }

  return categoryFiltered.filter((project) =>
    project.title.toLowerCase().includes(normalizedQuery),
  );
}

// Pencapaian yang menjadi bagian dari profil profesional.
export const achievements = [
  {
    title: "Passed the industry class selection process",
    year: "2025",
    level: "2",
    description:
      "During my first year as a software engineering student, I successfully passed the selection process to join the UBIG industry class.",
  },
];

// Sertifikat yang dapat dibuka untuk melihat gambar dalam modal preview.
export const certificates = [
  {
    title: "Understanding AI",
    issuer: "Senopaty academy - Polri - Kemendikdasmen",
    year: "2026",
    image: "/images/projects/sertifikat-1.jpg",
    link: "https://www.freecodecamp.org/",
  },
];

// Riwayat pendidikan formal pemilik portfolio.
export const education = [
  {
    year: "2025 — Now",
    school: "SMKN 1 Pasuruan",
    major: "Software Engineering",
    description:
      "A hands-on education in web development, databases, product thinking, and collaborative delivery.",
  },
];

// Tautan menuju profil sosial dan profesional.
export const socialLinks = [
  { label: "GitHub", href: "https://github.com/d99881100-design" },
  { label: "Discord", href: "https://discord.com/users/1458672696517722242" },
  {
    label: "Instagram",
    href: "https://www.instagram.com/akhmad_roufun_aziz?stkn=MWkxYXJ4NDZmOXo5aw==",
  },
];
