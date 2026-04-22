import type { CountryConfig } from '../../types';

export const UK_CONFIG: CountryConfig = {
  code: 'uk',
  label: 'United Kingdom',
  groups: [
    {
      key: 'food_produce',
      label: 'Produce (Fruit & Veg)',
      order: 1,
      sections: [
        {
          key: 'produce',
          label: 'Produce',
          keywords: [
            'apple', 'banana', 'orange', 'grape', 'berries', 'strawberry', 'blueberry', 'raspberry', 'blackberry',
            'melon', 'pineapple', 'pear', 'peach', 'plum', 'kiwi', 'mango', 'lemon', 'lime', 'avocado', 'tomato',
            'potato', 'sweet potato', 'carrot', 'onion', 'red onion', 'spring onion', 'garlic', 'pepper', 'chilli',
            'broccoli', 'cauliflower', 'cucumber', 'lettuce', 'salad', 'spinach', 'kale', 'cabbage', 'mushroom',
            'courgette', 'aubergine', 'celery', 'leek', 'ginger', 'herbs', 'coriander', 'parsley', 'basil',
          ],
        },
      ],
    },
    {
      key: 'food_counters',
      label: 'In-store Counters',
      order: 2,
      sections: [
        {
          key: 'bakery_counter',
          label: 'Bakery',
          keywords: [
            'fresh bread', 'bread', 'roll', 'bagel', 'bun', 'croissant', 'wrap', 'tortilla', 'pitta', 'naan', 'cake',
            'muffin', 'crumpet', 'teacake', 'scone', 'brioche', 'baguette', 'pastry', 'donut', 'doughnut', 'hot cross bun',
          ],
        },
        {
          key: 'butcher_counter',
          label: 'Butcher / Meat Counter',
          keywords: ['butcher', 'beef joint', 'lamb shank', 'steak', 'pork chop', 'whole chicken'],
        },
        {
          key: 'fishmonger_counter',
          label: 'Fishmonger',
          keywords: ['fishmonger', 'fresh salmon fillet', 'fresh cod fillet', 'sea bass fillet', 'whole fish'],
        },
        {
          key: 'deli_counter',
          label: 'Deli / Delicatessen',
          keywords: [
            'deli', 'cold meats', 'sliced ham', 'pastrami', 'continental meats', 'deli cheese', 'rotisserie chicken', 'hot chicken',
          ],
        },
      ],
    },
    {
      key: 'food_chillers',
      label: 'Chillers',
      order: 3,
      sections: [
        {
          key: 'chilled_milk_juice_cream',
          label: 'Milk / Juice / Cream',
          keywords: [
            'milk', 'whole milk', 'semi skimmed milk', 'semi-skimmed milk', 'skimmed milk', 'oat milk', 'almond milk',
            'gold milk',
            'blue milk', 'green milk', 'red milk',
            'juice', 'orange juice', 'apple juice', 'mango juice', 'smoothie', 'cream', 'single cream', 'double cream',
            'whipped cream', 'whipping cream', 'butter', 'yogurt', 'yoghurt', 'cheese', 'cheddar', 'mozzarella',
            'parmesan', 'halloumi', 'egg', 'eggs', 'creme fraiche', 'crème fraîche', 'custard', 'cottage cheese',
            'soft cheese', 'sour cream', 'buttermilk', 'kefir',
          ],
        },
        {
          key: 'chilled_cooked_meat',
          label: 'Cooked Meat, Prepackaged',
          keywords: [
            'cooked ham', 'ham slices', 'wafer thin ham', 'turkey slices', 'roast beef slices', 'chicken slices', 'salami pack', 'pepperoni slices',
          ],
        },
        {
          key: 'chilled_fresh_meat',
          label: 'Fresh Meat, Prepackaged',
          keywords: [
            'minced beef', 'beef mince', 'mince', 'sausages', 'burgers', 'uncooked chicken', 'chicken thighs', 'chicken breast', 'bacon', 'pork loin', 'lamb chops',
          ],
        },
        {
          key: 'chilled_ready_meals',
          label: 'Ready Meals',
          keywords: [
            'ready meal', 'lasagna', 'lasagne', 'chilled pizza', 'fresh pizza', 'microwave meal', 'pasta bake', 'meal for one',
          ],
        },
      ],
    },
    {
      key: 'food_freezers',
      label: 'Freezers',
      order: 4,
      sections: [
        {
          key: 'frozen_veg',
          label: 'Frozen Veg',
          keywords: ['frozen veg', 'frozen vegetables', 'frozen peas', 'frozen sweetcorn', 'frozen broccoli'],
        },
        {
          key: 'frozen_ice_cream',
          label: 'Ice Cream',
          keywords: ['ice cream', 'icecream', 'ice-cream', 'gelato', 'sorbet', 'ice lolly', 'ice lollies'],
        },
        {
          key: 'frozen_fruit',
          label: 'Frozen Fruit',
          keywords: ['frozen fruit', 'frozen berries', 'frozen mango', 'frozen strawberries', 'frozen blueberries'],
        },
        {
          key: 'frozen_meals',
          label: 'Frozen Meals',
          keywords: [
            'frozen pizza', 'frozen meal', 'frozen lasagna', 'frozen lasagne', 'frozen chips', 'chips', 'waffles', 'hash brown', 'hash browns', 'fish fingers',
          ],
        },
      ],
    },
    {
      key: 'food_cupboard',
      label: 'Cupboard Staples',
      order: 5,
      sections: [
        {
          key: 'pasta',
          label: 'Pasta',
          keywords: [
            'pasta',
            'long pasta',
            'short pasta',
            'tube pasta',
            'shaped pasta',
            'filled pasta',
            'fresh pasta',
            'dry pasta',
            'spaghetti',
            'bucatini',
            'linguine',
            'fettuccine',
            'capellini',
            'angel hair',
            'penne',
            'rigatoni',
            'fusilli',
            'rotini',
            'macaroni',
            'elbows',
            'cavatappi',
            'manicotti',
            'farfalle',
            'bowties',
            'orecchiette',
            'little ears',
            'radiatore',
            'orzo',
            'ravioli',
            'tortellini',
            'gnocchi',
          ],
        },
      ],
    },
    {
      key: 'non_food_general',
      label: 'Non-Food & General Merchandise',
      order: 6,
      sections: [
        {
          key: 'clothing',
          label: 'Clothing',
          keywords: ['t shirt', 't-shirt', 'socks', 'underwear', 'school uniform', 'baby clothes', 'jeans', 'pyjamas'],
        },
        {
          key: 'household',
          label: 'Home / Household Goods',
          keywords: [
            'washing up liquid', 'detergent', 'fabric softener', 'bin bags', 'foil', 'cling film', 'baking paper', 'kitchen roll',
            'bleach', 'sponges', 'surface cleaner', 'disinfectant', 'laundry', 'dishwasher tablet', 'dishwasher tablets', 'rinse aid',
            'rubber gloves', 'bedding', 'pillow', 'duvet', 'plate', 'mug', 'pan', 'frying pan', 'storage box',
          ],
        },
        {
          key: 'health_beauty',
          label: 'Pharmacy / Health & Beauty',
          keywords: [
            'paracetamol', 'ibuprofen', 'toothpaste', 'toothbrush', 'shampoo', 'conditioner', 'soap', 'body wash', 'deodorant',
            'razor', 'toilet roll', 'shaving foam', 'mouthwash', 'hand wash', 'face wash', 'sanitary', 'tampons', 'pads',
            'skincare', 'moisturiser', 'vitamins', 'plasters',
          ],
        },
        {
          key: 'electrical',
          label: 'Electrical Goods',
          keywords: ['toaster', 'kettle', 'dvd', 'batteries', 'light bulb', 'headphones', 'extension lead'],
        },
        {
          key: 'pet_supplies',
          label: 'Pet Supplies',
          keywords: ['cat food', 'dog food', 'litter', 'pet treats', 'bird seed', 'pet toy', 'pet shampoo'],
        },
        {
          key: 'seasonal',
          label: 'Seasonal Aisle',
          keywords: ['easter egg', 'easter eggs', 'christmas decorations', 'bbq', 'barbecue', 'summer toys', 'garden games', 'halloween', 'valentines'],
        },
      ],
    },
  ],
};
