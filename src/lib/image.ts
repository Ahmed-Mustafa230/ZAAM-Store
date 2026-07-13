export interface ImageAsset {
  public_id: string;
  url: string;
  secure_url: string;
  is_primary: boolean;
}

export function getPrimaryImage(images?: (ImageAsset | string)[]): string {
  if (!images || images.length === 0) return '';
  const primary = images.find(img => typeof img !== 'string' && img.is_primary);
  if (primary && typeof primary !== 'string') return primary.secure_url || primary.url;
  const first = images[0];
  if (typeof first === 'string') return first;
  return first.secure_url || first.url;
}

export function getImageUrl(img: ImageAsset | string): string {
  if (typeof img === 'string') return img;
  return img.secure_url || img.url;
}

export function getAllImageUrls(images?: (ImageAsset | string)[]): string[] {
  if (!images || images.length === 0) return [];
  return images.map(img => getImageUrl(img));
}

export function sanitizeImages(images: unknown): ImageAsset[] {
  if (!Array.isArray(images) || images.length === 0) return [];

  return images.map((img, index) => {
    if (img && typeof img === 'object' && 'public_id' in img) {
      return img as ImageAsset;
    }
    const url = typeof img === 'string' ? img : '';
    const publicId = url ? `legacy_${index}_${Date.now()}` : '';
    return {
      public_id: publicId,
      url,
      secure_url: url,
      is_primary: index === 0,
    };
  });
}
