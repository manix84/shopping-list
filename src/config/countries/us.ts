import type { CountryConfig } from '../../types';

export const US_CONFIG: CountryConfig = {
  code: 'us',
  label: 'United States',
  groups: [
    {
      key: 'food_produce',
      label: 'Produce',
      order: 1,
      sections: [
        {
          key: 'produce',
          label: 'Produce',
          keywords: [
            'apple', 'banana', 'orange', 'grape', 'berries', 'strawberry', 'blueberry', 'raspberry', 'blackberry',
            'melon', 'pineapple', 'pear', 'peach', 'plum', 'kiwi', 'mango', 'lemon', 'lime', 'avocado', 'tomato',
            'potato', 'sweet potato', 'carrot', 'onion', 'red onion', 'spring onion', 'scallion', 'garlic', 'pepper',
            'chili', 'chile', 'broccoli', 'cauliflower', 'cucumber', 'lettuce', 'salad', 'spinach', 'kale', 'cabbage',
            'mushroom', 'zucchini', 'eggplant', 'celery', 'leek', 'ginger', 'herbs', 'cilantro', 'parsley', 'basil',
            'corn', 'sweet corn',
          ],
        },
      ],
    },
    {
      key: 'food_fresh',
      label: 'Fresh Foods',
      order: 2,
      sections: [
        {
          key: 'bakery_counter',
          label: 'Bakery',
          keywords: [
            'fresh bread', 'bread', 'roll', 'bagel', 'bun', 'croissant', 'wrap', 'tortilla', 'cake', 'muffin',
            'cookie', 'cookies', 'pie', 'donut', 'doughnut', 'baguette', 'pastry', 'sourdough', 'loaf', 'focaccia',
          ],
        },
        {
          key: 'butcher_counter',
          label: 'Meat Counter',
          keywords: [
            'butcher', 'beef roast', 'steak', 'ribeye', 'sirloin', 'ground beef', 'beef', 'pork chop', 'pork loin',
            'chicken breast', 'chicken thighs', 'whole chicken', 'turkey breast', 'lamb chops', 'bacon', 'sausage',
          ],
        },
        {
          key: 'seafood_counter',
          label: 'Seafood Counter',
          keywords: [
            'seafood', 'fish', 'salmon fillet', 'cod fillet', 'tuna steak', 'shrimp', 'prawns', 'crab', 'lobster',
            'scallops', 'tilapia', 'halibut', 'whole fish',
          ],
        },
        {
          key: 'deli_counter',
          label: 'Deli / Prepared Foods',
          keywords: [
            'deli', 'cold cuts', 'sliced ham', 'turkey slices', 'roast beef slices', 'pastrami', 'salami',
            'rotisserie chicken', 'prepared salad', 'potato salad', 'macaroni salad', 'prepared foods',
          ],
        },
        {
          key: 'chilled_milk_juice_cream',
          label: 'Dairy / Refrigerated',
          keywords: [
            'milk', 'whole milk', '2% milk', 'skim milk', 'oat milk', 'almond milk', 'soy milk', 'gold milk',
            'blue milk', 'green milk', 'red milk', 'juice', 'orange juice', 'apple juice', 'smoothie', 'cream',
            'half and half', 'whipped cream', 'butter', 'yogurt', 'yoghurt', 'cheese', 'cheddar', 'mozzarella',
            'parmesan', 'eggs', 'egg', 'cream cheese', 'sour cream', 'buttermilk', 'kefir',
          ],
        },
        {
          key: 'chilled_cooked_meat',
          label: 'Packaged Lunch Meat',
          keywords: ['ham', 'ham slices', 'turkey slices', 'roast beef slices', 'chicken slices', 'pepperoni', 'salami pack'],
        },
        {
          key: 'chilled_fresh_meat',
          label: 'Fresh Meat',
          keywords: ['minced beef', 'ground beef', 'ground turkey', 'sausages', 'burgers', 'chicken breast', 'chicken thighs', 'pork chops', 'bacon', 'lamb chops'],
        },
        {
          key: 'chilled_ready_meals',
          label: 'Prepared Meals',
          keywords: ['ready meal', 'prepared meal', 'lasagna', 'lasagne', 'frozen dinner', 'microwave meal', 'meal kit', 'family meal'],
        },
      ],
    },
    {
      key: 'food_freezers',
      label: 'Frozen Foods',
      order: 3,
      sections: [
        {
          key: 'frozen_veg',
          label: 'Frozen Vegetables',
          keywords: ['frozen veg', 'frozen vegetables', 'frozen peas', 'frozen corn', 'frozen sweetcorn', 'frozen broccoli'],
        },
        {
          key: 'frozen_ice_cream',
          label: 'Ice Cream & Frozen Treats',
          keywords: ['ice cream', 'icecream', 'ice-cream', 'gelato', 'sorbet', 'frozen dessert', 'popsicle', 'ice pop'],
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
            'frozen pizza', 'frozen meal', 'frozen lasagna', 'frozen lasagne', 'frozen fries', 'fries', 'waffles',
            'hash brown', 'hash browns', 'fish sticks', 'chicken nuggets',
          ],
        },
      ],
    },
    {
      key: 'food_pantry',
      label: 'Pantry & Grocery',
      order: 4,
      sections: [
        {
          key: 'pantry',
          label: 'Pantry Staples',
          keywords: [
            'pantry', 'canned goods', 'canned food', 'canned tomatoes', 'beans', 'rice', 'quinoa', 'couscous',
            'soup', 'broth', 'stock', 'sauce', 'tomato sauce', 'pasta sauce', 'jarred sauce', 'peanut butter', 'jam',
            'jelly', 'honey', 'syrup', 'oats', 'cereal', 'flour', 'sugar', 'baking powder', 'baking soda', 'oil',
            'olive oil', 'vinegar', 'salt', 'pepper', 'seasoning', 'coffee', 'tea',
          ],
        },
        {
          key: 'pasta',
          label: 'Pasta',
          keywords: [
            'pasta', 'spaghetti', 'bucatini', 'linguine', 'fettuccine', 'capellini', 'angel hair', 'penne',
            'rigatoni', 'fusilli', 'rotini', 'macaroni', 'elbows', 'cavatappi', 'manicotti', 'farfalle', 'bowties',
            'orecchiette', 'little ears', 'radiatore', 'orzo', 'ravioli', 'tortellini', 'gnocchi',
          ],
        },
        {
          key: 'snacks',
          label: 'Snacks & Candy',
          keywords: [
            'snacks', 'chips', 'crisps', 'crackers', 'pretzels', 'cookies', 'biscuits', 'candy', 'chocolate',
            'granola bar', 'granola bars', 'protein bar', 'nuts', 'trail mix', 'popcorn', 'tortilla chips',
          ],
        },
        {
          key: 'drinks',
          label: 'Drinks',
          keywords: [
            'drinks', 'soda', 'soft drink', 'sparkling water', 'water', 'juice', 'energy drink', 'sports drink',
            'coffee', 'tea', 'iced tea', 'lemonade', 'sports drinks', 'bottled water',
          ],
        },
      ],
    },
    {
      key: 'non_food_general',
      label: 'Home, Health & Family',
      order: 5,
      sections: [
        {
          key: 'baby',
          label: 'Baby Care',
          keywords: ['baby', 'diapers', 'nappies', 'wipes', 'formula', 'baby food', 'pacifier', 'bottle', 'baby shampoo'],
        },
        {
          key: 'clothing',
          label: 'Clothing',
          keywords: ['t shirt', 't-shirt', 'socks', 'underwear', 'school uniform', 'baby clothes', 'jeans', 'pajamas', 'pyjamas'],
        },
        {
          key: 'household',
          label: 'Home / Household Goods',
          keywords: [
            'washing up liquid', 'detergent', 'fabric softener', 'trash bags', 'foil', 'plastic wrap', 'baking paper',
            'paper towels', 'bleach', 'sponges', 'surface cleaner', 'disinfectant', 'laundry', 'dishwasher tablet',
            'dishwasher tablets', 'rinse aid', 'rubber gloves', 'bedding', 'pillow', 'duvet', 'plate', 'mug', 'pan',
            'frying pan', 'storage box',
          ],
        },
        {
          key: 'health_beauty',
          label: 'Health & Beauty',
          keywords: [
            'acetaminophen', 'ibuprofen', 'toothpaste', 'toothbrush', 'shampoo', 'conditioner', 'soap', 'body wash',
            'deodorant', 'razor', 'toilet paper', 'shaving foam', 'mouthwash', 'hand soap', 'face wash',
            'sanitary', 'tampons', 'pads', 'skincare', 'moisturizer', 'vitamins', 'bandages',
          ],
        },
        {
          key: 'electrical',
          label: 'Electrical Goods',
          keywords: ['toaster', 'kettle', 'dvd', 'batteries', 'light bulb', 'headphones', 'extension cord', 'charger'],
        },
        {
          key: 'pet_supplies',
          label: 'Pet Supplies',
          keywords: ['cat food', 'dog food', 'litter', 'pet treats', 'bird seed', 'pet toy', 'pet shampoo'],
        },
        {
          key: 'seasonal',
          label: 'Seasonal Aisle',
          keywords: ['easter egg', 'easter eggs', 'christmas decorations', 'bbq', 'barbecue', 'summer toys', 'garden games', 'halloween', 'valentines', 'thanksgiving', 'pumpkin'],
        },
      ],
    },
  ],
};
