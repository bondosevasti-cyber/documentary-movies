import React from 'react';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  excerpt: string | null;
  category: string | null;
  createdAt: Date | null;
}

export const ArticleCard = ({ article }: { article: Article }) => {
  return (
    <Link href={`/articles/${article.slug}`} className="group bg-[#111] rounded-xl overflow-hidden hover:ring-2 hover:ring-accent transition-all duration-300 flex flex-col h-full shadow-lg">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={article.thumbnailUrl || '/images/placeholder.webp'} 
          alt={article.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2 px-2 py-1 bg-accent text-white text-[10px] font-bold rounded uppercase">
          {article.category || 'Article'}
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-white text-lg font-bold line-clamp-2 leading-tight mb-2 group-hover:text-accent transition-colors">
          {article.title}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-3 flex-1">
          {article.excerpt}
        </p>
        <div className="mt-4 text-[10px] text-gray-500 uppercase flex items-center justify-between">
          <span>{article.createdAt ? new Date(article.createdAt).toLocaleDateString('ka-GE') : ''}</span>
          <span className="text-accent group-hover:translate-x-1 transition-transform">დაწვრილებით →</span>
        </div>
      </div>
    </Link>
  );
};

export const ArticlesGrid = ({ articles }: { articles: Article[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};
