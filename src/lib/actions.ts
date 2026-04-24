'use server';

import { db } from '@/lib/db';
import { articles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createArticle(data: any) {
  try {
    await db.insert(articles).values({
      title: data.title,
      slug: data.slug,
      thumbnailUrl: data.thumbnailUrl,
      excerpt: data.excerpt,
      category: data.category,
      content: data.content,
      isPublished: data.isPublished,
    });
    
    revalidatePath('/articles');
    revalidatePath('/admin/articles');
  } catch (error) {
    console.error('Error creating article:', error);
    throw new Error('სტატიის შექმნა ვერ მოხერხდა');
  }
}

export async function updateArticle(id: string, data: any) {
  try {
    await db.update(articles).set({
      title: data.title,
      slug: data.slug,
      thumbnailUrl: data.thumbnailUrl,
      excerpt: data.excerpt,
      category: data.category,
      content: data.content,
      isPublished: data.isPublished,
      updated_at: new Date(),
    }).where(eq(articles.id, id));

    revalidatePath('/articles');
    revalidatePath(`/articles/${data.slug}`);
    revalidatePath('/admin/articles');
  } catch (error) {
    console.error('Error updating article:', error);
    throw new Error('სტატიის განახლება ვერ მოხერხდა');
  }
}

export async function deleteArticle(id: string) {
  try {
    await db.delete(articles).where(eq(articles.id, id));
    revalidatePath('/articles');
    revalidatePath('/admin/articles');
  } catch (error) {
    console.error('Error deleting article:', error);
    throw new Error('სტატიის წაშლა ვერ მოხერხდა');
  }
}
