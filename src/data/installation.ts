import type { AccessoryRule, Product } from '../types/calculator';

// The catalog defines compatibility. Missing yields always require a manual quantity.
export function getInstallationOptions(product: Product): AccessoryRule[] {
  const options = [...product.accessoryRules];
  const installation = product.installation.toLowerCase();
  const pending: [string, string, string, string][] = [
    ['gorilax', 'Gorilax · silicona estructural', 'envase', 'gorilax'],
    ['vinchas', 'Vinchas de fijación', 'unidad', 'vinchas'],
    ['tornillos', 'Tornillos para vinchas', 'unidad', 'tornillos'],
    ['tacos', 'Tacos para vinchas', 'unidad', 'tacos'],
  ];
  for (const [id, name, unit, word] of pending) {
    if (installation.includes(word) && !options.some(o => o.id === id)) {
      options.push({ id, name: id === 'tornillos' ? 'Tornillos' : id === 'tacos' ? 'Tacos' : name, unit, manualQuantity: true, sourceNote: 'Cantidad de instalación por confirmar; se ingresa manualmente.' });
    }
  }
  for (const name of product.complements) {
    const id = 'complemento-' + name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    options.push({ id, name, unit: 'unidad', manualQuantity: true, sourceNote: 'Recomendación del catálogo. Confirma presentación y cantidad con el instalador.' });
  }
  return options;
}
