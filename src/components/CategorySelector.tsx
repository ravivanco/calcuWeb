import { CATEGORIES } from '../data/categories';
import { Layers, AlignVerticalJustifyCenter, Diamond, Grid2X2, Sun, Mountain } from 'lucide-react';
import type { FamilyId } from '../types/calculator';
const icons = { layers: Layers, slats: AlignVerticalJustifyCenter, diamond: Diamond, grid: Grid2X2, sun: Sun, stone: Mountain };
export function CategorySelector({ selected, onSelect }: { selected: FamilyId | 'all'; onSelect: (id: FamilyId | 'all') => void }) {
  return <div className="category-list" aria-label="Familias de materiales"><button className={selected === 'all' ? 'selected' : ''} onClick={() => onSelect('all')} aria-pressed={selected === 'all'}>Todos</button>{CATEGORIES.map(cat => { const Icon = icons[cat.icon as keyof typeof icons]; return <button key={cat.id} className={selected === cat.id ? 'selected' : ''} aria-pressed={selected === cat.id} onClick={() => onSelect(cat.id)}><Icon size={16}/>{cat.name}</button>; })}</div>;
}
