import type { Lang } from './content';

export const notesUi: Record<
  Lang,
  {
    heading: string;
    title: string;
    description: string;
    sub: string;
    back: string;
    minRead: (n: number) => string;
    caseStudy: string;
    next: string;
    homeHeading: string;
    all: string;
  }
> = {
  en: {
    heading: 'Flight log',
    title: 'Flight log · Ömer Faruk Erdem',
    description: 'Technical notes on the things I built: on-device ML, validation in a Kaggle competition, and a Git-backed CMS on Cloudflare Workers.',
    sub: 'Longer notes on single problems from my projects: what went wrong, what I measured and what I would keep.',
    back: 'All log entries',
    minRead: (n) => `${n} min read`,
    caseStudy: 'The project behind this note',
    next: 'Next entry',
    homeHeading: 'From the flight log',
    all: 'All entries',
  },
  tr: {
    heading: 'Uçuş günlüğü',
    title: 'Uçuş günlüğü · Ömer Faruk Erdem',
    description: 'Yaptığım işler üzerine teknik notlar: cihaz üstü makine öğrenmesi, bir Kaggle yarışmasında doğrulama ve Cloudflare Workers üzerinde Git tabanlı bir içerik paneli.',
    sub: 'Projelerimdeki tek tek problemler üzerine uzun notlar: ne ters gitti, neyi ölçtüm, neyi korurdum.',
    back: 'Tüm günlük kayıtları',
    minRead: (n) => `${n} dk okuma`,
    caseStudy: 'Bu notun arkasındaki proje',
    next: 'Sıradaki kayıt',
    homeHeading: 'Uçuş günlüğünden',
    all: 'Tüm kayıtlar',
  },
};

/** Words per minute for a reading-time estimate; Turkish words run longer. */
export const readMinutes = (body: string, lang: Lang) =>
  Math.max(1, Math.round(body.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length / (lang === 'tr' ? 170 : 220)));

export const noteSlug = (id: string) => id.split('/').pop()!;
