// On-screen text, the "voice" of the essay. English is the version to hand
// in; Russian is for checking. Keep lines short: a few words, 1-2 seconds.
export type Lang = "en" | "ru";

type Line = Record<Lang, string>;

export const CAPTIONS = {
  hook1: { en: "Every day — a new star.", ru: "Каждый день — новая звезда." },
  hook2: {
    en: "A week later, nobody remembers them.",
    ru: "Через неделю её никто не помнит.",
  },
  year: { en: "Back then", ru: "Раньше" },
  sameVideo: {
    en: "The whole world watched Michael Jackson.",
    ru: "Весь мир смотрел Майкла Джексона.",
  },
  thriller: {
    en: "His album Thriller became the best-selling album in history.",
    ru: "Его альбом Thriller стал самым продаваемым в истории.",
  },
  thrillerSource: {
    en: "Source: Guinness World Records",
    ru: "Источник: Книга рекордов Гиннесса",
  },
  question: {
    en: "So why can't anyone be as famous as Michael Jackson today?",
    ru: "Почему сегодня никто не может стать таким же знаменитым, как Майкл Джексон?",
  },
  then: { en: "THEN", ru: "РАНЬШЕ" },
  now: { en: "NOW", ru: "СЕЙЧАС" },
  reason: { en: "Reason", ru: "Причина" },
  r1Then: {
    en: "A few TV channels for the whole planet",
    ru: "Несколько каналов на весь мир",
  },
  r1Now: { en: "Everyone has their own feed", ru: "У каждого своя лента" },
  r2Then: { en: "Only a handful of stars", ru: "Мало конкурентов" },
  r2Now: {
    en: "Thousands of new tracks every day",
    ru: "Тысячи новых треков каждый день",
  },
  r3Then: { en: "A hit played for years", ru: "Хит звучал годами" },
  r3Now: {
    en: "A trend lasts a few days",
    ru: "Тренд живёт несколько дней",
  },
  who: {
    en: "So who is the biggest star right now?",
    ru: "Кто главная звезда сейчас?",
  },
  noAnswer: { en: "There's no single answer.", ru: "Единого ответа нет." },
  niche: { en: "Fame has become niche.", ru: "Слава стала нишевой." },
  millions: {
    en: "Millions of fans — but never the whole world at once.",
    ru: "Миллионы фанатов — но не весь мир сразу.",
  },
  finalQ: {
    en: "Who is the Michael Jackson of YOUR generation?",
    ru: "Кто Майкл Джексон ТВОЕГО поколения?",
  },
  comments: { en: "Tell us in the comments", ru: "Напиши в комментариях" },
  credits: {
    en: "Original music and illustrations. No Michael Jackson recordings or images were used.",
    ru: "Оригинальная музыка и иллюстрации. Записи и изображения Майкла Джексона не использовались.",
  },
} satisfies Record<string, Line>;

export type CaptionKey = keyof typeof CAPTIONS;

// Scene 4: a fast montage of names — no single answer.
export const STAR_NAMES = [
  "Taylor Swift",
  "Bad Bunny",
  "BTS",
  "Billie Eilish",
  "Drake",
  "The Weeknd",
  "Olivia Rodrigo",
  "SZA",
  "Dua Lipa",
  "Kendrick Lamar",
  "Doja Cat",
  "Peso Pluma",
  "Nippa",
  "Sabrina Carpenter",
  "Stray Kids",
  "Central Cee",
];
