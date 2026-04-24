import React from 'react';
import { db } from '@/lib/db';
import { articles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

export default async function ArticleSinglePage({ params }: { params: { slug: string } }) {
  const article = await db.query.articles.findFirst({
    where: eq(articles.slug, params.slug),
  });

  if (!article) {
    notFound();
  }

  return (
    <article className="min-h-screen bg-black text-white pt-24 pb-20 px-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <Link href="/articles" className="text-accent hover:underline mb-6 inline-block">
          ← ყველა სტატია
        </Link>
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-bold rounded-full uppercase">
            {article.category || 'Article'}
          </span>
          <span className="text-gray-500 text-sm">
            {article.createdAt ? new Date(article.createdAt).toLocaleDateString('ka-GE', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="text-xl text-gray-400 italic border-l-4 border-accent pl-6 py-2 mb-8">
            {article.excerpt}
          </p>
        )}
      </div>

      <div className="relative aspect-video mb-12 rounded-2xl overflow-hidden shadow-2xl">
        <img 
          src={article.thumbnailUrl || '/images/placeholder.webp'} 
          alt={article.title}
          className="object-cover w-full h-full"
        />
      </div>

      <div 
        className="prose prose-invert prose-red prose-lg max-w-none prose-headings:font-bold prose-a:text-accent prose-img:rounded-2xl prose-img:mx-auto prose-img:shadow-lg prose-img:w-full"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
}

// Helper Link component since we are in a server component and need to import it
import Link from 'next/link';
