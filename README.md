# Calculadora de materiales Decokasa

Calculadora para clientes y vendedores basada en las 20 presentaciones del Manual Técnico Comercial Decokasa. React, TypeScript y Vite. Los cálculos y proyectos se procesan y guardan en el navegador.

## Ejecutar

Requiere Node.js compatible con Vite 8 (22.12 o posterior dentro de la rama 22; también ramas posteriores compatibles).

```powershell
npm ci
npm run dev
```

Abre la dirección Local que muestre Vite. El puerto inicial es 3000; si está ocupado, Vite usa el siguiente. No se necesita una clave de Gemini ni un archivo de secretos.

```powershell
npm run build
npm run preview
```

La versión compilada queda en `dist/`.

## Funciones

- Selección de 20 presentaciones por familia y material.
- Ingreso por ancho × alto o área directa en m², con descuento de puertas y ventanas.
- Varias superficies con cálculo por área.
- Desperdicio seleccionable de 5% o 10%; 10% inicial como sugerencia, no rendimiento oficial.
- Complementos seleccionables según el material. Los rendimientos conocidos calculan cantidades; los demás requieren una cantidad manual.
- Presupuesto con cálculos independientes, consumos consolidados, CSV e impresión del cálculo actual o del proyecto.
- Precios por pieza, caja o complemento en el formulario; sin precios oficiales precargados.
- Resumen fijo a la derecha en escritorio, con total, cobertura, desperdicio y redondeo. En móvil aparece debajo del formulario.
- Recuperación local de medidas, proyectos y precios, con validación de estructura y aviso cuando no se pueda guardar.
- Diseño responsive, controles con etiquetas y diálogos nativos con manejo de foco.

## Datos y reglas

`src/data/catalog.ts` contiene dimensiones, coberturas publicadas, instalación, rendimientos y observaciones. Las referencias DK son identificadores internos, no SKU oficiales. El formato de datos está en `src/types/calculator.ts`; las fórmulas y la consolidación están en `src/utils/calculator.ts`.

Los formatos usan su área geométrica exacta; la cobertura publicada puede estar redondeada. El piso se calcula con cajas de 5 m². El despiece trabaja por rectángulo completo, no reutiliza retazos y no reduce las piezas por aberturas; las aberturas sí reducen el área. Los insumos usan piezas base, sin incluir la reserva. Los consumos compartidos se suman antes de redondear a envases o unidades enteras.

El formulario calcula por área. Cada superficie admite `measurementMode: 'dimensions' | 'area'`; las superficies por área usan `areaM2` y conservan las medidas anteriores. Las aberturas se descuentan antes de aplicar desperdicio. El motor conserva la distribución por piezas para leer presupuestos anteriores. Los proyectos anteriores sin estos campos siguen siendo compatibles.

`accessorySelection` guarda los complementos elegidos. Una lista vacía no añade complementos. Los presupuestos anteriores sin ese campo conservan sus insumos originales. Al cambiar de material se inicia una selección nueva. Solo los complementos marcados se incluyen al cotizar, imprimir o exportar. Los nuevos rendimientos no se deducen: los insumos pendientes y los acabados sugeridos usan cantidades manuales enteras por envase o unidad, a confirmar con instalación.

La asociación entre productos y rendimientos de las páginas 3 y 4 se deduce del orden de filas del PDF. Confirmar con instalación. PVC, WPC Small, Metal Siding, piso, cielo raso y geométricos tienen datos pendientes indicados en pantalla. El silicón transparente de piedra traslúcida se identifica como no disponible en el local.

Los precios se ingresan manualmente y se conservan en ese navegador. No hay control de acceso. El total permanece por cotizar mientras no haya precios; si solo algunas partidas tienen precio, se muestra su subtotal. No hay impuestos, transporte o mano de obra añadidos automáticamente. El inventario no está conectado.

## Archivos del negocio

- Fuente: `documentos/Manual_Tecnico_Comercial_DECOKASA.pdf`.
- Análisis inicial: `documentos/analisis_proyecto_decokasa.md` (describe el demo anterior).
- Manual de implementación y uso: `output/docx/Manual_calculadora_DECOKASA.docx`.
- Copia del demo anterior: `tmp/demo_original.zip`.

Para usar el proyecto desde varios equipos o conservar cotizaciones en una cuenta compartida se necesita añadir almacenamiento en servidor y control de acceso. La versión actual es local al navegador.
