import { Plus, Trash2, Ruler } from 'lucide-react';
import type { CalculationResult, Product, ProjectInput, ProjectSurface } from '../types/calculator';
import { formatNumber } from '../utils/calculator';
import { newId } from '../hooks/useProjectStorage';

export function ProjectForm({ product, input, onChangeInput, result }: { product: Product; input: ProjectInput; onChangeInput: (v: ProjectInput) => void; result: CalculationResult }) {
  const update = (id: string, changes: Partial<ProjectSurface>) => onChangeInput({ ...input, surfaces: input.surfaces.map(s => s.id === id ? { ...s, ...changes } : s) });
  const number = (v: string) => v === '' ? 0 : Number(v);
  return <section className="workspace-section measurements" aria-labelledby="measurements-title">
    <h2 id="measurements-title">Medidas de la superficie</h2>
    {input.surfaces.map((surface, index) => <div className="surface-editor" key={surface.id}>
      <div className="surface-top"><label className="surface-name-label"><Ruler size={16}/><input aria-label={`Nombre de superficie ${index + 1}`} maxLength={80} value={surface.name} onChange={e => update(surface.id, { name: e.target.value })}/></label>
        {input.surfaces.length > 1 && <button className="icon-button" aria-label={`Eliminar superficie ${index + 1}`} onClick={() => onChangeInput({ ...input, surfaces: input.surfaces.filter(s => s.id !== surface.id) })}><Trash2 size={16}/></button>}
      </div>
      <div className="measurement-tabs" role="group" aria-label={`Ingreso de medidas de superficie ${index + 1}`}>
        <button aria-pressed={surface.measurementMode !== 'area'} onClick={() => update(surface.id, { measurementMode: 'dimensions' })}>Ancho × alto</button>
        <button aria-pressed={surface.measurementMode === 'area'} onClick={() => onChangeInput({ ...input, mode: 'area', surfaces: input.surfaces.map(s => s.id === surface.id ? { ...s, measurementMode: 'area', areaM2: s.areaM2 ?? s.widthM * s.heightM } : s) })}>Área en m²</button>
      </div>
      {surface.measurementMode === 'area' ? <label className="direct-area">Superficie total (m²)<input aria-label={`Área total superficie ${index + 1}`} type="number" inputMode="decimal" min="0.01" max="1000000" step="0.01" value={surface.areaM2 || ''} placeholder="Ej. 12" onChange={e => update(surface.id, { areaM2: number(e.target.value) })}/></label>
        : <div className="dimension-inputs"><label>Ancho (m)<input aria-label={`Ancho superficie ${index + 1}`} type="number" inputMode="decimal" min="0.01" max="1000" step="0.01" value={surface.widthM || ''} onChange={e => update(surface.id, { widthM: number(e.target.value) })}/></label><span>×</span><label>{product.family === 'pisos' || product.family === 'cielos' ? 'Largo' : 'Alto'} (m)<input aria-label={`Alto superficie ${index + 1}`} type="number" inputMode="decimal" min="0.01" max="1000" step="0.01" value={surface.heightM || ''} onChange={e => update(surface.id, { heightM: number(e.target.value) })}/></label><output>{formatNumber(surface.widthM * surface.heightM)} <span>m²</span></output></div>}
      <div className="openings-section">
        {surface.openings.map((o, opIndex) => <div className="opening-row" key={o.id}>
          <label>Puerta / ventana<input aria-label={`Nombre abertura ${opIndex + 1} superficie ${index + 1}`} maxLength={40} value={o.name} onChange={e => update(surface.id, { openings: surface.openings.map(v => v.id === o.id ? { ...v, name: e.target.value } : v) })}/></label>
          {(['widthM', 'heightM', 'quantity'] as const).map(field => <label key={field}>{field === 'widthM' ? 'Ancho (m)' : field === 'heightM' ? 'Alto (m)' : 'Cantidad'}<input aria-label={`${field === 'widthM' ? 'Ancho' : field === 'heightM' ? 'Alto' : 'Cantidad'} abertura ${opIndex + 1} superficie ${index + 1}`} type="number" inputMode={field === 'quantity' ? 'numeric' : 'decimal'} min={field === 'quantity' ? 1 : 0.01} max="1000" step={field === 'quantity' ? 1 : 0.01} value={o[field] || ''} onChange={e => update(surface.id, { openings: surface.openings.map(v => v.id === o.id ? { ...v, [field]: number(e.target.value) } : v) })}/></label>)}
          <button className="icon-button" aria-label={`Eliminar abertura ${opIndex + 1} superficie ${index + 1}`} onClick={() => update(surface.id, { openings: surface.openings.filter(v => v.id !== o.id) })}><Trash2 size={16}/></button>
        </div>)}
        <button className="text-button" disabled={surface.openings.length >= 50} onClick={() => update(surface.id, { openings: [...surface.openings, { id: newId(), name: 'Puerta o ventana', widthM: .9, heightM: 2.1, quantity: 1 }] })}><Plus size={15}/> Descontar puerta o ventana</button>
      </div>
    </div>)}
    <button className="text-button add-surface" disabled={input.surfaces.length >= 50} onClick={() => onChangeInput({ ...input, surfaces: [...input.surfaces, { id: newId(), name: `Superficie ${input.surfaces.length + 1}`, widthM: 3, heightM: 2.6, orientation: 'vertical', openings: [] }] })}><Plus size={15}/> Agregar superficie</button>
    <div className="waste-control"><div><h3>Desperdicio</h3><p>Reserva para cortes y ajustes.</p></div><div className="waste-options">{[5, 10].map(n => <button key={n} aria-pressed={input.wastePercent === n} onClick={() => onChangeInput({ ...input, wastePercent: n })}>{n}%</button>)}</div></div>
    {result.errors.length > 0 && <div className="validation-errors" role="alert"><ul>{result.errors.map((e, i) => <li key={i}>{e}</li>)}</ul></div>}
  </section>;
}
