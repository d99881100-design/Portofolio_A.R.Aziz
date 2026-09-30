"use client";
// Komponen Next.js untuk memuat gambar yang dioptimalkan.
import Image from "next/image";
// Link internal agar perpindahan halaman project tetap dikelola Next.js.
import Link from "next/link";
// Ikon yang digunakan pada tombol dan informasi section.
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Mail,
  MapPin,
  Search,
  Send,
  X,
} from "lucide-react";
// Animasi reveal untuk kartu project ketika masuk viewport.
import { motion, useReducedMotion } from "motion/react";
// Data portfolio yang digunakan oleh seluruh section.
import {
  achievements,
  certificates,
  education,
  experience,
  filterProjects,
  personalInfo,
  projects,
  skills,
  socialLinks,
  stats,
  validProjectCategories,
} from "@/data/portfolio";
import type { AchievementItem } from "@/lib/achievements";
import type { CertificateItem } from "@/lib/certificates";
import type { EducationItem } from "@/lib/education";
import type { ExperienceItem } from "@/lib/experience";
// Hook dan tipe event untuk state interaksi client-side.
import { FormEvent, useEffect, useState } from "react";
import { getProjects, type Project } from "@/lib/projects";
import { supabase } from "@/lib/supabase";

// Path gambar profil yang digunakan pada bagian hero.
const heroImageUrl = "/images/profil_keren.jpeg";
// Mengatur konfigurasi animasi saat elemen masuk ke layar agar transisi terlihat mulus.
const revealViewport = { once: true, amount: 0.18 };
// Menyediakan pengaturan animasi yang sama untuk berbagai section agar tampilan terasa konsisten.
function revealProps(reducedMotion: boolean, delay = 0) {
  return {
    initial: reducedMotion
      ? { opacity: 1 }
      : { opacity: 0, y: 24, filter: "blur(4px)" },
    whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
    viewport: revealViewport,
    transition: reducedMotion
      ? { duration: 0 }
      : { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}

// Bagian pembuka yang memperkenalkan identitas, fokus, dan ajakan tindakan.
export function Hero() {
  return (
    <section className="hero wrap" id="top">
      <div className="hero-copy">
        <p className="eyebrow reveal">
          Software engineer / designer <span className="status-dot" /> open to
          work
        </p>
        <h1 className="hero-title reveal delay-1">
          Making AI engineer
          <br />
          <em>valuable</em> for the web..
        </h1>
        <p className="hero-intro reveal delay-2">{personalInfo.bio}</p>
        <div className="hero-actions reveal delay-3">
          <a className="button button-dark" href="#work">
            See my work <ArrowDownRight size={17} />
          </a>
          <a className="text-link" href={`mailto:${personalInfo.email}`}>
            Get in touch <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="hero-meta reveal delay-3">
          <span>
            <MapPin size={14} /> {personalInfo.location}
          </span>
          <span>{personalInfo.focus}</span>
        </div>
      </div>
      <div className="hero-visual reveal delay-2">
        <div className="portrait-frame">
          <div className="portrait-art">
            <Image
              src={heroImageUrl}
              alt="Profile portrait"
              fill
              priority
              sizes="(max-width: 700px) 80vw, 390px"
            />
            <span className="portrait-caption">Akhmad Roufun Aziz</span>
          </div>
        </div>
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="floating-note note-top">
          Years Old
          <br />
          <strong>16</strong>
        </div>
        <div className="floating-note note-bottom">
          My name is
          <br />
          <strong>Akhmad Roufun Aziz.</strong>
        </div>
      </div>
      <a href="#about" className="scroll-cue" aria-label="Scroll to explore">
        <span>Scroll to explore</span>
        <ArrowDownRight size={16} />
      </a>
    </section>
  );
}
// Menampilkan empat metrik ringkas dari data portfolio.
export function Stats() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="stats wrap">
      {stats.map(([value, label], index) => (
        <motion.div
          className="stat"
          key={label}
          {...revealProps(Boolean(reducedMotion), index * 0.07)}
        >
          <strong>{value}</strong>
          <span>{label}</span>
        </motion.div>
      ))}
    </div>
  );
}
// Menampilkan konteks singkat, deskripsi, dan fakta utama tentang pemilik portfolio.
export function About() {
  const reducedMotion = useReducedMotion();
  return (
    <section className="section wrap about-section" id="about">
      <SectionLabel number="01" label="A little about me" title="About me" />
      <div className="about-grid">
        <motion.div
          className="about-lead"
          {...revealProps(Boolean(reducedMotion), 0.08)}
        >
          <p>
            I&apos;am a developer and a vocational high school student majoring
            in Software Engineering, with a keen focus on the details that
            enable AI to function at its full potential in software development.
          </p>
        </motion.div>
        <motion.div
          className="about-body"
          {...revealProps(Boolean(reducedMotion), 0.16)}
        >
          <p>
            I like working across the whole product: asking better questions,
            shaping a clear interface, then writing the code that makes it hold
            together. I&apos;m at my best when a messy idea becomes a useful,
            well-made thing.
          </p>
          <p>
            Outside the browser, you&apos;ll find me collecting references,
            learning in public, and looking for the next problem worth solving.
          </p>
          <div className="fact-grid">
            <Fact label="Based in" value={personalInfo.location} />
            <Fact label="Education" value={personalInfo.education} />
            <Fact label="Focus" value="Web development" />
            <Fact label="Role" value="Student / developer" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
// Komponen kecil untuk menampilkan satu label dan nilai fakta.
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
// Menampilkan teknologi berdasarkan kategori dan ticker teknologi berjalan.
export function Skills() {
  const reducedMotion = useReducedMotion();
  return (
    <section className="section skills-section" id="skills">
      <div className="wrap">
        <SectionLabel
          number="02"
          label="What I use"
          title="Tools for turning ideas into interfaces."
        />
        <div className="skills-grid">
          {skills.map((group, index) => (
            <motion.div
              className="skill-group"
              key={group.category}
              {...revealProps(Boolean(reducedMotion), index * 0.08)}
            >
              <div className="skill-heading">
                <span>0{index + 1}</span>
                <h3>{group.category}</h3>
              </div>
              <div className="skill-list">
                {group.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="marquee">
        <div className="marquee-track">
          {[
            ...skills.flatMap((group) => group.items),
            ...skills.flatMap((group) => group.items),
          ].map((item, index) => (
            <span key={`${item}-${index}`}>
              {item}
              <b>✳</b>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
// Menampilkan pengalaman dalam bentuk timeline beserta teknologi tiap peran.
export function Experience({ initialExperience = experience }: { initialExperience?: ExperienceItem[] }) {
  const reducedMotion = useReducedMotion();
  const items = initialExperience.length > 0 ? initialExperience : experience;

  return (
    <section className="section wrap experience-section">
      <SectionLabel number="03" label="The path so far" title="Experience" />
      <div className="timeline">
        {items.map((item, index) => (
          <motion.article
            className="timeline-item"
            key={`${item.year}-${item.role}`}
            {...revealProps(Boolean(reducedMotion), index * 0.1)}
          >
            <div className="timeline-date">{item.year}</div>
            <div className="timeline-main">
              <h3>{item.role}</h3>
              <p className="timeline-company">{item.company}</p>
              <p>{item.description}</p>
              <div className="tag-row">
                {item.tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
// Menampilkan daftar project utama dengan kartu yang muncul saat pengguna men-scroll ke area tersebut.
export function Projects({ initialProjects = projects }: { initialProjects?: Project[] }) {
  const reducedMotion = useReducedMotion();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [projectList, setProjectList] = useState<Project[]>(
    initialProjects.length > 0 ? initialProjects : projects
  );

  // Sinkronisasi data saat server revalidasi atau props berubah
  useEffect(() => {
    if (initialProjects && initialProjects.length > 0) {
      setProjectList(initialProjects);
    }
  }, [initialProjects]);

  // Sinkronisasi realtime langsung dari Supabase tanpa perlu refresh manual
  useEffect(() => {
    const fetchLatestProjects = async () => {
      try {
        const latest = await getProjects();
        if (latest && latest.length > 0) {
          setProjectList(latest);
        }
      } catch (err) {
        console.error("Gagal memperbarui daftar proyek realtime:", err);
      }
    };

    const channel = supabase
      .channel("realtime-projects-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => {
          fetchLatestProjects();
        }
      )
      .subscribe();

    const handleFocus = () => {
      fetchLatestProjects();
    };

    window.addEventListener("focus", handleFocus);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchLatestProjects();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const activeProjects = projectList.length > 0 ? projectList : projects;
  const filteredProjects = filterProjects(activeProjects, {
    q: search,
    category,
  });

  return (
    <section className="section wrap projects-section" id="work">
      <SectionLabel
        number="04"
        label="Selected work"
        title="A few things I've made."
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          marginTop: "1.5rem",
          marginBottom: "2.5rem",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ position: "relative", minWidth: "240px", flex: "1 1 240px", maxWidth: "380px" }}>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari project..."
              aria-label="Cari project"
              style={{
                width: "100%",
                borderRadius: "999px",
                border: "1px solid var(--line)",
                background: "var(--paper)",
                padding: "0.75rem 1.25rem 0.75rem 2.75rem",
                color: "var(--ink)",
                boxShadow: "var(--shadow-subtle)",
                outline: "none",
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
              }}
            />
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "1.1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted)",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          {validProjectCategories.map((item) => {
            const label = item === "all" ? "All" : item.toUpperCase();
            const isActive = category === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={isActive ? "button button-dark" : "button button-light"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "96px",
                  padding: "10px 18px",
                  fontSize: "0.8rem",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.04em",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div style={{ padding: "2.5rem 0", color: "var(--muted)", fontStyle: "italic" }}>
          Tidak ada project yang ditemukan.
        </div>
      ) : (
        <div className="project-grid">
          {filteredProjects.map((project, index) => (
            <motion.article
              className={`project-card ${project.featured ? "featured" : "supporting"} ${project.color}`}
              key={project.slug}
              {...revealProps(Boolean(reducedMotion), index * 0.08)}
            >
              <div className="project-image">
                <Image
                  src={project.image}
                  alt={`${project.title} project preview`}
                  fill
                  sizes="(max-width: 700px) 100vw, 50vw"
                  quality={75}
                  loading="lazy"
                  decoding="async"
                />
                <span className="project-number">{project.number}</span>
                <span className="project-image-label">
                  {project.featured
                    ? "Featured case study"
                    : "Selected experiment"}
                </span>
              </div>
              <div className="project-content">
                <div>
                  <p className="project-category">{project.category}</p>
                  <Link href={`/projects/${project.slug}`} className="project-title-link">
                    <h3>{project.title}</h3>
                  </Link>
                  <p>{project.description}</p>
                </div>
                <div className="project-footer">
                  <div className="tag-row">
                    {project.technologies.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                  <div className="project-actions">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="circle-link"
                      aria-label={`View ${project.title} details`}
                    >
                      <ArrowUpRight size={19} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}
// Menampilkan pencapaian penting sebagai bukti perkembangan selama proses belajar dan berlatih.
export function Achievements({ initialAchievements = achievements }: { initialAchievements?: AchievementItem[] }) {
  const reducedMotion = useReducedMotion();
  const items = initialAchievements.length > 0 ? initialAchievements : achievements;

  return (
    <section className="section dark-section">
      <div className="wrap">
        <SectionLabel
          number="05"
          label="Small wins"
          title="Achievements"
          light
        />
        <div className="achievement-list">
          {items.map((item, index) => (
            <motion.div
              className="achievement"
              key={item.title}
              {...revealProps(Boolean(reducedMotion), index * 0.1)}
            >
              <span className="achievement-year">{item.year}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <span className="achievement-level">{item.level}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
// Menampilkan sertifikat dan membuka preview besar ketika pengguna memilih salah satu gambar.
export function Certificates({ initialCertificates = certificates }: { initialCertificates?: CertificateItem[] }) {
  // Menyimpan sertifikat yang sedang dibuka agar modal dapat menampilkan gambar yang benar.
  const [selected, setSelected] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const items = initialCertificates.length > 0 ? initialCertificates : certificates;

  useEffect(() => {
    if (!selected) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [selected]);
  return (
    <section className="section wrap certificates-section">
      <SectionLabel
        number="06"
        label="Proof of practice"
        title="Certificates"
      />
      <div className="certificate-grid">
        {items.map((item, index) => (
          <motion.button
            className="certificate"
            key={item.title}
            onClick={() => setSelected(item.image)}
            aria-label={`Open ${item.title} certificate`}
            {...revealProps(Boolean(reducedMotion), index * 0.1)}
          >
            <div className="certificate-image">
              <Image
                src={item.image}
                alt={`${item.title} certificate`}
                fill
                sizes="(max-width: 700px) 100vw, 40vw"
                quality={72}
                loading="lazy"
                decoding="async"
              />
            </div>
            <span>
              {item.issuer} · {item.year}
            </span>
            <strong>{item.title}</strong>
          </motion.button>
        ))}
      </div>
      {selected && (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-label="Certificate preview"
          onClick={() => setSelected(null)}
        >
          <div
            className="modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              autoFocus
              onClick={() => setSelected(null)}
              aria-label="Close certificate preview"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            <Image
              src={selected}
              alt="Expanded certificate"
              width={900}
              height={620}
            />
          </div>
        </div>
      )}
    </section>
  );
}
// Menampilkan satu entri pendidikan formal dari data portfolio.
export function Education({ initialEducation = education }: { initialEducation?: EducationItem[] }) {
  const reducedMotion = useReducedMotion();
  const item = initialEducation.length > 0 ? initialEducation[0] : education[0];

  return (
    <section className="section wrap education-section">
      <SectionLabel number="07" label="Where it started" title="Education" />
      <motion.div
        className="education-card"
        {...revealProps(Boolean(reducedMotion))}
      >
        <span>{item.year}</span>
        <div>
          <h3>{item.school}</h3>
          <p className="timeline-company">{item.major}</p>
          <p>{item.description}</p>
        </div>
        <Check size={22} />
      </motion.div>
    </section>
  );
}
// Menampilkan informasi kontak dan formulir sederhana yang membuka email untuk mengirim pesan.
export function Contact() {
  const reducedMotion = useReducedMotion();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [submitMessage, setSubmitMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      setSubmitState("error");
      setSubmitMessage("Please fill in your name, email, and message.");
      return;
    }

    setIsSubmitting(true);
    setSubmitState("idle");
    setSubmitMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Failed to send message.");
      }

      form.reset();
      setSubmitState("success");
      setSubmitMessage("Message sent successfully.");
    } catch (error) {
      setSubmitState("error");
      setSubmitMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section contact-section" id="contact">
      <div className="wrap contact-grid">
        <div>
          <SectionLabel
            number="08"
            label="Start a conversation"
            title="Let's make<br /><em>something useful.</em>"
            light
          />
          <p className="contact-copy">
            Have a project, a question, or just a good idea? My inbox is open.
          </p>
          <div className="contact-email">
            <Mail size={18} />
            <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a>
          </div>
          <div className="socials">
            {socialLinks.map((link) => (
              <a
                href={link.href}
                key={link.label}
                target="_blank"
                rel="noreferrer"
              >
                {link.label} <ArrowUpRight size={14} />
              </a>
            ))}
          </div>
        </div>
        <motion.form
          className="contact-form"
          onSubmit={submit}
          {...revealProps(Boolean(reducedMotion), 0.12)}
        >
          <label>
            Name
            <input required name="name" placeholder="Your name" />
          </label>
          <label>
            Email
            <input
              required
              type="email"
              name="email"
              placeholder="you@example.com"
            />
          </label>
          <label>
            Message
            <textarea
              required
              name="message"
              placeholder="Tell me a little about the project..."
              rows={4}
            />
          </label>
          <button className="button button-lime" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send message"} <Send size={16} />
          </button>
          {submitMessage ? (
            <p
              aria-live="polite"
              style={{
                marginTop: "0.75rem",
                color: submitState === "success" ? "#22c55e" : "#f87171",
                fontSize: "0.95rem",
              }}
            >
              {submitMessage}
            </p>
          ) : null}
        </motion.form>
      </div>
    </section>
  );
}
// Menampilkan footer akhir yang menutup halaman dengan identitas singkat dan info teknis dasar.
export function Footer() {
  return (
    <footer className="footer wrap">
      <a className="brand" href="#top">
        <span className="brand-mark">AR</span>
        <span>Akhmad Roufun Aziz</span>
      </a>
      <span>Designed &amp; built with Next.js</span>
      <span>© 2026</span>
    </footer>
  );
}
// Menyediakan label section yang dapat dipakai berulang pada berbagai bagian portfolio dengan gaya yang konsisten.
function SectionLabel({
  number,
  label,
  title,
  light = false,
}: {
  number: string;
  label: string;
  title: string;
  light?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className={`section-heading ${light ? "light" : ""}`}
      {...revealProps(Boolean(reducedMotion))}
    >
      <div className="heading-kicker">
        <span>{number}</span>
        <span>{label}</span>
      </div>
      <h2 dangerouslySetInnerHTML={{ __html: title }} />
    </motion.div>
  );
}
