import { Wrench } from 'lucide-react';
import type { Product, CalculationResult, PriceList, ProjectInput } from '../types/calculator';
import { ceilQuantity, formatNumber, unitLabel } from '../utils/calculator';
import { getInstallationOptions } from '../data/installation';

export function InstallationOptions({ product, input, onChangeInput, result, prices, onPrice }: {
  product: Product; input: ProjectInput; onChangeInput: (input: ProjectInput) => void;
  result: CalculationResult; prices: PriceList; onPrice: (id: string, value: string) => void;
}) {
  const options = getInstallationOptions(product);
  const selection: NonNullable<ProjectInput['accessorySelection']> = input.accessorySelection ?? product.accessoryRules.map(o => ({ id: o.id }));
  return <section className="workspace-section installation-options" aria-labelledby="installation-title">
    <h2 id="installation-title"><Wrench size={18}/> Complementos de instalación</h2>
    <p className="installation-method">{product.installation}</p>
    {options.map(option => {
      const selected = selection.find(s => s.id === option.id);
      const exact = option.panelsPerUnit ? result.basePieces / option.panelsPerUnit : result.basePieces * (option.unitsPerPanel ?? 0);
      const quantity = option.manualQuantity ? selected?.quantity ?? 1 : ceilQuantity(exact);
      const updateQuantity = (value: string) => onChangeInput({ ...input, accessorySelection: selection.map(s => s.id === option.id ? { ...s, quantity: value === '' ? 0 : Number(value) } : s) });
      return <div className={`installation-row ${selected ? 'is-included' : ''}`} key={option.id}>
        <label className="accessory-choice"><input type="checkbox" aria-label={`Incluir ${option.name}`} checked={!!selected} onChange={e => onChangeInput({ ...input, accessorySelection: e.target.checked ? [...selection, { id: option.id, ...(option.manualQuantity ? { quantity: 1 } : {}) }] : selection.filter(s => s.id !== option.id) })}/>
          <span><strong>{option.name}</strong><small>{option.manualQuantity ? 'Cantidad manual' : option.panelsPerUnit ? `1 ${option.unit} / ${option.panelsPerUnit} paneles` : `${option.unitsPerPanel} ${unitLabel(option.unit, option.unitsPerPanel!)} / panel`}{option.available === false && ' · Fuera del local'}</small></span>
        </label>
        {selected && <div className="accessory-fields">{option.manualQuantity ? <label>Cantidad ({unitLabel(option.unit, 2)})<input aria-label={`Cantidad de ${option.name}`} type="number" inputMode="numeric" min="1" max="1000000" step="1" value={quantity || ''} onChange={e => updateQuantity(e.target.value)}/></label> : <span className="accessory-auto-quantity">{result.basePieces > 0 ? `${formatNumber(quantity)} ${unitLabel(option.unit, quantity)}` : 'Según medidas'}</span>}
          {option.available !== false && <label>USD / {option.unit}<input aria-label={`Precio de ${option.name}`} type="number" inputMode="decimal" min="0" max="1000000" step="0.01" placeholder="Por cotizar" value={prices[option.id] ?? ''} onChange={e => onPrice(option.id, e.target.value)}/></label>}
        </div>}
      </div>;
    })}
    {!options.length && <p className="small-note">Sin complementos indicados para este material.</p>}
    <p className="small-note installation-hint">Marca lo que necesitas. Confirma las cantidades manuales con tu instalador.</p>
    <details className="installation-details"><summary>Ficha de instalación</summary>
      {product.technicalNotes.map((note, i) => <p key={i}>{note}</p>)}
      <a href="/documentos/Manual_Tecnico_Comercial_DECOKASA.pdf" target="_blank" rel="noreferrer">Consultar manual técnico</a>
    </details>
  </section>;
}
