export type ImageCategory =
  | 'logo'
  | 'team'
  | 'werkstatt'
  | 'projekte'
  | 'ausbildung';

export interface ImageAsset {
  src: string;
  alt: string;
  title: string;
  width: number;
  height: number;
  category: ImageCategory;
}

export const BRAND_IMAGES: ImageAsset[] = [
  {
    src: '/images/bad-energie-lahn-dill-logo-transparent.webp',
    alt: 'Bad und Energie GmbH Lahn Dill offizielles Logo',
    title: 'Bad und Energie GmbH Lahn Dill Meisterbetrieb Wetzlar',
    width: 320,
    height: 80,
    category: 'logo',
  },
  {
    src: '/images/bad-energie-lahn-dill-logo-white-transparent.webp',
    alt: 'Bad und Energie GmbH Lahn Dill Logo helle Version',
    title: 'Bad und Energie Logo für dunkle und kontrastreiche Hintergründe',
    width: 320,
    height: 80,
    category: 'logo',
  },
];
