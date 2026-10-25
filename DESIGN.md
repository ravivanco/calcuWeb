# Diseño DECOKASA

La interfaz es una herramienta comercial de uso repetido. Prioriza elegir, medir y cotizar sobre publicidad o decoración.

## Dirección aplicada
Catálogo compacto de muestras con selección negra y amarilla. Una familia por control visual; presentaciones en tarjetas pequeñas con formato, cobertura y uso. La cotización permanece a la derecha y puede leerse sin abrir ventanas. La lista acumulada se abre desde el área de cotización, nunca desde un recuadro en cabecera.

## Composiciones consideradas
A: catálogo visual, formulario continuo y cotización lateral. Elegida porque permite reconocer materiales y comparar el resultado mientras se ingresa información.
B: lista de materiales en una tabla densa con editor debajo. Descartada porque reduce demasiado las miniaturas y obliga a desplazarse entre selección y medidas en teléfono.
21st no está instalado ni conectado; no se ejecutó generación externa.

## Tokens
Colores, espaciados, radios, tipografía, estados y tiempos se registran en design-tokens.json y src/styles/tokens.css. Un solo sans, números tabulares, texto secundario de contraste comprobable. Controles táctiles de 44 px o más. Capas elevadas solo para selección buscable y ventanas de cotización.

## Movimiento
Transiciones CSS de 120–200 ms para selección y apertura de detalles. Confirmación de guardado de 180 ms. Sin animar cantidades o campos al escribir. Foco de teclado y movimiento reducido mantienen respuesta inmediata.

## Recursos
public/images/materiales-ilustrativos.png es un atlas generado con imagegen incorporado. Miniaturas genéricas de nueve familias, sin textos, medidas, marcas ni personas. Cada uso está marcado como ilustrativo. Prompt: cuadrícula 3 por 3 de muestras genéricas de PVC marmoleado, WPC, WPET, autoadhesivo, geométrico, piedra, piso, siding y cielo raso, sobre fondo claro sin etiquetas ni marcas.

## Aplicación de skills
- frontend-design: composición de catálogo, blanco/negro/amarillo, muestras y tipografía funcional.
- ui-ux-pro-max: cinco pasos, formularios por superficie y jerarquía de compra.
- design-system: tokens JSON/CSS y muestra interactiva en design-preview.html.
- impeccable: eliminación de publicidad y campos redundantes, revisión acotada escritorio/móvil. Detector ejecutado una vez; advertencia sobre el borde de cabecera impresa corregida.
- emil-design-eng: foco visible, selección inequívoca, confirmación de guardado y edición decimal sin saltos del cursor.
- accessibility: combobox Base UI, controles nativos, etiquetas, errores y avisos de estado; auditorías axe y navegación por teclado.
- mobile-native: controles de 44 px, entradas de 16 px, viewport con áreas seguras y resumen sin obstruir campos. Revisión en emulación; sin afirmar validación en un dispositivo físico.
- animate: transiciones CSS de 160 ms, apertura de selector/detalles y confirmación, sin animación de cifras. Movimiento reducido y foco por teclado sin animación de detalles.
- imagegen: un atlas de nueve familias genéricas, marcado “Imágenes ilustrativas”, sin acabados ni marcas oficiales inventados.
- 21st-ai: CLI y conexión no disponibles; no se generaron propuestas con ese servicio. Se continuó con la composición de catálogo documentada.

Se conservó el catálogo técnico sin cambiar medidas, cobertura ni rendimientos. Los precios no vienen precargados. En móvil se descartó la barra fija tras revisar las capturas porque tapaba parte del formulario; el enlace “Cotización” de la navegación lleva al resumen inferior.
