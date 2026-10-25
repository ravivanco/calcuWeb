# Verificación de la calculadora DECOKASA

Fecha: 25 de octubre de 2026. Proyecto: `calcuWeb`.

## Resultado

- `npm test`: 29 pruebas aprobadas.
- `npm run test:e2e`: 6 flujos aprobados, 0 fallos y 0 reintentos.
- `npm run lint`: TypeScript sin errores.
- `npm run build`: compilación de producción correcta en `dist/`.
- `git diff --check`: sin problemas de espacios.

## Reglas verificadas

- Desperdicio fijo del 10%, incluso ante campos heredados con otro porcentaje.
- Coberturas geométricas de las 20 presentaciones, compra entera y excedente por redondeo independiente del desperdicio.
- Adhesivo obligatorio según presentación, sobre piezas base sin reserva; actualización al cambiar medidas y aberturas.
- PVC con rendimiento ambiguo: cantidad pendiente e importe incompleto aunque existan precios.
- Ningún adhesivo añadido a autoadhesivos o materiales con instalación mecánica.
- Complementos compatibles, seleccionables, automáticos o manuales enteros; no se suman los desmarcados.
- Consolidación de consumos exactos antes de redondear los envases compartidos.
- Precios faltantes distintos de cero; subtotal identificado si faltan datos.
- Lista exacta de 15 vendedores, sin selección inicial; persistencia y vendedor histórico independiente del formulario actual.
- Migración de cálculos anteriores a las nuevas reglas sin borrar presupuestos y precios válidos.

## Interfaz y accesibilidad

Chrome sin ventana mediante Playwright. Escritorio de 1440 × 1000 y móvil emulado de 390 × 844. Comprobación adicional de anchuras de 320 y 768 px y orientación de 844 × 390.

Las auditorías axe con etiquetas WCAG 2 A/AA, 2.1 AA y 2.2 AA no detectaron infracciones en los estados auditados de escritorio y móvil. Se comprobó navegación con teclado, foco visible, búsqueda y selección del vendedor, etiquetas, avisos de error y confirmación, botones móviles de al menos 44 px, controles numéricos con teclado decimal y movimiento reducido. No se detectó desbordamiento horizontal en las anchuras comprobadas, incluido el estado con complemento manual seleccionado.

La cotización permanece fija en escritorio. En móvil aparece debajo del formulario y se alcanza desde el enlace de navegación. La barra flotante considerada durante el diseño se retiró para que no tape controles.

La revisión es en emulación de navegador; no incluye prueba física en iPhone o Android ni una auditoría manual con lector de pantalla.

## Guardado, CSV e impresión

Se guardó un cálculo a nombre de Marlon Quishpe y se cambió el vendedor actual a Cinthya García. El presupuesto, CSV y PDF conservaron Marlon Quishpe y las cantidades originales (24 piezas y 7 envases para la superficie del escenario). La selección de complementos automáticos y manuales persistió tras recargar.

El PDF generado por Chrome tiene una página; se comprobó su texto, vendedor, adhesivo y ausencia del vendedor posterior. La versión de impresión oculta la aplicación y muestra las partidas y datos del cálculo correspondiente.

Los precios introducidos en pruebas automatizadas son datos de prueba aislados; no se incorporaron precios oficiales al catálogo ni a las capturas.

## Evidencias

- `capturas/decokasa-escritorio.png`: 1440 × 2030 px, página completa.
- `capturas/decokasa-movil.png`: 390 × 3156 px, página completa.
- `e2e-results.json`: resultado de los seis flujos finales.
- `cotizacion-verificada.pdf`: documento de comprobación de impresión.

El vendedor mostrado en las capturas se seleccionó durante la prueba; la aplicación inicia sin vendedor predeterminado.

## Datos pendientes y herramientas

La empresa debe confirmar la presentación y el rendimiento de Gorilax para las láminas PVC: el manual indica «1 x plancha por lámina», expresión insuficiente para calcular envases. Se muestra “Adhesivo por confirmar” y nunca un presupuesto completo para esas presentaciones.

Se conservaron las medidas, coberturas y rendimientos de `src/data/catalog.ts` sin modificarlos. Los datos sin rendimiento confirmado permanecen identificados como manuales o pendientes. La condición del silicón transparente sigue la fuente técnica, sin conexión a inventario en tiempo real.

Se leyeron y aplicaron frontend-design, ui-ux-pro-max, design-system, impeccable, emil-design-eng, accessibility, mobile-native, animate e imagegen. El CLI y la conexión de 21st-ai no estaban disponibles; no se usó ese servicio. Las decisiones y alternativas de composición están documentadas en `DESIGN.md`.
