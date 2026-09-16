import { MushafLayout } from './types';

export interface SurahBoundary {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  startPage: number;
  endPage: number;
}

export interface JuzBoundary {
  juzNumber: number;
  startPage: number;
  endPage: number;
}

// 1. Madinah 604 Pages Surah Boundaries
export const SURAHS_604: SurahBoundary[] = [
  { number: 1, nameArabic: "الفاتحة", nameEnglish: "Al-Fātiḥah", startPage: 1, endPage: 1 },
  { number: 2, nameArabic: "البقرة", nameEnglish: "Al-Baqarah", startPage: 2, endPage: 49 },
  { number: 3, nameArabic: "آل عمران", nameEnglish: "Āl ʿImrān", startPage: 50, endPage: 76 },
  { number: 4, nameArabic: "النساء", nameEnglish: "An-Nisāʾ", startPage: 77, endPage: 106 },
  { number: 5, nameArabic: "المائدة", nameEnglish: "Al-Māʾidah", startPage: 106, endPage: 127 },
  { number: 6, nameArabic: "الأنعام", nameEnglish: "Al-Anʿām", startPage: 128, endPage: 150 },
  { number: 7, nameArabic: "الأعراف", nameEnglish: "Al-Aʿrāf", startPage: 151, endPage: 176 },
  { number: 8, nameArabic: "الأنفال", nameEnglish: "Al-Anfāl", startPage: 177, endPage: 186 },
  { number: 9, nameArabic: "التوبة", nameEnglish: "At-Tawbah", startPage: 187, endPage: 207 },
  { number: 10, nameArabic: "يونس", nameEnglish: "Yūnus", startPage: 208, endPage: 221 },
  { number: 11, nameArabic: "هود", nameEnglish: "Hūd", startPage: 221, endPage: 235 },
  { number: 12, nameArabic: "يوسف", nameEnglish: "Yūsuf", startPage: 235, endPage: 248 },
  { number: 13, nameArabic: "الرعد", nameEnglish: "Ar-Raʿd", startPage: 249, endPage: 255 },
  { number: 14, nameArabic: "إبراهيم", nameEnglish: "Ibrāhīm", startPage: 255, endPage: 261 },
  { number: 15, nameArabic: "الحجر", nameEnglish: "Al-Ḥijr", startPage: 262, endPage: 267 },
  { number: 16, nameArabic: "النحل", nameEnglish: "An-Naḥl", startPage: 267, endPage: 281 },
  { number: 17, nameArabic: "الإسراء", nameEnglish: "Al-Isrāʾ", startPage: 282, endPage: 293 },
  { number: 18, nameArabic: "الكهف", nameEnglish: "Al-Kahf", startPage: 293, endPage: 304 },
  { number: 19, nameArabic: "مريم", nameEnglish: "Maryam", startPage: 305, endPage: 312 },
  { number: 20, nameArabic: "طه", nameEnglish: "Ṭā-Hā", startPage: 312, endPage: 321 },
  { number: 21, nameArabic: "الأنبياء", nameEnglish: "Al-Anbiyāʾ", startPage: 322, endPage: 331 },
  { number: 22, nameArabic: "الحج", nameEnglish: "Al-Ḥajj", startPage: 332, endPage: 341 },
  { number: 23, nameArabic: "المؤمنون", nameEnglish: "Al-Muʾminūn", startPage: 342, endPage: 349 },
  { number: 24, nameArabic: "النور", nameEnglish: "An-Nūr", startPage: 350, endPage: 359 },
  { number: 25, nameArabic: "الفرقان", nameEnglish: "Al-Furqān", startPage: 359, endPage: 366 },
  { number: 26, nameArabic: "الشعراء", nameEnglish: "Ash-Shuʿarāʾ", startPage: 367, endPage: 376 },
  { number: 27, nameArabic: "النمل", nameEnglish: "An-Naml", startPage: 377, endPage: 385 },
  { number: 28, nameArabic: "القصص", nameEnglish: "Al-Qaṣaṣ", startPage: 385, endPage: 396 },
  { number: 29, nameArabic: "العنكبوت", nameEnglish: "Al-ʿAnkabūt", startPage: 396, endPage: 404 },
  { number: 30, nameArabic: "الروم", nameEnglish: "Ar-Rūm", startPage: 404, endPage: 410 },
  { number: 31, nameArabic: "لقمان", nameEnglish: "Luqmān", startPage: 411, endPage: 414 },
  { number: 32, nameArabic: "السجدة", nameEnglish: "As-Sajdah", startPage: 415, endPage: 417 },
  { number: 33, nameArabic: "الأحزاب", nameEnglish: "Al-Aḥzāb", startPage: 418, endPage: 427 },
  { number: 34, nameArabic: "سبأ", nameEnglish: "Sabaʾ", startPage: 428, endPage: 434 },
  { number: 35, nameArabic: "فاطر", nameEnglish: "Fāṭir", startPage: 434, endPage: 440 },
  { number: 36, nameArabic: "يس", nameEnglish: "Yā-Sīn", startPage: 440, endPage: 445 },
  { number: 37, nameArabic: "الصافات", nameEnglish: "Aṣ-Ṣāffāt", startPage: 446, endPage: 452 },
  { number: 38, nameArabic: "ص", nameEnglish: "Ṣād", startPage: 453, endPage: 458 },
  { number: 39, nameArabic: "الزمر", nameEnglish: "Az-Zumar", startPage: 458, endPage: 467 },
  { number: 40, nameArabic: "غافر", nameEnglish: "Ghāfir", startPage: 467, endPage: 476 },
  { number: 41, nameArabic: "فصلت", nameEnglish: "Fuṣṣilat", startPage: 477, endPage: 482 },
  { number: 42, nameArabic: "الشورى", nameEnglish: "Ash-Shūrā", startPage: 483, endPage: 489 },
  { number: 43, nameArabic: "الزخرف", nameEnglish: "Az-Zukhruf", startPage: 489, endPage: 495 },
  { number: 44, nameArabic: "الدخان", nameEnglish: "Ad-Dukhān", startPage: 496, endPage: 498 },
  { number: 45, nameArabic: "الجاثية", nameEnglish: "Al-Jāthiyah", startPage: 499, endPage: 502 },
  { number: 46, nameArabic: "الأحقاف", nameEnglish: "Al-Aḥqāf", startPage: 502, endPage: 506 },
  { number: 47, nameArabic: "محمد", nameEnglish: "Muḥammad", startPage: 507, endPage: 510 },
  { number: 48, nameArabic: "الفتح", nameEnglish: "Al-Fatḥ", startPage: 511, endPage: 515 },
  { number: 49, nameArabic: "الحجرات", nameEnglish: "Al-Ḥujurāt", startPage: 515, endPage: 517 },
  { number: 50, nameArabic: "ق", nameEnglish: "Qāf", startPage: 518, endPage: 520 },
  { number: 51, nameArabic: "الذاريات", nameEnglish: "Adh-Dhāriyāt", startPage: 520, endPage: 523 },
  { number: 52, nameArabic: "الطور", nameEnglish: "Aṭ-Ṭūr", startPage: 523, endPage: 525 },
  { number: 53, nameArabic: "النجم", nameEnglish: "An-Najm", startPage: 526, endPage: 528 },
  { number: 54, nameArabic: "القمر", nameEnglish: "Al-Qamar", startPage: 528, endPage: 531 },
  { number: 55, nameArabic: "الرحمن", nameEnglish: "Ar-Raḥmān", startPage: 531, endPage: 534 },
  { number: 56, nameArabic: "الواقعة", nameEnglish: "Al-Wāqiʿah", startPage: 534, endPage: 537 },
  { number: 57, nameArabic: "الحديد", nameEnglish: "Al-Ḥadīd", startPage: 537, endPage: 541 },
  { number: 58, nameArabic: "المجادلة", nameEnglish: "Al-Mujādilah", startPage: 542, endPage: 545 },
  { number: 59, nameArabic: "الحشر", nameEnglish: "Al-Ḥashr", startPage: 545, endPage: 548 },
  { number: 60, nameArabic: "الممتحنة", nameEnglish: "Al-Mumtaḥanah", startPage: 549, endPage: 551 },
  { number: 61, nameArabic: "الصف", nameEnglish: "Aṣ-Ṣaff", startPage: 551, endPage: 553 },
  { number: 62, nameArabic: "الجمعة", nameEnglish: "Al-Jumuʿah", startPage: 553, endPage: 554 },
  { number: 63, nameArabic: "المنافقون", nameEnglish: "Al-Munāfiqūn", startPage: 554, endPage: 555 },
  { number: 64, nameArabic: "التغابن", nameEnglish: "At-Taghābun", startPage: 556, endPage: 557 },
  { number: 65, nameArabic: "الطلاق", nameEnglish: "Aṭ-Ṭalāq", startPage: 558, endPage: 559 },
  { number: 66, nameArabic: "التحريم", nameEnglish: "At-Taḥrīm", startPage: 560, endPage: 561 },
  { number: 67, nameArabic: "الملك", nameEnglish: "Al-Mulk", startPage: 562, endPage: 564 },
  { number: 68, nameArabic: "القلم", nameEnglish: "Al-Qalam", startPage: 564, endPage: 566 },
  { number: 69, nameArabic: "الحاقة", nameEnglish: "Al-Ḥāqqah", startPage: 566, endPage: 568 },
  { number: 70, nameArabic: "المعارج", nameEnglish: "Al-Maʿārij", startPage: 568, endPage: 570 },
  { number: 71, nameArabic: "نوح", nameEnglish: "Nūḥ", startPage: 570, endPage: 571 },
  { number: 72, nameArabic: "الجن", nameEnglish: "Al-Jinn", startPage: 572, endPage: 573 },
  { number: 73, nameArabic: "المزمل", nameEnglish: "Al-Muzzammil", startPage: 574, endPage: 575 },
  { number: 74, nameArabic: "المدثر", nameEnglish: "Al-Muddaththir", startPage: 575, endPage: 577 },
  { number: 75, nameArabic: "القيامة", nameEnglish: "Al-Qiyāmah", startPage: 577, endPage: 578 },
  { number: 76, nameArabic: "الإنسان", nameEnglish: "Al-Insān", startPage: 578, endPage: 580 },
  { number: 77, nameArabic: "المرسلات", nameEnglish: "Al-Mursalāt", startPage: 580, endPage: 581 },
  { number: 78, nameArabic: "النبأ", nameEnglish: "An-Nabaʾ", startPage: 582, endPage: 583 },
  { number: 79, nameArabic: "النازعات", nameEnglish: "An-Nāziʿāt", startPage: 583, endPage: 584 },
  { number: 80, nameArabic: "عبس", nameEnglish: "ʿAbasa", startPage: 585, endPage: 585 },
  { number: 81, nameArabic: "التكوير", nameEnglish: "At-Takwīr", startPage: 586, endPage: 586 },
  { number: 82, nameArabic: "الانفطار", nameEnglish: "Al-Infiṭār", startPage: 587, endPage: 587 },
  { number: 83, nameArabic: "المطففين", nameEnglish: "Al-Muṭaffifīn", startPage: 587, endPage: 589 },
  { number: 84, nameArabic: "الانشقاق", nameEnglish: "Al-Inshiqāq", startPage: 589, endPage: 590 },
  { number: 85, nameArabic: "البروج", nameEnglish: "Al-Burūj", startPage: 590, endPage: 590 },
  { number: 86, nameArabic: "الطارق", nameEnglish: "Aṭ-Ṭāriq", startPage: 591, endPage: 591 },
  { number: 87, nameArabic: "الأعلى", nameEnglish: "Al-Aʿlā", startPage: 591, endPage: 592 },
  { number: 88, nameArabic: "الغاشية", nameEnglish: "Al-Ghāshiyah", startPage: 592, endPage: 593 },
  { number: 89, nameArabic: "الفجر", nameEnglish: "Al-Fajr", startPage: 593, endPage: 594 },
  { number: 90, nameArabic: "البلد", nameEnglish: "Al-Balad", startPage: 594, endPage: 595 },
  { number: 91, nameArabic: "الشمس", nameEnglish: "Ash-Shams", startPage: 595, endPage: 595 },
  { number: 92, nameArabic: "الليل", nameEnglish: "Al-Layl", startPage: 595, endPage: 596 },
  { number: 93, nameArabic: "الضحى", nameEnglish: "Aḍ-Ḍuḥā", startPage: 596, endPage: 596 },
  { number: 94, nameArabic: "الشرح", nameEnglish: "Ash-Sharḥ", startPage: 596, endPage: 597 },
  { number: 95, nameArabic: "التين", nameEnglish: "At-Tīn", startPage: 597, endPage: 597 },
  { number: 96, nameArabic: "العلق", nameEnglish: "Al-ʿAlaq", startPage: 597, endPage: 598 },
  { number: 97, nameArabic: "القدر", nameEnglish: "Al-Qadr", startPage: 598, endPage: 598 },
  { number: 98, nameArabic: "البينة", nameEnglish: "Al-Bayyinah", startPage: 598, endPage: 599 },
  { number: 99, nameArabic: "الزلزلة", nameEnglish: "Az-Zalzalah", startPage: 599, endPage: 599 },
  { number: 100, nameArabic: "العاديات", nameEnglish: "Al-ʿĀdiyāt", startPage: 599, endPage: 600 },
  { number: 101, nameArabic: "القارعة", nameEnglish: "Al-Qāriʿah", startPage: 600, endPage: 600 },
  { number: 102, nameArabic: "التكاثر", nameEnglish: "At-Takāthur", startPage: 600, endPage: 600 },
  { number: 103, nameArabic: "العصر", nameEnglish: "Al-ʿAṣr", startPage: 601, endPage: 601 },
  { number: 104, nameArabic: "الهمزة", nameEnglish: "Al-Humazah", startPage: 601, endPage: 601 },
  { number: 105, nameArabic: "الفيل", nameEnglish: "Al-Fīl", startPage: 601, endPage: 601 },
  { number: 106, nameArabic: "قريش", nameEnglish: "Quraysh", startPage: 602, endPage: 602 },
  { number: 107, nameArabic: "الماعون", nameEnglish: "Al-Māʿūn", startPage: 602, endPage: 602 },
  { number: 108, nameArabic: "الكوثر", nameEnglish: "Al-Kawthar", startPage: 602, endPage: 602 },
  { number: 109, nameArabic: "الكافرون", nameEnglish: "Al-Kāfirūn", startPage: 603, endPage: 603 },
  { number: 110, nameArabic: "النصر", nameEnglish: "An-Naṣr", startPage: 603, endPage: 603 },
  { number: 111, nameArabic: "المسد", nameEnglish: "Al-Masad", startPage: 603, endPage: 603 },
  { number: 112, nameArabic: "الإخلاص", nameEnglish: "Al-Ikhlāṣ", startPage: 604, endPage: 604 },
  { number: 113, nameArabic: "الفلق", nameEnglish: "Al-Falaq", startPage: 604, endPage: 604 },
  { number: 114, nameArabic: "الناس", nameEnglish: "An-Nās", startPage: 604, endPage: 604 }
];

// Madinah 604 Juz Bounds
export const JUZ_BOUNDS_604: JuzBoundary[] = [
  { juzNumber: 1, startPage: 1, endPage: 21 },
  { juzNumber: 2, startPage: 22, endPage: 41 },
  { juzNumber: 3, startPage: 42, endPage: 61 },
  { juzNumber: 4, startPage: 62, endPage: 81 },
  { juzNumber: 5, startPage: 82, endPage: 101 },
  { juzNumber: 6, startPage: 102, endPage: 121 },
  { juzNumber: 7, startPage: 122, endPage: 141 },
  { juzNumber: 8, startPage: 142, endPage: 161 },
  { juzNumber: 9, startPage: 162, endPage: 181 },
  { juzNumber: 10, startPage: 182, endPage: 201 },
  { juzNumber: 11, startPage: 202, endPage: 221 },
  { juzNumber: 12, startPage: 222, endPage: 241 },
  { juzNumber: 13, startPage: 242, endPage: 261 },
  { juzNumber: 14, startPage: 262, endPage: 281 },
  { juzNumber: 15, startPage: 282, endPage: 301 },
  { juzNumber: 16, startPage: 302, endPage: 321 },
  { juzNumber: 17, startPage: 322, endPage: 341 },
  { juzNumber: 18, startPage: 342, endPage: 361 },
  { juzNumber: 19, startPage: 362, endPage: 381 },
  { juzNumber: 20, startPage: 382, endPage: 401 },
  { juzNumber: 21, startPage: 402, endPage: 421 },
  { juzNumber: 22, startPage: 422, endPage: 441 },
  { juzNumber: 23, startPage: 442, endPage: 461 },
  { juzNumber: 24, startPage: 462, endPage: 481 },
  { juzNumber: 25, startPage: 482, endPage: 501 },
  { juzNumber: 26, startPage: 502, endPage: 521 },
  { juzNumber: 27, startPage: 522, endPage: 541 },
  { juzNumber: 28, startPage: 542, endPage: 561 },
  { juzNumber: 29, startPage: 562, endPage: 581 },
  { juzNumber: 30, startPage: 582, endPage: 604 }
];

// Indo-Pak 848 Juz Bounds (16 Lines / South Asian standard)
export const JUZ_BOUNDS_848: JuzBoundary[] = [
  { juzNumber: 1, startPage: 1, endPage: 28 },
  { juzNumber: 2, startPage: 29, endPage: 56 },
  { juzNumber: 3, startPage: 57, endPage: 84 },
  { juzNumber: 4, startPage: 85, endPage: 112 },
  { juzNumber: 5, startPage: 113, endPage: 140 },
  { juzNumber: 6, startPage: 141, endPage: 168 },
  { juzNumber: 7, startPage: 169, endPage: 196 },
  { juzNumber: 8, startPage: 197, endPage: 224 },
  { juzNumber: 9, startPage: 225, endPage: 252 },
  { juzNumber: 10, startPage: 253, endPage: 280 },
  { juzNumber: 11, startPage: 281, endPage: 308 },
  { juzNumber: 12, startPage: 309, endPage: 336 },
  { juzNumber: 13, startPage: 337, endPage: 364 },
  { juzNumber: 14, startPage: 365, endPage: 392 },
  { juzNumber: 15, startPage: 393, endPage: 420 },
  { juzNumber: 16, startPage: 421, endPage: 448 },
  { juzNumber: 17, startPage: 449, endPage: 476 },
  { juzNumber: 18, startPage: 477, endPage: 504 },
  { juzNumber: 19, startPage: 505, endPage: 532 },
  { juzNumber: 20, startPage: 533, endPage: 560 },
  { juzNumber: 21, startPage: 561, endPage: 588 },
  { juzNumber: 22, startPage: 589, endPage: 616 },
  { juzNumber: 23, startPage: 617, endPage: 644 },
  { juzNumber: 24, startPage: 645, endPage: 672 },
  { juzNumber: 25, startPage: 673, endPage: 700 },
  { juzNumber: 26, startPage: 701, endPage: 728 },
  { juzNumber: 27, startPage: 729, endPage: 756 },
  { juzNumber: 28, startPage: 757, endPage: 784 },
  { juzNumber: 29, startPage: 785, endPage: 812 },
  { juzNumber: 30, startPage: 813, endPage: 848 }
];

// Helper Functions
export function getTotalPages(layout: MushafLayout = 'madinah_604'): number {
  return layout === 'indopak_848' ? 848 : 604;
}

export function getJuzBounds(layout: MushafLayout = 'madinah_604'): JuzBoundary[] {
  return layout === 'indopak_848' ? JUZ_BOUNDS_848 : JUZ_BOUNDS_604;
}

export function getSurahsForLayout(layout: MushafLayout = 'madinah_604'): SurahBoundary[] {
  if (layout === 'indopak_848') {
    // Proportional mapping for 848 layout
    const ratio = 848 / 604;
    return SURAHS_604.map(s => ({
      ...s,
      startPage: Math.max(1, Math.round(s.startPage * ratio)),
      endPage: Math.min(848, Math.round(s.endPage * ratio))
    }));
  }
  return SURAHS_604;
}

export function getSurahForPage(page: number, layout: MushafLayout = 'madinah_604'): SurahBoundary {
  const surahs = getSurahsForLayout(layout);
  const surah = surahs.find(s => page >= s.startPage && page <= s.endPage);
  return surah || surahs[0];
}

export function getJuzForPage(page: number, layout: MushafLayout = 'madinah_604'): number {
  const bounds = getJuzBounds(layout);
  const juz = bounds.find(j => page >= j.startPage && page <= j.endPage);
  return juz ? juz.juzNumber : 1;
}

export function getRubForPage(page: number, layout: MushafLayout = 'madinah_604'): number {
  const total = getTotalPages(layout);
  const scale = total / 240;
  return Math.min(240, Math.max(1, Math.ceil(page / scale)));
}

export interface QuranChunk {
  id: string;
  type: 'surah' | 'rub';
  title: string;
  subtitle: string;
  startPage: number;
  endPage: number;
  pages: number[];
}

export function getNaturalQuranChunks(layout: MushafLayout = 'madinah_604'): QuranChunk[] {
  const chunks: QuranChunk[] = [];
  const surahs = getSurahsForLayout(layout);
  const bounds = getJuzBounds(layout);

  surahs.forEach(s => {
    if (s.endPage - s.startPage >= 1) {
      const pageList: number[] = [];
      for (let p = s.startPage; p <= s.endPage; p++) {
        pageList.push(p);
      }
      chunks.push({
        id: `surah-${s.number}`,
        type: 'surah',
        title: `Surah ${s.nameEnglish}`,
        subtitle: `${s.nameArabic} · pp. ${s.startPage}–${s.endPage}`,
        startPage: s.startPage,
        endPage: s.endPage,
        pages: pageList
      });
    }
  });

  bounds.forEach(j => {
    let currentStart = j.startPage;
    let rubCount = 1;
    while (currentStart <= j.endPage) {
      const chunkLength = 2 + (rubCount % 2 === 0 ? 1 : 0);
      const currentEnd = Math.min(j.endPage, currentStart + chunkLength - 1);
      const pages: number[] = [];
      for (let p = currentStart; p <= currentEnd; p++) {
        pages.push(p);
      }
      const rubNumber = (j.juzNumber - 1) * 8 + rubCount;
      chunks.push({
        id: `juz-${j.juzNumber}-rub-${rubCount}`,
        type: 'rub',
        title: `Juz ${j.juzNumber} · Rubʿ ${rubCount}`,
        subtitle: `Rubʿ al-Hizb ${rubNumber} · pp. ${currentStart}–${currentEnd}`,
        startPage: currentStart,
        endPage: currentEnd,
        pages
      });
      currentStart = currentEnd + 1;
      rubCount++;
    }
  });

  return chunks;
}
