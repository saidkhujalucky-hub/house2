export const MISSING_PHOTO = 'image-placeholder.svg';

export function propertyImages(property, baseUrl) {
  const images = Array.isArray(property.images) ? property.images : [];
  return images
    .filter(image => image && (image.propertyId == null || String(image.propertyId) === String(property.id)))
    .slice()
    .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0))
    .flatMap(image => {
      if (typeof image.url !== 'string' || !image.url.trim()) return [];
      try {
        const base = new URL(baseUrl);
        base.pathname = base.pathname.replace(/\/?$/, '/');
        const url = new URL(image.url.trim(), base);
        return ['http:', 'https:'].includes(url.protocol) ? [url.href] : [];
      } catch {
        return [];
      }
    })
    .filter((url, index, all) => all.indexOf(url) === index);
}

export function assignDemoPhotos(listings) {
  for (const listing of listings) {
    listing.photo = `listings/${String(listing.id).padStart(2, '0')}.webp`;
    listing.gallery = [listing.photo];
    if (listing.id === 4) listing.tour = 'bektemir';
  }
}

export const hasTour = listing => listing?.tour === 'bektemir' && !listing.real;
