export function resolveBomItem(itemNumber?: string) {
  const raw = (itemNumber ?? "").trim().toUpperCase();

  let bomItem = raw;

  // Strip trailing -PR
  if (bomItem.endsWith("-PR")) {
    bomItem = bomItem.slice(0, -3);
  }

  // Strip trailing -FRC
  if (bomItem.endsWith("-FRC")) {
    bomItem = bomItem.slice(0, -4);
  }

  // Strip leading FRC-
  if (bomItem.startsWith("FRC-")) {
    bomItem = bomItem.slice(4);
  }

  // Clean up accidental double dashes / leftover dashes
  bomItem = bomItem.replace(/--+/g, "-").replace(/^-+|-+$/g, "");

  return {
    originalItem: raw,
    bomItem,
    isPrVariant: raw.endsWith("-PR"),
    hadFrc: raw.includes("FRC"),
  };
}