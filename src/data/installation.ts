import type { AccessoryRule, Product } from '../types/calculator';
export const ADHESIVE_IDS = new Set(['gorilax', 'silicona-transparente']);
export type AdhesiveRequirement = { status: 'not-required' } | { status: 'confirmed'; rule: AccessoryRule } | { status: 'pending'; rule: AccessoryRule };
export function getAdhesiveRequirement(product: Product): AdhesiveRequirement {
  const confirmed = product.accessoryRules.find(rule => ADHESIVE_IDS.has(rule.id));
  if (confirmed) return { status: 'confirmed', rule: confirmed };
  if (/gorilax/i.test(product.installation)) return { status: 'pending', rule: { id: 'gorilax', name: 'Gorilax · silicona estructural', unit: 'envase', sourceNote: product.technicalNotes.find(note => /plancha por lámina|rendimiento/i.test(note)) ?? 'La empresa debe configurar el rendimiento por presentación.' } };
  return { status: 'not-required' };
}
// Adhesive is required separately; only other compatible accessories are selectable.
export function getInstallationOptions(product: Product): AccessoryRule[] {
  const options = product.accessoryRules.filter(rule => !ADHESIVE_IDS.has(rule.id));
  const installation = product.installation.toLowerCase();
  for (const [id, name] of [['vinchas', 'Vinchas de fijación'], ['tornillos', 'Tornillos'], ['tacos', 'Tacos']] as const) {
    if (installation.includes(id) && !options.some(option => option.id === id)) options.push({ id, name, unit: 'unidad', manualQuantity: true, sourceNote: 'La empresa debe confirmar la cantidad y presentación de venta.' });
  }
  for (const name of product.complements) {
    const id = 'complemento-' + name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!options.some(option => option.id === id)) options.push({ id, name, unit: 'unidad', manualQuantity: true, sourceNote: 'Cantidad manual. Confirma presentación de venta con el instalador.' });
  }
  return options;
}
