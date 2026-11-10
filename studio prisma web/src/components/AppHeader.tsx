import { Bookmark, ChevronDown, Clapperboard, Clock, Compass, Film, House, Moon, Search, Sun, Tv, FileText, UserRound, Video } from 'lucide-react';
import type { ActiveNavTab } from '../types';

const links = [
  { id: 'Home', label: 'მთავარი', Icon: House },
  { id: 'Movies', label: 'ფილმები', Icon: Film },
  { id: 'TV Series', label: 'სერიალები', Icon: Tv },
  { id: 'Videos', label: 'ვიდეოები', Icon: Video },
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
    <>
      <header className={`os-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <button type="button" className="cinema-brand" onClick={() => onSelect('Home')} aria-label="სტუდია პრიზმა — მთავარი">
          <Clapperboard size={20} />
        </button>
        <nav aria-label="მთავარი ნავიგაცია">
          {links.map(({ id, label, Icon }) => (
            <button type="button" key={id} onClick={() => onSelect(id)} aria-current={active === id ? 'page' : undefined}>
              <Icon size={14} /><span>{label}</span>
            </button>
          ))}
          <button type="button" onClick={() => onSelect('Discover')} aria-current={active === 'Discover' ? 'page' : undefined}>
            <span>აღმოაჩინე</span><ChevronDown size={13} />
          </button>
        </nav>
        <div className="nav-tools">
          <button type="button" aria-label="ძებნა" onClick={onSearch}><Search size={17} /></button>
          <button type="button" aria-label="ფონის შეცვლა" aria-pressed={!dark} onClick={onToggleTheme}>{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
          <details className="nav-profile">
            <summary aria-label="ბიბლიოთეკა"><UserRound size={17} /></summary>
            <div className="nav-popover" onClick={event => {
              if ((event.target as Element).closest('button')) event.currentTarget.closest('details')?.removeAttribute('open');
            }}>
              <button type="button" className="nav-discover" onClick={() => onSelect('Discover')}><Compass size={15} />აღმოაჩინე</button>
              <button type="button" onClick={() => onSelect('Watchlist')}><Bookmark size={15} />შენახული</button>
              <button type="button" onClick={() => onSelect('History')}><Clock size={15} />ისტორია</button>
            </div>
          </details>
        </div>
      </header>
      <nav className="os-mobile-nav" aria-label="მობილური ნავიგაცია">
        {links.map(({ id, label, Icon }) => (
          <button type="button" key={id} onClick={() => onSelect(id)} aria-label={label} aria-current={active === id ? 'page' : undefined}><Icon size={17} /></button>
        ))}
        <button type="button" onClick={onSearch} aria-label="ძებნა"><Search size={17} /></button>
        <button type="button" onClick={() => onSelect('Discover')} aria-label="აღმოაჩინე" aria-current={active === 'Discover' ? 'page' : undefined}><Compass size={17} /></button>
      </nav>
    </>
  );
}
