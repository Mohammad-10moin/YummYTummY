const Clarifai = require('clarifai');
const express = require('express');
const multer = require("multer");
const router = express.Router();
const Restaurant = require('../models/Restaurant');

// Initialize Clarifai app with your API key
const clarifaiApp = new Clarifai.App({
  apiKey: process.env.API_KEY, // Replace with your actual API key
});

const upload = multer({ storage: multer.memoryStorage() });

// Get paginated list of restaurants
router.get('/restaurants', async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    
    // Additional query parameters for filtering and search
    const { country, averageSpend, cuisine, search } = req.query;
    
    // Build query object dynamically
    const query = {};
    
    // Filter by country (case-insensitive)
    if (country) {
      query.country = { $regex: country, $options: 'i' };
    }
    
    // Filter by average spend (assuming the field is named average_cost_for_two)
    if (averageSpend) {
      const [min, max] = averageSpend.split("-").map(Number);
      query.average_cost_for_two = { $gte: min, $lte: max };
    }
    
    
    // Filter by cuisine (assuming cuisines is an array or string field)
    if (cuisine) {
      query.cuisines = { $regex: cuisine, $options: 'i' };
    }
    
    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    // Get total count for filtered results and paginated list
    const totalRestaurants = await Restaurant.countDocuments(query);
    const results = await Restaurant.find(query)
      .skip((page - 1) * limit)
      .limit(limit);
    //  console.log(results)
    res.json({
      total: totalRestaurants,
      page,
      totalPages: Math.ceil(totalRestaurants / limit),
      results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get nearby restaurants (within 3km radius)
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, page = 1, limit = 9 } = req.query;

    // Validate latitude & longitude
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required.' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: 'Invalid latitude or longitude values.' });
    }

    // Convert page & limit to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Define GeoJSON for the location
    const userLocation = {
      type: "Point",
      coordinates: [longitude, latitude]
    };

    // Query restaurants within 3km radius using $geoWithin
    const results = await Restaurant.find({
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], 3 / 6378.1] // 3 km radius (6378.1 km = Earth radius)
        }
      }
    })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // Get total count for pagination
    const totalRestaurants = await Restaurant.countDocuments({
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], 3 / 6378.1]
        }
      }
    });

    res.json({
      total: totalRestaurants,
      page: pageNum,
      totalPages: Math.ceil(totalRestaurants / limitNum),
      results,
    });
  } catch (error) {
    console.error('Error in nearby search:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Image-based search for restaurants
router.post("/image-search", upload.single("imageFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded." });
    }

    const imageBytes = req.file.buffer.toString("base64");

    // 🔹 Call Clarifai API
    const response = await clarifaiApp.models.predict(Clarifai.FOOD_MODEL, { base64: imageBytes });

    // Extract food concepts
    const detectedFoods = response.outputs[0].data.concepts
      .filter((concept) => concept.value > 0.8) // Confidence threshold
      .map((concept) => concept.name.toLowerCase());

    // Food-to-cuisine mapping
    const foodToCuisineMap = {
      afghani: ['kebab', 'naan', 'pilaf', 'qorma', 'mantoo'],
      african: ['jollof rice', 'fufu', 'injera', 'plantains', 'peanut stew'],
      american: ['burger', 'hot dog', 'apple pie', 'fried chicken', 'barbecue'],
      andhra: ['spicy curry', 'guntur chili', 'pulihora', 'gongura', 'pappu'],
      arabian: ['shawarma', 'hummus', 'falafel', 'kebab', 'tabbouleh'],
      argentine: ['empanada', 'chimichurri', 'asado', 'dulce de leche', 'mate'],
      armenian: ['lavash', 'khorovats', 'dolma', 'harissa', 'ghapama'],
      asian: ['dumpling', 'sushi', 'noodles', 'spring roll', 'tofu'],
      asianFusion: ['bao', 'kimchi tacos', 'sushi burrito', 'pad thai', 'poke bowl'],
      assamese: ['fish curry', 'bamboo shoot', 'pitha', 'tekeli pitha', 'masor tenga'],
      australian: ['meat pie', 'lamington', 'pavlova', 'vegemite', 'bush tucker'],
      awadhi: ['biryani', 'korma', 'kabab', 'sheermal', 'nihari'],
      bbq: ['grilled meat', 'ribs', 'barbecue sauce', 'pulled pork', 'brisket'],
      bakery: ['croissant', 'bread', 'bagel', 'muffin', 'cupcake'],
      barFood: ['fries', 'wings', 'nachos', 'sliders', 'pretzel'],
      belgian: ['waffles', 'chocolate', 'mussels', 'frites', 'speculoos'],
      bengali: ['fish curry', 'rosogolla', 'mishti doi', 'shorshe ilish', 'bharta'],
      beverages: ['coffee', 'tea', 'smoothie', 'juice', 'milkshake'],
      bihari: ['litti chokha', 'sattu', 'thekua', 'chana ghugni', 'mutton curry'],
      biryani: ['biryani', 'pilaf', 'rice', 'saffron', 'raita'],
      brazilian: ['feijoada', 'pão de queijo', 'brigadeiro', 'churrasco', 'caipirinha'],
      breakfast: ['pancakes', 'eggs', 'toast', 'cereal', 'bacon'],
      british: ['fish and chips', 'shepherd’s pie', 'scones', 'roast dinner', 'pudding'],
      bubbleTea: ['tapioca pearls', 'milk tea', 'boba', 'jelly', 'matcha'],
      burger: ['burger', 'cheeseburger', 'veggie burger', 'slider', 'bun'],
      burmese: ['mohinga', 'khao suey', 'laphet', 'tofu salad', 'shan noodles'],
      cafe: ['coffee', 'sandwich', 'pastry', 'latte', 'croissant'],
      cajun: ['gumbo', 'jambalaya', 'crawfish', 'boudin', 'red beans and rice'],
      canadian: ['poutine', 'butter tart', 'tourtière', 'maple syrup', 'beaver tails'],
      cantonese: ['dim sum', 'char siu', 'wonton', 'congee', 'egg tart'],
      caribbean: ['jerk chicken', 'plantains', 'rice and peas', 'ackee', 'saltfish'],
      charcoalGrill: ['grilled chicken', 'kebab', 'smoked meat', 'charcoal roast', 'tandoori'],
      chettinad: ['chettinad chicken', 'pepper fry', 'idiyappam', 'kuzhambu', 'vadai'],
      chinese: ['noodles', 'fried rice', 'dumpling', 'sweet and sour pork', 'spring roll'],
      coffeeAndTea: ['latte', 'espresso', 'green tea', 'iced tea', 'cappuccino'],
      contemporary: ['fusion cuisine', 'plating', 'modern food', 'experimental dishes'],
      continental: ['pasta', 'steak', 'roast', 'grilled fish', 'potatoes'],
      cuban: ['cuban sandwich', 'ropa vieja', 'mojito', 'black beans', 'plantains'],
      curry: ['curry', 'masala', 'gravy', 'spices', 'naan'],
      deli: ['sandwich', 'salad', 'pickles', 'bagel', 'cold cuts'],
      desserts: ['cake', 'ice cream', 'pastry', 'chocolate', 'pudding'],
      dimSum: ['dumpling', 'bao', 'siu mai', 'spring roll', 'char siu bao'],
      diner: ['pancakes', 'burger', 'milkshake', 'fries', 'omelette'],
      drinksOnly: ['cocktail', 'mocktail', 'wine', 'beer', 'whiskey'],
      european: ['pasta', 'paella', 'crepes', 'gnocchi', 'schnitzel'],
      fastFood: ['burger', 'pizza', 'fries', 'hot dog', 'fried chicken'],
      filipino: ['adobo', 'sinigang', 'pancit', 'halo-halo', 'lechon'],
      fingerFood: ['fries', 'chicken wings', 'mozzarella sticks', 'sliders', 'samosa'],
      fishAndChips: ['fried fish', 'chips', 'tartar sauce', 'vinegar', 'peas'],
      french: ['croissant', 'baguette', 'ratatouille', 'quiche', 'macarons'],
      fusion: ['sushi burrito', 'kimchi burger', 'taco pizza', 'ramen burger', 'poke nachos'],
      german: ['bratwurst', 'sauerkraut', 'pretzel', 'schnitzel', 'black forest cake'],
      greek: ['gyros', 'tzatziki', 'moussaka', 'souvlaki', 'baklava'],
      grill: ['grilled chicken', 'barbecue', 'kebab', 'skewers', 'roast'],
      gujarati: ['dhokla', 'thepla', 'khandvi', 'undhiyu', 'fafda'],
      hawaiian: ['poke', 'spam musubi', 'kalua pork', 'haupia', 'poi'],
      healthyFood: ['salad', 'smoothie', 'avocado', 'quinoa', 'oats'],
      iceCream: ['ice cream', 'gelato', 'sundae', 'sorbet', 'milkshake'],
      indian: ['curry', 'tandoori', 'naan', 'biryani', 'samosa'],
      italian: ['pasta', 'pizza', 'risotto', 'lasagna', 'tiramisu'],
      japanese: ['sushi', 'ramen', 'tempura', 'sashimi', 'miso soup'],
      iranian: ['kebab', 'ghormeh sabzi', 'ash reshteh', 'tahdig', 'baklava'],
      irish: ['irish stew', 'soda bread', 'colcannon', 'boxty', 'shepherd’s pie'],
      izgara: ['grilled meat', 'kebab', 'lamb skewers', 'pide', 'meze'],
      kashmiri: ['rogan josh', 'yakhni', 'gushtaba', 'haakh', 'modur pulao'],
      kerala: ['appam', 'puttu', 'fish curry', 'sambar', 'avial'],
      kiwi: ['pavlova', 'hokey pokey ice cream', 'lamb roast', 'whitebait fritters'],
      korean: ['kimchi', 'bibimbap', 'bulgogi', 'tteokbokki', 'japchae'],
      latinAmerican: ['tamales', 'arepas', 'ceviche', 'empanadas', 'dulce de leche'],
      lebanese: ['hummus', 'tabbouleh', 'fattoush', 'kibbeh', 'baklava'],
      lucknowi: ['galouti kebab', 'awadhi biryani', 'sheermal', 'nihari', 'kulcha'],
      maharashtrian: ['pav bhaji', 'vada pav', 'poha', 'puran poli', 'modak'],
      malay: ['satay', 'nasi lemak', 'laksa', 'rendang', 'mee goreng'],
      malaysian: ['nasi lemak', 'char kway teow', 'laksa', 'roti canai', 'satay'],
      malwani: ['fish curry', 'sol kadhi', 'kombdi vade', 'bombil fry', 'masala bhat'],
      mangalorean: ['neer dosa', 'goli baje', 'pork bafat', 'korri rotti', 'fish gassi'],
      mediterranean: ['hummus', 'pita bread', 'falafel', 'tzatziki', 'moussaka'],
      mexican: ['taco', 'burrito', 'quesadilla', 'enchilada', 'churros'],
      middleEastern: ['shawarma', 'falafel', 'hummus', 'kebab', 'baklava'],
      mithai: ['gulab jamun', 'jalebi', 'barfi', 'ladoo', 'rasmalai'],
      modernAustralian: ['avocado toast', 'vegemite sandwich', 'lamington', 'meat pie'],
      modernIndian: ['fusion curry', 'deconstructed samosa', 'tandoori wraps', 'chutney shots'],
      moroccan: ['tagine', 'couscous', 'harira', 'briouat', 'pastilla'],
      mughlai: ['biryani', 'korma', 'seekh kebab', 'shahi tukda', 'naan'],
      naga: ['smoked pork', 'axone', 'bamboo shoot curry', 'ragi pancakes', 'fermented fish'],
      nepalese: ['momo', 'dal bhat', 'gundruk', 'sel roti', 'thukpa'],
      newAmerican: ['fusion burgers', 'quinoa bowls', 'avocado toast', 'poke bowls'],
      northEastern: ['bamboo shoot curry', 'fish tenga', 'pitha', 'fermented soybeans'],
      northIndian: ['butter chicken', 'naan', 'dal makhani', 'roti', 'paneer tikka'],
      oriya: ['pakhala bhata', 'dalma', 'chenna poda', 'saga bhaja', 'mahura'],
      pakistani: ['biryani', 'nihari', 'seekh kebab', 'halwa puri', 'karahi'],
      parsi: ['dhansak', 'salli boti', 'patra ni machhi', 'lagan nu custard'],
      patisserie: ['eclairs', 'macarons', 'croissants', 'tarts', 'profiteroles'],
      peranakan: ['laksa', 'nasi ulam', 'otak-otak', 'popiah', 'onde-onde'],
      persian: ['kebab', 'tahdig', 'ghormeh sabzi', 'ash reshteh', 'fesenjan'],
      peruvian: ['ceviche', 'lomo saltado', 'anticuchos', 'aji de gallina', 'picarones'],
      pizza: ['pepperoni pizza', 'margherita', 'deep dish', 'calzone', 'neapolitan pizza'],
      portuguese: ['bacalhau', 'piri piri chicken', 'pastel de nata', 'caldo verde'],
      pubFood: ['fish and chips', 'burgers', 'fries', 'wings', 'shepherd’s pie'],
      rajasthani: ['dal baati churma', 'gatte ki sabzi', 'ker sangri', 'laal maas'],
      ramen: ['ramen noodles', 'tonkotsu', 'shoyu ramen', 'miso ramen', 'chashu pork'],
      rawMeats: ['carpaccio', 'steak tartare', 'ceviche', 'poke', 'sushi'],
      salad: ['caesar salad', 'garden salad', 'quinoa salad', 'greek salad', 'kale salad'],
      sandwich: ['club sandwich', 'panini', 'grilled cheese', 'BLT', 'submarine sandwich'],
      scottish: ['haggis', 'scotch pie', 'shortbread', 'cullen skink', 'cranachan'],
      seafood: ['lobster', 'prawns', 'crab', 'grilled fish', 'oysters'],
      singaporean: ['chilli crab', 'laksa', 'hainanese chicken rice', 'satay'],
      soulFood: ['fried chicken', 'mac and cheese', 'collard greens', 'cornbread'],
      southAfrican: ['bobotie', 'biltong', 'malva pudding', 'boerewors', 'sosaties'],
      southAmerican: ['empanadas', 'ceviche', 'asado', 'arepas', 'dulce de leche'],
      southIndian: ['idli', 'dosa', 'sambar', 'rasam', 'uttapam'],
      southern: ['fried chicken', 'biscuits', 'grits', 'sweet tea', 'pecan pie'],
      southwestern: ['tacos', 'enchiladas', 'chili', 'cornbread', 'salsa'],
      spanish: ['paella', 'tapas', 'churros', 'gazpacho', 'tortilla espanola'],
      sriLankan: ['hoppers', 'kottu roti', 'pol sambol', 'fish curry', 'lamprais'],
      steak: ['ribeye', 'sirloin', 'filet mignon', 't-bone', 'porterhouse'],
      streetFood: ['tacos', 'samosa', 'corn dogs', 'pani puri', 'kebabs'],
      sushi: ['nigiri', 'maki', 'sashimi', 'uramaki', 'tempura rolls'],
      taiwanese: ['bubble tea', 'beef noodle soup', 'gua bao', 'stinky tofu'],
      tapas: ['patatas bravas', 'croquettes', 'meatballs', 'pimientos de padron'],
      tea: ['green tea', 'black tea', 'chai', 'oolong', 'herbal tea'],
      texMex: ['nachos', 'quesadilla', 'taco salad', 'enchiladas'],
      thai: ['pad thai', 'green curry', 'tom yum', 'papaya salad', 'mango sticky rice'],
      tibetan: ['momos', 'thukpa', 'butter tea', 'shapaley'],
      turkish: ['baklava', 'doner kebab', 'pide', 'meze', 'lahmacun'],
      vegetarian: ['vegetable curry', 'salads', 'paneer', 'lentil soup', 'tofu'],
      vietnamese: ['pho', 'banh mi', 'spring rolls', 'bun cha'],
      western: ['steak', 'pasta', 'salads', 'soups'],
      worldCuisine: ['fusion', 'international flavors', 'global dishes']
    };

    // Match cuisines
    const matchedCuisines = [];
    for (const [cuisine, foods] of Object.entries(foodToCuisineMap)) {
      if (detectedFoods.some((food) => foods.includes(food))) {
        matchedCuisines.push(cuisine);
      }
    }

    // 🔹 Pagination Parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    // Find matching restaurants
    const totalRestaurants = await Restaurant.countDocuments({
      cuisines: { $in: matchedCuisines.map((cuisine) => new RegExp(`^${cuisine}$`, "i")) },
    });

    const results = await Restaurant.find({
      cuisines: { $in: matchedCuisines.map((cuisine) => new RegExp(`^${cuisine}$`, "i")) },
    })
      .skip(skip)
      .limit(limit);

    res.json({
      message: "Image search completed",
      detectedFoods,
      matchedCuisines,
      total: totalRestaurants,
      page,
      totalPages: Math.ceil(totalRestaurants / limit),
      results,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});


// Get a single restaurant by ID (should come after all specific routes)
router.get('/restaurants/:id', async (req, res) => {
  try {
    const restaurantId = req.params.id;

    // Validate restaurant_id (must be numeric)
    if (isNaN(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurant ID. It must be a number.' });
    }

    const restaurant = await Restaurant.findOne({ restaurant_id: parseInt(restaurantId) });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant by ID:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
