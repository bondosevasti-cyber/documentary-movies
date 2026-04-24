import React from 'react';
import { db } from '@/lib/db';
import { articles } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminArticlesPage() {
  const allArticles = await db.select().from(articles).orderBy(desc(articles.createdAt));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">სტატიების მართვა</h1>
          <p className="text-gray-500">შექმენით, შეცვალეთ ან წაშალეთ სტატიები</p>
        </div>
        <Link 
          href="/admin/articles/new" 
          className="bg-accent text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-accent-hover transition-colors shadow-lg"
        >
          <Plus size={20} />
          ახალი სტატია
        </Link>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-[#1a1a1a] text-gray-400 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">სურათი</th>
              <th className="px-6 py-4">სათაური</th>
              <th className="px-6 py-4">კატეგორია</th>
              <th className="px-6 py-4">სტატუსი</th>
              <th className="px-6 py-4 text-right">მოქმედება</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {allArticles.map((article) => (
              <tr key={article.id} className="hover:bg-[#1a1a1a] transition-colors group">
                <td className="px-6 py-4">
                  <div className="w-16 aspect-video bg-[#222] rounded overflow-hidden">
                    {article.thumbnailUrl && (
                      <img src={article.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium">{article.title}</div>
                  <div className="text-xs text-gray-500">/{article.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-[#222] px-2 py-0.5 rounded text-[10px]">{article.category}</span>
                </td>
                <td className="px-6 py-4">
                  {article.isPublished ? (
                    <span className="text-green-500 text-xs flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      გამოქვეყნებულია
                    </span>
                  ) : (
                    <span className="text-gray-500 text-xs flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                      დრაფტი
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 text-gray-400">
                    <Link href={`/articles/${article.slug}`} target="_blank" className="hover:text-white p-1">
                      <Eye size={18} />
                    </Link>
                    <Link href={`/admin/articles/${article.id}/edit`} className="hover:text-accent p-1">
                      <Edit size={18} />
                    </Link>
                    <button className="hover:text-red-500 p-1">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {allArticles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  სტატიები ვერ მოიძებნა.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
