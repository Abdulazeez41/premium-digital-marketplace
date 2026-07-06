"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";

// Recommended fonts (add via next/font or a <link> in your root layout):
// Display: Fraunces (serif, editorial, use weight 400-600 + italic)
// Body: Inter or General Sans
// Utility/mono: IBM Plex Mono

const headline = (text: string) => text.split(" ");

export function HeroSection({
  hero,
}: {
  hero: Record<string, any> | null | undefined;
}) {
  const content = hero || {};

  const tickerItems: string[] = content.tickerItems || [
    "Positioning for Premium Products",
    "Pricing Psychology for Creators",
    "Systems for Solo Operators",
    "The Founder's Content Engine",
  ];

  const [tickerIndex, setTickerIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setTickerIndex((i) => (i + 1) % tickerItems.length),
      2600,
    );
    return () => clearInterval(id);
  }, [tickerItems.length]);

  const stats: { label: string; value: string }[] = content.stats || [
    { label: "Active learners", value: "12,048" },
    { label: "Completion rate", value: "91%" },
    { label: "Average rating", value: "4.9 / 5" },
  ];

  const words = headline(
    content.heading || "Learn faster. Build better. Scale with confidence.",
  );

  return (
    <section className="relative overflow-hidden bg-[#FBF7F2] py-20 sm:py-24 lg:py-28">
      {/* faint ledger-line texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent, transparent 39px, rgba(122,31,43,0.05) 40px)",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(122,31,43,0.07),_transparent_40%)]" />

      <div className="relative grid gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        {/* LEFT: editorial headline */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.045, delayChildren: 0.1 },
            },
          }}
          className="space-y-8"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            className="inline-flex items-center gap-3 border-y border-[#7A1F2B]/20 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7A1F2B]"
          >
            <span>{content.editionLabel || "Edition No. 04"}</span>
            <span className="h-1 w-1 rounded-full bg-[#7A1F2B]/40" />
            <span>
              {content.eyebrow || "Premium digital learning products"}
            </span>
          </motion.div>

          <div className="max-w-3xl">
            <h1
              className="font-serif text-4xl font-medium leading-[1.05] tracking-tight text-[#1F1F1F] sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  className="mr-[0.28em] inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </h1>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              className="mt-5 max-w-xl text-lg leading-8 text-[#666666]"
            >
              {content.subheading ||
                "A curated marketplace for founders, operators, and ambitious creators."}
            </motion.p>
          </div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Button
              asChild
              size="lg"
              className="bg-[#7A1F2B] hover:bg-[#651A24]"
            >
              <Link href={content.primaryCta?.href || "/shop"}>
                {content.primaryCta?.label || "Enter the shop"}
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="text-[#7A1F2B] hover:bg-transparent hover:underline underline-offset-4"
            >
              <Link href={content.secondaryCta?.href || "/courses"}>
                {content.secondaryCta?.label || "View the catalogue →"}
              </Link>
            </Button>
          </motion.div>

          {/* ambient ticker */}
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { duration: 0.6, delay: 0.3 } },
            }}
            className="flex items-center gap-3 pt-2 font-mono text-xs uppercase tracking-[0.18em] text-[#8A8A8A]"
          >
            <span className="flex h-1.5 w-1.5">
              <span className="h-full w-full animate-ping rounded-full bg-[#7A1F2B]/60" />
            </span>
            <span>Now enrolling —</span>
            <div className="relative h-5 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={tickerIndex}
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -16, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="block whitespace-nowrap normal-case tracking-normal text-[#1F1F1F]"
                >
                  {tickerItems[tickerIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT: the index-card / ticket — signature element */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="relative rounded-[4px] border border-[#E4D9CE] bg-white px-8 pb-8 pt-10 shadow-[0_30px_80px_rgba(122,31,43,0.10)]">
            {/* perforation */}
            <div className="absolute -top-[9px] left-0 flex w-full justify-between px-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className="h-[9px] w-[9px] rounded-full bg-[#FBF7F2]"
                />
              ))}
            </div>
            <div className="absolute left-0 top-0 h-px w-full border-t border-dashed border-[#D8CABB]" />

            {/* catalogue number + rotating seal */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8A8A8A]">
                  Catalogue No.
                </p>
                <p
                  className="font-mono text-2xl font-semibold text-[#1F1F1F]"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {content.catalogNumber || "MP-2026-014"}
                </p>
              </div>
              <SpinningSeal rating={content.rating || "4.9"} />
            </div>

            {/* ledger stats */}
            <div className="space-y-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-baseline gap-2">
                  <span className="whitespace-nowrap text-sm text-[#666666]">
                    {stat.label}
                  </span>
                  <span className="mb-[3px] flex-1 border-b border-dotted border-[#D8CABB]" />
                  <span
                    className="whitespace-nowrap font-mono text-sm font-semibold text-[#1F1F1F]"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-[#EFE6DC] pt-4 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-[#B7A896]">
              Verified · Premium Edition
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SpinningSeal({ rating }: { rating: string }) {
  return (
    <div className="relative h-16 w-16 shrink-0">
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <path
            id="sealCircle"
            d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
          />
        </defs>
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="#7A1F2B"
          strokeOpacity="0.25"
        />
        <text
          fontSize="8.2"
          fill="#7A1F2B"
          letterSpacing="2"
          fontFamily="'IBM Plex Mono', monospace"
        >
          <textPath href="#sealCircle" startOffset="0%">
            VERIFIED EDITION • PREMIUM MARKETPLACE •
          </textPath>
        </text>
      </motion.svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-mono text-sm font-bold text-[#7A1F2B]"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {rating}
        </span>
      </div>
    </div>
  );
}
