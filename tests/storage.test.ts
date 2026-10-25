import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CATALOG_VERSION, getProduct } from '../src/data/catalog';
import { getDefaultInput, isProjectInput, useProjectStorage } from '../src/hooks/useProjectStorage';
import { calculateProject } from '../src/utils/calculator';

test('el guardado conserva formatos anteriores y valida campos de área directa', () => {
  const input = getDefaultInput();
  assert.equal(isProjectInput(input), true);
  const surface = input.surfaces[0]!;
  surface.measurementMode = 'area';
  assert.equal(isProjectInput(input), false);
  surface.areaM2 = 12;
  assert.equal(isProjectInput(input), true);
  surface.areaM2 = NaN;
  assert.equal(isProjectInput(input), false);
});

test('guarda la selección de complementos y rechaza selecciones con estructura inválida', () => {
  const input = getDefaultInput('pvc-prime');
  assert.deepEqual(input.accessorySelection, []);
  input.accessorySelection = [{ id: 'gorilax', quantity: 2 }];
  assert.equal(isProjectInput(JSON.parse(JSON.stringify(input))), true);
  input.accessorySelection[0]!.quantity = NaN;
  assert.equal(isProjectInput(input), false);
  assert.equal(isProjectInput({ ...input, accessorySelection: 'gorilax' }), false);
});

test('medidas actuales dañadas no eliminan presupuesto ni precios válidos', () => {
  const input = getDefaultInput('piso-pvc');
  const product = getProduct(input.productId);
  const saved = JSON.stringify({ version: CATALOG_VERSION, input: { productId: 'piso-pvc' }, items: [{ id: 'saved', createdAt: '2026-10-25', input, product, result: calculateProject(product, input) }], prices: { 'piso-pvc': 19.99 } });
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => saved } });
    let recovered: ReturnType<typeof useProjectStorage> | undefined;
    function Probe() { recovered = useProjectStorage(); return null; }
    renderToStaticMarkup(createElement(Probe));
    assert.equal(recovered!.budgetItems.length, 1);
    assert.equal(recovered!.prices['piso-pvc'], 19.99);
    assert.equal(calculateProject(getProduct(recovered!.projectInput.productId), recovered!.projectInput).isValid, true);
    assert.ok(recovered!.storageNotice);
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
