'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Image as ImageIcon, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';

import { RichTextEditor } from './RichTextEditor';

interface ArticleFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
}

export const ArticleForm = ({ initialData, onSubmit }: ArticleFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    thumbnailUrl: initialData?.thumbnailUrl || '',
    excerpt: initialData?.excerpt || '',
    category: initialData?.category || 'Articles',
    content: initialData?.content || '',
    isPublished: initialData?.isPublished ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('movie-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from('movie-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, thumbnailUrl: publicData.publicUrl }));
    } catch (error) {
      console.error('Upload error:', error);
      alert('ატვირთვა ვერ მოხერხდა');
    } finally {
      setIsUploading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\u10A0-\u10FF\s-]/g, '') // Keep alphanumeric (+ Georgian Unicode) and spaces/hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Remove duplicate hyphens
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => {
      const next = { ...prev, [name]: val };
      // Auto-generate slug from title ONLY if we are creating a new article and slug is not manually changed yet
      if (name === 'title' && (!initialData?.id || prev.slug === generateSlug(prev.title))) {
        next.slug = generateSlug(value);
      }
      return next;
    });
  };

  const handleContentChange = (html: string) => {
    setFormData(prev => ({ ...prev, content: html }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      router.push('/admin/articles');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('შეცდომა შენახვისას');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 animate-fade-in">
      <div className="flex-1 space-y-6">
        {/* Main Content Area */}
        <div className="bg-[#111] border border-[#222] p-6 rounded-xl shadow-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">სათაური</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 focus:border-accent outline-none text-xl font-bold transition-all"
                placeholder="სტატიის სათაური"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-1">Slug (URL-ის ნაწილი)</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 focus:border-accent outline-none text-sm font-mono transition-all"
                  placeholder="article-slug-example"
                />
              </div>
              <div className="w-full md:w-48">
                <label className="block text-sm font-medium text-gray-400 mb-1">კატეგორია</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 focus:border-accent outline-none transition-all"
                >
                  <option value="Articles">სტატიები</option>
                  <option value="Films">ფილმები</option>
                  <option value="Videos">ვიდეოები</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">მოკლე აღწერა (Excerpt)</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={2}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 focus:border-accent outline-none text-sm transition-all resize-none"
                placeholder="სტატიის მოკლე შინაარსი..."
              />
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div className="space-y-2">
          <label className="block text-sm font-bold uppercase tracking-wider text-gray-500">კონტენტი</label>
          <RichTextEditor 
            content={formData.content} 
            onChange={handleContentChange} 
          />
        </div>
      </div>

      {/* Sidebar Area */}
      <div className="w-full lg:w-80 space-y-6">
        <div className="bg-[#111] border border-[#222] p-6 rounded-xl shadow-lg sticky top-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">პარამეტრები</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase">გარეკანი (Thumbnail)</label>
              <div className="space-y-3">
                <div className="aspect-video bg-[#0a0a0a] rounded-lg overflow-hidden border border-[#333] flex items-center justify-center relative">
                  {formData.thumbnailUrl ? (
                    <img src={formData.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-gray-700" size={32} />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => document.getElementById('thumbnail-file')?.click()}
                    disabled={isUploading}
                    className="flex items-center justify-center gap-2 bg-[#222] hover:bg-[#333] text-xs py-2 rounded-lg border border-[#333] transition-all disabled:opacity-50"
                  >
                    <Upload size={14} />
                    ფაილის ატვირთვა
                  </button>
                  <input
                    type="file"
                    id="thumbnail-file"
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="relative">
                    <input
                      type="url"
                      name="thumbnailUrl"
                      value={formData.thumbnailUrl}
                      onChange={handleChange}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent outline-none"
                      placeholder="ან ჩაწერეთ URL..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                name="isPublished"
                id="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="w-5 h-5 accent-accent"
              />
              <label htmlFor="isPublished" className="text-sm font-medium cursor-pointer">
                გამოქვეყნება
              </label>
            </div>

            <hr className="border-[#222]" />

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-accent-hover transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={18} />
                    შენახვა
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full bg-[#222] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#333] transition-all"
              >
                <X size={18} />
                გაუქმება
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
