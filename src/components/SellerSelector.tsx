import { Combobox } from '@base-ui/react/combobox';
import { Check, ChevronDown, UserRound, X } from 'lucide-react';
import { SELLERS, sellerById } from '../data/sellers';
import { SectionHeading } from './SectionHeading';
const names = SELLERS.map(s => s.name);
export function SellerSelector({ sellerId, onChange, error }: { sellerId: string | null; onChange: (id: string | null) => void; error: boolean }) {
  const seller = sellerById(sellerId);
  return <section className="workspace-section seller-section" aria-labelledby="seller-title" id="vendedor"><SectionHeading number="1" title="Vendedor" id="seller-title"/>
    <Combobox.Root items={names} value={seller?.name ?? null} onValueChange={name => onChange(SELLERS.find(s => s.name === name)?.id ?? null)}>
      <label htmlFor="seller-input" className="sr-only">Vendedor</label><Combobox.InputGroup className={`seller-input-group ${error ? 'has-error' : ''}`}><span className={`seller-avatar ${seller ? 'assigned' : ''}`} aria-hidden="true">{seller?.initials ?? <UserRound size={19}/>}</span><Combobox.Input id="seller-input" placeholder="Buscar y seleccionar vendedor" autoComplete="off" aria-invalid={error || undefined} aria-describedby={error ? 'seller-error' : undefined}/>{seller && <Combobox.Clear className="icon-button" aria-label="Quitar vendedor"><X size={16}/></Combobox.Clear>}<Combobox.Trigger className="icon-button" aria-label="Mostrar vendedores"><ChevronDown size={18}/></Combobox.Trigger></Combobox.InputGroup>
      <Combobox.Portal><Combobox.Positioner sideOffset={6} className="seller-positioner"><Combobox.Popup className="seller-popup"><Combobox.Empty className="seller-empty">No hay coincidencias. Busca otro nombre.</Combobox.Empty><Combobox.List className="seller-list">{(name: string) => { const item = SELLERS.find(s => s.name === name)!; return <Combobox.Item key={item.id} value={name} className="seller-option"><span className="seller-avatar" aria-hidden="true">{item.initials}</span><span>{item.name}</span><Combobox.ItemIndicator className="seller-check"><Check size={17}/></Combobox.ItemIndicator></Combobox.Item>; }}</Combobox.List></Combobox.Popup></Combobox.Positioner></Combobox.Portal>
    </Combobox.Root>{error && <p className="field-error" id="seller-error" role="alert">Selecciona un vendedor para guardar o imprimir.</p>}
  </section>;
}
