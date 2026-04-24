import React from 'react';
import { ArticleForm } from '@/components/admin/ArticleForm';
import { createArticle } from '@/lib/actions';

export default function NewArticlePage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">ახალი სტატია</h1>
        <p className="text-gray-500">შექმენით ახალი შინაარსი თქვენი პლატფორმისთვის</p>
      </div>

      <ArticleForm onSubmit={createArticle} />
    </div>
  );
}
