import React from 'react';
import { db } from '@/lib/db';
import { articles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ArticleForm } from '@/components/admin/ArticleForm';
import { updateArticle } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const article = await db.query.articles.findFirst({
    where: eq(articles.id, params.id),
  });

  if (!article) {
    notFound();
  }

  // Wrap the submit to include the ID
  const handleSubmit = async (data: any) => {
    'use server';
    await updateArticle(params.id, data);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">სტატიის რედაქტირება</h1>
        <p className="text-gray-500">შეცვალეთ არსებული სტატიის შინაარსი</p>
      </div>

      <ArticleForm initialData={article} onSubmit={handleSubmit} />
    </div>
  );
}
