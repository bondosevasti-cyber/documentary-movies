// Reuse the legacy site's public, anonymous configuration (never server credentials).
import legacyConfig from '../../../supabase-config.js?raw';
import type { Documentary } from '../types';

export type Section = 'Movies' | 'Videos' | 'Articles';
export const sectionLabels: Record<Section, string> = { Movies: 'ფილმები', Videos: 'ვიდეოები', Articles: 'სტატიები' };
export interface CatalogItem extends Documentary {
  section: Section;
  categories: string[];
  href: string;
  topPosition?: number;
  comingSoon?: boolean;
  posterUrl?: string;
}
type Row = Record<string, unknown>;
const url = legacyConfig.match(/const SUPABASE_URL = '([^']+)'/)?.[1];
const key = legacyConfig.match(/const SUPABASE_KEY = '([^']+)'/)?.[1];

function rumbleEmbed(value: string) {
  let input = value.trim();
  if (!input) return '';
  // The old site accepted a raw Rumble ID, a normal Rumble link, an embed URL,
  // or an entire iframe tag. Preserve an existing embed URL exactly as entered.
  const iframeSource = input.match(/src=["']([^"']+)["']/i);
  if (iframeSource) input = iframeSource[1];
  if (input.includes('rumble.com/embed/')) return input.startsWith('http') ? input : `https://${input.replace(/^[/:]+/, '')}`;
  const match = input.match(/(?:rumble\.com\/v|(?:\/|^)v)([a-zA-Z0-9]+)/i);
  const id = match?.[1] || (!input.includes('://') && !input.includes('.') ? input.split('/').filter(Boolean).pop() : undefined);
  return id ? `https://rumble.com/embed/${id}/?pub=4p1avk&api=1` : input;
}

async function query(table: string, signal: AbortSignal, filter = ''): Promise<Row[]> {
  if (!url || !key) throw new Error('მონაცემთა ბაზის პარამეტრები ვერ მოიძებნა.');
  const response = await fetch(`${url}/rest/v1/${table}?select=*&order=created_at.desc${filter}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }, signal,
  });
  if (!response.ok) throw new Error('მონაცემები ვერ ჩაიტვირთა. სცადე ხელახლა.');
  return response.json();
}

export async function loadSection(section: Section, signal: AbortSignal) {
  const table = { Movies: 'movies', Videos: 'short_videos', Articles: 'articles' }[section];
  const rows = await query(table, signal, section === 'Articles' ? '&is_published=eq.true' : '');
  const items: CatalogItem[] = rows.map(row => {
    const text = (field: string) => typeof row[field] === 'string' ? row[field] as string : '';
    const categories = section === 'Movies'
      ? (text('genre') || text('category') || 'სხვა').split(/\s*[/,]\s*/).filter(Boolean)
      : [text('category') || (section === 'Videos' ? 'აგრო' : 'ზოგადი')];
    const thumbnail = text('thumbnail_url') || text('photo_url') || text('poster_url') || text('card_url') || text('cover_url');
    const page = section === 'Movies' ? 'watch_movie' : section === 'Videos' ? 'watch_video' : 'watch_article';
    const param = section === 'Articles' ? `slug=${encodeURIComponent(text('slug'))}` : `id=${encodeURIComponent(String(row.id))}`;
    return {
      id: `${section}:${row.id}`, section, categories, href: `/${page}.html?${param}`,
      topPosition: row.top_10_position == null ? undefined : Number(row.top_10_position),
      comingSoon: row.is_coming_soon === true,
      title: text('title'), category: categories.join(' / '), titleImageUrl: text('title_image_url'), hideHeroTitle: Boolean(row.hide_hero_title),
      description: text('excerpt') || text('description'), longDescription: text('description') || text('excerpt'),
      thumbnailUrl: thumbnail, posterUrl: text('poster_url') || text('card_url') || thumbnail, backdropUrl: text('cover_url') || thumbnail,
      duration: text('duration'), views: `${Number(row.views || 0).toLocaleString('ka-GE')} ნახვა`,
      rating: Number(row.rating || 0), year: Number(row.release_year || 0), quality: 'HD',
      videoUrl: section === 'Videos' ? rumbleEmbed(text('rumble_link')) : section === 'Movies' ? rumbleEmbed(text('video_id')) : '', tags: categories,
    };
  });
  let categories = [...new Set(items.flatMap(item => item.categories))];
  let categoryWarning = '';
  if (section === 'Articles') {
    try {
      const existing = await query('article_categories', signal);
      categories = [...new Set([...existing.map(row => String(row.name)), ...categories])];
    } catch (error) {
      if (signal.aborted) throw error;
      categoryWarning = 'კატეგორიების სრული სია ვერ ჩაიტვირთა; ნაჩვენებია სტატიებში არსებული კატეგორიები.';
    }
  }
  return { items, categories, categoryWarning };
}
