# Calculadora DECOKASA

Herramienta comercial en React, TypeScript y Vite, basada en las 20 presentaciones del Manual Técnico Comercial DECOKASA. Datos y cotizaciones guardados en este navegador.

## Ejecutar

Requiere Node.js 22.12 o posterior compatible con Vite 8.

```powershell
npm ci
npm run dev
```

Vite inicia en el puerto 3000 o el siguiente disponible. No se necesitan claves de servicios externos.

```powershell
npm test
npm run test:e2e
npm run build
npm run preview
```

Las pruebas de navegador usan Google Chrome instalado, sin abrir una ventana. La compilación queda en `dist/`.

## Flujo comercial

Vendedor → Material → Medidas → Instalación → Cotización.

- Selector buscable de los 15 vendedores, sin persona preseleccionada. La selección persiste y cada cálculo guardado conserva su vendedor, aunque cambie el del formulario.
- Nueve familias visuales y 20 presentaciones. Las miniaturas generadas son ilustrativas; no representan acabados oficiales ni disponibilidad.
- Ancho × alto o superficie bruta en m², varias superficies y descuento de puertas o ventanas. Esquema orientativo sin posiciones de aberturas.
- Desperdicio fijo del 10%, sobre material principal, con compra de piezas o cajas completas. Desperdicio y excedente por redondeo se muestran por separado.
- Adhesivo obligatorio para los productos que lo requieren, calculado automáticamente sobre piezas base, sin piezas de reserva. Su precio se incluye cuando está configurado.
- Complementos compatibles opcionales. Consumo automático si consta en el catálogo; cantidad manual identificada si no hay rendimiento confirmado.
- Cotización lateral fija en escritorio y debajo del formulario en móvil. El enlace de los pasos permite saltar al detalle, sin barras que cubran controles.
- Presupuesto acumulado, reutilización, CSV e impresión/PDF del cálculo actual o del presupuesto guardado.
- Precios manuales en USD. Un precio ausente significa “Por cotizar”; un cero ingresado explícitamente sí es un precio válido. Sin impuestos, flete ni mano de obra automáticos.

## Reglas y fuentes

Fuente: `documentos/Manual_Tecnico_Comercial_DECOKASA.pdf`. Catálogo: `src/data/catalog.ts`. Las medidas, coberturas y rendimientos confirmados de este archivo se conservaron. Las coberturas de cálculo usan las dimensiones exactas; las publicadas pueden estar redondeadas. Piso PVC se vende en cajas de 5 m².

`src/utils/calculator.ts` fija el 10%, calcula material e insumos, consolida y exporta. Los consumos compartidos se suman antes de redondear envases y fijaciones. `src/data/installation.ts` separa adhesivo obligatorio y complementos opcionales. No se puede sustituir un rendimiento automático desde la selección de complementos.

El rendimiento de Gorilax para PVC es ambiguo: el manual escribe «1 x plancha por lámina». La cantidad se conserva pendiente; la empresa debe confirmar el número de láminas por envase y su presentación. Esa cotización permanece incompleta aunque el material tenga precio. El silicón transparente de piedra traslúcida mantiene la condición “no disponible” del manual. No se añadieron fijaciones contradictorias al piso autoadhesivo.

La asociación de rendimientos de las páginas 3 y 4 sigue el orden de filas del catálogo existente. Los datos no definidos no se inventan; los complementos manuales requieren confirmación de presentación y consumo.

El formulario usa cálculo por área. El motor conserva el despiece de registros anteriores: orientación por rectángulo completo, sin reutilizar retazos ni descontar piezas por aberturas. En ese caso muestra los recortes del despiece separados del desperdicio y redondeo.

## Persistencia

`src/utils/storage.ts` valida y migra el espacio local. Mantiene la clave `decokasa_workspace_v2`, con esquema 3 y versión de reglas. Los cálculos anteriores se recalculan con 10% fijo y adhesivo obligatorio; el aviso pide revisar el vendedor cuando antes no existía. Los complementos compatibles se conservan. Un registro actual dañado no borra presupuestos y precios válidos.

“Nuevo cálculo” restablece material, medidas y complementos; conserva vendedor, precios y presupuesto. Vaciar el presupuesto requiere confirmación independiente.

El selector de vendedor no es autenticación. No hay servidor, cuenta compartida ni inventario conectado.

## Diseño y evidencias

- `PRODUCT.md` y `DESIGN.md`: decisiones y restricciones.
- `design-tokens.json` y `src/styles/tokens.css`: colores, espaciado e interacción.
- `design-preview.html`: muestra interactiva del sistema visual, disponible en `/design-preview.html` durante el desarrollo.
- `artifacts/capturas/`: capturas de escritorio y móvil.
- `artifacts/verificacion.md`: alcance y resultados de la revisión.

El manual Word anterior permanece en `output/docx/Manual_calculadora_DECOKASA.docx`; describe una versión previa y no se modificó en esta actualización.
