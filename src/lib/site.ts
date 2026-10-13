import type { L } from "@/i18n/config";

// Store details shown in the footer, help page, emails and payment pages.
// Contact details are from crestartrading.com; confirm the hours and the
// Arabic name with the owner before launch.
export const site = {
  name: "Crestar Trading",
  nameAr: "كريستار للتجارة",
  legalName: "Crestar Trading LLC",
  email: "hello@crestartrading.com",
  phoneDisplay: "+974 7023 0245",
  phoneHref: "tel:+97470230245",
  whatsappHref: "https://wa.me/97470230245",
  website: "https://www.crestartrading.com",
  // Leave empty to hide the link.
  instagramHref: "",
  address: {
    en: "West Bay, Doha, Qatar",
    ar: "الخليج الغربي، الدوحة، قطر",
  } satisfies L,
  hours: {
    en: "Saturday – Thursday, 9am – 9pm",
    ar: "السبت – الخميس، 9 صباحًا – 9 مساءً",
  } satisfies L,
};
