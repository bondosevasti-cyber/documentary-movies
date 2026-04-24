import React from 'react';
import { db } from '@/lib/db';
import { articles } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { ArticlesGrid } from '@/components/ArticlesDisplay';

export const revalidate = 3600; // Revalidate every hour

export default async function ArticlesPage() {
  const allArticles = await db.select().from(articles).where(eq(articles.isPublished, true)).orderBy(desc(articles.createdAt));

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">სტატიები</h1>
          <p className="text-gray-400 max-w-2xl">
            გაეცანით საინტერესო სტატიებს ფილმების, ვიდეოებისა და კინოს სამყაროს შესახებ.
          </p>
        </div>
        <div className="bg-accent/10 border border-accent/20 px-4 py-2 rounded-full text-accent text-sm font-medium">
          სულ {allArticles.length} სტატია
        </div>
      </div>

      {allArticles.length > 0 ? (
        <ArticlesGrid articles={allArticles} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <p className="text-xl">სტატიები ჯერ არ მოიძებნა</p>
        </div>
      )}
    </div>
  );
}
