import type {
  CatalogRouteContent,
  HomeRouteContent,
  LiveRouteContent,
  PromoCardContent,
  PromotionsRouteContent,
  TournamentsRouteContent,
  VipRouteContent
} from "./types";

const sharedHeroPromos: PromoCardContent[] = [
  {
    id: "city-vip",
    kicker: "Увійди до кола обраних",
    title: "CITY VIP",
    href: "/promotions/city-vip",
    image: "/slotcity/assets/promos/city-vip-slider.webp"
  },
  {
    id: "welcome-pack",
    kicker: "Новим гравцям",
    title: "500 000₴ + 700 ФС",
    href: "/promotions/welcome-pack",
    image: "/slotcity/assets/promos/welcome-lucky-season-slider.webp"
  },
  {
    id: "lucky-season",
    kicker: "Злови удачу",
    title: "у Столиці Розваг",
    href: "/promotions/lucky-season",
    image: "/slotcity/assets/tournaments/lucky-season-promo-desktop.webp"
  }
];

const sharedLiveGames = [
  {
    id: "mega-wheel",
    title: "Mega Wheel",
    provider: "Pragmatic Play Live",
    image: "/slotcity/games/mega-wheel.webp"
  },
  {
    id: "roulette-ruby",
    title: "Roulette Ruby",
    provider: "Pragmatic Play Live",
    image: "/slotcity/games/roulette-ruby.webp"
  },
  {
    id: "vip-blackjack",
    title: "VIP Blackjack 2 - Ruby",
    provider: "Pragmatic Play Live",
    image: "/slotcity/games/vip-blackjack-ruby.webp"
  },
  {
    id: "monopoly-live",
    title: "Monopoly Live",
    provider: "Evolution",
    image: "/slotcity/games/monopoly-live.webp"
  },
  {
    id: "crazy-time",
    title: "Crazy Time",
    provider: "Evolution",
    image: "/slotcity/games/crazy-time.webp"
  },
  {
    id: "auto-mega-roulette",
    title: "Slot City Auto Mega Roulette",
    provider: "Pragmatic Play Live",
    image: "/slotcity/games/auto-mega-roulette.webp"
  },
  {
    id: "mega-roulette",
    title: "Mega Roulette",
    provider: "Pragmatic Play Live",
    image: "/slotcity/games/mega-roulette.webp"
  },
  {
    id: "vip-auto-roulette",
    title: "VIP Auto Roulette",
    provider: "Pragmatic Play Live",
    image: "/slotcity/games/vip-auto-roulette.webp"
  },
  {
    id: "ice-fishing",
    title: "Ice Fishing",
    provider: "Evolution",
    image: "/slotcity/games/ice-fishing.webp"
  }
];

const sharedHeroSliderSlides = [
  {
    id: "welcome-lucky-season",
    eyebrow: "Вітальний бонус",
    title: "500 000 ₴ + 700 ФС",
    body: "Бонус на перші депозити та швидкий старт для нових гравців у SlotCity.",
    image: "/slotcity/assets/promos/welcome-lucky-season-slider.webp",
    accent: "gold" as const,
    primaryHref: "/bonuses",
    primaryLabel: "Отримати бонус",
    secondaryHref: "/promotions",
    secondaryLabel: "Деталі акції",
    chips: ["Новим гравцям", "7 депозитів", "700 ФС"],
    stats: [
      { label: "100%", value: "+25 ФС" },
      { label: "150%", value: "+50 ФС" },
      { label: "200%", value: "+300%+" }
    ]
  },
  {
    id: "city-vip-slider",
    eyebrow: "CITY VIP",
    title: "Увійди до кола обраних City VIP",
    body: "Персональні подарунки, окремі турніри та пріоритетна підтримка.",
    image: "/slotcity/assets/promos/city-vip-slider.webp",
    accent: "violet" as const,
    primaryHref: "/vip",
    primaryLabel: "Дивитися VIP",
    secondaryHref: "/catalog",
    secondaryLabel: "Відкрити ігри",
    chips: ["VIP club", "Персональні офери", "Преміум турніри"],
    stats: [
      { label: "VIP", value: "Статус" },
      { label: "CRM", value: "Персонально" },
      { label: "Fast lane", value: "Пріоритет" }
    ]
  },
  {
    id: "lucky-season",
    eyebrow: "Сезон удачі",
    title: "Злови удачу у Столиці Розваг",
    body: "Щоденні промо, турніри та швидкий перехід до потрібних слотів.",
    image: "/slotcity/assets/tournaments/lucky-season-promo-desktop.webp",
    accent: "green" as const,
    primaryHref: "/tournaments",
    primaryLabel: "Перейти до акцій",
    secondaryHref: "/catalog",
    secondaryLabel: "Дивитися слоти",
    chips: ["Щоденні розіграші", "Турніри", "Lucky journey"],
    stats: [
      { label: "Daily", value: "Промо" },
      { label: "Drops", value: "Подарунки" },
      { label: "CTA", value: "Швидкий вхід" }
    ]
  }
];

export const mockCatalogRouteContent: CatalogRouteContent = {
  heroPromos: sharedHeroPromos,
  topSlots: [
    {
      id: "gates-of-olympus",
      title: "Gates of Olympus",
      provider: "Pragmatic Play",
      image: "/slotcity/games/gates-of-olympus.webp"
    },
    {
      id: "pure-ecstasy",
      title: "Pure Ecstasy",
      provider: "PatePlay",
      image: "/slotcity/games/pure-ecstasy.webp"
    },
    {
      id: "coin-strike",
      title: "Coin Strike: Hold and Win",
      provider: "Playson",
      image: "/slotcity/games/coin-strike.webp"
    },
    {
      id: "magic-apple",
      title: "Magic Apple",
      provider: "3 Oaks Gaming",
      image: "/slotcity/games/magic-apple.webp"
    },
    {
      id: "fortune-of-olympus",
      title: "Fortune of Olympus",
      provider: "Pragmatic Play",
      image: "/slotcity/games/fortune-of-olympus.webp"
    },
    {
      id: "egypt-fire-2",
      title: "Egypt Fire 2",
      provider: "3 Oaks Gaming",
      image: "/slotcity/games/egypt-fire-2.webp"
    },
    {
      id: "sun-of-egypt-3",
      title: "Sun of Egypt 3",
      provider: "3 Oaks Gaming",
      image: "/slotcity/games/sun-of-egypt-3.webp"
    },
    {
      id: "sugar-rush",
      title: "Sugar Rush",
      provider: "Pragmatic Play",
      image: "/slotcity/games/sugar-rush.webp"
    },
    {
      id: "lucky-crusher",
      title: "Lucky Crusher",
      provider: "Spinjoy",
      image: "/slotcity/games/lucky-crusher.webp"
    },
    {
      id: "big-bass-bonanza",
      title: "Big Bass Bonanza",
      provider: "Pragmatic Play",
      image: "/slotcity/games/big-bass-bonanza.webp"
    },
    {
      id: "fire-stampede-2",
      title: "Fire Stampede 2",
      provider: "Pragmatic Play",
      image: "/slotcity/games/fire-stampede-2.webp"
    },
    {
      id: "fat-panda",
      title: "Fat Panda",
      provider: "Pragmatic Play",
      image: "/slotcity/games/fat-panda.webp"
    }
  ],
  discoveryGames: [
    {
      id: "wild-ways-hunt",
      title: "Wild Ways Hunt",
      provider: "BePlay",
      image: "/slotcity/games/wild-ways-hunt.webp"
    },
    {
      id: "sweet-bonanza",
      title: "Sweet Bonanza",
      provider: "Pragmatic Play",
      image: "/slotcity/games/sweet-bonanza.webp"
    },
    {
      id: "joker-blaze",
      title: "Joker Blaze",
      provider: "Zephyr",
      image: "/slotcity/games/joker-blaze.webp"
    },
    {
      id: "aztec-sun",
      title: "Aztec Sun",
      provider: "3 Oaks Gaming",
      image: "/slotcity/games/aztec-sun.webp"
    },
    {
      id: "big-bass-boxing",
      title: "Big Bass Boxing Bonus Round",
      provider: "Pragmatic Play",
      image: "/slotcity/games/big-bass-boxing-bonus-round.webp"
    },
    {
      id: "fat-panda-discovery",
      title: "Fat Panda",
      provider: "Pragmatic Play",
      image: "/slotcity/games/fat-panda.webp"
    }
  ],
  bonusGames: [
    {
      id: "bonus-sweet-bonanza",
      title: "Sweet Bonanza",
      provider: "Pragmatic Play",
      image: "/slotcity/games/sweet-bonanza.webp"
    },
    {
      id: "bonus-wild-ways-hunt",
      title: "Wild Ways Hunt",
      provider: "BePlay",
      image: "/slotcity/games/wild-ways-hunt.webp"
    },
    {
      id: "bonus-fortune",
      title: "Fortune of Olympus",
      provider: "Pragmatic Play",
      image: "/slotcity/games/fortune-of-olympus.webp"
    },
    {
      id: "bonus-sugar-rush",
      title: "Sugar Rush",
      provider: "Pragmatic Play",
      image: "/slotcity/games/sugar-rush.webp"
    },
    {
      id: "bonus-sun-of-egypt",
      title: "Sun of Egypt 3",
      provider: "3 Oaks Gaming",
      image: "/slotcity/games/sun-of-egypt-3.webp"
    },
    {
      id: "bonus-lucky-crusher",
      title: "Lucky Crusher",
      provider: "Spinjoy",
      image: "/slotcity/games/lucky-crusher.webp"
    },
    {
      id: "bonus-pure-ecstasy",
      title: "Pure Ecstasy",
      provider: "PatePlay",
      image: "/slotcity/games/pure-ecstasy.webp"
    },
    {
      id: "bonus-magic-apple",
      title: "Magic Apple",
      provider: "3 Oaks Gaming",
      image: "/slotcity/games/magic-apple.webp"
    }
  ],
  liveGames: sharedLiveGames.slice(0, 6),
  quickPicks: [
    {
      id: "quick-pure-ecstasy",
      title: "Pure Ecstasy",
      image: "/slotcity/games/pure-ecstasy.webp"
    },
    {
      id: "quick-fortune",
      title: "Fortune of Olympus",
      image: "/slotcity/games/fortune-of-olympus.webp"
    },
    {
      id: "quick-sweet-bonanza",
      title: "Sweet Bonanza",
      image: "/slotcity/games/sweet-bonanza.webp"
    },
    {
      id: "quick-lucky-crusher",
      title: "Lucky Crusher",
      image: "/slotcity/games/lucky-crusher.webp"
    },
    {
      id: "quick-mega-wheel",
      title: "Mega Wheel",
      image: "/slotcity/games/mega-wheel.webp"
    },
    {
      id: "quick-monopoly-live",
      title: "Monopoly Live",
      image: "/slotcity/games/monopoly-live.webp"
    }
  ],
  monthlyTop: [
    {
      id: "monthly-1",
      rank: "1",
      title: "Sugar Rush",
      provider: "Pragmatic Play",
      image: "/slotcity/games/sugar-rush.webp"
    },
    {
      id: "monthly-2",
      rank: "2",
      title: "Gates of Olympus",
      provider: "Pragmatic Play",
      image: "/slotcity/games/gates-of-olympus.webp"
    },
    {
      id: "monthly-3",
      rank: "3",
      title: "Joker Blaze",
      provider: "Zephyr",
      image: "/slotcity/games/joker-blaze.webp"
    },
    {
      id: "monthly-4",
      rank: "4",
      title: "Big Bass Bonanza",
      provider: "Pragmatic Play",
      image: "/slotcity/games/big-bass-bonanza.webp"
    },
    {
      id: "monthly-5",
      rank: "5",
      title: "Aztec Sun",
      provider: "3 Oaks Gaming",
      image: "/slotcity/games/aztec-sun.webp"
    },
    {
      id: "monthly-6",
      rank: "6",
      title: "Gorilla Mayhem",
      provider: "Pragmatic Play",
      image: "/slotcity/games/gorilla-mayhem.webp"
    }
  ],
  providerHighlights: [
    "Pragmatic Play",
    "Evolution",
    "Zephyr",
    "3 Oaks Gaming",
    "Amusnet",
    "Playtech",
    "Spinjoy"
  ],
  footerSignals: [
    "Google Pay",
    "Visa",
    "Mastercard",
    "Apple Pay",
    "Android Pay",
    "24/7 support"
  ]
};

export const mockLiveRouteContent: LiveRouteContent = {
  heroPromos: sharedHeroPromos,
  liveGames: sharedLiveGames,
  primeTables: [
    sharedLiveGames[0],
    sharedLiveGames[2],
    sharedLiveGames[1],
    sharedLiveGames[7],
    sharedLiveGames[3],
    sharedLiveGames[6]
  ],
  comebackTables: [
    sharedLiveGames[2],
    sharedLiveGames[0],
    sharedLiveGames[1],
    sharedLiveGames[7],
    sharedLiveGames[6],
    sharedLiveGames[8]
  ],
  slotCrossSell: [
    {
      id: "sweet-bonanza",
      title: "Sweet Bonanza",
      provider: "Pragmatic Play",
      image: "/slotcity/games/sweet-bonanza.webp"
    },
    {
      id: "wild-ways-hunt",
      title: "Wild Ways Hunt",
      provider: "BePlay",
      image: "/slotcity/games/wild-ways-hunt.webp"
    },
    {
      id: "fortune-of-olympus",
      title: "Fortune of Olympus",
      provider: "Pragmatic Play",
      image: "/slotcity/games/fortune-of-olympus.webp"
    },
    {
      id: "sugar-rush",
      title: "Sugar Rush",
      provider: "Pragmatic Play",
      image: "/slotcity/games/sugar-rush.webp"
    },
    {
      id: "sun-of-egypt-3",
      title: "Sun of Egypt 3",
      provider: "3 Oaks Gaming",
      image: "/slotcity/games/sun-of-egypt-3.webp"
    },
    {
      id: "lucky-crusher",
      title: "Lucky Crusher",
      provider: "Spinjoy",
      image: "/slotcity/games/lucky-crusher.webp"
    }
  ],
  providerHighlights: [
    "Pragmatic Play Live",
    "Evolution",
    "VIP tables",
    "Roulette",
    "Blackjack",
    "Wheel shows"
  ],
  footerSignals: [
    "VIP столи",
    "Roulette",
    "Blackjack",
    "Wheel shows",
    "Швидкий вхід",
    "24/7 live"
  ]
};

export const mockHomeRouteContent: HomeRouteContent = {
  heroSliderSlides: sharedHeroSliderSlides,
  topSlots: [
    ...mockCatalogRouteContent.topSlots,
    {
      id: "gates-of-slotcity-1000",
      title: "Gates of SlotCity 1000",
      provider: "Pragmatic Play",
      image: "/slotcity/games/gates-of-slotcity-1000.webp"
    },
    {
      id: "diamond-slam",
      title: "Diamond Slam",
      provider: "Enjoy Gaming",
      image: "/slotcity/games/diamond-slam.webp"
    },
    {
      id: "firecracker-frenzy-money-toad",
      title: "Firecracker Frenzy - Money Toad",
      provider: "Greentube",
      image: "/slotcity/games/firecracker-frenzy-money-toad.webp"
    },
    {
      id: "tea-party-of-fortune",
      title: "Tea Party of Fortune",
      provider: "ElaGames",
      image: "/slotcity/games/tea-party-of-fortune.webp"
    },
    {
      id: "moon-joker-joker-wheel",
      title: "Moon Joker: Joker Wheel",
      provider: "DreamPlay",
      image: "/slotcity/games/moon-joker-joker-wheel.webp"
    },
    {
      id: "madame-veyra",
      title: "Madame Veyra",
      provider: "Mancala Gaming",
      image: "/slotcity/games/madame-veyra.webp"
    },
    {
      id: "four-supercharged-clovers",
      title: "4 Supercharged Clovers: Hold and Win",
      provider: "Playson",
      image: "/slotcity/games/four-supercharged-clovers.webp"
    },
    {
      id: "mighty-wild-gorilla",
      title: "Mighty Wild: Gorilla",
      provider: "Wazdan",
      image: "/slotcity/games/mighty-wild-gorilla.webp"
    },
    {
      id: "three-royal-bags",
      title: "3 Royal Bags",
      provider: "Platipus",
      image: "/slotcity/games/three-royal-bags.webp"
    },
    {
      id: "golden-egg-of-crazy-chicken",
      title: "Golden Egg of Crazy Chicken",
      provider: "Pragmatic Play",
      image: "/slotcity/games/golden-egg.webp"
    },
    {
      id: "gates-of-olympus-super-scatter-home",
      title: "Gates of Olympus Super Scatter",
      provider: "Pragmatic Play",
      image: "/slotcity/games/gates-of-olympus-super-scatter.webp"
    },
    {
      id: "joker-blaze-home",
      title: "Joker Blaze",
      provider: "Zephyr",
      image: "/slotcity/games/joker-blaze.webp"
    },
    {
      id: "aztec-sun-home",
      title: "Aztec Sun",
      provider: "3 Oaks Gaming",
      image: "/slotcity/games/aztec-sun.webp"
    },
    {
      id: "sweet-bonanza-home",
      title: "Sweet Bonanza",
      provider: "Pragmatic Play",
      image: "/slotcity/games/sweet-bonanza.webp"
    },
    {
      id: "wild-ways-hunt-home",
      title: "Wild Ways Hunt",
      provider: "BePlay",
      image: "/slotcity/games/wild-ways-hunt.webp"
    },
    {
      id: "gorilla-mayhem-home",
      title: "Gorilla Mayhem",
      provider: "Pragmatic Play",
      image: "/slotcity/games/gorilla-mayhem.webp"
    }
  ],
  bonusGames: [
    ...mockCatalogRouteContent.bonusGames,
    mockCatalogRouteContent.discoveryGames[0],
    mockCatalogRouteContent.discoveryGames[1],
    mockCatalogRouteContent.discoveryGames[2],
    mockCatalogRouteContent.discoveryGames[3],
    {
      id: "bonus-gates-of-slotcity-1000",
      title: "Gates of SlotCity 1000",
      provider: "Pragmatic Play",
      image: "/slotcity/games/gates-of-slotcity-1000.webp"
    },
    {
      id: "bonus-diamond-slam",
      title: "Diamond Slam",
      provider: "Enjoy Gaming",
      image: "/slotcity/games/diamond-slam.webp"
    },
    {
      id: "bonus-firecracker-frenzy-money-toad",
      title: "Firecracker Frenzy - Money Toad",
      provider: "Greentube",
      image: "/slotcity/games/firecracker-frenzy-money-toad.webp"
    },
    {
      id: "bonus-tea-party-of-fortune",
      title: "Tea Party of Fortune",
      provider: "ElaGames",
      image: "/slotcity/games/tea-party-of-fortune.webp"
    },
    {
      id: "bonus-mighty-wild-gorilla",
      title: "Mighty Wild: Gorilla",
      provider: "Wazdan",
      image: "/slotcity/games/mighty-wild-gorilla.webp"
    },
    {
      id: "bonus-three-royal-bags",
      title: "3 Royal Bags",
      provider: "Platipus",
      image: "/slotcity/games/three-royal-bags.webp"
    },
    {
      id: "bonus-golden-egg-of-crazy-chicken",
      title: "Golden Egg of Crazy Chicken",
      provider: "Pragmatic Play",
      image: "/slotcity/games/golden-egg.webp"
    },
    {
      id: "bonus-joker-blaze-home",
      title: "Joker Blaze",
      provider: "Zephyr",
      image: "/slotcity/games/joker-blaze.webp"
    },
    {
      id: "bonus-aztec-sun-home",
      title: "Aztec Sun",
      provider: "3 Oaks Gaming",
      image: "/slotcity/games/aztec-sun.webp"
    },
    {
      id: "bonus-gates-super-scatter-home",
      title: "Gates of Olympus Super Scatter",
      provider: "Pragmatic Play",
      image: "/slotcity/games/gates-of-olympus-super-scatter.webp"
    },
    {
      id: "bonus-gorilla-mayhem-home",
      title: "Gorilla Mayhem",
      provider: "Pragmatic Play",
      image: "/slotcity/games/gorilla-mayhem.webp"
    }
  ],
  liveGames: sharedLiveGames,
  monthlyTop: [
    {
      id: "monthly-1",
      rank: "1",
      title: "Sugar Rush",
      provider: "Pragmatic Play",
      image: "/slotcity/games/sugar-rush.webp"
    },
    {
      id: "monthly-2",
      rank: "2",
      title: "Gates of Olympus",
      provider: "Pragmatic Play",
      image: "/slotcity/games/gates-of-olympus.webp"
    },
    {
      id: "monthly-3",
      rank: "3",
      title: "Royal Joker style",
      provider: "Zephyr / 3 Oaks",
      image: "/slotcity/games/joker-blaze.webp"
    },
    {
      id: "monthly-4",
      rank: "4",
      title: "Big Bass Bonanza",
      provider: "Pragmatic Play",
      image: "/slotcity/games/big-bass-bonanza.webp"
    },
    {
      id: "monthly-5",
      rank: "5",
      title: "Aztec Sun",
      provider: "3 Oaks",
      image: "/slotcity/games/aztec-sun.webp"
    },
    {
      id: "monthly-6",
      rank: "6",
      title: "Gorilla Mayhem",
      provider: "Pragmatic Play",
      image: "/slotcity/games/gorilla-mayhem.webp"
    },
    {
      id: "monthly-7",
      rank: "7",
      title: "Fat Panda",
      provider: "Pragmatic Play",
      image: "/slotcity/games/fat-panda.webp"
    },
    {
      id: "monthly-8",
      rank: "8",
      title: "Fire Stampede 2",
      provider: "Pragmatic Play",
      image: "/slotcity/games/fire-stampede-2.webp"
    },
    {
      id: "monthly-9",
      rank: "9",
      title: "Coin Strike: Hold and Win",
      provider: "Playson",
      image: "/slotcity/games/coin-strike.webp"
    },
    {
      id: "monthly-10",
      rank: "10",
      title: "Magic Apple",
      provider: "3 Oaks Gaming",
      image: "/slotcity/games/magic-apple.webp"
    }
  ],
  quickPicks: mockCatalogRouteContent.quickPicks,
  heroPromos: sharedHeroPromos,
  welcomeGifts: [
    {
      id: "gift-1",
      title: "100%",
      body: "+ 25 ФС",
      image: "/slotcity/assets/gift-live-1.webp",
      tone: "green"
    },
    {
      id: "gift-2",
      title: "150%",
      body: "+ 50 ФС",
      image: "/slotcity/assets/gift-live-2.webp",
      tone: "red"
    },
    {
      id: "gift-3",
      title: "200%",
      body: "+ 100 ФС",
      image: "/slotcity/assets/gift-live-3.webp",
      tone: "blue"
    }
  ],
  sideRailItems: [
    { id: "bonus", label: "Бонуси", short: "+" },
    { id: "top", label: "ТОП", short: "T" },
    { id: "live", label: "Live", short: "L" },
    { id: "promo", label: "Акції", short: "%" }
  ],
  socialLinks: [
    {
      id: "telegram",
      label: "Telegram",
      href: "https://t.me/+TVivwRae_UpkMzYy",
      mark: "TG",
      tone: "telegram"
    },
    {
      id: "instagram-news",
      label: "Instagram News",
      href: "https://www.instagram.com/slotcity.ua_news",
      mark: "IG",
      tone: "instagram"
    },
    {
      id: "instagram-fun",
      label: "Instagram Fun",
      href: "https://www.instagram.com/slotcity_fun/",
      mark: "IF",
      tone: "instagram-fun"
    },
    {
      id: "facebook",
      label: "Facebook",
      href: "https://www.facebook.com/sc.ua.official",
      mark: "FB",
      tone: "facebook"
    },
    {
      id: "youtube",
      label: "YouTube",
      href: "https://www.youtube.com/@slotcity_show",
      mark: "YT",
      tone: "youtube"
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/slot-city-ua",
      mark: "IN",
      tone: "linkedin"
    }
  ],
  faqItems: [
    {
      id: "faq-1",
      question: "Як швидко зареєструватись в Слот Сіті?",
      answer:
        "На сайті представлені 4 способи створення профілю: за номером телефону, через email, або за допомогою активного акаунта Google чи Apple. Якщо перші два варіанти передбачають заповнення даних і створення пароля, то реєстрація через Google чи Apple відбувається миттєво."
    },
    {
      id: "faq-2",
      question: "Які ігри доступні в казино Slot City?",
      answer:
        "У казино Слот Сіті онлайн гравцям доступна широка колекція ігрового контенту: слоти, краш-ігри, настільні та карткові ігри, а також live-казино. Ігри розділені на підкатегорії, що дозволяє швидко вибрати гру під ваш стиль та рівень банкролу."
    },
    {
      id: "faq-3",
      question: "Чи є у Slot City ліцензія?",
      answer:
        "Slot City має ліцензію видану державним агентством України ПлейСіті (Рішення № 137-Р, 29.10.2025)."
    },
    {
      id: "faq-4",
      question: "Чи можна грати в казино без реєстрації?",
      answer:
        "Гравці можуть грати в Слот Сіті без реєстрації та внесення депозиту лише у слоти в деморежимі. Для ставок ігровий баланс поповнюється віртуальними кредитами."
    },
    {
      id: "faq-5",
      question: "Як вивести виграш?",
      answer:
        "Перейдіть до розділу «Поповнити» → «Виплата». Для тих, хто подає заявку на зняття коштів вперше, потрібно верифікувати ідентифікаційний код. Виплата можлива лише на той банківський рахунок, з якого вже було внесено депозит."
    }
  ],
  providerHighlights: mockCatalogRouteContent.providerHighlights.slice(0, 6),
  contactPoints: [
    {
      id: "email",
      label: "Email",
      value: "support@slotcity.ua",
      href: "mailto:support@slotcity.ua"
    },
    {
      id: "phone",
      label: "Телефон",
      value: "+380630213021",
      href: "tel:+380630213021"
    },
    {
      id: "address",
      label: "Адреса",
      value: "пров. Ярославський, буд. 1/3, м. Київ, 04071, Україна"
    }
  ],
  footerLinks: [
    { id: "catalog", label: "Каталог", href: "/catalog" },
    { id: "live", label: "Live", href: "/live" },
    { id: "responsible", label: "Відповідальна гра", href: "/info/responsible-gaming" },
    { id: "bonuses", label: "Бонуси", href: "/bonuses" }
  ],
  storeButtons: [
    {
      id: "google-play",
      title: "Google Play",
      caption: "Android 7.0+",
      image: "/slotcity/assets/store/google-play.webp",
      width: 220,
      height: 66
    },
    {
      id: "app-store",
      title: "App Store",
      caption: "iOS 15.5+",
      image: "/slotcity/assets/store/app-store.webp",
      width: 205,
      height: 66
    }
  ],
  footerGroups: [
    {
      id: "product",
      title: "Розділи",
      links: [
        { id: "catalog", label: "Каталог", href: "/catalog" },
        { id: "live", label: "Live казино", href: "/live" },
        { id: "bonuses", label: "Бонуси", href: "/bonuses" },
        { id: "faq", label: "Популярні питання", href: "/faq" }
      ]
    },
    {
      id: "pages",
      title: "Інформація",
      links: [
        { id: "support", label: "Служба підтримки", href: "/info/contacts" },
        { id: "partners", label: "Партнерам", href: "/info/partners" },
        { id: "app", label: "Мобільний застосунок", href: "/casino-app" },
        { id: "registration", label: "Реєстрація", href: "/registration" }
      ]
    },
    {
      id: "legal",
      title: "Правова інформація",
      links: [
        { id: "responsible", label: "Відповідальна гра", href: "/info/responsible-gaming" },
        { id: "kyc", label: "Знай свого клієнта", href: "/info/know-your-customer" },
        { id: "game-rules", label: "Правила гри", href: "/info/game-rules" },
        { id: "rules", label: "Правила та умови", href: "/info/rules" }
      ]
    }
  ],
  paymentMethods: ["Visa", "Master Card", "ApplePay", "AndroidPay"],
  seoIntro: [
    "Онлайн казино SlotCity це понад 7000 ігрових автоматів. Забирайте Містичний Бонус. Грайте в ліцензованому та надійному казино.",
    "Бонуси нараховуються і за прості активності: завантажте додаток Slot City й отримайте 25 ФС."
  ],
  bonusMatrix: [
    {
      id: "matrix-1-4",
      label: "Нагороди за депозити з 1 по 4 включно",
      values: [
        "100% + 25 ФС (макс. бонус – 300 ₴)",
        "150% + 50 ФС (макс. бонус – 1 500 ₴)",
        "200% + 100 ФС (макс. бонус – 80 000 ₴)"
      ]
    },
    {
      id: "matrix-5-7",
      label: "Нагороди за депозити з 5 по 7 включно",
      values: [
        "100% + 25 ФС (макс. бонус – 300 ₴)",
        "125% + 50 ФС (макс. бонус – 1 500 ₴)",
        "150% + 100 ФС (макс. бонус – 60 000 ₴)"
      ]
    }
  ],
  bonusSlotPlan: [
    "1-й: Fortune of Olympus",
    "2-й: Wild Ways Hunt",
    "3-й: Pure Ecstasy",
    "4-й: Tornado Power: Hold and Win",
    "5-й: Sweet Bonanza 1000",
    "6-й: Lucky Penny 2",
    "7-й: Regal Spins 10"
  ],
  appRequirements: [
    {
      id: "os",
      label: "Мінімальна версія ОС",
      android: "7.0 та новіша",
      ios: "Для стабільної роботи iOS 15.5 або новіша"
    },
    {
      id: "ram",
      label: "Обсяг ОЗП",
      android: "Від 2 ГБ",
      ios: "Від 2 ГБ"
    },
    {
      id: "storage",
      label: "Вільне місце на пристрої",
      android: "Близько 150 МБ",
      ios: "Близько 165 МБ"
    },
    {
      id: "size",
      label: "Розмір файлу",
      android: "APK-файл: 77 МБ",
      ios: "App Store: 160,2 МБ"
    }
  ],
  androidSteps: [
    "Відкрийте офіційний сайт казино у мобільному браузері.",
    "Натисніть на посилання і розпочніть завантаження .apk-файлу.",
    "Інсталюйте файл на свій гаджет та, за потреби, надайте дозвіл на встановлення невідомих програм."
  ],
  iosSteps: [
    "Відкрийте App Store.",
    "Введіть у пошукове поле назву казино Slot City.",
    "Орієнтуйтеся на логотип та деталі в описі (GEIMDEV, TOV), щоб завантажити офіційний додаток.",
    "Натисніть «Отримати»."
  ],
  responsiblePoints: [
    "У казино впроваджуються політики щодо мінімізації негативних наслідків участі в гемблінгу та запобігання проявам ігрової залежності.",
    "Гравці мають право самостійно подати заявку на самообмеження участі в казино Slot City мінімум на 6 місяців.",
    "Якщо гра перестає бути розвагою, зверніться до служби підтримки або по кваліфіковану допомогу до спеціалізованих організацій."
  ]
};

export const mockPromotionsRouteContent: PromotionsRouteContent = {
  heroPromos: sharedHeroPromos,
  hero: {
    kicker: "Акції SlotCity",
    title: "Бонуси, розіграші та промо-кампанії",
    body:
      "Тут зібрані welcome pack, lucky journeys, місії та щоденні акції SlotCity з прямими переходами у потрібні добірки ігор.",
    image: "/slotcity/assets/promos/welcome-lucky-season-slider.webp",
    primaryCta: "Забрати бонус",
    primaryHref: "/registration",
    secondaryCta: "Дивитися каталог",
    secondaryHref: "/catalog",
    chips: ["500 000 ₴ + 700 ФС", "Щоденні акції", "Lucky journey"]
  },
  featuredPromotions: [
    {
      id: "welcome-pack",
      kicker: "Welcome pack",
      title: "500 000 ₴ + 700 ФС",
      body: "Бонуси на перші депозити для швидкого старту в SlotCity.",
      image: "/slotcity/assets/promos/welcome-lucky-season-slider.webp",
      href: "/registration"
    },
    {
      id: "city-vip",
      kicker: "CITY VIP",
      title: "Преміальні пропозиції та окремі офери",
      body: "VIP-гравці отримують окремі сценарії, подарунки та швидший доступ до акцій.",
      image: "/slotcity/assets/promos/city-vip-slider.webp",
      href: "/vip"
    },
    {
      id: "lucky-season",
      kicker: "Сезон удачі",
      title: "Турніри та розіграші в Столиці Розваг",
      body: "Щоденні кампанії з бонусами, prize drops та прямими переходами до слотів.",
      image: "/slotcity/assets/tournaments/lucky-season-promo-desktop.webp",
      href: "/tournaments"
    }
  ],
  welcomeGames: mockCatalogRouteContent.topSlots.slice(0, 6),
  seasonalGames: mockHomeRouteContent.bonusGames.slice(0, 8),
  missions: [
    {
      id: "mission-1",
      kicker: "Щоденні місії",
      title: "Грай, виконуй задачі та забирай подарунки",
      body: "Місії, free spins та бонусні механіки оформлюються як окремі промо-вікна."
    },
    {
      id: "mission-2",
      kicker: "Промокоди",
      title: "Спеціальні офери для сезонних кампаній",
      body: "Промокоди, welcome-акції та доповнення до щоденних бонусів без довгого пошуку."
    },
    {
      id: "mission-3",
      kicker: "Campaign windows",
      title: "Маркетинг редагує банери та CTA без розробника",
      body: "Контентні вікна під акції, welcome flow і турнірні добірки керуються через Directus."
    }
  ],
  footerSignals: ["Welcome pack", "Daily promos", "Lucky journey", "Directus editable"]
};

export const mockVipRouteContent: VipRouteContent = {
  heroPromos: sharedHeroPromos,
  hero: {
    kicker: "CITY VIP",
    title: "Преміальний контур SlotCity",
    body:
      "Окремі офери, VIP-сцени, персональні подарунки та швидші маршрути до потрібних слотів і live-столів.",
    image: "/slotcity/assets/promos/city-vip-slider.webp",
    primaryCta: "Переглянути VIP",
    primaryHref: "/vip",
    secondaryCta: "Відкрити live",
    secondaryHref: "/live",
    chips: ["VIP клуб", "Персональні бонуси", "Преміум lobby"]
  },
  featuredPromotions: [
    {
      id: "vip-lounge",
      kicker: "VIP lounge",
      title: "Окремі полиці та premium surfaces",
      body: "Для high-intent гравців готуємо окремі ряди слотів, live та promo-банерів.",
      image: "/slotcity/assets/promos/city-vip-slider.webp",
      href: "/live"
    },
    {
      id: "vip-gifts",
      kicker: "Подарунки",
      title: "Персональні акції та CRM journeys",
      body: "Маркетинг може виносити окремі бонусні банери для VIP-сегмента.",
      image: "/slotcity/assets/promos/welcome-lucky-season-slider.webp",
      href: "/promotions"
    }
  ],
  vipGames: mockCatalogRouteContent.topSlots.slice(0, 8),
  loungeGames: sharedLiveGames.slice(0, 6),
  benefits: [
    {
      id: "benefit-1",
      kicker: "Персоналізація",
      title: "Geo та segment override для VIP-витрин",
      body: "Окремі ряди можна керувати для VIP, locale та рекламних сегментів."
    },
    {
      id: "benefit-2",
      kicker: "CRM",
      title: "Braze journeys для premium сценаріїв",
      body: "Окремі retention та reactivation flow для користувачів з premium-intent."
    },
    {
      id: "benefit-3",
      kicker: "Контент",
      title: "VIP банери та тижні провайдерів редагуються в адмінці",
      body: "Контент-команда править обкладинки, CTA та promo windows без залучення фронтенду."
    }
  ],
  footerSignals: ["VIP club", "Premium slots", "Live tables", "Segment override"]
};

export const mockTournamentsRouteContent: TournamentsRouteContent = {
  heroPromos: sharedHeroPromos,
  hero: {
    kicker: "Турніри",
    title: "Сезонні кампанії, prize drops та турнірні полиці",
    body:
      "Сторінка для конкурсів, турнірних банерів і добірок слотів, які зараз беруть участь у промо та розіграшах.",
    image: "/slotcity/assets/tournaments/lucky-season-promo-desktop.webp",
    primaryCta: "Перейти до акцій",
    primaryHref: "/promotions",
    secondaryCta: "Відкрити слоти",
    secondaryHref: "/catalog",
    chips: ["Турніри", "Розіграші", "Prize drops"]
  },
  featuredPromotions: [
    {
      id: "lucky-season-promo",
      kicker: "Lucky Season",
      title: "Щоденні турніри та дропи",
      body: "Тематичні кампанії з prize pool, leaderboard і прямими CTA у слоти.",
      image: "/slotcity/assets/tournaments/lucky-season-promo-desktop.webp",
      href: "/promotions"
    },
    {
      id: "spinjoy-spring",
      kicker: "Provider weeks",
      title: "Промо-тижні провайдерів",
      body: "Окремі акційні банери для provider shelves та сезонних колекцій ігор.",
      image: "/slotcity/assets/tournaments/spinjoy-spring-desktop.webp",
      href: "/catalog"
    }
  ],
  tournamentGames: mockHomeRouteContent.topSlots.slice(0, 10),
  prizeGames: mockHomeRouteContent.bonusGames.slice(0, 8),
  mechanics: [
    {
      id: "mechanic-1",
      kicker: "Leaderboard",
      title: "Турнірні полиці з pinned-іграми",
      body: "Маркетинг або merch-команда може швидко змінювати добірки слотів під кампанію."
    },
    {
      id: "mechanic-2",
      kicker: "Preview",
      title: "Перед публікацією є окремий preview flow",
      body: "Банери, заголовки та promo-вікна проходять preview і публікуються по розкладу."
    },
    {
      id: "mechanic-3",
      kicker: "Analytics",
      title: "CTR і переходи на турнірні полиці міряються подіями",
      body: "Banner click, shelf view та conversion події йдуть у PostHog і маркетингові пайплайни."
    }
  ],
  footerSignals: ["Tournaments", "Prize drops", "Provider weeks", "Editable campaigns"]
};
