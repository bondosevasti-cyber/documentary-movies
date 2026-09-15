import React from 'react';
import { Leaf, Globe, Landmark, Atom, Users, Cpu, ChevronRight } from 'lucide-react';
import { CategoryType, CategoryItem } from '../types';

interface CategoryFilterBarProps {
  categories: CategoryItem[];
  selectedCategory: CategoryType | 'All';
  onSelectCategory: (cat: CategoryType | 'All') => void;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const getIcon = (id: CategoryType) => {
    switch (id) {
      case 'Nature':
        return <Leaf className="w-4 h-4" />;
      case 'Space':
        return <Globe className="w-4 h-4" />;
      case 'History':
        return <Landmark className="w-4 h-4" />;
      case 'Science':
        return <Atom className="w-4 h-4" />;
      case 'Society':
        return <Users className="w-4 h-4" />;
      case 'Technology':
        return <Cpu className="w-4 h-4" />;
      default:
        return <Leaf className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-center gap-3 w-full overflow-x-auto py-2 scrollbar-none no-scrollbar">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            id={`category-filter-${cat.id.toLowerCase()}`}
            onClick={() => onSelectCategory(isSelected ? 'All' : cat.id)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'glow-amber-pill bg-gradient-to-r from-orange-500/30 via-amber-500/15 to-transparent text-white'
                : 'bg-[#14161E]/80 border border-white/10 text-neutral-300 hover:text-white hover:border-orange-500/40 hover:bg-white/[0.06]'
            }`}
          >
            <span className={isSelected ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(255,107,0,0.85)]' : 'text-neutral-400'}>
              {getIcon(cat.id)}
            </span>
            <span className={isSelected ? 'font-bold' : 'font-medium'}>{cat.name}</span>
          </button>
        );
      })}

      {/* Right chevron circle button */}
      <button
        onClick={() => onSelectCategory('All')}
        className="w-10 h-10 rounded-full shrink-0 bg-[#14161E]/80 border border-white/10 hover:border-orange-500/50 hover:bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white transition-all cursor-pointer"
        title="View All / Reset Filter"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
