
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const out = path.join(root, 'output/docx/Manual_calculadora_DECOKASA.docx');
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
let body = '', imageId = 0;
const images = [];
const relationships = [];
const run = (text, bold=false, size, font) => '<w:r>' + (bold || size || font ? '<w:rPr>'+(bold?'<w:b/>':'')+(size?'<w:sz w:val="'+size+'"/>':'')+(font?'<w:rFonts w:ascii="'+font+'" w:hAnsi="'+font+'"/>':'')+'</w:rPr>' : '') + '<w:t xml:space="preserve">'+esc(text)+'</w:t></w:r>';
function p(text, style='Normal', opts={}) {
 body += '<w:p><w:pPr><w:pStyle w:val="'+style+'"/>'+(opts.keep?'<w:keepNext/>':'')+(opts.align?'<w:jc w:val="'+opts.align+'"/>':'')+'</w:pPr>'+run(text,opts.bold,opts.size,opts.font)+'</w:p>';
}
function h(text){ p(text,'Heading1'); }
function sub(text){ p(text,'Heading2'); }
function bullet(text){ p('•  '+text,'ListText'); }
function action(n,text){ p(n+'.  '+text,'ListText'); }
function code(text){ p(text,'Code'); }
function newPage(title){ if(body) body+='<w:p><w:r><w:br w:type="page"/></w:r></w:p>'; h(title); }
function skill(query,chosen,purpose) {
 p('Búsqueda de habilidades','Heading2');
 code('npx skills find "'+query+'"');
 p('Habilidad seleccionada: '+chosen+'. '+purpose);
}
function table(headers,rows,widths) {
 const total = widths.reduce((a,b)=>a+b,0);
 body += '<w:tbl><w:tblPr><w:tblW w:w="'+total+'" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders>'+['top','left','bottom','right','insideH','insideV'].map(b=>'<w:'+b+' w:val="single" w:sz="4" w:color="D9D9D9"/>').join('')+'</w:tblBorders><w:tblCellMar><w:top w:w="95" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="95" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>'+widths.map(w=>'<w:gridCol w:w="'+w+'"/>').join('')+'</w:tblGrid>';
 [headers,...rows].forEach((row,i)=>{
 body+='<w:tr><w:trPr><w:cantSplit/>'+(i===0?'<w:tblHeader/>':'')+'</w:trPr>';
 row.forEach((cell,j)=> {body+='<w:tc><w:tcPr><w:tcW w:w="'+widths[j]+'" w:type="dxa"/><w:vAlign w:val="center"/><w:shd w:fill="'+(i===0?'363A3C':i%2===0?'F1F3F0':'FFFFFF')+'"/></w:tcPr><w:p><w:pPr><w:pStyle w:val="TableText"/>'+(j>0&&widths[j]<1700?'<w:jc w:val="center"/>':'')+'</w:pPr><w:r><w:rPr>'+(i===0?'<w:b/><w:color w:val="FFFFFF"/>':'<w:color w:val="222222"/>')+'</w:rPr><w:t xml:space="preserve">'+esc(cell)+'</w:t></w:r></w:p></w:tc>'; });
 body+='</w:tr>';});
 body+='</w:tbl>'; p('','Small');
}
function image(file,widthIn,heightIn,alt) {
 const id=++imageId,rid='rIdImage'+id,filename='image'+id+'.png';
 images.push({filename,data:fs.readFileSync(path.join(root,'tmp/manual',file))});
 relationships.push('<Relationship Id="'+rid+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/'+filename+'"/>');
 const cx=Math.round(widthIn*914400),cy=Math.round(heightIn*914400);
 body+='<w:p><w:pPr><w:spacing w:before="100" w:after="140"/><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="'+cx+'" cy="'+cy+'"/><wp:docPr id="'+id+'" name="'+esc(alt)+'" descr="'+esc(alt)+'"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="'+filename+'"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="'+rid+'"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="'+cx+'" cy="'+cy+'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';
}
function link(label,url){
 const rid='rIdLink'+relationships.length;
 relationships.push('<Relationship Id="'+rid+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="'+esc(url)+'" TargetMode="External"/>');
 body+='<w:p><w:pPr><w:pStyle w:val="Small"/></w:pPr>'+run(label+' ')+'<w:hyperlink r:id="'+rid+'"><w:r><w:rPr><w:color w:val="365835"/><w:u w:val="single"/></w:rPr><w:t>'+esc(url)+'</w:t></w:r></w:hyperlink></w:p>';
}

// 1
p('Decokasa','Brand');
p('Manual de implementación y uso de la calculadora Decokasa','Title');
p('Guía para clientes vendedores y mantenimiento del demo','Subtitle');
p('Versión implementada 1.0   |   25 de octubre de 2026','Small');
p('La calculadora del proyecto se ha mejorado para trabajar con las 20 presentaciones del Manual Técnico Comercial Decokasa. Este documento explica, paso a paso, cómo ejecutar y mantener esa versión y cómo usarla para preparar una lista de compra.');
image('inicio.png',7.05,3.26,'Pantalla inicial de la calculadora Decokasa renovada');
p('El diseño combina un catálogo visual, medidas con vista orientativa y un resumen de materiales. Los vendedores pueden ingresar precios; los clientes pueden calcular, guardar e imprimir sin registrarse.');
p('Alcance del documento','Heading2');
p('Los pasos se concentran en implementación y uso. Las reglas incompletas del PDF se mantienen visibles como pendientes. No hay precios oficiales precargados ni conexión con inventario o cuentas compartidas.');

// 2
newPage('Cómo seguir este manual');
p('Cada etapa incluye una consulta de find-skills, la habilidad elegida y acciones concretas sobre los archivos del demo. Las consultas se pueden repetir para buscar alternativas. Una habilidad orienta el trabajo; las medidas y los rendimientos del negocio proceden del manual técnico.');
table(['Paso','Trabajo','Habilidad principal'],[
['1','Preparar y ejecutar el demo','vite-patterns'],
['2','Organizar el catálogo técnico','pdf'],
['3','Separar datos y fórmulas','react-patterns y error-handling'],
['4','Construir el diseño visual','frontend-design'],
['5','Conectar medidas y orientación','react-patterns'],
['6','Presentar materiales y notas','error-handling'],
['7','Preparar cotizaciones','react-patterns'],
['8','Imprimir y exportar','documents'],
['9','Adaptar la experiencia móvil','accessibility'],
['10','Mantener y preparar publicación','deployment-patterns'],
],[650,4400,5100]);
sub('Cómo pedir la ayuda de una habilidad');
p('Indicación reutilizable para el asistente: «Usa find-skills para localizar la habilidad adecuada para esta etapa, lee sus instrucciones y aplícala a los archivos indicados, conservando las reglas técnicas de Decokasa».');
p('Para una búsqueda desde terminal, utiliza el comando de cada paso. Si la habilidad ya está disponible localmente, se puede aplicar directamente. Si se descubre una nueva, revisa su descripción y procedencia antes de instalarla.');
sub('Selección realizada');
p('Se consultó skills.sh y se usó la búsqueda CLI para diseño, materiales y navegador. Para los cálculos del negocio se mantuvo el PDF como fuente. En el anexo final se incluyen los enlaces de las habilidades públicas y la distinción entre recursos locales y públicos.');

// 3
newPage('Paso 1 Preparar y ejecutar el demo');
skill('vite','vite-patterns','Ayuda a mantener la configuración y las dependencias de Vite.');
p('Objetivo: continuar sobre el proyecto existente en calcuWeb y conservar una forma sencilla de abrir la calculadora en el local.');
action(1,'Conserva la copia del demo original ubicada en tmp/demo_original.zip. Los cambios nuevos están en los archivos del proyecto, no en una aplicación separada.');
action(2,'Abre una terminal de PowerShell en la carpeta calcuWeb. Instala las versiones registradas en package-lock.json.');
code('npm ci');
action(3,'Inicia la aplicación y abre la dirección Local que muestre Vite.');
code('npm run dev');
p('El puerto inicial es 3000. Cuando está ocupado, Vite muestra otro, por ejemplo http://localhost:3001/. Usa la dirección que aparezca en tu terminal.');
action(4,'Para generar la carpeta de la versión distribuible, ejecuta el comando de compilación. Después puedes abrir su vista local.');
code('npm run build');
code('npm run preview');
sub('Qué se cambió en la base');
p('Se conservaron React y TypeScript, se corrigió el conflicto de dependencias del demo y se simplificó Vite. El diseño ahora usa una hoja CSS propia. Se retiraron las dependencias de Gemini, Express y otras que la calculadora no utilizaba.');
table(['Archivo','Responsabilidad'],[
['package.json','Comandos de ejecución y dependencias necesarias.'],
['package-lock.json','Versiones resueltas para reinstalar el proyecto.'],
['vite.config.ts','Servidor y compilación de la aplicación React.'],
['tsconfig.json','Tipos estrictos para los archivos de la aplicación.'],
['README.md','Instrucciones actualizadas y criterios de cálculo.'],
],[2700,7450]);
p('No necesitas una clave de inteligencia artificial ni configurar secretos para esta versión.');

// 4
newPage('Paso 2 Organizar el catálogo técnico');
skill('pdf technical product catalog','pdf disponible en esta sesión','Permite leer las tablas del PDF y conservar su contexto.');
p('Objetivo: que la calculadora utilice las presentaciones del negocio y permita distinguir un dato técnico de una decisión de la herramienta.');
action(1,'Usa documentos/Manual_Tecnico_Comercial_DECOKASA.pdf como fuente. Las páginas 1 y 2 contienen productos, medidas, coberturas e instalación. Las páginas 3 y 4 continúan los complementos y sus rendimientos.');
action(2,'Mantén los 20 registros en src/data/catalog.ts. Cada registro debe conservar nombre, familia, dimensiones, cobertura publicada, unidad de venta, uso, instalación y páginas de origen.');
action(3,'Guarda por separado coverageM2 y publishedCoverageM2. La primera es la cobertura que usa el cálculo; la segunda permite mostrar la cifra publicada en el PDF.');
action(4,'En formatos por pieza se usa el área geométrica exacta. Por ejemplo, 1,22 × 2,44 m cubre geométricamente 2,9768 m², aunque el PDF lo muestre como 2,98 m². El piso se vende en cajas de 5 m².');
action(5,'Conserva technicalNotes para las ambigüedades y complements para recomendaciones decorativas sin cantidad automática.');
table(['Campo','Uso en la aplicación'],[
['id','Identificador estable para seleccionar y consolidar.'],
['reference','Referencia interna DK; no es un SKU oficial.'],
['widthM y heightM','Dimensiones de la pieza en metros.'],
['saleUnit','Pieza o caja completa.'],
['accessoryRules','Insumos con rendimiento cuantificable.'],
['technicalNotes','Datos que el vendedor o instalador debe confirmar.'],
['sourcePages','Páginas de origen para conservar trazabilidad.'],
],[3000,7150]);
p('La asociación de rendimientos de las páginas 3 y 4 se deduce del orden de filas, porque no repiten el nombre del producto. La aplicación lo comunica en las notas de instalación.');

// 5
newPage('Paso 3 Separar datos y fórmulas');
skill('typescript input validation','react-patterns y error-handling disponibles localmente','Ayudan a separar estado, reglas y mensajes para el usuario.');
p('Objetivo: poder cambiar una medida o un rendimiento sin reescribir la pantalla de la calculadora.');
action(1,'Mantén los contratos de datos en src/types/calculator.ts. Product describe el material; ProjectInput guarda las medidas; CalculationResult contiene cantidades, explicaciones y observaciones.');
action(2,'Mantén los cálculos en src/utils/calculator.ts. La función calculateProject recibe un producto y un proyecto y devuelve un resultado; no modifica el catálogo ni las medidas.');
action(3,'Exige medidas positivas y finitas, cantidades enteras de aberturas y un margen de reserva entre 0 y 50%. Cuando falte un dato, devuelve un mensaje claro en errors.');
action(4,'Evita redondear las coberturas internas para presentarlas en pantalla. Conserva suficiente precisión en las explicaciones para no mostrar una división aparentemente exacta con una compra mayor.');
sub('Dos métodos con objetivos distintos');
table(['Método','Criterio implementado'],[
['Por superficie','Área neta con reserva dividida entre cobertura. Compra unidades completas. No resuelve la distribución de cortes.'],
['Por piezas y orientación','Columnas por filas para cada rectángulo completo. Aplica reserva a las piezas base. No reutiliza retazos.'],
],[2700,7450]);
p('Los productos vendidos por caja sin dimensiones individuales de tablón, como el piso, solo permiten calcular por superficie. Para los paneles, la orientación intercambia el ancho y el largo de la pieza.');
sub('Decisiones de esta versión');
p('La reserva inicial es 10% y es ajustable; no procede de un rendimiento oficial del PDF. Los insumos se calculan sobre las piezas base, sin añadir fijaciones para las piezas de reserva. Estas decisiones se explican junto al resultado.');

// 6
newPage('Paso 4 Construir el diseño visual');
skill('frontend design','frontend-design','La búsqueda localizó anthropics/skills@frontend-design; se revisó su fuente pública y se aplicó la habilidad disponible.');
p('Objetivo: presentar la calculadora como una herramienta de Decokasa, con materiales visibles y una secuencia fácil de seguir.');
image('inicio.png',7.05,3.26,'Diseño inicial con ilustración de sala y acceso a la calculadora');
action(1,'Mantén la identidad en src/index.css: fondo claro, tipografía Manrope en títulos y DM Sans en textos, verde para selección y amarillo para la acción principal.');
action(2,'Usa public/espacio-decokasa.svg como ilustración local de bienvenida. Las texturas del catálogo se generan con CSS y son ilustrativas; no representan colores o modelos certificados.');
action(3,'Mantén el flujo visual en tres partes: elegir material, ingresar medidas y preparar la lista de compra. En escritorio, el resultado acompaña al formulario en una columna lateral.');
action(4,'Personaliza imágenes reales solo cuando dispongas de fotografías autorizadas del catálogo. Conserva la nota para confirmar acabados en el local.');
table(['Elemento','Valor o archivo'],[
['Fondo principal','#F6F7F1'],
['Acción principal','#F3DC55'],
['Selección','#586D42 y tonos afines'],
['Ilustración de sala','public/espacio-decokasa.svg'],
['Estilos de texturas','Clases texture en src/index.css'],
],[3200,6950]);

// 7
newPage('Paso 5 Conectar medidas y orientación');
skill('react forms accessibility','react-patterns y accessibility disponibles localmente','Guían formularios con etiquetas, estado claro y controles utilizables con teclado.');
p('Objetivo: que clientes y vendedores puedan describir el espacio sin conocer las fórmulas.');
image('medidas.png',7.05,3.26,'Formulario de medidas y vista orientativa del panel WPC');
action(1,'Usa ProjectForm.tsx para nombrar el proyecto y añadir ancho y alto o largo en metros. Cada superficie tiene su propio nombre, orientación y lista de aberturas.');
action(2,'Permite agregar superficies independientes. Cambiar de material conserva las medidas; el método inicial se ajusta a la presentación elegida.');
action(3,'Añade puertas o ventanas con ancho, alto y cantidad. Sus áreas se restan del área neta. El formulario informa si una abertura excede las dimensiones disponibles.');
action(4,'Usa SurfacePreview.tsx para representar dimensiones y distribución de paneles de manera orientativa. La puerta del dibujo es simbólica: no indica su posición real.');
p('En el cálculo por orientación, una abertura reduce el área mostrada pero no la compra de piezas. Para reducir piezas por cortes de puertas y ventanas se necesita un despiece con posiciones reales. Esta versión mantiene la estimación conservadora y lo explica.');

// 8
newPage('Paso 6 Presentar materiales y complementos');
skill('typescript error handling','error-handling disponible localmente','Ayuda a presentar datos incompletos con instrucciones comprensibles.');
p('Objetivo: que el resultado sea una lista que permita preparar la compra y conversar con el instalador.');
action(1,'Usa ResultsSummary.tsx para mostrar unidades que se compran, cobertura, área neta y excedente frente al área neta. El excedente puede incluir reserva, redondeo y recortes.');
action(2,'Cuantifica un insumo únicamente cuando accessoryRules tenga un rendimiento interpretable. Mantén las observaciones de instalación debajo del resultado.');
action(3,'Muestra las recomendaciones decorativas aparte. Perfiles, LED y zócalos no se añaden automáticamente si el manual no fija su cantidad.');
table(['Producto','Regla incorporada'],[
['Geométrico Clásico','1 silicón por 8 paneles.'],
['Geométrico Design Premium','1 silicón por 2 paneles.'],
['WPET S M y L','1 silicón por 3 paneles.'],
['Piedras Flexible PU y Traslúcida','1 silicón por 4 paneles; transparente para Traslúcida.'],
['WPC Exterior','4 vinchas por panel y 1 tornillo por vincha; tacos por confirmar.'],
['WPC de 2,90 m','1 silicón por 3 paneles; 3 vinchas por panel; 1 tornillo y 1 taco por vincha.'],
['WPC Small','1 silicón por 3 paneles; cantidad de fijaciones pendiente.'],
],[3400,6750]);
sub('Lectura del resultado');
p('Para una pared de 3,50 × 2,60 m con WPC de 0,15 × 2,90 m, orientación vertical y 10% de reserva: 24 columnas por 1 fila producen 24 piezas base. La compra sube a 27 piezas. Los insumos corresponden a las 24 piezas base: 8 envases de Gorilax, 72 vinchas, 72 tornillos y 72 tacos.');
p('Es una estimación de instalación con los criterios indicados. Los envases y empaques comerciales se deben confirmar en el local.');

// 9
newPage('Paso 7 Preparar cotizaciones de vendedores');
skill('react state management','react-patterns disponible localmente','Ayuda a mantener separados el cálculo actual y los cálculos guardados.');
p('Objetivo: reunir materiales de varios espacios y completar precios sin confundir el cálculo actual con la lista acumulada.');
image('proyecto.png',7.05,3.26,'Ventana Mi proyecto con materiales y precios pendientes');
action(1,'Activa Vista vendedor en la cabecera para habilitar precios en el resumen y en Mi proyecto. Esta opción cambia la interfaz; no es un inicio de sesión ni un área protegida.');
action(2,'Ingresa el precio por la unidad mostrada: pieza, caja, envase o unidad de fijación. Un campo vacío significa Por cotizar; no se interpreta como un producto gratuito.');
action(3,'Pulsa Añadir a mi proyecto para guardar una copia del cálculo con sus medidas. Cada pulsación agrega un cálculo nuevo. Reutilizar recupera medidas y permite preparar otro cálculo.');
action(4,'Consolida los materiales por ID. Para los insumos compartidos se suman los consumos exactos antes de redondear a unidades enteras. Así, dos consumos de medio envase suman un envase.');
p('Cuando falta algún precio, el importe se denomina subtotal de partidas con precio. La herramienta no agrega impuestos, flete ni mano de obra. Las condiciones comerciales deben definirse con el local.');

// 10
newPage('Paso 8 Imprimir y exportar listas');
skill('document generation export csv','documents disponible en esta sesión','Orienta documentos legibles con un contexto completo.');
p('Objetivo: entregar una lista de materiales que corresponda exactamente al cálculo o al proyecto que se desea compartir.');
action(1,'Usa Imprimir este cálculo en el resumen lateral para generar la hoja del material activo. Se incluyen solo ese producto, sus medidas y sus observaciones.');
action(2,'Abre Mi proyecto y usa Imprimir proyecto para imprimir la lista acumulada. Se incluyen todos sus cálculos y las medidas que originaron cada uno.');
action(3,'En el diálogo del navegador puedes elegir una impresora o Guardar como PDF, cuando esa opción esté disponible. La aplicación usa el servicio de impresión del navegador.');
action(4,'Usa Descargar CSV desde Mi proyecto para llevar las partidas a una hoja de cálculo. El archivo incluye material, cantidad, unidad, precio, subtotal y disponibilidad.');
sub('Archivos que intervienen');
table(['Archivo o función','Responsabilidad'],[
['PrintQuotationView.tsx','Hoja imprimible con cálculos incluidos y notas.'],
['QuoteTable.tsx','Partidas y precios pendientes o ingresados.'],
['buildQuote','Agrupación de materiales y consumos por ID.'],
['exportQuoteCsv','Archivo CSV con separador de punto y coma.'],
['useProjectStorage.ts','Guardado local de medidas, cálculos y precios.'],
],[3600,6550]);
sub('Conservar la información');
p('La aplicación guarda datos en este navegador y en esta dirección web. Otro navegador, equipo o puerto puede tener datos diferentes. Borrar datos de navegación elimina el guardado local.');
p('El CSV y la impresión permiten conservar la lista, pero no son una copia restaurable del proyecto. La versión actual no importa archivos de proyecto ni sincroniza datos entre equipos.');

// 11
newPage('Paso 9 Adaptar la experiencia móvil');
skill('accessibility responsive design','accessibility disponible localmente','Guía etiquetas, foco, contraste y disposición para distintos tamaños.');
p('Objetivo: permitir que un cliente use su teléfono y que un vendedor trabaje con teclado o en una pantalla amplia.');
image('movil.png',2.35,5.09,'Pantalla de inicio adaptada a un teléfono de 390 píxeles');
action(1,'Mantén las reglas responsive de src/index.css. En teléfono, catálogo, formulario y resultados se muestran en una columna.');
action(2,'Conserva las etiquetas de los campos y los nombres de los botones. Los productos se seleccionan con botones que indican su estado.');
action(3,'Usa Dialog.tsx para las ventanas de ayuda, presupuesto y reinicio. El diálogo nativo gestiona el foco y puede cerrarse con Escape.');
p('Respeta la preferencia de movimiento reducido y evita que una decoración interfiera con las medidas o la lectura de cantidades.');

// 12
newPage('Paso 10 Mantener y preparar la publicación');
skill('deployment static vite','deployment-patterns y vite-patterns disponibles localmente','Sirven para organizar cambios y preparar una distribución estática.');
p('Objetivo: mantener actualizada la calculadora y disponer de una versión que pueda alojarse cuando el negocio elija su servicio.');
action(1,'Para cambiar medidas o instalación, edita src/data/catalog.ts. Conserva las páginas de origen y la diferencia entre dato confirmado, interpretación y dato pendiente.');
action(2,'Si cambia una regla de consumo o un criterio de cálculo, actualiza CATALOG_VERSION. El guardado actual rechaza versiones incompatibles y avisa al usuario para iniciar un proyecto nuevo.');
action(3,'Antes de cambiar la versión del catálogo, conserva las listas importantes con CSV o impresión. La aplicación no incluye un sistema de migración de proyectos anteriores.');
action(4,'Actualiza las observaciones del negocio solo cuando se confirme el dato. Si cambian los empaques, incorpora su contenido explícitamente; no conviertas unidades sueltas a bolsas por suposición.');
action(5,'Genera dist con npm run build. Para alojar esta versión, el proveedor debe servir esa carpeta y sus recursos estáticos. Los archivos de public se incluyen en la compilación.');
code('npm run build');
sub('Qué está listo y qué se decide después');
p('La entrega es un proyecto local mejorado. No se ha publicado un sitio público ni configurado un dominio. Para atender a clientes por Internet, el negocio debe elegir alojamiento, dominio y condiciones de uso.');
p('Si se requieren historial compartido, precios oficiales administrados, vendedores con cuenta o inventario, se necesita un servicio en servidor y controles de acceso. La vista vendedor actual no sustituye esos componentes.');
sub('Recursos locales');
p('El PDF técnico está disponible desde la aplicación y se distribuye en public/documentos. El manual Word de esta entrega está en output/docx/Manual_calculadora_DECOKASA.docx.');

// 13
newPage('Guía rápida para clientes y vendedores');
sub('Para un cliente');
action(1,'Abre la calculadora y elige una familia de materiales.');
action(2,'Selecciona la presentación y lee su uso interior o exterior.');
action(3,'Nombra el proyecto e ingresa las medidas en metros.');
action(4,'Agrega las superficies y aberturas necesarias; ajusta orientación y reserva.');
action(5,'Consulta la lista y las notas de instalación. Añade el cálculo a Mi proyecto si deseas combinarlo con otros.');
action(6,'Imprime la lista o descarga CSV y confirma los materiales con el vendedor.');
sub('Para un vendedor');
action(1,'Activa Vista vendedor y acompaña al cliente en la selección.');
action(2,'Ingresa los precios vigentes por la unidad indicada.');
action(3,'Añade los cálculos al proyecto y elimina cualquier partida que se haya agregado por duplicado.');
action(4,'Atiende las observaciones de materiales o rendimientos pendientes. El silicón transparente de Piedra Traslúcida figura como no disponible en el local.');
action(5,'Imprime el proyecto consolidado. Define por separado impuestos, flete, mano de obra y condiciones comerciales cuando correspondan.');
sub('Ejemplo de compra por caja');
p('Un piso de 5 × 2 m tiene 10 m². Con 10% de reserva, la superficie objetivo es 11 m². Una caja cubre 5 m², de modo que la compra es de 3 cajas completas, con 15 m² de cobertura. El exceso frente al área neta es 5 m² e incluye el redondeo de la caja.');
p('La calculadora comienza con 10% de reserva como sugerencia ajustable. El material de reserva no equivale necesariamente a material que se instalará.');

// 14
newPage('Catálogo incorporado en esta versión');
p('Se registran las 20 presentaciones del PDF. Las coberturas de la tabla son las publicadas; el cálculo por pieza usa las dimensiones exactas. Los asteriscos señalan cobertura corregida por dimensiones por un error de texto en el PDF.','Small');
table(['Material','Formato en metros','Cobertura m²','Uso'],[
['Lámina PVC Prime','1,22 × 2,44','2,98','Interior'],
['Lámina PVC Delux','1,22 × 2,44','2,98','Interior'],
['Lámina PVC Premium','1,22 × 2,44','2,98','Interior'],
['Lámina PVC Bambú','1,22 × 2,44','2,98','Interior'],
['Lámina Adhesiva 3 Metros','1,20 × 3,00','3,60','Interior'],
['Lámina Adhesiva Satin','0,60 × 2,44','1,46','Interior'],
['Geométrico Clásico','0,60 × 0,60','0,36','Interior'],
['Geométrico Design Premium','0,60 × 2,60','1,56','Interior'],
['WPET S','0,16 × 2,90','0,46','Interior'],
['WPET M','0,20 × 2,90','0,58','Interior'],
['WPET L','0,30 × 2,90','0,87','Interior'],
['WPC Exterior','0,22 × 2,90','0,63','Exterior'],
['Metal Siding','0,39 × 2,90','1,13','Exterior'],
['Piso PVC Adhesivo','Caja completa','5,00','Interior'],
['Cielo Raso PVC','0,25 × 5,95','1,48','Interior'],
['Piedra Flexible','0,60 × 1,20','0,72','Interior'],
['Piedra PU','0,60 × 1,20','0,72 *','Interior exterior'],
['Piedra Traslúcida','0,60 × 1,20','0,72 *','Interior'],
['WPC','0,15 × 2,90','0,43','Interior'],
['WPC Small','0,15 × 2,60','0,39','Interior'],
],[4100,2350,1550,2150]);
p('La cobertura publicada no acredita un ancho útil tras traslapes o encajes. Confirma esas condiciones cuando el montaje real las requiera.','Small');

// 15
newPage('Información que debe completar Decokasa');
p('Estas observaciones permanecen en la aplicación. Resolverlas permite completar las cantidades de instalación sin inventar rendimientos.');
sub('Láminas PVC');
p('Aclarar qué significa «1 x plancha por lámina». Se conserva Gorilax como instalación, pero no se calcula su cantidad hasta conocer el rendimiento.');
sub('WPC Small y WPC Exterior');
p('Small no indica cuántas vinchas lleva cada panel ni completa la relación de tornillos y tacos. Exterior menciona tacos en la primera tabla, pero su proporción no se cuantifica en la continuación.');
sub('Metal Siding y piso autoadhesivo');
p('Confirmar si los quince tacos y tornillos de Metal Siding son por panel. Revisar la fila de quince tornillos y tacos asociada por posición al piso, porque contradice el montaje autoadhesivo.');
sub('Geométricos y cielo raso');
p('El manual menciona tornillos para geométricos sin cantidad o condición de uso. Para cielo raso no cuantifica tornillos ni estructura. La herramienta no dimensiona sistemas estructurales.');
sub('Envases y empaques de insumos');
p('Confirmar presentación de la silicona y forma de venta de vinchas, tacos y tornillos. Las cantidades actuales se expresan como envases o unidades; no se suponen bolsas de 50 ni cajas de 100.');
sub('Precios y administración');
p('Incorporar la lista oficial si se desea precargar precios. Definir cómo se administran, si incluyen impuestos y qué usuarios pueden cambiarlos. Actualmente se ingresan en cada navegador.');
sub('Acabados y complementos');
p('Añadir fotografías, colores, largos de perfiles y criterios para LED cuando exista información comercial autorizada. Las sugerencias decorativas actuales no tienen cantidades automáticas.');

// 16
newPage('Fuentes y habilidades consultadas');
sub('Documentos del proyecto');
p('Manual_Tecnico_Comercial_DECOKASA.pdf, páginas 1 a 4. Fuente de productos, dimensiones, uso, instalación y rendimientos. Las páginas de complementos se asociaron por orden de filas.');
p('analisis_calculadora_materiales_sicon_2026.md. Referencia de organización de una calculadora de otro local; no aporta fórmulas autorizadas para Decokasa.');
p('analisis_proyecto_decokasa.md. Diagnóstico del demo anterior a esta implementación. El presente manual describe la versión mejorada.');
sub('Habilidades disponibles localmente');
p('find-skills, pdf, vite-patterns, react-patterns, error-handling, frontend-design, accessibility, documents y deployment-patterns. Se consultaron sus instrucciones para el trabajo correspondiente. La selección local no implica que tengan el mismo nombre de paquete en un catálogo público.');
sub('Habilidades públicas localizadas');
p('La consulta pública identificó frontend-design de anthropics/skills y vercel-react-best-practices de vercel-labs/agent-skills. Se revisaron sus páginas y repositorios oficiales. Las métricas son referencias de la consulta y pueden cambiar. No se instalaron habilidades nuevas.');
table(['Habilidad','Referencia de adopción consultada','Procedencia'],[
['frontend-design','Aproximadamente 1 millón de instalaciones','anthropics/skills'],
['vercel-react-best-practices','Aproximadamente 837 mil instalaciones','vercel-labs/agent-skills'],
],[3700,3700,2750]);
link('Directorio y búsqueda','https://skills.sh/');
link('Diseño frontend','https://skills.sh/anthropics/skills/frontend-design');
link('Buenas prácticas React','https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices');
link('Repositorio de Anthropic','https://github.com/anthropics/skills');
link('Repositorio de Vercel','https://github.com/vercel-labs/agent-skills');
sub('Instalación opcional de una habilidad pública');
p('Solo si no está disponible en tu entorno y decides incorporarla:');
code('npx skills add https://github.com/anthropics/skills --skill frontend-design');
p('Las habilidades no sustituyen las fichas del negocio ni resuelven las ambigüedades del manual técnico.','Small');

const ns='xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';
const sect='<w:sectPr><w:headerReference w:type="default" r:id="rIdHeader"/><w:footerReference w:type="default" r:id="rIdFooter"/><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="900" w:right="1045" w:bottom="900" w:left="1045" w:header="400" w:footer="420"/><w:cols w:space="720"/></w:sectPr>';
const document='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document '+ns+'><w:body>'+body+sect+'</w:body></w:document>';
const style = (id,name,size,bold=false,extra='',ppr='') => '<w:style w:type="paragraph" w:styleId="'+id+'"><w:name w:val="'+name+'"/><w:basedOn w:val="Normal"/><w:pPr>'+ppr+'</w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="000000"/><w:sz w:val="'+size+'"/>'+(bold?'<w:b/>':'')+extra+'</w:rPr></w:style>';
const styles='<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/><w:lang w:val="es-EC"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="130" w:line="270" w:lineRule="auto"/><w:widowControl/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:pPr><w:spacing w:after="130" w:line="270" w:lineRule="auto"/></w:pPr></w:style>'
+style('Title','Title',52,true,'','<w:keepNext/><w:spacing w:before="120" w:after="230" w:line="570" w:lineRule="auto"/>')
+style('Subtitle','Subtitle',28,false,'','<w:keepNext/><w:spacing w:after="180"/>')
+style('Brand','Brand',30,true,'','<w:spacing w:after="260"/>')
+style('Heading1','heading 1',34,true,'','<w:keepNext/><w:outlineLvl w:val="0"/><w:spacing w:after="200" w:line="390" w:lineRule="auto"/>')
+style('Heading2','heading 2',24,true,'','<w:keepNext/><w:outlineLvl w:val="1"/><w:spacing w:before="180" w:after="100"/>')
+style('Small','Small',19,false,'','<w:spacing w:after="110" w:line="240" w:lineRule="auto"/>')
+style('Code','Code',19,false,'<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>','<w:spacing w:before="70" w:after="130" w:line="235" w:lineRule="auto"/>')
+style('ListText','List text',22,false,'','<w:spacing w:after="150" w:line="270" w:lineRule="auto"/>')
+style('TableText','Table text',20,false,'','<w:spacing w:after="0" w:line="235" w:lineRule="auto"/>')
+'</w:styles>';
const header='<?xml version="1.0" encoding="UTF-8"?><w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:tabs><w:tab w:val="right" w:pos="10150"/></w:tabs><w:spacing w:after="0"/></w:pPr><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="000000"/></w:rPr><w:t>DECOKASA</w:t></w:r><w:r><w:tab/></w:r><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="000000"/></w:rPr><w:t>Manual de la calculadora</w:t></w:r></w:p></w:hdr>';
const footer='<?xml version="1.0" encoding="UTF-8"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:sz w:val="16"/></w:rPr><w:t xml:space="preserve">Decokasa   |   </w:t></w:r><w:fldSimple w:instr="PAGE"><w:r><w:t>1</w:t></w:r></w:fldSimple></w:p></w:ftr>';
const baseRels='<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdSettings" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/><Relationship Id="rIdHeader" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/><Relationship Id="rIdFooter" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>';
const entries=[
['[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>'],
['_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>'],
['word/document.xml',document],['word/styles.xml',styles],['word/header1.xml',header],['word/footer1.xml',footer],
['word/settings.xml','<?xml version="1.0" encoding="UTF-8"?><w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:defaultTabStop w:val="720"/><w:compat/><w:updateFields w:val="true"/></w:settings>'],
['word/_rels/document.xml.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+baseRels+relationships.join('')+'</Relationships>'],
['docProps/core.xml','<?xml version="1.0" encoding="UTF-8"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Manual de implementación y uso de la calculadora Decokasa</dc:title><dc:creator>Decokasa</dc:creator><dc:description>Guía de implementación y uso con habilidades por etapa y catálogo técnico</dc:description></cp:coreProperties>'],
...images.map(i=>['word/media/'+i.filename,i.data])];
let crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc32(b){let c=0xffffffff;for(const v of b)c=crcTable[(c^v)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
function zip(files) { let offset=0;const locals=[],central=[];for(const [name,source] of files){const n=Buffer.from(name),data=Buffer.isBuffer(source)?source:Buffer.from(source),crc=crc32(data);const l=Buffer.alloc(30);l.writeUInt32LE(0x04034b50);l.writeUInt16LE(20,4);l.writeUInt16LE(0x800,6);l.writeUInt32LE(crc,14);l.writeUInt32LE(data.length,18);l.writeUInt32LE(data.length,22);l.writeUInt16LE(n.length,26);locals.push(l,n,data);const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt32LE(crc,16);c.writeUInt32LE(data.length,20);c.writeUInt32LE(data.length,24);c.writeUInt16LE(n.length,28);c.writeUInt32LE(offset,42);central.push(c,n);offset+=l.length+n.length+data.length;}const size=central.reduce((s,b)=>s+b.length,0);const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(size,12);end.writeUInt32LE(offset,16);return Buffer.concat([...locals,...central,end]);}
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,zip(entries));
fs.writeFileSync(path.join(root,'tmp/manual/contenido.xml'),document);
console.log(JSON.stringify({output:out,plannedPages:16,images:images.length,bytes:fs.statSync(out).size}));
