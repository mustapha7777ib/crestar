import type { L } from "@/i18n/config";

// Where each product comes from, for the "Kano → Doha · 4,600 km" journey line.
// Coordinates are town centres (state capitals where the origin is a state).

export type Town = { name: L; country: L; lat: number; lng: number };

const NG: L = { en: "Nigeria", ar: "نيجيريا" };

export const towns = {
  kano: { name: { en: "Kano", ar: "كانو" }, country: NG, lat: 12.0022, lng: 8.592 },
  nasarawa: { name: { en: "Nasarawa", ar: "ناساراوا" }, country: NG, lat: 8.4939, lng: 8.5153 },
  benue: { name: { en: "Benue", ar: "بينوي" }, country: NG, lat: 7.7337, lng: 8.5214 },
  kaduna: { name: { en: "Kaduna", ar: "كادونا" }, country: NG, lat: 10.5105, lng: 7.4165 },
  niger: { name: { en: "Niger State", ar: "ولاية النيجر" }, country: NG, lat: 9.6139, lng: 6.5569 },
  abeokuta: { name: { en: "Abeokuta", ar: "أبيوكوتا" }, country: NG, lat: 7.1475, lng: 3.3619 },
  oyo: { name: { en: "Oyo", ar: "أويو" }, country: NG, lat: 7.8526, lng: 3.931 },
  kwara: { name: { en: "Kwara", ar: "كوارا" }, country: NG, lat: 8.4966, lng: 4.5426 },
  ilorin: { name: { en: "Ilorin", ar: "إلورن" }, country: NG, lat: 8.4966, lng: 4.5426 },
  iseyin: { name: { en: "Iseyin", ar: "إسيين" }, country: NG, lat: 7.9667, lng: 3.6 },
  lagos: { name: { en: "Lagos", ar: "لاغوس" }, country: NG, lat: 6.5244, lng: 3.3792 },
  "benin-city": { name: { en: "Benin City", ar: "مدينة بنين" }, country: NG, lat: 6.335, lng: 5.6037 },
  bida: { name: { en: "Bida", ar: "بيدا" }, country: NG, lat: 9.0833, lng: 6.0167 },
  pemba: { name: { en: "Pemba", ar: "بيمبا" }, country: { en: "Zanzibar", ar: "زنجبار" }, lat: -5.2459, lng: 39.7666 },
} satisfies Record<string, Town>;

export type TownId = keyof typeof towns;

export const DOHA = { name: { en: "Doha", ar: "الدوحة" }, lat: 25.2854, lng: 51.531 };

/** Great-circle distance to Doha, rounded to the nearest 10 km. */
export function kmToDoha(town: Town): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(DOHA.lat - town.lat);
  const dLng = rad(DOHA.lng - town.lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(town.lat)) * Math.cos(rad(DOHA.lat)) * Math.sin(dLng / 2) ** 2;
  const km = 2 * 6371 * Math.asin(Math.sqrt(a));
  return Math.round(km / 10) * 10;
}

export function originLabel(town: Town): L {
  return { en: `${town.name.en}, ${town.country.en}`, ar: `${town.name.ar}، ${town.country.ar}` };
}
