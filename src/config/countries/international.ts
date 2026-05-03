import type { CountryCode, CountryConfig, MeasurementUnitSystem, SectionKey } from '../../types';
import { UK_CONFIG } from './uk';
import { US_CONFIG } from './us';

type SectionKeywordAdditions = Partial<Record<SectionKey, string[]>>;
type LabelOverrides = Partial<Record<string, string>>;

type InternationalConfigOptions = {
  base: CountryConfig;
  code: CountryCode;
  flag: string;
  label: string;
  unitSystem?: MeasurementUnitSystem;
  groupLabels?: LabelOverrides;
  sectionLabels?: Partial<Record<SectionKey, string>>;
  keywords?: SectionKeywordAdditions;
};

const unique = (values: string[]) => [...new Set(values)];

const createInternationalConfig = ({
  base,
  code,
  flag,
  label,
  unitSystem = 'metric',
  groupLabels = {},
  sectionLabels = {},
  keywords = {},
}: InternationalConfigOptions): CountryConfig => ({
  ...base,
  code,
  flag,
  label,
  measurement: {
    unitSystem,
    displayMode: 'metric',
  },
  groups: base.groups.map((group) => ({
    ...group,
    label: groupLabels[group.key] ?? group.label,
    sections: group.sections.map((section) => ({
      ...section,
      label: sectionLabels[section.key] ?? section.label,
      keywords: unique([...section.keywords, ...(keywords[section.key] ?? [])]),
    })),
  })),
});

const EUROPEAN_GROUP_LABELS: LabelOverrides = {
  food_produce: 'Fruit & Vegetables',
  food_counters: 'Fresh Counters',
  food_chillers: 'Fresh & Chilled',
  food_freezers: 'Frozen',
  food_cupboard: 'Grocery & Pantry',
  non_food_general: 'Household & Personal Care',
};

const MEXICO_GROUP_LABELS: LabelOverrides = {
  food_produce: 'Frutas y verduras',
  food_fresh: 'Frescos',
  food_freezers: 'Congelados',
  food_pantry: 'Abarrotes',
  non_food_general: 'Hogar y cuidado personal',
};

export const FR_CONFIG = createInternationalConfig({
  base: UK_CONFIG,
  code: 'fr',
  flag: '🇫🇷',
  label: 'France',
  groupLabels: {
    ...EUROPEAN_GROUP_LABELS,
    food_produce: 'Fruits et légumes',
    food_counters: 'Rayons frais',
    food_chillers: 'Frais et crèmerie',
    food_cupboard: 'Épicerie',
  },
  sectionLabels: {
    produce: 'Fruits et légumes',
    bakery_counter: 'Boulangerie',
    butcher_counter: 'Boucherie',
    fishmonger_counter: 'Poissonnerie',
    deli_counter: 'Charcuterie / Traiteur',
    chilled_milk_juice_cream: 'Crèmerie / Frais',
    tinned_jarred: 'Conserves et bocaux',
    cooking_ingredients: 'Épices, huiles et cuisine du monde',
    hot_drinks: 'Café, thé et boissons chaudes',
  },
  keywords: {
    produce: ['pomme', 'banane', 'orange', 'fraise', 'framboise', 'poire', 'pêche', 'raisin', 'tomate', 'pomme de terre', 'carotte', 'oignon', 'ail', 'salade', 'courgette', 'aubergine', 'champignon'],
    bakery_counter: ['baguette', 'pain', 'pain de mie', 'croissant', 'pain au chocolat', 'brioche', 'viennoiserie'],
    butcher_counter: ['boucherie', 'boeuf', 'bœuf', 'poulet', 'porc', 'agneau', 'steak haché', 'saucisse'],
    fishmonger_counter: ['poisson', 'saumon', 'cabillaud', 'crevettes', 'thon', 'moules'],
    deli_counter: ['charcuterie', 'jambon', 'saucisson', 'pâté', 'rillettes', 'traiteur'],
    chilled_milk_juice_cream: ['lait', 'beurre', 'yaourt', 'fromage', 'emmental', 'camembert', 'crème fraîche', 'oeufs', 'œufs'],
    tinned_jarred: ['conserve', 'haricots', 'pois chiches', 'tomates concassées', 'cornichons', 'moutarde de dijon'],
    pantry: ['riz', 'semoule', 'bouillon', 'sel', 'poivre'],
    home_baking: ['farine', 'sucre', 'levure chimique', 'levure boulangère', 'pâte feuilletée'],
    cooking_ingredients: ['huile olive', 'huile d olive', 'vinaigre', 'herbes de provence', 'paprika', 'cumin', 'curry', 'sauce soja'],
    hot_drinks: ['café', 'dosettes café', 'thé', 'tisane', 'chocolat chaud'],
    drinks: ['eau', 'eau gazeuse', 'limonade', 'sirop', 'orangina', 'oasis'],
    alcohol: ['vin rouge', 'vin blanc', 'rosé', 'champagne', 'cidre', 'pastis'],
  },
});

export const DE_CONFIG = createInternationalConfig({
  base: UK_CONFIG,
  code: 'de',
  flag: '🇩🇪',
  label: 'Germany',
  groupLabels: {
    ...EUROPEAN_GROUP_LABELS,
    food_produce: 'Obst und Gemüse',
    food_counters: 'Frischetheken',
    food_chillers: 'Kühlregal',
    food_cupboard: 'Trockensortiment',
  },
  sectionLabels: {
    produce: 'Obst und Gemüse',
    bakery_counter: 'Bäckerei',
    butcher_counter: 'Metzgerei / Fleischtheke',
    fishmonger_counter: 'Fischtheke',
    deli_counter: 'Wurst und Käse',
    chilled_milk_juice_cream: 'Molkereiprodukte / Kühlung',
    tinned_jarred: 'Konserven und Gläser',
    cooking_ingredients: 'Gewürze, Öl und internationale Küche',
    hot_drinks: 'Kaffee, Tee und Heißgetränke',
  },
  keywords: {
    produce: ['apfel', 'banane', 'orange', 'erdbeeren', 'birne', 'trauben', 'kartoffeln', 'karotte', 'zwiebel', 'knoblauch', 'salat', 'gurke', 'paprika', 'zucchini', 'aubergine', 'champignons'],
    bakery_counter: ['brot', 'brötchen', 'brezel', 'croissant', 'kuchen', 'gebäck', 'toastbrot'],
    butcher_counter: ['fleisch', 'rindfleisch', 'schweinefleisch', 'hähnchen', 'wurst', 'hackfleisch', 'schnitzel'],
    fishmonger_counter: ['fisch', 'lachs', 'kabeljau', 'garnelen', 'forelle'],
    deli_counter: ['aufschnitt', 'schinken', 'salami', 'käseaufschnitt', 'leberwurst'],
    chilled_milk_juice_cream: ['milch', 'butter', 'joghurt', 'quark', 'käse', 'sahne', 'eier', 'kefir'],
    tinned_jarred: ['konserve', 'dosentomaten', 'bohnen', 'kichererbsen', 'gurken', 'senf'],
    pantry: ['reis', 'brühe', 'salz', 'pfeffer', 'knödel'],
    home_baking: ['mehl', 'zucker', 'backpulver', 'hefe', 'vanillezucker'],
    cooking_ingredients: ['olivenöl', 'sonnenblumenöl', 'essig', 'gewürze', 'paprikapulver', 'sojasauce'],
    hot_drinks: ['kaffee', 'kaffeepads', 'tee', 'kräutertee', 'kakao'],
    drinks: ['wasser', 'sprudelwasser', 'cola', 'apfelschorle', 'fanta', 'spezi'],
    alcohol: ['bier', 'pils', 'weizenbier', 'wein', 'sekt', 'riesling'],
  },
});

export const IT_CONFIG = createInternationalConfig({
  base: UK_CONFIG,
  code: 'it',
  flag: '🇮🇹',
  label: 'Italy',
  groupLabels: {
    ...EUROPEAN_GROUP_LABELS,
    food_produce: 'Frutta e verdura',
    food_counters: 'Banchi freschi',
    food_chillers: 'Freschi',
    food_cupboard: 'Dispensa',
  },
  sectionLabels: {
    produce: 'Frutta e verdura',
    bakery_counter: 'Pane e forno',
    butcher_counter: 'Macelleria',
    fishmonger_counter: 'Pescheria',
    deli_counter: 'Salumi e gastronomia',
    chilled_milk_juice_cream: 'Latte, formaggi e freschi',
    tinned_jarred: 'Conserve e vasetti',
    cooking_ingredients: 'Condimenti, spezie e cucina etnica',
    hot_drinks: 'Caffè, tè e bevande calde',
  },
  keywords: {
    produce: ['mela', 'banana', 'arancia', 'fragole', 'pera', 'uva', 'pomodoro', 'patate', 'carote', 'cipolla', 'aglio', 'insalata', 'zucchine', 'melanzane', 'funghi'],
    bakery_counter: ['pane', 'focaccia', 'ciabatta', 'grissini', 'cornetto', 'brioche'],
    butcher_counter: ['macelleria', 'manzo', 'pollo', 'maiale', 'salsiccia', 'carne macinata', 'prosciutto cotto'],
    fishmonger_counter: ['pesce', 'salmone', 'merluzzo', 'tonno', 'gamberi', 'cozze'],
    deli_counter: ['salumi', 'prosciutto', 'salame', 'mortadella', 'bresaola', 'gastronomia'],
    chilled_milk_juice_cream: ['latte', 'burro', 'yogurt', 'formaggio', 'mozzarella', 'parmigiano', 'ricotta', 'uova', 'panna'],
    tinned_jarred: ['conserve', 'pomodori pelati', 'passata', 'ceci', 'fagioli', 'tonno in scatola', 'olive'],
    pantry: ['riso', 'polenta', 'brodo', 'sale', 'pepe'],
    home_baking: ['farina', 'zucchero', 'lievito', 'cacao', 'gocce di cioccolato'],
    cooking_ingredients: ['olio extravergine', 'olio d oliva', 'aceto balsamico', 'origano', 'basilico', 'spezie', 'salsa di soia'],
    hot_drinks: ['caffè', 'caffe', 'capsule caffè', 'tè', 'te', 'camomilla'],
    drinks: ['acqua', 'acqua frizzante', 'aranciata', 'chinotto', 'succo'],
    alcohol: ['vino rosso', 'vino bianco', 'prosecco', 'birra', 'aperol', 'limoncello'],
    pasta: ['spaghetti', 'penne', 'fusilli', 'rigatoni', 'tagliatelle', 'tortellini', 'gnocchi'],
  },
});

export const BE_CONFIG = createInternationalConfig({
  base: UK_CONFIG,
  code: 'be',
  flag: '🇧🇪',
  label: 'Belgium',
  groupLabels: {
    ...EUROPEAN_GROUP_LABELS,
    food_produce: 'Fruit & Groenten / Fruits et légumes',
    food_counters: 'Fresh Counters / Rayons frais',
    food_chillers: 'Fresh & Chilled / Frais',
    food_cupboard: 'Grocery / Épicerie',
  },
  sectionLabels: {
    produce: 'Fruit & Groenten',
    bakery_counter: 'Bakkerij / Boulangerie',
    butcher_counter: 'Slagerij / Boucherie',
    fishmonger_counter: 'Vis / Poissonnerie',
    deli_counter: 'Charcuterie / Traiteur',
    chilled_milk_juice_cream: 'Zuivel / Crèmerie',
    tinned_jarred: 'Conserven / Conserves',
    cooking_ingredients: 'Kruiden, olie en wereldkeuken',
    hot_drinks: 'Koffie, thee en warme dranken',
  },
  keywords: {
    produce: ['appel', 'pomme', 'banaan', 'banane', 'sinaasappel', 'fraise', 'aardbei', 'tomaat', 'tomate', 'aardappel', 'pomme de terre', 'wortel', 'carotte', 'ui', 'oignon', 'sla', 'salade', 'champignon'],
    bakery_counter: ['brood', 'pain', 'stokbrood', 'baguette', 'croissant', 'pistolet', 'koffiekoek'],
    butcher_counter: ['slagerij', 'boucherie', 'rundvlees', 'boeuf', 'kip', 'poulet', 'varkensvlees', 'porc', 'gehakt'],
    fishmonger_counter: ['vis', 'poisson', 'zalm', 'saumon', 'kabeljauw', 'cabillaud', 'garnalen', 'crevettes'],
    deli_counter: ['charcuterie', 'ham', 'jambon', 'salami', 'prepare', 'préparé'],
    chilled_milk_juice_cream: ['melk', 'lait', 'boter', 'beurre', 'yoghurt', 'yaourt', 'kaas', 'fromage', 'eieren', 'oeufs'],
    tinned_jarred: ['conserven', 'conserve', 'bonen', 'haricots', 'kikkererwten', 'pois chiches', 'mosterd', 'moutarde'],
    pantry: ['rijst', 'riz', 'bouillon', 'zout', 'sel', 'peper', 'poivre'],
    home_baking: ['bloem', 'farine', 'suiker', 'sucre', 'bakpoeder', 'levure chimique', 'gist', 'levure'],
    cooking_ingredients: ['olijfolie', 'huile olive', 'azijn', 'vinaigre', 'specerijen', 'épices', 'sojasaus', 'sauce soja'],
    hot_drinks: ['koffie', 'café', 'thee', 'thé', 'chocolademelk', 'chocolat chaud'],
    drinks: ['water', 'eau', 'spuitwater', 'eau pétillante', 'cola', 'limonade'],
    alcohol: ['bier', 'bière', 'trappist', 'tripel', 'wijn', 'vin', 'cava'],
  },
});

export const ES_CONFIG = createInternationalConfig({
  base: UK_CONFIG,
  code: 'es',
  flag: '🇪🇸',
  label: 'Spain',
  groupLabels: {
    ...EUROPEAN_GROUP_LABELS,
    food_produce: 'Fruta y verdura',
    food_counters: 'Mostradores frescos',
    food_chillers: 'Refrigerados',
    food_cupboard: 'Despensa',
  },
  sectionLabels: {
    produce: 'Fruta y verdura',
    bakery_counter: 'Panadería',
    butcher_counter: 'Carnicería',
    fishmonger_counter: 'Pescadería',
    deli_counter: 'Charcutería',
    chilled_milk_juice_cream: 'Lácteos y refrigerados',
    tinned_jarred: 'Conservas y frascos',
    cooking_ingredients: 'Aceites, especias y cocina internacional',
    hot_drinks: 'Café, té y bebidas calientes',
  },
  keywords: {
    produce: ['manzana', 'plátano', 'platano', 'naranja', 'fresas', 'pera', 'uva', 'tomate', 'patata', 'zanahoria', 'cebolla', 'ajo', 'lechuga', 'calabacín', 'berenjena', 'champiñones'],
    bakery_counter: ['pan', 'barra de pan', 'baguette', 'croissant', 'bollería', 'magdalenas'],
    butcher_counter: ['carnicería', 'carne', 'ternera', 'pollo', 'cerdo', 'cordero', 'carne picada', 'chorizo'],
    fishmonger_counter: ['pescado', 'salmón', 'merluza', 'bacalao', 'atún', 'gambas', 'mejillones'],
    deli_counter: ['charcutería', 'jamón', 'jamón serrano', 'jamón cocido', 'salchichón', 'queso manchego'],
    chilled_milk_juice_cream: ['leche', 'mantequilla', 'yogur', 'queso', 'manchego', 'nata', 'huevos', 'zumo'],
    tinned_jarred: ['conservas', 'tomate triturado', 'garbanzos', 'alubias', 'aceitunas', 'atún en lata'],
    pantry: ['arroz', 'caldo', 'sal', 'pimienta'],
    home_baking: ['harina', 'azúcar', 'levadura', 'cacao'],
    cooking_ingredients: ['aceite de oliva', 'aceite', 'vinagre', 'pimentón', 'azafrán', 'comino', 'salsa soja'],
    hot_drinks: ['café', 'capsulas café', 'té', 'infusión', 'chocolate caliente'],
    drinks: ['agua', 'agua con gas', 'refresco', 'cola', 'fanta', 'zumo'],
    alcohol: ['vino tinto', 'vino blanco', 'cava', 'cerveza', 'sidra', 'sangría'],
  },
});

export const RO_CONFIG = createInternationalConfig({
  base: UK_CONFIG,
  code: 'ro',
  flag: '🇷🇴',
  label: 'Romania',
  groupLabels: {
    ...EUROPEAN_GROUP_LABELS,
    food_produce: 'Fructe și legume',
    food_counters: 'Raioane proaspete',
    food_chillers: 'Proaspete și refrigerate',
    food_cupboard: 'Cămara',
  },
  sectionLabels: {
    produce: 'Fructe și legume',
    bakery_counter: 'Brutărie',
    butcher_counter: 'Măcelărie',
    fishmonger_counter: 'Pește',
    deli_counter: 'Mezeluri / Delicatese',
    chilled_milk_juice_cream: 'Lactate și refrigerate',
    tinned_jarred: 'Conserve și borcane',
    cooking_ingredients: 'Condimente, uleiuri și ingrediente',
    hot_drinks: 'Cafea, ceai și băuturi calde',
  },
  keywords: {
    produce: ['măr', 'mar', 'banană', 'banana', 'portocală', 'capsuni', 'căpșuni', 'pară', 'pere', 'struguri', 'roșii', 'rosii', 'cartofi', 'morcovi', 'ceapă', 'ceapa', 'usturoi', 'salată', 'salata', 'dovlecei', 'vinete', 'ciuperci'],
    bakery_counter: ['pâine', 'paine', 'chifle', 'covrigi', 'cozonac', 'cornuri'],
    butcher_counter: ['carne', 'vită', 'vita', 'pui', 'porc', 'miel', 'carne tocată', 'carnati', 'cârnați'],
    fishmonger_counter: ['pește', 'peste', 'somon', 'cod', 'ton', 'creveți', 'creveti'],
    deli_counter: ['mezeluri', 'șuncă', 'sunca', 'salam', 'cașcaval', 'cascaval'],
    chilled_milk_juice_cream: ['lapte', 'unt', 'iaurt', 'brânză', 'branza', 'smântână', 'smantana', 'ouă', 'oua'],
    tinned_jarred: ['conserve', 'fasole', 'năut', 'naut', 'roșii la conservă', 'rosii la conserva', 'murături', 'muraturi'],
    pantry: ['orez', 'mălai', 'malai', 'sare', 'piper', 'cuburi supă', 'cuburi supa'],
    home_baking: ['făină', 'faina', 'zahăr', 'zahar', 'praf de copt', 'drojdie'],
    cooking_ingredients: ['ulei', 'ulei de măsline', 'otet', 'oțet', 'boia', 'condimente', 'sos de soia'],
    hot_drinks: ['cafea', 'ceai', 'ceai verde', 'ciocolată caldă', 'ciocolata calda'],
    drinks: ['apă', 'apa', 'apă minerală', 'apa minerala', 'suc', 'cola'],
    alcohol: ['bere', 'vin roșu', 'vin rosu', 'vin alb', 'țuică', 'tuica', 'palincă', 'palinca'],
  },
});

export const MX_CONFIG = createInternationalConfig({
  base: US_CONFIG,
  code: 'mx',
  flag: '🇲🇽',
  label: 'Mexico',
  groupLabels: MEXICO_GROUP_LABELS,
  sectionLabels: {
    produce: 'Frutas y verduras',
    bakery_counter: 'Panadería',
    butcher_counter: 'Carnicería',
    seafood_counter: 'Pescadería',
    deli_counter: 'Salchichonería / Comida preparada',
    chilled_milk_juice_cream: 'Lácteos y refrigerados',
    tinned_jarred: 'Enlatados y abarrotes',
    cooking_ingredients: 'Aceites, especias y cocina mexicana',
    hot_drinks: 'Café, té y bebidas calientes',
    baby_food: 'Bebé y fórmula',
    baby: 'Pañales y bebé',
  },
  keywords: {
    produce: ['manzana', 'plátano', 'platano', 'naranja', 'limón', 'limon', 'aguacate', 'jitomate', 'tomate verde', 'tomate', 'papa', 'zanahoria', 'cebolla', 'ajo', 'chile', 'jalapeño', 'jalapeno', 'cilantro', 'nopales', 'elote'],
    bakery_counter: ['pan dulce', 'bolillo', 'telera', 'concha', 'tortillas', 'tortilla de maiz', 'tortillas de maíz', 'pan de caja'],
    butcher_counter: ['carnicería', 'carne', 'res', 'pollo', 'cerdo', 'arrachera', 'carne molida', 'chorizo'],
    seafood_counter: ['pescado', 'salmón', 'atun', 'atún', 'camarón', 'camaron', 'tilapia'],
    deli_counter: ['jamón', 'jamon', 'salchicha', 'salchichas', 'queso Oaxaca', 'queso manchego', 'pollo rostizado'],
    chilled_milk_juice_cream: ['leche', 'mantequilla', 'yogur', 'queso', 'queso fresco', 'crema', 'huevos'],
    tinned_jarred: ['frijoles', 'frijoles negros', 'frijoles refritos', 'maíz en lata', 'maiz en lata', 'salsa verde', 'salsa roja', 'chiles enlatados'],
    pantry: ['arroz', 'caldo', 'sal', 'pimienta'],
    home_baking: ['harina', 'azúcar', 'azucar', 'levadura', 'harina de maiz', 'harina de maíz'],
    cooking_ingredients: ['aceite', 'aceite de oliva', 'vinagre', 'comino', 'orégano', 'oregano', 'achiote', 'mole', 'salsa soja', 'salsa de soya'],
    hot_drinks: ['café', 'cafe', 'chocolate abuelita', 'té', 'te'],
    drinks: ['agua', 'agua mineral', 'refresco', 'coca cola', 'jarritos', 'boing', 'jumex'],
    alcohol: ['cerveza', 'tequila', 'mezcal', 'vino tinto', 'vino blanco'],
    baby_food: ['fórmula bebé', 'formula bebe', 'papilla', 'gerber'],
    baby: ['pañales', 'panales', 'toallitas húmedas', 'toallitas humedas'],
  },
});

export const NL_CONFIG = createInternationalConfig({
  base: UK_CONFIG,
  code: 'nl',
  flag: '🇳🇱',
  label: 'Netherlands',
  groupLabels: {
    ...EUROPEAN_GROUP_LABELS,
    food_produce: 'Groente en fruit',
    food_counters: 'Versafdelingen',
    food_chillers: 'Koeling',
    food_cupboard: 'Kruidenierswaren',
  },
  sectionLabels: {
    produce: 'Groente en fruit',
    bakery_counter: 'Bakkerij',
    butcher_counter: 'Slagerij',
    fishmonger_counter: 'Vis',
    deli_counter: 'Vleeswaren / Delicatessen',
    chilled_milk_juice_cream: 'Zuivel en koeling',
    tinned_jarred: 'Conserven en potten',
    cooking_ingredients: 'Kruiden, olie en wereldkeuken',
    hot_drinks: 'Koffie, thee en warme dranken',
  },
  keywords: {
    produce: ['appel', 'banaan', 'sinaasappel', 'aardbei', 'peer', 'druiven', 'tomaat', 'aardappel', 'wortel', 'ui', 'knoflook', 'sla', 'komkommer', 'paprika', 'courgette', 'aubergine', 'champignon'],
    bakery_counter: ['brood', 'bolletjes', 'croissant', 'stokbrood', 'krentenbol', 'beschuit'],
    butcher_counter: ['slagerij', 'rundvlees', 'kip', 'varkensvlees', 'gehakt', 'worst', 'spek'],
    fishmonger_counter: ['vis', 'zalm', 'kabeljauw', 'garnalen', 'haring', 'makreel'],
    deli_counter: ['vleeswaren', 'ham', 'salami', 'kaas plakjes', 'filet americain'],
    chilled_milk_juice_cream: ['melk', 'boter', 'yoghurt', 'kwark', 'kaas', 'gouda', 'slagroom', 'eieren', 'karnemelk'],
    tinned_jarred: ['conserven', 'bonen', 'kikkererwten', 'tomatenblokjes', 'augurken', 'appelmoes', 'pindakaas'],
    pantry: ['rijst', 'bouillon', 'zout', 'peper', 'hagelslag'],
    home_baking: ['bloem', 'suiker', 'bakpoeder', 'gist', 'vanillesuiker'],
    cooking_ingredients: ['olijfolie', 'zonnebloemolie', 'azijn', 'kruiden', 'paprikapoeder', 'ketjap', 'sojasaus', 'sambal'],
    hot_drinks: ['koffie', 'koffiepads', 'thee', 'muntthee', 'chocolademelk'],
    drinks: ['water', 'spa rood', 'frisdrank', 'cola', 'sinas', 'sap'],
    alcohol: ['bier', 'pils', 'wijn', 'jenever', 'prosecco'],
  },
});
