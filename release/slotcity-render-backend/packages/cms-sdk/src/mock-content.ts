import type {
  CatalogPageData,
  HomePageData,
  LivePageData,
  NavigationLink
} from "./types";

const navigation: NavigationLink[] = [
  { id: "vision", label: "Vision", href: "/" },
  { id: "catalog", label: "Catalog", href: "/catalog" },
  { id: "live", label: "Live", href: "/live" }
];

export const mockHomePageData: HomePageData = {
  navigation,
  brandSubtitle: "SlotCity / new storefront platform",
  hero: {
    kicker: "SlotCity Platform / 4.0",
    title: "Нова luxury-платформа для iгор, live та retention growth.",
    body:
      "Робимо з нуля повноцiнне веб-застосування, яке зберiгає ДНК SlotCity, але працює як app-first продукт: швидкi витрини, мерчандайзинг, аналітика, CRM та контроль релiзiв.",
    actions: [
      { id: "catalog", label: "Вiдкрити Catalog Shell", href: "/catalog", variant: "primary" },
      { id: "live", label: "Вiдкрити Live Shell", href: "/live", variant: "secondary" }
    ],
    signals: [
      "Palette locked to #FFD15A",
      "24 canonical events seeded",
      "4 launch flags reserved"
    ]
  },
  infrastructureStats: [
    { id: "cms", label: "CMS", value: "Directus", body: "No-code shelf ops" },
    { id: "analytics", label: "Analytics", value: "PostHog", body: "Flags, replay, experiments" },
    { id: "crm", label: "CRM", value: "Braze", body: "Retention and journeys" },
    { id: "ops", label: "Observability", value: "Sentry", body: "Release health and tracing" }
  ],
  capabilityCards: [
    {
      id: "storefront",
      title: "Storefront",
      body: "Next.js app shell зi швидким входом у каталог, live, пошук і cashflow critical routes."
    },
    {
      id: "admin",
      title: "Directus Admin",
      body: "No-code керування банерами, shelf-ами, geo override, campaign windows та контентом."
    },
    {
      id: "growth",
      title: "Growth Engine",
      body: "PostHog для flags та експериментiв, Braze для lifecycle journeys, Sentry для release health."
    }
  ],
  operatingLayers: [
    {
      id: "content",
      kicker: "Content",
      title: "Маркетинг працює без розробника",
      points: [
        "hero-банери, заголовки та CTA у Directus",
        "витрини ігор по geo, locale та segment",
        "scheduled publish, rollback і approval flow"
      ]
    },
    {
      id: "growth",
      kicker: "Growth",
      title: "Продукт вимiрюється, а не вгадується",
      points: [
        "feature flags та A/B у PostHog",
        "канонiчна event-schema для web і server-side events",
        "CRM journeys у Braze по депозиту, KYC та reactivation"
      ]
    }
  ],
  architecture: {
    label: "Storefront",
    title: "Швидкий app shell без hardcoded маркетингового хаосу.",
    body:
      "Один фронт, який однаково добре працює для acquisition, game discovery, bonuses, live flows та повернення в сесiю.",
    items: [
      {
        id: "next",
        label: "Runtime",
        value: "Next.js",
        body: "App Router, typed routes, BFF layer"
      },
      {
        id: "motion",
        label: "Motion",
        value: "Motion + GSAP",
        body: "Цiлеспрямована анiмацiя замiсть косметичного шуму"
      },
      {
        id: "budget",
        label: "Perf",
        value: "Performance budgets",
        body: "LCP, INP, route-size та CI-контроль"
      }
    ]
  },
  footerPanels: [
    {
      id: "experience",
      kicker: "Experience",
      title: "Інтерфейс будуємо як дорогий продукт, а не як шаблонну витрину.",
      body:
        "Типографiка, depth, light, hover-state та mobile rhythm вже закладаються на стартi, щоб далi не латати UX поверх коду."
    },
    {
      id: "operations",
      kicker: "Operations",
      title: "Маркетинг отримує інструмент, а не чергу до розробника.",
      body:
        "Банери, витрини, сегменти, campaign windows, publish flow та аналітика будуть жити в окремому операцiйному контурi."
    }
  ],
  footerNote: "Monorepo scaffold готовий для design system, Directus schema і event ingestion."
};

export const mockCatalogPageData: CatalogPageData = {
  navigation,
  hero: {
    kicker: "Каталог SlotCity",
    title: "Каталог слотів",
    body:
      "Пошук по назві гри, провайдеру, бонусним слотам і live casino без порожніх технічних екранів та зайвого пошуку.",
    image: "/slotcity/assets/hero-card-live.webp",
    imageAlt: "Каталог слотів",
    actions: [
      { id: "home", label: "На головну", href: "/", variant: "secondary" },
      { id: "live", label: "Відкрити Live", href: "/live", variant: "primary" }
    ],
    chips: [
      { id: "all", label: "Всі" },
      { id: "top", label: "ТОП" },
      { id: "live", label: "Live" },
      { id: "bonus", label: "Бонуси" },
      { id: "pragmatic", label: "Pragmatic" },
      { id: "oaks", label: "3 Oaks" },
      { id: "spinjoy", label: "Spinjoy" }
    ]
  },
  console: {
    label: "Пошук / Фільтри",
    badge: "7000+ ігор",
    image: "/slotcity/assets/promos/city-vip-slider.webp",
    imageAlt: "Пошук і добірки слотів",
    searchPlaceholder: "Введи назву гри...",
    searchShortcut: "⌘K",
    chips: [
      { id: "popular", label: "Популярні", active: true },
      { id: "bonus-ready", label: "Bonus ready" },
      { id: "new", label: "Новинки" },
      { id: "providers", label: "Провайдери" }
    ],
    featuredGames: [
      { id: "gates", title: "Gates of Olympus", meta: "Pragmatic / top row", accent: "gold" },
      { id: "sweet", title: "Sweet Bonanza", meta: "Bonus shelf", accent: "green" },
      { id: "mega-wheel", title: "Mega Wheel", meta: "Live / cross-sell", accent: "blue" },
      { id: "coin", title: "Coin Strike XXL", meta: "Pinned for UA", accent: "gold" }
    ],
    footerCards: [
      {
        id: "geo",
        label: "Добірка",
        value: "UA / mobile / live",
        body: "Популярні ігри, бонусні слоти та live-зали зібрані в одному швидкому каталозі."
      },
      {
        id: "favourites",
        label: "Швидко",
        value: "Пошук за кілька тапів",
        body: "Знайди слот по назві, провайдеру або добірці без довгого скролу."
      }
    ]
  },
  stats: [
    {
      id: "slots",
      label: "Слоти",
      value: "7000+",
      body: "Популярні автомати, новинки та хіти дня в одному каталозі"
    },
    {
      id: "live",
      label: "Live",
      value: "200+",
      body: "Рулетка, blackjack, wheel-шоу та окремі live-добірки"
    },
    {
      id: "providers",
      label: "Провайдери",
      value: "50+",
      body: "Pragmatic Play, Evolution, 3 Oaks, Playtech, Spinjoy та інші"
    }
  ],
  shelves: [
    {
      id: "top-slots",
      title: "ТОП слоти",
      countLabel: "9 позицій",
      items: ["Gates", "Sweet", "Coin Strike", "Magic Apple", "Sun of Egypt"]
    },
    {
      id: "bonus-ready",
      title: "Ігри для відіграшу бонусів",
      countLabel: "8 позицій",
      items: ["Sweet Bonanza", "Wild Ways Hunt", "Fortune", "Sugar Rush", "Lucky Crusher"]
    }
  ],
  operationsFeed: [
    "Популярні слоти піднімаються у верхній ряд каталогу",
    "Ігри для відіграшу бонусів винесені в окрему добірку",
    "Live casino доступне поруч зі слотами без окремого довгого пошуку",
    "Новинки та хіти дня оновлюються разом із промо-банерами"
  ],
  floorCards: [
    {
      id: "popular",
      kicker: "Популярне",
      title: "Хіти дня та улюблені слоти завжди під рукою",
      body:
        "У верхніх рядах зібрані автомати, які найчастіше обирають гравці SlotCity: від великих хітів до швидких новинок."
    },
    {
      id: "bonuses",
      kicker: "Бонуси",
      title: "Окремі добірки для відіграшу та швидкого старту",
      body:
        "Каталог підсвічує слоти, які зручно відкривати під бонусні сценарії, free spins та щоденні пропозиції."
    },
    {
      id: "providers",
      kicker: "Провайдери",
      title: "Окремі полиці від Pragmatic, 3 Oaks, Spinjoy та live-залів",
      body:
        "Промо-банери, тижні провайдерів і тематичні добірки легко знаходяться прямо всередині каталогу."
    }
  ]
};

export const mockLivePageData: LivePageData = {
  navigation,
  hero: {
    kicker: "Live casino",
    title: "Live casino",
    body:
      "Рулетка, blackjack, wheel-шоу та VIP-сцени повинні відкриватися швидко: без довгого пошуку, без технічної порожнечі та з правильним quick return прямо з lobby.",
    image: "/slotcity/assets/promos/city-vip-slider.webp",
    imageAlt: "Live casino hero",
    actions: [
      { id: "home", label: "На головну", href: "/", variant: "secondary" },
      { id: "catalog", label: "До каталогу", href: "/catalog", variant: "primary" }
    ],
    points: [
      "Повернення в останній стіл за 1 tap",
      "VIP, Roulette, Blackjack і Wheel в одному lobby",
      "Популярні столи, ведучі та live-шоу в одному розділі"
    ]
  },
  console: {
    featuredLabel: "LIVE / PRIME",
    featuredTitle: "Улюблені live-столи, VIP-сцени та швидке повернення.",
    featuredBody: "Тут зібрані улюблені live-столи, ведучі та швидке повернення без зайвого пошуку.",
    image: "/slotcity/assets/hero-card-live.webp",
    imageAlt: "Quick return",
    pillLabel: "Quick return",
    tables: [
      { id: "mega-wheel", title: "Mega Wheel", meta: "Trending / UA", accent: "gold" },
      { id: "vip-blackjack", title: "VIP Blackjack", meta: "High value / VIP", accent: "blue" },
      { id: "roulette-ruby", title: "Roulette Ruby", meta: "Fast return / slots", accent: "green" }
    ],
    footerCards: [
      {
        id: "segment",
        label: "Улюблене",
        value: "VIP і популярні столи",
        body: "Швидко повернися до recent tables та знайди live-зали, які обираєш найчастіше."
      },
      {
        id: "reliability",
        label: "Швидкість",
        value: "Миттєвий вхід у live",
        body: "Рулетка, blackjack і wheel-шоу відкриваються без довгого пошуку."
      }
    ]
  },
  stats: [
    {
      id: "recent",
      label: "Recent tables",
      value: "08",
      body: "Швидкий re-entry для повернення в live-сесію"
    },
    {
      id: "hosts",
      label: "Hosts",
      value: "12",
      body: "Популярні ведучі та преміальні live-зали"
    },
    {
      id: "journeys",
      label: "Зали",
      value: "04",
      body: "Окремі добірки для рулетки, blackjack, VIP і wheel-шоу"
    }
  ],
  timeline: [
    "Популярні live-столи винесені у верхній ряд lobby",
    "VIP-зали та wheel-шоу знаходяться за кілька тапів",
    "Останній відкритий стіл доступний для швидкого повернення",
    "Рулетка та blackjack зібрані в окремі добірки"
  ],
  quickReturn: [
    {
      id: "blackjack",
      label: "Останній стіл",
      value: "VIP Blackjack",
      body: "Відкритий 13 хв тому"
    },
    {
      id: "mega-wheel",
      label: "Популярне",
      value: "Mega Wheel",
      body: "Швидкий перехід у live-шоу"
    },
    {
      id: "roulette",
      label: "Рулетка",
      value: "Roulette Ruby",
      body: "Повернення в улюблену live-залу"
    }
  ],
  floorCards: [
    {
      id: "crm",
      kicker: "Повернення",
      title: "Зручно повернутися у live в один-два тапи",
      body:
        "Останні столи, VIP-зали та популярні live-шоу завжди поруч, щоб не шукати їх заново."
    },
    {
      id: "compliance",
      kicker: "Промо",
      title: "Промо та live-добірки зібрані в одному місці",
      body:
        "Банери, акції та тематичні live-зали показуються поруч із головними столами без зайвого шуму."
    },
    {
      id: "instrumentation",
      kicker: "Швидкість",
      title: "Швидкий вхід у стіл, ведучого та live-залу",
      body:
        "Live lobby залишається швидким і зрозумілим навіть коли на сторінці багато столів, банерів і добірок."
    }
  ]
};
