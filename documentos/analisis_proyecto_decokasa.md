# Análisis del demo de la calculadora Decokasa

Fecha: 25 de octubre de 2026.

## 1. Diagnóstico

El proyecto ofrece una base aprovechable para la calculadora: selección de categorías y productos, medidas de varias superficies, aberturas, orientación de paneles, accesorios, presupuesto acumulado e impresión. Sin embargo, todavía no representa el catálogo ni las reglas comerciales de Decokasa descritas en el manual.

La prioridad es sustituir y validar los datos y reglas de ejemplo. No hace falta rehacer toda la aplicación ni incorporar inteligencia artificial para calcular materiales.

Se identificaron **17 categorías y 34 productos, todos marcados como datos de ejemplo**. El PDF contiene **20 entradas de productos/presentaciones**. Son clasificaciones distintas; los números no indican que el catálogo del PDF esté cubierto.

Este trabajo es un análisis: no se modificaron los componentes, las fórmulas ni los datos de la aplicación.

## 2. Fuentes y alcance

- `Manual_Tecnico_Comercial_DECOKASA.pdf`: cuatro páginas revisadas por extracción de texto y visualmente. Es la referencia aportada para el catálogo, las medidas, el uso y la instalación.
- `analisis_calculadora_materiales_sicon_2026.md`: referencia funcional de otro local. Su propio alcance aclara que no verificó fórmulas, coeficientes ni exactitud de resultados. No permite trasladar reglas técnicas de SICON a Decokasa.
- Código completo de la aplicación en `src/` y archivos de configuración, dependencias y documentación de la raíz.
- Ejecución aislada del motor con los datos originales y casos de diagnóstico. No se ejecutó la interfaz en navegador.

El PDF no define una especificación completa de software: no establece precios, empaques de todos los insumos, porcentajes de desperdicio, política de cortes, impuestos ni reglas cuantitativas para todos los complementos. Las recomendaciones de este informe no deben confundirse con requisitos expresamente escritos en el manual.

## 3. Cómo está construido

| Archivo o área | Responsabilidad actual |
|---|---|
| `src/App.tsx` | Une el formulario, el cálculo en tiempo real, el presupuesto y la impresión. |
| `src/data/categories.ts` | Define seis grupos y 17 categorías. |
| `src/data/catalog.ts` | Contiene 34 productos ficticios/referenciales, precios y reglas de accesorios. |
| `src/types/calculator.ts` | Define productos, medidas, reglas, resultados y partidas de presupuesto. |
| `src/utils/calculator.ts` | Calcula por superficie, longitud, unidades o rendimiento de un envase. |
| `src/hooks/useProjectStorage.ts` | Guarda el formulario y las partidas en `localStorage`; consolida materiales. |
| `src/components/ProjectForm.tsx` | Permite ingresar superficies, aberturas, tramos, desperdicio y parámetros de montaje. |
| `src/components/ResultsSummary.tsx` | Presenta cantidades, costos y explicación del cálculo. |
| `src/components/BudgetModal.tsx` | Muestra el presupuesto acumulado y permite eliminar partidas. |
| `src/components/PrintQuotationView.tsx` | Prepara una hoja para imprimir mediante `window.print()`. |

Tecnología declarada: React, TypeScript, Vite y Tailwind. La aplicación inspeccionada calcula en el navegador. No hay implementación de servidor, base de datos, autenticación o API de catálogo en los archivos revisados. Aunque `package.json` declara Express y el SDK de Gemini, no se encontraron usos de esos servicios en `src/`.

El guardado actual conserva un formulario y un listado acumulado en ese navegador. No constituye un historial de proyectos o cotizaciones con cliente, número y versión.

## 4. Comparación con el catálogo del manual

La cobertura del manual se transcribe como está publicada. En varios productos es una cifra redondeada; no se ha asumido que sea idéntica al área geométrica exacta o al ancho útil de instalación.

| Producto del manual | Presentación / cobertura indicada | Diferencia encontrada en el demo |
|---|---|---|
| Lámina PVC Prime, Delux y Premium | Cada una: 1,22 × 2,44 m; 2,98 m² | Existen dos acabados de mármol, pero no estas tres líneas comerciales. Cobertura interna: 2,977 m². |
| Lámina PVC Bambú | 1,22 × 2,44 m; 2,98 m² | Un ejemplo coincide aproximadamente; otro usa 1,22 × 2,80 m. Los adhesivos tampoco corresponden al manual. |
| Lámina Adhesiva 3 METROS | 1,20 × 3,00 m; 3,60 m² | Los ejemplos son 0,60 × 5 m y 1,22 × 3 m. |
| Lámina Adhesiva Satin | 0,60 × 2,44 m; 1,46 m² | No está representada con estas medidas. |
| Panel Geométrico Clásico | 0,60 × 0,60 m; 0,36 m² | Los ejemplos son placas de 0,50 × 0,50 m vendidas en cajas de 3 m². |
| Panel Geométrico Design Premium | 0,60 × 2,60 m; 1,56 m² | Falta esta presentación. |
| WPET S | 2,90 × 0,16 m; 0,46 m² | El WPET del demo mide 2,40 × 0,60 m. |
| WPET M | 2,90 × 0,20 m; 0,58 m² | Falta esta presentación. |
| WPET L | 2,90 × 0,30 m; 0,87 m² | Falta esta presentación. |
| WPC Exterior | 2,90 × 0,22 m; 0,63 m² | Hay un ejemplo cercano de 0,219 m de ancho; su montaje usa cinco clips, frente a cuatro vinchas por panel en el manual. |
| Metal Siding | 2,90 × 0,39 m; 1,13 m² | No se encontró un producto equivalente. |
| Piso PVC adhesivo | Caja de 5 m² | Los ejemplos usan cajas de 3,34 y 2,78 m². |
| Cielo Raso PVC | 0,25 × 5,95 m; 1,48 m² | No se encontró. Las vigas para techo del demo son productos diferentes. |
| Piedra Flexible | 0,60 × 1,20 m; 0,72 m² | Los ejemplos usan 1,22 × 2,80 y 1,22 × 2,44 m. |
| Piedra PU | 0,60 × 1,20 m; cobertura impresa con error de texto | Las dimensiones y 0,72 m² del demo son compatibles; el adhesivo y su rendimiento difieren. |
| Piedra Traslúcida | 0,60 × 1,20 m; cobertura impresa con error de texto | Los ejemplos usan 1,22 × 2,44 m. El manual indica silicón transparente no disponible en Decokasa. |
| WPC | 0,15 × 2,90 m; 0,43 m² | Hay un ejemplo con estas medidas, pero usa cuatro vinchas por panel; el manual indica tres. |
| WPC Small | 0,15 × 2,60 m; 0,39 m² | Falta esta presentación y el manual omite la cantidad de vinchas. |

Las dimensiones, coberturas y presentaciones afectan las cantidades compradas; no son solo textos que deban cambiarse en pantalla.

Las categorías de regaderas, lavaplatos y vigas del demo no están justificadas por este manual. Pueden pertenecer al negocio, pero requieren otra fuente antes de incorporarlas como alcance confirmado.

## 5. Reglas de instalación extraíbles del PDF

Las páginas 1-2 contienen los productos; las páginas 3-4 continúan con complementos y rendimientos sin repetir los nombres de los productos. La asociación siguiente se deduce del orden y de la alineación de las filas y debe conservar esa trazabilidad.

| Familia / producto | Regla indicada | Aplicación propuesta, pendiente de definir la base de paneles |
|---|---|---|
| Geométrico Clásico | Un silicón cubre ocho paneles | `envases = ceil(paneles / 8)` |
| Geométrico Design Premium | Un silicón cubre dos paneles | `envases = ceil(paneles / 2)` |
| WPET S, M y L | Un silicón cubre tres paneles | `envases = ceil(paneles / 3)` |
| WPC Exterior | Cuatro vinchas por panel y un tornillo por vincha | `vinchas = paneles × 4`; `tornillos = vinchas`. La primera tabla menciona también tacos, sin detallar aquí su proporción. |
| Metal Siding | Quince tacos y quince tornillos | Confirmar si es por panel antes de calcular. |
| Piedra Flexible y PU | Un silicón para cuatro paneles | `envases = ceil(paneles / 4)` |
| Piedra Traslúcida | Un silicón para cuatro paneles | Requiere transparente; el manual indica que ese silicón no está disponible en el local. |
| WPC de 2,90 m | Un silicón por tres paneles, tres vinchas por panel, un tornillo y un taco por vincha | `envases = ceil(paneles / 3)`; `vinchas = paneles × 3`; `tornillos = tacos = vinchas`. |
| WPC Small | Un silicón por tres paneles; menciona vinchas y tacos | Falta el número de vinchas y no queda completamente especificada la tornillería. |

El motor actual puede representar un envase por varios paneles con un multiplicador fraccionario, pero el catálogo no configura estos rendimientos. Conviene expresar explícitamente «paneles por envase» para que mantener los datos sea claro y no dependa de interpretar `rate = 1/3`.

Se necesita distinguir materiales indispensables de recomendaciones decorativas. El manual menciona perfiles, LED, zócalos y combinaciones con otros revestimientos, pero no da cantidades ni obliga a incluirlos en todas las instalaciones.

### Ambigüedades que no deben convertirse en fórmulas automáticas

1. **PVC Prime, Delux, Premium y Bambú:** aparece «1 x plancha por lámina». Debe confirmarse si significa un envase de silicona por lámina u otra cosa.
2. **Piso adhesivo:** la fila correspondiente de la continuación menciona «15 tornillos y tacos por panel», lo que entra en conflicto con la instalación autoadhesiva indicada en la primera tabla. Confirmar la asignación y el contenido de esa fila.
3. **WPC Small:** falta el número de vinchas por panel.
4. **Metal Siding:** falta explicitar la base del rendimiento de quince tacos/tornillos.
5. **Paneles geométricos:** se mencionan tornillos como instalación, pero no se cuantifican ni se aclara cuándo se requieren junto al adhesivo.
6. **Cielo Raso PVC:** no hay rendimiento de tornillos ni detalle cuantitativo de estructura o suspensión.
7. **Piedra PU y Traslúcida:** las coberturas incluyen errores de texto (`0,72m131` y `0,72m132`). Las medidas producen 0,72 m², pero conviene corregir la fuente.
8. **Cobertura comercial:** confirmar si las coberturas publicadas son redondeos descriptivos o superficies útiles autorizadas para comprar. Por ejemplo, 1,22 × 2,44 = 2,9768 m², aunque se publica 2,98 m².

## 6. Hallazgos del cálculo y la aplicación

### Prioridad alta: resultados y datos comerciales

**A. Catálogo y accesorios de ejemplo.** Todos los precios son referenciales. Hay adhesivos, rendimientos, métodos de fijación y descripciones técnicas que no están respaldados por el manual. La misma familia puede cambiar sustancialmente de medida o presentación entre el PDF y el demo.

**B. Las aberturas no cambian las piezas en el cálculo por orientación.** En `calculator.ts:105-156`, se descuentan aberturas del área, pero las piezas se obtienen del rectángulo completo mediante columnas × filas. Caso comprobado: pared de 3,50 × 2,60 m con el WPC de ejemplo de 0,16 × 2,90 m y 0% de desperdicio: 22 paneles tanto sin puerta como con una puerta de 0,90 × 2,10 m. El área baja de 9,10 a 7,21 m² y el adhesivo pasa de cuatro a tres envases.

Esto puede ser una política conservadora, pero debe explicarse: descontar un área no siempre permite ahorrar paneles enteros. Para calcular el efecto real de puertas y ventanas se necesita su posición y una política de reutilización de recortes, datos que el formulario no recoge.

**C. El criterio por área no comprueba la distribución de cortes.** Láminas, piedras y otros productos sin `supportsOrientation` se calculan dividiendo el área total entre la cobertura. Es una estimación de superficie, no una garantía de que los formatos comerciales resuelvan todos los cortes. Los paneles orientados y las vigas, por otra parte, usan un criterio conservador sin optimización de retazos. Definir qué criterio se aplicará por producto y cómo se explicará.

**D. Los insumos por panel usan las unidades compradas.** `pieces_multiplier` recibe `unitsToBuy`, que incluye el margen de desperdicio. Debe decidirse si silicona, vinchas, tornillos y tacos se calculan sobre paneles instalados, comprados o una base específica por insumo. No todas las piezas de reserva necesariamente se instalan.

**E. Los redondeos de cobertura pueden confundir.** Con 2,98 m² de área y 0% de desperdicio, la lámina PVC de ejemplo produce dos piezas porque usa 2,977 m² internamente. La explicación visual redondea ambos números y muestra `ceil(2,98 / 2,98) = 2`. Hay que conservar suficiente precisión en la explicación y definir la cobertura autorizada. No basta con cambiar indiscriminadamente todos los valores a 2,98.

### Prioridad media: consistencia y recuperación

**F. Validación de datos guardados insuficiente.** En `useProjectStorage.ts:56-73`, el formulario recuperado solo comprueba que exista el producto y el presupuesto se acepta sin validar su estructura. Un JSON con producto válido pero sin `surfaces` puede llegar a `forEach` sobre `undefined`. El motor registra que faltan superficies, pero continúa iterando. Debe validar y normalizar antes de calcular o restaurar el estado inicial.

**G. Validación numérica incompleta.** `parseUserNumber` acepta `2abc` como 2, `1.234,56` como 1,234 e `Infinity` como infinito. La comprobación actual no exige `Number.isFinite`. Estos casos se probaron directamente en el motor y no implican que todos puedan teclearse en los controles HTML actuales. La validación debe vivir también en el motor, especialmente al leer almacenamiento o futuras importaciones. Cantidades fraccionarias se redondean sin explicación; un método de instalación desconocido tampoco se rechaza.

**H. Impresión mezcla contextos.** En `PrintQuotationView.tsx:22-106`, si hay presupuesto se imprime su tabla acumulada, pero el resumen técnico sigue mostrando el producto y medidas actualmente seleccionados. Puede acompañar un presupuesto de varias partidas con el resumen de un solo producto o de otro que ni se añadió. Hace falta elegir explícitamente cálculo actual o presupuesto y guardar los datos de cada proyecto/partida.

**I. Consolidación por nombre y presentación.** En `useProjectStorage.ts:186-250`, los materiales se agrupan por esos textos. Conviene identificar productos y accesorios mediante un SKU/ID estable. El mismo insumo con nombres distintos puede duplicarse; insumos distintos con el mismo nombre pueden fusionarse. Se redondean empaques en cada cálculo antes de acumularlos: dos cálculos que necesitan diez clips cada uno pueden sumar dos bolsas de 50, aunque una bastaría si se consolidara primero el consumo.

**J. No se conserva el proyecto completo al presupuestar.** Las partidas guardan cantidades, precios y notas, pero no el conjunto de medidas, método, aperturas y versión de reglas que las originó. No se puede reabrir una cotización y reproducir su cálculo con esos datos únicamente. Cambiar de categoría también restablece medidas; conviene evaluar si debe conservarse el espacio al cambiar de material.

**K. Dependencias implícitas entre accesorios.** `screws_per_clip` toma el primer accesorio de tipo `pieces_multiplier`, sin un vínculo explícito al accesorio de vinchas. Al extender el catálogo podría usar el multiplicador de otro insumo. Debe referenciar la regla correspondiente por ID.

### Prioridad posterior: operación y presentación

- Los perfiles y esquineros tienen longitudes comerciales y precios de ejemplo; el PDF no los especifica. Las medidas de bordes se introducen manualmente y tienen valores iniciales distintos de cero.
- El PDF de cotización se obtiene mediante el diálogo de impresión; no existe una descarga PDF generada directamente ni exportación CSV/Excel.
- No hay desglose de impuestos, transporte o mano de obra. El PDF aportado tampoco exige esos módulos ni define sus valores; deben acordarse si se necesitan para cotizar.
- El `README.md` conserva instrucciones de AI Studio y pide Gemini, aunque los cálculos inspeccionados no utilizan IA. Debe documentar el funcionamiento real.
- `npm run lint` ejecuta únicamente TypeScript; no hay configuración de un analizador de estilo ni suite de pruebas declarada. `tsconfig.json` no activa el modo estricto.
- No hay archivo de bloqueo de dependencias ni `node_modules` en la copia revisada. No se encontró un repositorio Git inicializado en esta carpeta.
- `index.html` declara inglés para una interfaz en español. Las tarjetas de producto son `div` con `onClick`, sin interacción de teclado equivalente. Los modales no implementan semántica de diálogo ni gestión de foco. Son hallazgos del código, sin auditoría de accesibilidad en navegador.
- El texto principal promete «cantidades exactas», mientras el pie y la hoja imprimible reconocen una estimación con datos de ejemplo. Conviene usar una promesa consistente con el cálculo disponible.

## 7. Comprobaciones realizadas

Se ejecutaron `calculator.ts`, `catalog.ts` y `categories.ts` de forma aislada con Node.js. Solo se retiraron los imports de interfaces y la sintaxis TypeScript para cargarlos; no se alteraron las fórmulas ni los valores. Esta comprobación no sustituye la compilación del proyecto ni las pruebas de interfaz.

| Comprobación | Resultado |
|---|---|
| Un caso válido para cada producto del demo | 34 de 34 devolvieron resultado válido y costo finito. Esto comprueba ejecución básica, no exactitud comercial. |
| Piso de 10 m² con 10% de desperdicio | El ejemplo de 3,34 m²/caja devuelve cuatro cajas. Con 5 m²/caja del manual, el mismo criterio de cálculo daría tres. |
| WPC orientado con y sin puerta | Misma compra de 22 paneles; cambian el área y el adhesivo. |
| Lámina PVC para 2,98 m² sin desperdicio | Dos piezas; explicación redondeada potencialmente confusa. |
| Entrada sin arreglo de superficies | Excepción al ejecutar `forEach`. |
| Cantidad de equipo de 1,5 unidades | Se acepta como dos unidades, sin error. |
| Método de instalación desconocido | Se acepta; se omiten accesorios restringidos a los métodos válidos. |
| Número infinito, con desperdicio cero | Se propagan infinito/NaN; resultado inválido sin mensaje de validación. |
| `npm run lint` | No se pudo ejecutar TypeScript: falta `tsc` instalado. |
| `npm run build` | No se pudo compilar: falta `vite` instalado. |

No se instalaron dependencias, no se probó la interfaz, no se verificó el diseño responsive y no se imprimió desde navegador. El fallo de los comandos anteriores es una limitación del entorno disponible, no prueba de un error de compilación del código.

## 8. Adaptación recomendada

1. **Normalizar el manual.** Registrar las 20 entradas con nombre comercial, SKU cuando exista, medidas, cobertura publicada, cobertura útil autorizada, presentación de venta y uso interior/exterior. Mantener explícitos los datos pendientes.
2. **Confirmar reglas de instalación.** Resolver las ambigüedades anteriores y registrar por insumo su rendimiento, empaque, disponibilidad y base de consumo. No sustituir silenciosamente Gorilax por otros adhesivos de ejemplo.
3. **Cargar el catálogo real.** Añadir Metal Siding, Cielo Raso PVC, WPC Small y variantes faltantes; sustituir los ejemplos que difieren. Separar insumos de instalación de complementos decorativos.
4. **Ajustar el motor.** Definir área frente a despiece por orientación, política de aberturas, reserva de material, precisión y redondeo por presentación. Validar estructura, números y métodos antes de calcular.
5. **Corregir presupuesto e impresión.** Guardar medidas y reglas de cada cálculo; usar identificadores estables; decidir si los empaques se consolidan por proyecto completo; imprimir el contexto elegido.
6. **Validar con ventas e instalación.** Contrastar casos manuales aprobados de todas las presentaciones, incluyendo cambios de orientación, aberturas, límites de empaque y cantidades pequeñas.

Para una primera versión local puede mantenerse el catálogo en archivos y el motor en el navegador. Una base de datos o un panel de administración cobran sentido cuando se necesita que personal del local cambie precios y reglas, compartir cotizaciones o mantener historial entre equipos. No son una condición para corregir la calculadora actual.

## 9. Información comercial todavía necesaria

- Confirmaciones de las reglas ambiguas de la sección 5.
- Precios reales y si incluyen impuestos, cuando se quiera un presupuesto económico.
- Presentación de venta y contenido de bolsas/cajas/envases de cada accesorio.
- Longitud comercial de perfiles, esquineros y cintas; presentación y criterio de selección de LED.
- Anchos útiles, traslapes o uniones que reduzcan cobertura, cuando correspondan.
- Desperdicio recomendado por familia y política de compra de reserva.
- Criterio de consumo: paneles instalados, piezas compradas o área neta.
- Alcance de productos adicionales del demo no incluidos en el manual.
- Si el documento final será solo lista de materiales o cotización con cliente, vendedor, número, vigencia y condiciones.

El siguiente paso concreto es obtener un catálogo y una tabla de reglas aprobados por Decokasa. Con esa base puede adaptarse la aplicación existente y comprobarse que los materiales sugeridos correspondan a lo que realmente vende e instala el local.
