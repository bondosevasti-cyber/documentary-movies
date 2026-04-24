'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export const Header = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'ფილმები', href: '/index.html' },
    { name: 'ვიდეოები', href: '/index.html?section=videos' },
    { name: 'სტატიები', href: '/articles' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-[#222]">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img src="/images/logo/Logo.png" alt="სტუდია სენაკი" className="h-10 md:h-12 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                pathname.startsWith(link.href) && link.href !== '/'
                  ? 'text-accent'
                  : 'text-gray-400'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <button className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-accent/20">
            მხარდაჭერა
          </button>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-[#111] border-b border-[#222] p-4 flex flex-col gap-4 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="text-lg font-medium py-2 border-b border-[#222] last:border-0"
            >
              {link.name}
            </Link>
          ))}
          <button className="bg-accent text-white py-3 rounded-xl font-bold mt-2">
            მხარდაჭერა
          </button>
        </div>
      )}
    </header>
  );
};
