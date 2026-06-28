export const profiles = {
  publico: { label: 'Público' },
  disenadores: { label: 'Diseñadores' },
  gremio: { label: 'Gremio' },
}

// Tarifario transcripto de las listas del 02/02/2026.
// eco = columna Ecosolvente; uv = columna Mimaki UV CMYK.
// La tercera columna "CMYK + W + V" (blanco + varnish/laca) NO se usa como UV CMYK.
const prices = (gremioEco, gremioUv, disenadoresEco, disenadoresUv, publicoEco, publicoUv) => ({
  gremio: { eco: gremioEco, uv: gremioUv, uvPlus: null },
  disenadores: { eco: disenadoresEco, uv: disenadoresUv, uvPlus: null },
  publico: { eco: publicoEco, uv: publicoUv, uvPlus: null },
})

const printPrices = (gEco, gUv, gPlus, dEco, dUv, dPlus, pEco, pUv, pPlus) => ({
  gremio: { eco: gEco, uv: gUv, uvPlus: gPlus },
  disenadores: { eco: dEco, uv: dUv, uvPlus: dPlus },
  publico: { eco: pEco, uv: pUv, uvPlus: pPlus },
})

export const materials = [
  // Impresión: mínimo 50 × 50 cm
  { id:'papel', name:'Papel Blueback', category:'Impresión por m²', unit:'m²', prices:printPrices(6900,14500,20600,12600,20300,28800,16400,26400,37400), desc:'Papel para cartelería de corta duración', popular:false },
  { id:'vinilo-promo', name:'Vinilo PROMO', category:'Impresión por m²', unit:'m²', prices:printPrices(10000,16000,22400,14100,22300,31400,18400,29000,40800), desc:'Jaspe, Winflex, American, Adhoc, etc.', popular:true },
  { id:'vinilo-lg', name:'Vinilo LG 1800 / Inflex 100 mic', category:'Impresión por m²', unit:'m²', prices:printPrices(14000,19500,25700,19900,27500,35900,25800,35700,46700), desc:'Vinilo autoadhesivo de uso general' },
  { id:'oracal', name:'Oracal 3164', category:'Impresión por m²', unit:'m²', prices:printPrices(21200,27000,33300,30100,37800,46500,39100,49100,60500), desc:'Vinilo de mayor durabilidad', popular:false },
  { id:'micro', name:'Vinilo microperforado', category:'Impresión por m²', unit:'m²', prices:printPrices(17000,23400,29900,24700,32800,41800,32100,42600,54300), desc:'Permite visión desde el interior' },
  { id:'clear', name:'Vinilo Clear / transparente LG', category:'Impresión por m²', unit:'m²', prices:printPrices(11000,17000,23400,15500,23700,32800,20200,30800,42600), desc:'Para vidrieras y fondos transparentes' },
  { id:'lona-front', name:'Lona Front 13 oz', category:'Impresión por m²', unit:'m²', prices:printPrices(11700,17700,24200,15600,24800,33800,21600,32200,43800), desc:'Lona resistente para carteles y banners', popular:false },
  { id:'lona-back', name:'Lona Back Light', category:'Impresión por m²', unit:'m²', prices:printPrices(16400,25000,32100,23200,35000,44900,30200,45500,58100), desc:'Para carteles retroiluminados' },
  { id:'lona-front7', name:'Lona Front 7 oz', category:'Impresión por m²', unit:'m²', prices:printPrices(9700,15500,21700,13700,21600,30400,17800,28100,39500), desc:'Lona liviana para interior' },
  { id:'esmerilado-imp', name:'Esmerilado impreso', category:'Impresión por m²', unit:'m²', prices:printPrices(18400,24600,30900,26100,34100,43200,33800,44400,56100), desc:'Privacidad con diseño personalizado' },
  { id:'iman-imp', name:'Imán 1,20 m impreso', category:'Impresión por m²', unit:'m²', prices:printPrices(50100,56100,62800,71200,78600,87600,92500,102100,113900), desc:'Se cobra el ancho total' },
  { id:'suncatcher', name:'Vinilo SUNCATCHER Clear NEW', category:'Especiales UV por m²', unit:'m²', uvOnly:true, prices:printPrices(null,31700,40000,null,46200,56000,null,60000,72700), desc:'Material especial disponible sólo en UV' },
  { id:'tornasolado', name:'Vinilo tornasolado Clear NEW', category:'Especiales UV por m²', unit:'m²', uvOnly:true, prices:printPrices(null,29400,35700,null,43200,48100,null,56200,62800), desc:'Efecto tornasolado decorativo' },
  { id:'broken', name:'Vinilo Broken Glass Clear NEW', category:'Especiales UV por m²', unit:'m²', uvOnly:true, prices:printPrices(null,34200,40500,null,47900,54600,null,62200,71000), desc:'Efecto vidrio quebrado' },
  { id:'glitter', name:'Vinilo glitter', category:'Especiales UV por m²', unit:'m²', uvOnly:true, prices:printPrices(null,29400,35700,null,39700,48100,null,51600,62800), desc:'Terminación brillante con destellos' },
  { id:'espejado', name:'Vinilo espejado cepillado Silver / Gold', category:'Especiales UV por m²', unit:'m²', uvOnly:true, prices:printPrices(null,48400,54700,null,66800,73800,null,86900,95800), desc:'Acabado espejado dorado o plateado' },
  { id:'martele', name:'Martelé rollo 50 cm ancho', category:'Especiales UV por m²', unit:'m²', uvOnly:true, prices:printPrices(null,23300,29400,null,32200,41100,null,41800,53500), desc:'Textura martelé para impresión UV' },
  { id:'reflectivo', name:'Reflectivo blanco 1,20 m ancho', category:'Especiales UV por m²', unit:'m²', uvOnly:true, prices:printPrices(null,31300,39400,null,46300,55100,null,60200,71500), desc:'Alta visibilidad nocturna' },
  { id:'tela', name:'Tela bandera 1,50 m ancho', category:'Impresión por m²', unit:'m²', prices:printPrices(25600,31300,37300,36400,43700,50300,47300,56800,65400), desc:'Tela liviana para banderas' },
  { id:'ecocuero', name:'Ecocuero 1,40 m ancho', category:'Impresión por m²', unit:'m²', prices:printPrices(11200,21900,27500,null,30100,38500,null,39100,50100), desc:'Textura símil cuero personalizada' },

  // Terminaciones y productos
  { id:'corte-recto', name:'Corte recto por m²', category:'Terminaciones', unit:'m²', independent:true, prices:prices(4500,null,6400,null,8300,null), desc:'Corte recto del material' },
  { id:'troquel', name:'Troquel por m²', category:'Terminaciones', unit:'m²', independent:true, prices:prices(6700,null,9600,null,12400,null), desc:'Corte de contorno' },
  { id:'laca', name:'Laca UV', category:'Terminaciones', unit:'m²', independent:true, prices:prices(22900,null,32500,null,42300,null), desc:'Protección y acabado con laca UV' },
  { id:'banner', name:'Banner 0,90 × 1,90 + portabanner', category:'Productos listos', unit:'u.', fixed:true, prices:printPrices(58900,69100,80200,83600,95400,111400,100300,114500,133700), desc:'Gráfica armada con estructura' },
  { id:'bolsillos', name:'Armado de bolsillos', category:'Terminaciones', unit:'ml', billing:'linear', independent:true, prices:prices(2300,null,3200,null,4100,null), desc:'Armado de bolsillos por metro lineal' },
  { id:'domes', name:'DOMES UV digital con troquel', category:'Productos listos', unit:'u.', fixed:true, uvOnly:true, prices:printPrices(null,null,30500,null,null,42650,null,null,55300), desc:'Etiqueta resinada con troquel incluido' },

  // Vinilos de corte: 10 cm × ancho del material, costo por metro lineal
  { id:'corte-economico', name:'Colores comunes económico', category:'Vinilos de corte', unit:'ml', billing:'linear', independent:true, prices:prices(18220,null,22770,null,29600,null), desc:'Vinilo de corte, costo por metro lineal' },
  { id:'corte-oracal651', name:'Colores comunes Oracal 651', category:'Vinilos de corte', unit:'ml', billing:'linear', independent:true, prices:prices(27130,null,33910,null,44060,null), desc:'Vinilo de corte Oracal 651 por metro lineal' },
  { id:'corte-fluo', name:'Colores flúo y transparentes', category:'Vinilos de corte', unit:'ml', billing:'linear', independent:true, prices:prices(62000,null,77500,null,100750,null), desc:'Vinilo de corte especial por metro lineal' },
  { id:'corte-reflectivo', name:'Reflectivos', category:'Vinilos de corte', unit:'ml', billing:'linear', independent:true, prices:prices(24800,null,31000,null,40300,null), desc:'Vinilo reflectivo de corte por metro lineal' },
  { id:'corte-poliester', name:'Poliéster dorado y plateado', category:'Vinilos de corte', unit:'ml', billing:'linear', independent:true, prices:prices(31390,null,39240,null,51010,null), desc:'Poliéster de corte por metro lineal' },
  { id:'corte-esmerilado60', name:'Esmerilado 0,60', category:'Vinilos de corte', unit:'ml', billing:'linear', independent:true, prices:prices(13820,null,17270,null,22450,null), desc:'Esmerilado de corte por metro lineal' },
  { id:'corte-esmerilado120', name:'Esmerilado 1,20', category:'Vinilos de corte', unit:'ml', billing:'linear', independent:true, prices:prices(25110,null,31390,null,40810,null), desc:'Esmerilado de corte por metro lineal' },

  // Material sin corte, costo por metro lineal
  { id:'ml-clear', name:'Clear para protección', category:'Material sin corte', unit:'ml', billing:'linear', independent:true, prices:prices(11240,null,14050,null,18270,null), desc:'Material sin corte por metro lineal' },
  { id:'ml-esmerilado60', name:'Esmerilado 0,60 sin corte', category:'Material sin corte', unit:'ml', billing:'linear', independent:true, prices:prices(8060,null,10080,null,13100,null), desc:'Material sin corte por metro lineal' },
  { id:'ml-esmerilado120', name:'Esmerilado 1,20 sin corte', category:'Material sin corte', unit:'ml', billing:'linear', independent:true, prices:prices(14650,null,18310,null,23810,null), desc:'Material sin corte por metro lineal' },
  { id:'ml-oracal100-bn', name:'Vinilo Oracal 100 blanco y negro', category:'Material sin corte', unit:'ml', billing:'linear', independent:true, prices:prices(11660,null,14570,null,18950,null), desc:'Material sin corte por metro lineal' },
  { id:'ml-oracal100-color', name:'Oracal 100 colores', category:'Material sin corte', unit:'ml', billing:'linear', independent:true, prices:prices(11660,null,14570,null,18950,null), desc:'Material sin corte por metro lineal' },
  { id:'ml-oracal651-bn', name:'Vinilo Oracal 651 blanco y negro', category:'Material sin corte', unit:'ml', billing:'linear', independent:true, prices:prices(16820,null,21030,null,27330,null), desc:'Material sin corte por metro lineal' },
  { id:'ml-oracal651-color', name:'Oracal 651 colores', category:'Material sin corte', unit:'ml', billing:'linear', independent:true, prices:prices(16170,null,20210,null,26380,null), desc:'Material sin corte por metro lineal' },
  { id:'ml-fluo', name:'Flúo y transparentes sin corte', category:'Material sin corte', unit:'ml', billing:'linear', independent:true, prices:prices(45570,null,56970,null,74060,null), desc:'Material especial por metro lineal' },
  { id:'ml-poliester', name:'Poliéster dorado y plateado sin corte', category:'Material sin corte', unit:'ml', billing:'linear', independent:true, prices:prices(18600,null,23250,null,30230,null), desc:'Material por metro lineal' },
  { id:'ml-iman-adh', name:'Imán adhesivo', category:'Material sin corte', unit:'ml', billing:'linear', independent:true, prices:prices(18600,null,23250,null,30230,null), desc:'Imán adhesivo por metro lineal' },
  { id:'ml-iman-vehicular', name:'Imán vehicular', category:'Material sin corte', unit:'ml', billing:'linear', independent:true, prices:prices(27900,null,34880,null,45340,null), desc:'Imán vehicular por metro lineal' },
  { id:'ml-reflectivo-abeja', name:'Vinilo reflectivo panel de abeja', category:'Material sin corte', unit:'ml', billing:'linear', independent:true, prices:prices(59990,null,74990,null,97480,null), desc:'Por pedido, costo por metro lineal' },

  // Materiales rígidos sin impresión
  { id:'pvc3', name:'PVC espumado 3 mm', category:'Materiales rígidos', unit:'m²', independent:true, prices:prices(19010,null,23770,null,30890,null), desc:'Placa liviana sin impresión' },
  { id:'pvc5', name:'PVC espumado 5 mm', category:'Materiales rígidos', unit:'m²', independent:true, prices:prices(35750,null,44690,null,58100,null), desc:'Placa rígida sin impresión' },
  { id:'alto-impacto', name:'Alto impacto 1 mm', category:'Materiales rígidos', unit:'m²', independent:true, prices:prices(25580,null,31970,null,41560,null), desc:'Placa plástica flexible' },
  { id:'foam', name:'Foam Board 5 mm', category:'Materiales rígidos', unit:'m²', independent:true, prices:prices(12030,null,15040,null,19550,null), desc:'Placa ultraliviana para interior' },
  { id:'corrugado2', name:'Corrugado plástico 2 mm', category:'Materiales rígidos', unit:'m²', independent:true, prices:prices(10380,null,13030,null,16940,null), desc:'Placa económica y resistente' },

  // Portabanners sin impresión
  { id:'tensores', name:'2 tensores reforzados', category:'Portabanners sin impresión', unit:'u.', fixed:true, independent:true, prices:prices(34720,null,43400,null,56420,null), desc:'Estructura con dos tensores' },
  { id:'rollup', name:'Roll Up', category:'Portabanners sin impresión', unit:'u.', fixed:true, independent:true, prices:prices(44640,null,55800,null,72540,null), desc:'Estructura exhibidora enrollable' },

  // Colocación (sólo figura en lista Público)
  { id:'colocacion-simple', name:'Colocación simple', category:'Colocación', unit:'m²', independent:true, publicoOnly:true, prices:prices(null,null,null,null,1440,null), desc:'Colocación simple por m²' },
  { id:'colocacion-compleja', name:'Colocación compleja', category:'Colocación', unit:'m²', independent:true, publicoOnly:true, prices:prices(null,null,null,null,1790,null), desc:'Murales, esmerilados cortados y trabajos complejos' },
]

export const presets = [
  { label:'50 × 50', w:50, h:50 },
  { label:'70 × 100', w:70, h:100 },
  { label:'100 × 100', w:100, h:100 },
  { label:'100 × 200', w:100, h:200 },
]
