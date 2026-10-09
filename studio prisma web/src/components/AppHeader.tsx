import { Bookmark, Clock, Film, Moon, Search, Sun, Triangle, Tv, FileText } from 'lucide-react';
import type { ActiveNavTab } from '../types';

const links = [
  { id: 'Movies', label: 'ფილმები', Icon: Film },
  { id: 'Videos', label: 'ვიდეოები', Icon: Tv },
  { id: 'Articles', label: 'სტატიები', Icon: FileText },
] as const;

export function AppHeader({ active, scrolled, dark, onSelect, onSearch, onToggleTheme }: {
  active: ActiveNavTab;
  scrolled: boolean;
  dark: boolean;
  onSelect: (tab: ActiveNavTab) => void;
  onSearch: () => void;
  onToggleTheme: () => void;
}) {
  return (
    <header className={`os-nav ${scrolled ? 'is-scrolled' : ''}`}>
      <button type="button" className="cinema-brand" onClick={() => onSelect('Movies')} aria-label="სტუდია პრიზმა — მთავარი">
        <Triangle size={18} />
        <span>პრიზმა<small>STUDIO PRISMA</small></span>
      </button>
      <nav aria-label="მთავარი ნავიგაცია">
        {links.map(({ id, label, Icon }) => (
          <button type="button" key={id} onClick={() => onSelect(id)} aria-current={active === id ? 'page' : undefined}>
            <Icon size={15} />{label}
          </button>
        ))}
      </nav>
      <div className="nav-tools">
        <button type="button" aria-label="ძებნა" onClick={onSearch}><Search size={18} /></button>
        <button type="button" aria-label="შენახული" aria-pressed={active === 'Watchlist'} onClick={() => onSelect('Watchlist')}><Bookmark size={18} /></button>
        <button type="button" aria-label="ისტორია" aria-pressed={active === 'History'} onClick={() => onSelect('History')}><Clock size={18} /></button>
        <button type="button" aria-label="ფონის შეცვლა" onClick={onToggleTheme}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
      </div>
    </header>
  );
}
