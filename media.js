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

// Bektemir konsept uyining xona rasmlari (assets/residence/gallery) boshqa namunaviy e’lonlarda ham ko‘rsatiladi.
const ROOM_LABELS = {
  living: 'Mehmonxona', kitchen: 'Oshxona', bed1: '1-qavat yotoqxona',
  bed2: '2-qavat yotoqxona', bath: 'Hammom', pool: 'Basseyn',
};

function roomViewsFor(listing) {
  const category = listing.category;
  if (category === 'Yer uchastkalari') return [];
  if (category === 'Tijorat obyektlari') return ['living', 'kitchen', 'bath'];
  if (category === 'Kvartiralar') return Number(listing.rooms) > 1 ? ['living', 'kitchen', 'bed1', 'bath'] : ['living', 'kitchen', 'bath'];
  if (category === 'Villalar') return ['living', 'kitchen', 'bed1', 'bed2', 'bath', 'pool'];
  return ['living', 'kitchen', 'bed1', 'bed2', 'bath'];
}

export function assignDemoPhotos(listings) {
  for (const listing of listings) {
    listing.photo = `listings/${String(listing.id).padStart(2, '0')}.webp`;
    const rooms = roomViewsFor(listing);
    listing.gallery = [listing.photo, ...rooms.map(view => `residence/gallery/${view}.webp`)];
    if (rooms.length) {
      listing.galleryLabels = ['Asosiy ko‘rinish', ...rooms.map(view => ROOM_LABELS[view])];
      listing.galleryNote = 'Xona rasmlari konsept 3D modeldan (namuna)';
    }
    delete listing.tour;
  }
}

export const RESIDENCE_ID = 21;
const residenceViews = [
  ['outside', 'Hovli va fasad'],
  ['pool', 'Basseyn'],
  ['living', 'Mehmonxona'],
  ['kitchen', 'Oshxona'],
  ['bed1', '1-qavat yotoqxona'],
  ['bed2', '2-qavat yotoqxona'],
  ['bath', 'Hammom'],
  ['aerial', 'Yuqoridan ko‘rinish'],
];

export function createResidenceListing() {
  const gallery = residenceViews.map(([view]) => `residence/gallery/${view}.webp`);
  return {
    id: RESIDENCE_ID,
    title: 'Basseynli ikki qavatli villa, Bektemir',
    city: 'Toshkent', district: 'Bektemir', price: 310000,
    category: 'Villalar', type: 'SALE', rooms: 4, area: 220, bathrooms: 3,
    photo: gallery[0], gallery,
    galleryLabels: residenceViews.map(([, label]) => label),
    tour: 'bektemir-residence',
    description: 'Ikki qavatli zamonaviy villa: keng vitraj oynalar, och rangli fasad, yog‘och bezaklar va shisha to‘siqli balkon. Hovlida basseyn, dam olish zonasi, pergola va avtomobil uchun yopiq joy bor. Ichkarida mehmonxona, oshxona, yotoqxonalar va hammom mavjud. Galereyadagi sakkizta tasvir aynan shu 3D modelning o‘zidan tayyorlangan. Bu sotuv taklifi emas, namunaviy e’lon.',
  };
}

export const hasTour = listing => listing?.id === RESIDENCE_ID && listing.tour === 'bektemir-residence' && !listing.real;

export function galleryViews(listing) {
  const photos = Array.isArray(listing.gallery) ? listing.gallery : [];
  if (photos.length === 1 && !listing.real) {
    return [
      { file: photos[0], label: 'Umumiy ko‘rinish', zoom: 1, origin: '50% 50%' },
      { file: photos[0], label: 'Yaqin ko‘rinish', zoom: 1.4, origin: '25% 50%' },
      { file: photos[0], label: 'Detallar', zoom: 1.8, origin: '75% 50%' },
    ];
  }
  return photos.map((file, index) => ({
    file, label: listing.galleryLabels?.[index] || `${index + 1}-rasm`, zoom: 1, origin: '50% 50%',
  }));
}
