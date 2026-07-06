import {
  PrismaClient,
  ProductStatus,
  ProductType,
  CouponType,
  UserRole,
  ContentStatus,
  MediaKind,
  ProductMediaRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const currency = "NGN";
const cdn = "https://images.unsplash.com";

async function main() {
  await prisma.download.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.courseProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.productMedia.deleteMany();
  await prisma.media.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.homepageContent.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.authAttempt.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_SEED_PASSWORD || "ChangeMe!12345",
    12,
  );
  const customerPassword = await bcrypt.hash("CustomerPass!123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Marketplace Admin",
      email: "admin@digitalmarketplace.dev",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      emailVerifiedAt: new Date(),
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Ada Okafor",
      email: "ada@example.com",
      passwordHash: customerPassword,
      role: UserRole.CUSTOMER,
      emailVerifiedAt: new Date(),
      avatarUrl: `${cdn}/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80`,
    },
  });

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Leadership",
        slug: "leadership",
        description: "Strategy, team leadership, and executive communication.",
        type: ProductType.EBOOK,
      },
    }),
    prisma.category.create({
      data: {
        name: "Growth",
        slug: "growth",
        description:
          "Demand generation, funnels, content, and paid acquisition.",
        type: ProductType.COURSE,
      },
    }),
    prisma.category.create({
      data: {
        name: "Operations",
        slug: "operations",
        description: "Systems, process design, and scalable operating models.",
        type: ProductType.WORKBOOK,
      },
    }),
    prisma.category.create({
      data: {
        name: "Mindset",
        slug: "mindset",
        description: "Focus, performance, and sustainable creative practice.",
        type: ProductType.AUDIOBOOK,
      },
    }),
  ]);

  const mediaRecords = await Promise.all([
    prisma.media.create({
      data: {
        fileName: "executive-systems-cover.jpg",
        storageKey: "seed/executive-systems-cover.jpg",
        url: `${cdn}/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80`,
        mimeType: "image/jpeg",
        kind: MediaKind.IMAGE,
        sizeBytes: 220000,
        width: 1200,
        height: 1600,
        altText: "Executive Systems playbook cover",
        uploadedById: admin.id,
      },
    }),
    prisma.media.create({
      data: {
        fileName: "growth-mastery-cover.jpg",
        storageKey: "seed/growth-mastery-cover.jpg",
        url: `${cdn}/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80`,
        mimeType: "image/jpeg",
        kind: MediaKind.IMAGE,
        sizeBytes: 210000,
        width: 1200,
        height: 1600,
        altText: "Growth mastery course cover",
        uploadedById: admin.id,
      },
    }),
    prisma.media.create({
      data: {
        fileName: "deep-work-audio-cover.jpg",
        storageKey: "seed/deep-work-audio-cover.jpg",
        url: `${cdn}/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80`,
        mimeType: "image/jpeg",
        kind: MediaKind.IMAGE,
        sizeBytes: 190000,
        width: 1200,
        height: 1600,
        altText: "Deep work audiobook cover",
        uploadedById: admin.id,
      },
    }),
    prisma.media.create({
      data: {
        fileName: "ops-workbook-cover.jpg",
        storageKey: "seed/ops-workbook-cover.jpg",
        url: `${cdn}/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80`,
        mimeType: "image/jpeg",
        kind: MediaKind.IMAGE,
        sizeBytes: 215000,
        width: 1200,
        height: 1600,
        altText: "Operating cadence workbook cover",
        uploadedById: admin.id,
      },
    }),
    prisma.media.create({
      data: {
        fileName: "ebook-download.pdf",
        storageKey: "seed/executive-systems-playbook.pdf",
        url: "https://example.com/files/executive-systems-playbook.pdf",
        mimeType: "application/pdf",
        kind: MediaKind.DOCUMENT,
        sizeBytes: 4500000,
        altText: "Executive Systems Playbook PDF",
        uploadedById: admin.id,
      },
    }),
    prisma.media.create({
      data: {
        fileName: "workbook-download.pdf",
        storageKey: "seed/operating-cadence-workbook.pdf",
        url: "https://example.com/files/operating-cadence-workbook.pdf",
        mimeType: "application/pdf",
        kind: MediaKind.DOCUMENT,
        sizeBytes: 5600000,
        altText: "Operating cadence workbook PDF",
        uploadedById: admin.id,
      },
    }),
    prisma.media.create({
      data: {
        fileName: "audiobook-download.mp3",
        storageKey: "seed/deep-work-audio.mp3",
        url: "https://example.com/files/deep-work-audiobook.mp3",
        mimeType: "audio/mpeg",
        kind: MediaKind.AUDIO,
        sizeBytes: 66000000,
        altText: "Deep work audiobook MP3",
        uploadedById: admin.id,
      },
    }),
  ]);

  const [leadership, growth, operations, mindset] = categories;
  const [
    ebookCover,
    courseCover,
    audioCover,
    workbookCover,
    ebookFile,
    workbookFile,
    audioFile,
  ] = mediaRecords;

  const ebook = await prisma.product.create({
    data: {
      title: "Executive Systems Playbook",
      slug: "executive-systems-playbook",
      excerpt:
        "A premium field guide for founders building calm, measurable operations.",
      description:
        "Executive Systems Playbook teaches operating cadence, leadership rituals, and decision frameworks for digital product teams scaling from founder-led execution into repeatable systems.",
      features: [
        "143 pages",
        "Board meeting templates",
        "Weekly scorecard system",
        "Hiring rubric library",
      ],
      type: ProductType.EBOOK,
      status: ProductStatus.PUBLISHED,
      sku: "EBOOK-001",
      priceCents: 4200000,
      compareAtPriceCents: 6000000,
      currency,
      seoTitle: "Executive Systems Playbook for Founders",
      seoDescription:
        "Premium ebook for startup operators building scalable systems.",
      featured: true,
      popularScore: 96,
      publishedAt: new Date(),
      categoryId: leadership.id,
    },
  });

  const audiobook = await prisma.product.create({
    data: {
      title: "Deep Focus for Builders",
      slug: "deep-focus-for-builders",
      excerpt:
        "An immersive audiobook on attention, routines, and sustainable creative output.",
      description:
        "Designed for makers and operators who need sharper concentration and better recovery, this audiobook combines narrative coaching, practical systems, and guided reflection.",
      features: [
        "5 hours 12 minutes",
        "Chapter summaries",
        "Mobile-ready MP3",
        "Reflection prompts included",
      ],
      type: ProductType.AUDIOBOOK,
      status: ProductStatus.PUBLISHED,
      sku: "AUDIO-001",
      priceCents: 3800000,
      compareAtPriceCents: 5200000,
      currency,
      featured: true,
      popularScore: 88,
      publishedAt: new Date(),
      categoryId: mindset.id,
    },
  });

  const workbook = await prisma.product.create({
    data: {
      title: "Operating Cadence Workbook",
      slug: "operating-cadence-workbook",
      excerpt:
        "A practical workbook for designing team rituals, dashboards, and accountability loops.",
      description:
        "Create meeting rhythms, KPI review systems, and accountability workflows with guided worksheets and editable planning frameworks.",
      features: [
        "Printable worksheets",
        "Notion and spreadsheet prompts",
        "Quarter planning canvas",
        "Manager check-in templates",
      ],
      type: ProductType.WORKBOOK,
      status: ProductStatus.PUBLISHED,
      sku: "WORK-001",
      priceCents: 3000000,
      compareAtPriceCents: 4500000,
      currency,
      featured: false,
      popularScore: 77,
      publishedAt: new Date(),
      categoryId: operations.id,
    },
  });

  const courseProduct = await prisma.product.create({
    data: {
      title: "Growth Systems Masterclass",
      slug: "growth-systems-masterclass",
      excerpt:
        "A premium video course for modern digital marketers building durable acquisition engines.",
      description:
        "Learn positioning, offer design, paid acquisition systems, landing page architecture, retention loops, and dashboards that keep growth predictable.",
      features: [
        "18 HD lessons",
        "Templates and worksheets",
        "Bonus teardown session",
        "Lifetime updates",
      ],
      type: ProductType.COURSE,
      status: ProductStatus.PUBLISHED,
      sku: "COURSE-001",
      priceCents: 12000000,
      compareAtPriceCents: 16000000,
      currency,
      featured: true,
      popularScore: 98,
      publishedAt: new Date(),
      categoryId: growth.id,
    },
  });

  await prisma.productMedia.createMany({
    data: [
      {
        productId: ebook.id,
        mediaId: ebookCover.id,
        role: ProductMediaRole.COVER,
        sortOrder: 0,
        isPrimary: true,
      },
      {
        productId: ebook.id,
        mediaId: ebookFile.id,
        role: ProductMediaRole.DOWNLOAD,
        sortOrder: 1,
      },
      {
        productId: audiobook.id,
        mediaId: audioCover.id,
        role: ProductMediaRole.COVER,
        sortOrder: 0,
        isPrimary: true,
      },
      {
        productId: audiobook.id,
        mediaId: audioFile.id,
        role: ProductMediaRole.DOWNLOAD,
        sortOrder: 1,
      },
      {
        productId: workbook.id,
        mediaId: workbookCover.id,
        role: ProductMediaRole.COVER,
        sortOrder: 0,
        isPrimary: true,
      },
      {
        productId: workbook.id,
        mediaId: workbookFile.id,
        role: ProductMediaRole.DOWNLOAD,
        sortOrder: 1,
      },
      {
        productId: courseProduct.id,
        mediaId: courseCover.id,
        role: ProductMediaRole.COVER,
        sortOrder: 0,
        isPrimary: true,
      },
    ],
  });

  const course = await prisma.course.create({
    data: {
      productId: courseProduct.id,
      difficulty: "Intermediate",
      durationMinutes: 320,
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      outcomes: [
        "Clarify positioning and offers",
        "Build conversion-ready funnels",
        "Instrument analytics without noise",
        "Set up a weekly growth operating system",
      ],
    },
  });

  await prisma.lesson.createMany({
    data: [
      {
        courseId: course.id,
        title: "Positioning That Pulls Demand",
        slug: "positioning-that-pulls-demand",
        description: "Craft a message that resonates with a specific buyer.",
        content:
          "Lesson covers category design, differentiation, and offer shaping.",
        videoUrl: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
        durationMinutes: 19,
        position: 1,
        isPreview: true,
      },
      {
        courseId: course.id,
        title: "Offer Design and Pricing",
        slug: "offer-design-and-pricing",
        description: "Translate value into a high-converting offer stack.",
        content: "Build an offer ladder, urgency mechanics, and trust assets.",
        videoUrl: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
        durationMinutes: 22,
        position: 2,
        isPreview: false,
      },
      {
        courseId: course.id,
        title: "Landing Page Systems",
        slug: "landing-page-systems",
        description: "Create pages that convert intent into action.",
        content:
          "Page architecture, social proof, friction reduction, and CTA patterns.",
        videoUrl: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
        durationMinutes: 24,
        position: 3,
        isPreview: false,
      },
      {
        courseId: course.id,
        title: "Paid Acquisition Control Tower",
        slug: "paid-acquisition-control-tower",
        description: "Operate paid channels with disciplined reporting.",
        content:
          "Blended CAC, budget pacing, testing structure, and signal hierarchy.",
        videoUrl: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
        durationMinutes: 27,
        position: 4,
        isPreview: false,
      },
    ],
  });

  await prisma.homepageContent.createMany({
    data: [
      {
        key: "hero",
        title: "Homepage Hero",
        status: ContentStatus.PUBLISHED,
        content: {
          eyebrow: "Premium digital knowledge products",
          heading: "Learn faster. Build better. Scale with confidence.",
          subheading:
            "A curated marketplace for ambitious founders, operators, and creators buying premium ebooks, audiobooks, workbooks, and courses.",
          primaryCta: { label: "Explore the shop", href: "/shop" },
          secondaryCta: { label: "Browse courses", href: "/courses" },
          stats: [
            { label: "Active learners", value: "12k+" },
            { label: "Completion rate", value: "91%" },
            { label: "Average product rating", value: "4.9/5" },
          ],
        },
      },
      {
        key: "why-choose-us",
        title: "Why Choose Us",
        status: ContentStatus.PUBLISHED,
        content: {
          heading: "Built for serious learners who value clarity over noise.",
          items: [
            {
              title: "Curated quality",
              description:
                "Every product is designed like a premium software experience.",
            },
            {
              title: "Instant access",
              description:
                "Products appear inside your dashboard the moment payment clears.",
            },
            {
              title: "Lifetime updates",
              description:
                "Core products continue improving as new best practices emerge.",
            },
          ],
        },
      },
      {
        key: "newsletter",
        title: "Newsletter Block",
        status: ContentStatus.PUBLISHED,
        content: {
          heading: "Get one sharp idea each week",
          description:
            "Join product leaders receiving practical growth and operations insights.",
        },
      },
      {
        key: "footer",
        title: "Footer Content",
        status: ContentStatus.PUBLISHED,
        content: {
          company:
            "A premium marketplace for digital products designed to help builders move with clarity.",
          legalLinks: ["/privacy", "/terms"],
          socialLinks: [
            { label: "X", href: "https://x.com" },
            { label: "LinkedIn", href: "https://linkedin.com" },
          ],
        },
      },
      {
        key: "seo",
        title: "SEO Metadata",
        status: ContentStatus.PUBLISHED,
        content: {
          title: "Premium Digital Product Marketplace",
          description:
            "Premium ebooks, audiobooks, workbooks, and courses for modern founders and operators.",
          keywords: [
            "digital products",
            "ebooks",
            "audiobooks",
            "online courses",
            "workbooks",
          ],
        },
      },
    ],
  });

  await prisma.testimonial.createMany({
    data: [
      {
        name: "Tolu Adebayo",
        role: "Founder",
        company: "Northstar Studio",
        quote:
          "The polish of the platform matches the quality of the material. Purchase flow is frictionless and the course dashboard is genuinely useful.",
        rating: 5,
        sortOrder: 1,
      },
      {
        name: "Mia Torres",
        role: "Growth Lead",
        company: "Orbit Commerce",
        quote:
          "The workbook and course pairing helped us redesign weekly growth reviews in under a week.",
        rating: 5,
        sortOrder: 2,
      },
      {
        name: "David Chen",
        role: "COO",
        company: "Layered Labs",
        quote:
          "Premium content, clean delivery, and instant access after payment. Exactly what a serious digital marketplace should feel like.",
        rating: 5,
        sortOrder: 3,
      },
    ],
  });

  await prisma.faq.createMany({
    data: [
      {
        question: "How quickly do I get access after payment?",
        answer:
          "As soon as Paystack confirms your payment, access is granted automatically and the products appear in your dashboard.",
        sortOrder: 1,
      },
      {
        question: "Can I download my purchased files later?",
        answer:
          "Yes. Eligible purchases remain available from the Downloads area of your dashboard at any time.",
        sortOrder: 2,
      },
      {
        question: "Do courses include lifetime updates?",
        answer:
          "Yes. All premium courses on the platform include future lesson and material updates unless otherwise stated.",
        sortOrder: 3,
      },
    ],
  });

  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        description: "10% off for first-time learners",
        type: CouponType.PERCENTAGE,
        value: 10,
        usageLimit: 500,
        active: true,
      },
      {
        code: "COURSE2500",
        description: "Flat ₦2,500 discount on orders above ₦15,000",
        type: CouponType.FIXED,
        value: 250000,
        minOrderCents: 1500000,
        active: true,
      },
    ],
  });

  const seededOrder = await prisma.order.create({
    data: {
      userId: customer.id,
      status: "PAID",
      subtotalCents: ebook.priceCents + courseProduct.priceCents,
      totalCents: ebook.priceCents + courseProduct.priceCents,
      currency,
      billingName: customer.name,
      billingEmail: customer.email,
      billingPhone: "+2348012345678",
      billingAddressJson: {
        line1: "12 Admiralty Way",
        city: "Lekki",
        state: "Lagos",
        country: "Nigeria",
      },
      paymentVerifiedAt: new Date(),
      paystackReference: "seed-reference-001",
      items: {
        create: [
          {
            productId: ebook.id,
            titleSnapshot: ebook.title,
            priceCents: ebook.priceCents,
          },
          {
            productId: courseProduct.id,
            titleSnapshot: courseProduct.title,
            priceCents: courseProduct.priceCents,
          },
        ],
      },
      payments: {
        create: [
          {
            provider: "paystack",
            reference: "seed-reference-001",
            amountCents: ebook.priceCents + courseProduct.priceCents,
            status: "SUCCESS",
            currency,
            paidAt: new Date(),
            rawPayload: { seeded: true },
          },
        ],
      },
    },
  });

  await prisma.download.createMany({
    data: [
      {
        userId: customer.id,
        productId: ebook.id,
        orderId: seededOrder.id,
        mediaId: ebookFile.id,
      },
      {
        userId: customer.id,
        productId: courseProduct.id,
        orderId: seededOrder.id,
        mediaId: courseCover.id,
      },
    ],
  });

  await prisma.siteSetting.createMany({
    data: [
      { key: "site_name", value: "Premium Digital Marketplace" },
      { key: "support_email", value: "support@digitalmarketplace.dev" },
      { key: "currency", value: currency },
      { key: "paystack_public_key", value: "pk_test_replace_me" },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
