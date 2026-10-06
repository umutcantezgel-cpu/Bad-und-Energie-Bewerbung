import Image from 'next/image';
import type { ImageAsset } from '@/lib/data/imageAssets';

interface SeoHeroImageProps {
  image: ImageAsset;
  altOverride?: string;
  className?: string;
  sizes?: string;
}

export function SeoHeroImage({
  image,
  altOverride,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px',
}: SeoHeroImageProps) {
  return (
    <Image
      src={image.src}
      alt={altOverride || image.alt}
      title={image.title}
      width={image.width}
      height={image.height}
      priority={true}
      loading="eager"
      sizes={sizes}
      className={`object-cover ${className}`}
      quality={85}
    />
  );
}

interface SeoContentImageProps {
  image: ImageAsset;
  cityName?: string;
  altOverride?: string;
  className?: string;
  sizes?: string;
  quality?: number;
}

export function SeoContentImage({
  image,
  cityName,
  altOverride,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px',
  quality = 80,
}: SeoContentImageProps) {
  const dynamicAlt = altOverride
    ? altOverride
    : cityName
      ? `${image.alt} in ${cityName}`
      : image.alt;

  return (
    <Image
      src={image.src}
      alt={dynamicAlt}
      title={image.title}
      width={image.width}
      height={image.height}
      loading="lazy"
      sizes={sizes}
      className={`object-cover ${className}`}
      quality={quality}
    />
  );
}
