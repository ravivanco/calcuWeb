import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
const summary = (page: Page) => page.getByRole('complementary', { name: 'Resumen de cotización' });
async function seller(page: Page, search = 'Marlon') { const field = page.getByRole('combobox', { name: 'Vendedor', exact: true }); await field.fill(search); await page.getByRole('option', { name: new RegExp(search) }).click(); }
async function wpc(page: Page) { await page.getByRole('button', { name: 'Paneles WPC', exact: true }).click(); }
async function noOverflow(page: Page) { expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true); }
test('vendedor buscable, teclado y foco visible; sin predeterminado ni campos eliminados', async ({ page }) => {
  await page.goto('/'); const field = page.getByRole('combobox', { name: 'Vendedor', exact: true }); await expect(field).toHaveValue(''); await expect(page.getByRole('option')).toHaveCount(0);
  await summary(page).getByRole('button', { name: 'Añadir al presupuesto' }).click(); await expect(field).toBeFocused(); await expect(page.getByText('Selecciona un vendedor para guardar o imprimir.')).toBeVisible();
  await field.fill('Cinthya'); await field.press('ArrowDown'); await field.press('Enter'); await expect(field).toHaveValue('Cinthya García');
  await page.reload(); await expect(field).toHaveValue('Cinthya García');
  await field.focus(); await field.press('Tab'); const outline = await page.locator(':focus').evaluate(el => getComputedStyle(el).outlineStyle); expect(outline).not.toBe('none');
  for (const text of ['Calculadora de materiales','Mi presupuesto','Parámetros de cálculo','Cómo se calculó']) await expect(page.getByText(text, { exact: true })).toHaveCount(0);
  await expect(page.getByLabel(/nombre del proyecto|cliente/i)).toHaveCount(0);
});
test('adhesivo incluido, cambios de medidas y aberturas, complementos y persistencia', async ({ page }) => {
  await page.goto('/'); await seller(page); await wpc(page); await expect(summary(page).getByText('Adhesivo incluido · 7 envases')).toBeVisible(); await expect(page.getByRole('checkbox', { name: /gorilax|adhesivo/i })).toHaveCount(0);
  await page.getByLabel('Precio de Panel WPC', { exact: true }).fill('10'); await page.getByLabel('Precio de Gorilax · silicona estructural', { exact: true }).fill('6'); await expect(summary(page).locator('.estimate-total')).toHaveText(/282/);
  await page.getByRole('checkbox', { name: 'Incluir Vinchas de fijación' }).check(); await page.getByLabel('Precio de Vinchas de fijación', { exact: true }).fill('0,10'); await expect(summary(page).locator('.estimate-total')).toHaveText(/288[,.]30/);
  await page.getByRole('button', { name: 'Descontar puerta o ventana' }).click(); await expect(summary(page).getByText('Adhesivo incluido · 6 envases')).toBeVisible();
  await page.reload(); await expect(page.getByRole('checkbox', { name: 'Incluir Vinchas de fijación' })).toBeChecked(); await expect(page.getByRole('combobox', { name: 'Vendedor', exact: true })).toHaveValue('Marlon Quishpe');
  await page.getByRole('checkbox', { name: 'Incluir Vinchas de fijación' }).uncheck(); await expect(summary(page).getByText('Vinchas de fijación')).toHaveCount(0);
  await page.getByLabel('Ancho superficie 1', { exact: true }).fill('7'); await expect(summary(page).getByText('Adhesivo incluido · 13 envases')).toBeVisible();
  await expect(page.getByText('10% de desperdicio incluido', { exact: true }).first()).toBeVisible(); await expect(page.getByRole('spinbutton')).toHaveCount(0);
});
test('presupuesto conserva vendedor histórico, exportación CSV e impresión coherentes', async ({ page }) => {
  await page.addInitScript(() => { window.print = () => { document.documentElement.dataset.printRequested = 'true'; }; });
  await page.goto('/'); await seller(page); await wpc(page); await summary(page).getByRole('button', { name: 'Añadir al presupuesto' }).click(); await expect(summary(page).getByRole('button', { name: 'Añadido al presupuesto' })).toBeVisible();
  await seller(page, 'Cinthya'); await summary(page).getByRole('button', { name: /Guardados/ }).click(); const dialog = page.getByRole('dialog', { name: 'Presupuesto guardado' }); await expect(dialog).toBeVisible(); await expect(dialog.getByText('Vendedor: Marlon Quishpe', { exact: true }).first()).toBeVisible(); await expect(dialog.getByText(/Cinthya/)).toHaveCount(0);
  const downloadPromise = page.waitForEvent('download'); await dialog.getByRole('button', { name: 'Descargar CSV' }).click(); const download = await downloadPromise; const csv = await readFile((await download.path())!, 'utf8'); expect(csv).toContain('Marlon Quishpe'); expect(csv).not.toContain('Cinthya'); expect(csv).toContain('"24"'); expect(csv).toContain('"7"');
  await dialog.getByRole('button', { name: 'Imprimir o guardar PDF' }).click(); await expect(dialog).not.toBeVisible(); expect(await page.locator('html').getAttribute('data-print-requested')).toBe('true');
  await page.emulateMedia({ media: 'print' }); await expect(page.locator('.screen-app')).not.toBeVisible(); await expect(page.locator('.print-sheet')).toContainText('Vendedor: Marlon Quishpe'); await expect(page.locator('.print-sheet')).not.toContainText('Cinthya'); await expect(page.locator('.print-sheet')).toContainText('10% de desperdicio incluido'); await page.pdf({ path: 'artifacts/cotizacion-verificada.pdf', format: 'A4', printBackground: true });
  await page.emulateMedia({ media: 'screen' }); await page.reload(); await summary(page).getByRole('button', { name: /Guardados/ }).click(); await expect(dialog.getByText('Vendedor: Marlon Quishpe', { exact: true }).first()).toBeVisible();
});
test('PVC pendiente, complementos manuales y autoadhesivo sin adhesivo', async ({ page }) => {
  await page.goto('/'); await seller(page); await page.getByLabel('Precio de Lámina PVC Prime', { exact: true }).fill('10'); await expect(summary(page).getByText('Subtotal de partidas con precio')).toBeVisible(); await expect(summary(page).getByText('Adhesivo por confirmar')).toBeVisible(); await expect(page.getByText('Rendimiento sin configurar')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Incluir Perfil de acabado', exact: true }).check(); await page.getByLabel('Cantidad de Perfil de acabado', { exact: true }).fill('3'); await page.getByLabel('Precio de Perfil de acabado', { exact: true }).fill('2'); await expect(summary(page).locator('.estimate-total')).toHaveText(/46/); await expect(summary(page).getByText(/Cotización incompleta/)).toBeVisible();
  await page.reload(); await expect(page.getByRole('checkbox', { name: 'Incluir Perfil de acabado', exact: true })).toBeChecked(); await expect(page.getByLabel('Cantidad de Perfil de acabado', { exact: true })).toHaveValue('3'); await page.setViewportSize({ width: 320, height: 844 }); await noOverflow(page); await page.getByRole('button', { name: 'Autoadhesivos', exact: true }).click(); await expect(summary(page).getByText(/Adhesivo/)).toHaveCount(0); await expect(page.getByText('Autoadhesivo · sin pegamento adicional')).toBeVisible();
});
test('área directa, superficies múltiples, errores y decimales con coma', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Pisos', exact: true }).click(); await page.getByRole('button', { name: 'Superficie m²', exact: true }).click(); await page.getByLabel('Área total superficie 1', { exact: true }).fill('12,5'); await expect(summary(page).locator('.coverage-grid')).toContainText(/12[,.]5/);
  await page.getByRole('button', { name: 'Agregar superficie' }).click(); await expect(page.getByLabel('Ancho superficie 2', { exact: true })).toBeVisible(); await page.getByLabel('Ancho superficie 2', { exact: true }).fill('0'); await expect(summary(page).getByRole('button', { name: 'Añadir al presupuesto' })).toBeDisabled(); await expect(page.getByText('ingresa medidas mayores a cero.')).toBeVisible(); await page.getByLabel('Ancho superficie 2', { exact: true }).fill('3'); await expect(summary(page).getByRole('button', { name: 'Añadir al presupuesto' })).toBeEnabled();
});
test('accesibilidad, escritorio y móvil sin desbordamiento; capturas', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message)); await page.goto('/'); await seller(page); await wpc(page);
  await noOverflow(page); const desktopAudit = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze(); expect(desktopAudit.violations).toEqual([]);
  await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); window.scrollTo(0, 0); }); await page.evaluate(() => new Promise(requestAnimationFrame)); await page.screenshot({ path: 'artifacts/capturas/decokasa-escritorio.png', fullPage: true });
  const sidebar = summary(page); await page.getByRole('heading', { name: 'Instalación', exact: true }).scrollIntoViewIfNeeded(); expect((await sidebar.boundingBox())!.y).toBeGreaterThanOrEqual(12);
  await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(() => window.scrollTo(0,0)); await noOverflow(page); await expect(page.getByRole('link', { name: 'Cotización', exact: true })).toBeVisible(); await page.getByRole('combobox', { name: 'Vendedor', exact: true }).focus(); await expect(page.getByRole('combobox', { name: 'Vendedor', exact: true })).toBeFocused(); await page.getByRole('combobox', { name: 'Vendedor', exact: true }).blur();
  const targets = await page.locator('button:visible').evaluateAll(elements => elements.map(el => ({ name: el.getAttribute('aria-label') || el.textContent, width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })).filter(el => el.width < 43 || el.height < 43)); expect(targets).toEqual([]); const mobileAudit = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze(); expect(mobileAudit.violations).toEqual([]); await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); window.scrollTo(0, 0); }); await page.evaluate(() => new Promise(requestAnimationFrame)); await page.screenshot({ path: 'artifacts/capturas/decokasa-movil.png', fullPage: true });
  for (const width of [320, 768]) { await page.setViewportSize({ width, height: 844 }); await noOverflow(page); }
  await page.setViewportSize({ width: 844, height: 390 }); await noOverflow(page); await page.emulateMedia({ reducedMotion: 'reduce' }); expect(await page.locator('.product-card').first().evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s'); expect(errors).toEqual([]);
});
