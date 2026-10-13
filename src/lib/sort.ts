// Shop sort options, shared by the shop page (server) and SortSelect (client).
export const sortKeys = ["featured", "priceAsc", "priceDesc", "name"] as const;
export type SortKey = (typeof sortKeys)[number];
