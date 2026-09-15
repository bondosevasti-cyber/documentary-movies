export type CategoryType = string;

export interface Documentary {
  id: string;
  title: string;
  nativeTitle?: string;
  category: CategoryType;
  duration: string;
  views: string;
  rating: number;
  year: number;
  quality: '4K HDR' | 'HD' | 'IMAX Enhanced';
  description: string;
  longDescription: string;
  backdropUrl: string;
  thumbnailUrl: string;
  videoUrl: string;
  titleImageUrl?: string;
  hideHeroTitle?: boolean;
  narrator?: string;
  director?: string;
  progressPercentage?: number;
  isFeatured?: boolean;
  isPopular?: boolean;
  isNewRelease?: boolean;
  tags: string[];
  awards?: string[];
}

export interface CategoryItem {
  id: CategoryType;
  name: string;
  icon: string;
  count: number;
  color: string;
}

export type ActiveNavTab = 'Home' | 'Movies' | 'Videos' | 'Articles' | 'Discover' | 'Categories' | 'TV Series' | 'Watchlist' | 'History';
