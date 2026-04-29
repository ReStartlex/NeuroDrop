import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv();

const { sql } = await import("drizzle-orm");
const { db, schema } = await import("@/lib/db/client");
const { logger } = await import("@/lib/logger");

import type { FormSchema, NewProduct, NewProductVariant, NewReview } from "./schema";

const renewFormSchema: FormSchema = {
  fields: [
    {
      key: "login",
      label: "Логин или email от аккаунта",
      type: "text",
      placeholder: "you@gmail.com",
      required: true,
      encrypted: true,
    },
    {
      key: "password",
      label: "Пароль",
      type: "password",
      required: true,
      encrypted: true,
      helperText: "Хранится в зашифрованном виде, доступ — только для выполнения заказа",
    },
    {
      key: "twofa",
      label: "Резервные коды 2FA (если включена)",
      type: "textarea",
      required: false,
      encrypted: true,
    },
    {
      key: "notes",
      label: "Дополнительные комментарии",
      type: "textarea",
      required: false,
      encrypted: false,
    },
  ],
};

const readyAccountFormSchema: FormSchema = {
  fields: [
    {
      key: "notes",
      label: "Комментарии для менеджера",
      type: "textarea",
      required: false,
      encrypted: false,
      placeholder: "Например, нужен аккаунт без истории чатов",
    },
  ],
};

type CategorySeed = { slug: string; name: string; icon: string; sortOrder: number };

const CATEGORIES: CategorySeed[] = [
  { slug: "ai", name: "AI и нейросети", icon: "sparkles", sortOrder: 10 },
  { slug: "video-music", name: "Видео и музыка", icon: "play", sortOrder: 20 },
  { slug: "design", name: "Дизайн", icon: "palette", sortOrder: 30 },
  { slug: "development", name: "Разработка", icon: "code", sortOrder: 40 },
  { slug: "education", name: "Образование", icon: "graduation-cap", sortOrder: 50 },
];

type ReviewSeed = { authorName: string; rating: number; text: string };

type VariantSeed = Omit<NewProductVariant, "productId" | "id" | "createdAt" | "updatedAt">;

type ProductSeed = Omit<NewProduct, "id" | "categoryId" | "createdAt" | "updatedAt"> & {
  categorySlug: string;
  variants: VariantSeed[];
  reviews?: ReviewSeed[];
};

const PRODUCTS: ProductSeed[] = [
  {
    slug: "chatgpt-plus",
    categorySlug: "ai",
    title: "ChatGPT Plus",
    shortDescription:
      "GPT-4o с приоритетным доступом, генерация изображений, голосовой режим и расширенный анализ данных.",
    fullDescription:
      "ChatGPT Plus — премиум-подписка OpenAI. Включает: доступ к GPT-4o и более длинные ответы, генерацию изображений через DALL·E, продвинутый голосовой режим, анализ файлов и кода, более высокие лимиты на запросы.",
    accentColor: "#10A37F",
    isFeatured: true,
    sortOrder: 10,
    metaTitle: "Купить ChatGPT Plus в России — оплата картой РФ",
    metaDescription:
      "ChatGPT Plus с продлением вашего аккаунта или готовый аккаунт. Оплата в рублях, выдача за минуты, гарантия замены.",
    variants: [
      {
        name: "Продление вашего аккаунта · 1 месяц",
        type: "renew",
        durationDays: 31,
        priceRub: 1490,
        costPriceRub: 900,
        formSchema: renewFormSchema,
        deliveryTemplate: "Подписка на вашем аккаунте {{login}} активирована на 1 месяц.",
        sortOrder: 10,
      },
      {
        name: "Готовый аккаунт · 1 месяц",
        type: "ready_account",
        durationDays: 31,
        priceRub: 1990,
        costPriceRub: 1200,
        formSchema: readyAccountFormSchema,
        deliveryTemplate: "Логин: {{login}}\nПароль: {{password}}",
        stock: 25,
        sortOrder: 20,
      },
      {
        name: "Готовый аккаунт · 3 месяца",
        type: "ready_account",
        durationDays: 93,
        priceRub: 4990,
        costPriceRub: 3300,
        formSchema: readyAccountFormSchema,
        deliveryTemplate: "Логин: {{login}}\nПароль: {{password}}",
        stock: 10,
        sortOrder: 30,
      },
    ],
    reviews: [
      {
        authorName: "Илья В.",
        rating: 5,
        text: "Продлили мой аккаунт за 7 минут. Никаких VPN, всё работает.",
      },
      {
        authorName: "Маша К.",
        rating: 5,
        text: "Третий заказ. Удобно, что можно платить с российской карты.",
      },
      { authorName: "Дмитрий", rating: 4, text: "Норм, поддержка отвечает быстро в телеге." },
    ],
  },
  {
    slug: "chatgpt-pro",
    categorySlug: "ai",
    title: "ChatGPT Pro",
    shortDescription:
      "Безлимитный доступ к o1/o3-моделям, расширенный режим Deep Research и приоритетный доступ к новым возможностям.",
    fullDescription:
      "Pro-тариф для тех, кто упёрся в лимиты Plus. Безлимитный o1, o1-pro и o3, расширенный Deep Research, продвинутый Voice Mode без ограничений, приоритетный доступ к Sora.",
    accentColor: "#10A37F",
    isFeatured: true,
    sortOrder: 20,
    variants: [
      {
        name: "Продление вашего аккаунта · 1 месяц",
        type: "renew",
        durationDays: 31,
        priceRub: 19990,
        costPriceRub: 17500,
        formSchema: renewFormSchema,
        sortOrder: 10,
      },
      {
        name: "Готовый аккаунт · 1 месяц",
        type: "ready_account",
        durationDays: 31,
        priceRub: 22990,
        costPriceRub: 19500,
        formSchema: readyAccountFormSchema,
        stock: 5,
        sortOrder: 20,
      },
    ],
    reviews: [
      {
        authorName: "Артём",
        rating: 5,
        text: "Pro окупается за пару дней работы — o1-pro действительно сильнее.",
      },
    ],
  },
  {
    slug: "cursor-pro",
    categorySlug: "development",
    title: "Cursor Pro",
    shortDescription:
      "AI-редактор кода на стероидах: Claude и GPT-4 прямо в IDE, агентный режим, неограниченные автокомплиты.",
    fullDescription:
      "Cursor Pro даёт безлимитный slow-pool, увеличенный fast-pool, доступ к Claude Sonnet/Opus и GPT-4o, Composer и Agent. Главный инструмент любого AI-первого разработчика.",
    accentColor: "#6366F1",
    isFeatured: true,
    sortOrder: 30,
    variants: [
      {
        name: "Продление · 1 месяц",
        type: "renew",
        durationDays: 31,
        priceRub: 1690,
        costPriceRub: 1100,
        formSchema: renewFormSchema,
        sortOrder: 10,
      },
      {
        name: "Продление · 12 месяцев",
        type: "renew",
        durationDays: 366,
        priceRub: 16990,
        costPriceRub: 11500,
        formSchema: renewFormSchema,
        sortOrder: 20,
      },
      {
        name: "Готовый аккаунт · 1 месяц",
        type: "ready_account",
        durationDays: 31,
        priceRub: 1990,
        costPriceRub: 1300,
        formSchema: readyAccountFormSchema,
        stock: 15,
        sortOrder: 30,
      },
    ],
    reviews: [
      {
        authorName: "Никита",
        rating: 5,
        text: "Cursor + Claude Opus — до сих пор не верю, что это легально доступно. Спасибо.",
      },
      {
        authorName: "Ольга",
        rating: 5,
        text: "Продление прошло быстро, работаю без перерывов.",
      },
      { authorName: "Семён", rating: 4, text: "Брал годовую — выгоднее, всё ок." },
    ],
  },
  {
    slug: "claude-pro",
    categorySlug: "ai",
    title: "Claude Pro",
    shortDescription:
      "Premium-доступ к Claude Sonnet 4.6 и Opus 4.7. Длинный контекст, Projects, артефакты, Computer Use.",
    fullDescription:
      "Claude Pro — флагман Anthropic. 5x повышенные лимиты, Projects для долгосрочного контекста, артефакты, доступ к Opus и Computer Use в превью.",
    accentColor: "#C9986A",
    isFeatured: true,
    sortOrder: 40,
    variants: [
      {
        name: "Продление · 1 месяц",
        type: "renew",
        durationDays: 31,
        priceRub: 1690,
        costPriceRub: 1100,
        formSchema: renewFormSchema,
        sortOrder: 10,
      },
      {
        name: "Готовый аккаунт · 1 месяц",
        type: "ready_account",
        durationDays: 31,
        priceRub: 1990,
        costPriceRub: 1300,
        formSchema: readyAccountFormSchema,
        stock: 12,
        sortOrder: 20,
      },
    ],
    reviews: [
      {
        authorName: "Виктория",
        rating: 5,
        text: "Opus 4.7 — лучшая модель для длинных текстов. Всё корректно подключилось.",
      },
      { authorName: "Артём Б.", rating: 5, text: "Аккуратно, быстро, без вопросов." },
    ],
  },
  {
    slug: "claude-max",
    categorySlug: "ai",
    title: "Claude Max",
    shortDescription:
      "Максимальный тариф Claude: ×20 лимиты, приоритетный доступ к новым моделям, безлимитный Computer Use.",
    fullDescription:
      "Max — для тех, кто работает с Claude как с основной рабочей лошадкой. ×20 от Pro по лимитам, приоритет к новым моделям и фичам.",
    accentColor: "#C9986A",
    sortOrder: 45,
    variants: [
      {
        name: "Продление · 1 месяц",
        type: "renew",
        durationDays: 31,
        priceRub: 9990,
        costPriceRub: 8500,
        formSchema: renewFormSchema,
        sortOrder: 10,
      },
    ],
  },
  {
    slug: "gemini-advanced",
    categorySlug: "ai",
    title: "Gemini Advanced",
    shortDescription:
      "Gemini 2.5 Pro с интеграциями Google Workspace, Deep Research и приоритетным доступом к новым моделям.",
    fullDescription:
      "Google AI Pro: Gemini 2.5 Pro / Ultra, Deep Research, NotebookLM Plus, видео-генерация Veo, интеграции с Gmail/Docs/Sheets.",
    accentColor: "#3B82F6",
    sortOrder: 50,
    variants: [
      {
        name: "Продление · 1 месяц",
        type: "renew",
        durationDays: 31,
        priceRub: 1290,
        costPriceRub: 800,
        formSchema: renewFormSchema,
        sortOrder: 10,
      },
      {
        name: "Готовый аккаунт · 1 месяц",
        type: "ready_account",
        durationDays: 31,
        priceRub: 1690,
        costPriceRub: 1100,
        formSchema: readyAccountFormSchema,
        stock: 8,
        sortOrder: 20,
      },
    ],
    reviews: [
      { authorName: "Юлия", rating: 4, text: "Веду рисёрч по диссертации в NotebookLM. Топ." },
    ],
  },
  {
    slug: "perplexity-pro",
    categorySlug: "ai",
    title: "Perplexity Pro",
    shortDescription:
      "AI-поиск с цитированием источников. GPT-4o, Claude и Sonar внутри. Pro Search для глубоких запросов.",
    fullDescription:
      "Perplexity Pro — лучший AI-поиск на рынке. Pro Search, файлы, изображения, доступ к топовым моделям, без рекламы.",
    accentColor: "#20B8CD",
    sortOrder: 60,
    variants: [
      {
        name: "Продление · 12 месяцев",
        type: "renew",
        durationDays: 366,
        priceRub: 4490,
        costPriceRub: 1800,
        formSchema: renewFormSchema,
        sortOrder: 10,
      },
      {
        name: "Готовый аккаунт · 12 месяцев",
        type: "ready_account",
        durationDays: 366,
        priceRub: 5990,
        costPriceRub: 2400,
        formSchema: readyAccountFormSchema,
        stock: 20,
        sortOrder: 20,
      },
    ],
    reviews: [
      { authorName: "Артур", rating: 5, text: "Год по цене двух месяцев Pro — отличная сделка." },
      { authorName: "Лена", rating: 5, text: "Pro Search экономит часы рисёрча." },
    ],
  },
  {
    slug: "grok-premium",
    categorySlug: "ai",
    title: "Grok Premium",
    shortDescription:
      "Grok 4 от xAI: безлимитные запросы, Heavy mode, генерация изображений и Aurora-видео.",
    fullDescription:
      "Premium-доступ к Grok 4 / Heavy. Без ограничений, доступ к Aurora-видео, ранний доступ к новым возможностям xAI.",
    accentColor: "#1DA1F2",
    sortOrder: 70,
    variants: [
      {
        name: "Продление · 1 месяц",
        type: "renew",
        durationDays: 31,
        priceRub: 2790,
        costPriceRub: 2000,
        formSchema: renewFormSchema,
        sortOrder: 10,
      },
      {
        name: "Готовый аккаунт · 1 месяц",
        type: "ready_account",
        durationDays: 31,
        priceRub: 3290,
        costPriceRub: 2400,
        formSchema: readyAccountFormSchema,
        stock: 6,
        sortOrder: 20,
      },
    ],
  },
  {
    slug: "youtube-premium",
    categorySlug: "video-music",
    title: "YouTube Premium",
    shortDescription:
      "YouTube без рекламы, фоновое воспроизведение, скачивание видео и YouTube Music внутри.",
    fullDescription:
      "Подписка YouTube Premium включает YouTube без рекламы, скачивание видео офлайн, фоновое воспроизведение и YouTube Music Premium.",
    accentColor: "#DC2626",
    isFeatured: true,
    sortOrder: 80,
    variants: [
      {
        name: "Продление · 1 месяц",
        type: "renew",
        durationDays: 31,
        priceRub: 290,
        costPriceRub: 100,
        formSchema: renewFormSchema,
        sortOrder: 10,
      },
      {
        name: "Продление · 12 месяцев",
        type: "renew",
        durationDays: 366,
        priceRub: 1990,
        costPriceRub: 1100,
        formSchema: renewFormSchema,
        sortOrder: 20,
      },
      {
        name: "Семейный план · 12 месяцев",
        type: "renew",
        durationDays: 366,
        priceRub: 3990,
        costPriceRub: 2200,
        formSchema: renewFormSchema,
        sortOrder: 30,
      },
    ],
    reviews: [
      { authorName: "Кирилл", rating: 5, text: "Семейный за 4к в год — нет смысла искать дальше." },
      { authorName: "Алина", rating: 5, text: "Продлили за 3 минуты после оплаты." },
    ],
  },
  {
    slug: "spotify-premium",
    categorySlug: "video-music",
    title: "Spotify Premium",
    shortDescription:
      "Spotify без рекламы, офлайн-режим, lossless-качество и доступ ко всему каталогу.",
    fullDescription:
      "Premium-подписка Spotify: 100M+ треков без рекламы, офлайн-режим, hi-fi звук, неограниченные пропуски.",
    accentColor: "#1DB954",
    isFeatured: true,
    sortOrder: 90,
    variants: [
      {
        name: "Продление · 1 месяц",
        type: "renew",
        durationDays: 31,
        priceRub: 290,
        costPriceRub: 100,
        formSchema: renewFormSchema,
        sortOrder: 10,
      },
      {
        name: "Продление · 12 месяцев",
        type: "renew",
        durationDays: 366,
        priceRub: 1990,
        costPriceRub: 1100,
        formSchema: renewFormSchema,
        sortOrder: 20,
      },
      {
        name: "Семейный план · 12 месяцев",
        type: "renew",
        durationDays: 366,
        priceRub: 3490,
        costPriceRub: 2000,
        formSchema: renewFormSchema,
        sortOrder: 30,
      },
    ],
    reviews: [
      { authorName: "Игорь", rating: 5, text: "Семейный — топ. Поддержка моментальная." },
      { authorName: "Наталья", rating: 4, text: "Всё ок, музыка играет :)" },
      { authorName: "Дима", rating: 5, text: "5/5, рекомендую." },
    ],
  },
  {
    slug: "canva-pro",
    categorySlug: "design",
    title: "Canva Pro",
    shortDescription:
      "Premium-шаблоны, 100M+ стоковых ассетов, Magic Studio, ремув-фон в один клик и брендинг.",
    fullDescription:
      "Canva Pro: безлимитные премиум-шаблоны и стоки, Magic Studio (AI-инструменты), Brand Kit, фоновое удаление, скачивание в любом формате.",
    accentColor: "#00C4CC",
    sortOrder: 100,
    variants: [
      {
        name: "Продление · 12 месяцев",
        type: "renew",
        durationDays: 366,
        priceRub: 2490,
        costPriceRub: 1500,
        formSchema: renewFormSchema,
        sortOrder: 10,
      },
      {
        name: "Готовый аккаунт · 12 месяцев",
        type: "ready_account",
        durationDays: 366,
        priceRub: 3490,
        costPriceRub: 2000,
        formSchema: readyAccountFormSchema,
        stock: 30,
        sortOrder: 20,
      },
    ],
    reviews: [
      {
        authorName: "Маша",
        rating: 5,
        text: "Canva Pro решает 90% дизайн-задач для соцсетей. Год за 2.5к — зашло.",
      },
    ],
  },
  {
    slug: "replit-core",
    categorySlug: "development",
    title: "Replit Core",
    shortDescription:
      "Полноценная IDE в браузере, AI-агенты, неограниченные публичные репли и хостинг приложений.",
    fullDescription:
      "Replit Core — фичерфул облачная IDE с AI Agent, безлимитом репло, deploy-инфраструктурой и расширенными ресурсами.",
    accentColor: "#F26207",
    sortOrder: 110,
    variants: [
      {
        name: "Продление · 1 месяц",
        type: "renew",
        durationDays: 31,
        priceRub: 2290,
        costPriceRub: 1500,
        formSchema: renewFormSchema,
        sortOrder: 10,
      },
      {
        name: "Продление · 12 месяцев",
        type: "renew",
        durationDays: 366,
        priceRub: 21990,
        costPriceRub: 16500,
        formSchema: renewFormSchema,
        sortOrder: 20,
      },
    ],
  },
  {
    slug: "tryhackme-premium",
    categorySlug: "education",
    title: "TryHackMe Premium",
    shortDescription:
      "Cybersecurity-обучение через виртуальные машины. Безлимитный доступ ко всем room и learning paths.",
    fullDescription:
      "TryHackMe Premium даёт неограниченный доступ к комнатам, машинам, путям обучения по offensive/defensive security и сертификациям.",
    accentColor: "#88CC14",
    sortOrder: 120,
    variants: [
      {
        name: "Продление · 1 месяц",
        type: "renew",
        durationDays: 31,
        priceRub: 990,
        costPriceRub: 500,
        formSchema: renewFormSchema,
        sortOrder: 10,
      },
      {
        name: "Продление · 12 месяцев",
        type: "renew",
        durationDays: 366,
        priceRub: 9990,
        costPriceRub: 5500,
        formSchema: renewFormSchema,
        sortOrder: 20,
      },
    ],
    reviews: [
      { authorName: "Даниил", rating: 5, text: "Учусь по learning path Pentest+, всё ок." },
    ],
  },
];

async function seed(): Promise<void> {
  logger.info("seed: starting");

  await db.execute(sql`SET session_replication_role = replica`);
  await db.delete(schema.reviews);
  await db.delete(schema.productVariants);
  await db.delete(schema.products);
  await db.delete(schema.categories);
  await db.execute(sql`SET session_replication_role = origin`);

  const insertedCategories = await db
    .insert(schema.categories)
    .values(CATEGORIES)
    .returning({ id: schema.categories.id, slug: schema.categories.slug });

  const categoryIdBySlug = new Map(insertedCategories.map((c) => [c.slug, c.id]));
  logger.info({ count: insertedCategories.length }, "seed: categories");

  let variantCount = 0;
  let reviewCount = 0;

  for (const p of PRODUCTS) {
    const categoryId = categoryIdBySlug.get(p.categorySlug);
    if (!categoryId) throw new Error(`Unknown category slug: ${p.categorySlug}`);

    const [inserted] = await db
      .insert(schema.products)
      .values({
        slug: p.slug,
        categoryId,
        title: p.title,
        shortDescription: p.shortDescription,
        fullDescription: p.fullDescription,
        accentColor: p.accentColor,
        isFeatured: p.isFeatured,
        sortOrder: p.sortOrder,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
      })
      .returning({ id: schema.products.id });

    if (!inserted) throw new Error(`Failed to insert product ${p.slug}`);

    if (p.variants.length > 0) {
      await db
        .insert(schema.productVariants)
        .values(p.variants.map((v) => ({ ...v, productId: inserted.id })));
      variantCount += p.variants.length;
    }

    if (p.reviews?.length) {
      const rows: NewReview[] = p.reviews.map((r) => ({
        productId: inserted.id,
        authorName: r.authorName,
        rating: r.rating,
        text: r.text,
        status: "approved",
      }));
      await db.insert(schema.reviews).values(rows);
      reviewCount += rows.length;
    }
  }

  logger.info(
    { products: PRODUCTS.length, variants: variantCount, reviews: reviewCount },
    "seed: catalog done",
  );
}

await seed();
process.exit(0);
