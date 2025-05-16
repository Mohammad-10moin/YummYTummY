const fs = require('fs');
const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
require('dotenv').config();

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const processJSON = async () => {
  try {
    // Read and parse the JSON file
    const data = JSON.parse(fs.readFileSync('cleaned_zomato_1.json', 'utf8'));
    const batchSize = 500;
    let currentBatchSize = batchSize;
    let batch = [];

    console.log(`Processing ${data.length} records...`);

    const insertBatchWithRetry = async (batch) => {
      while (currentBatchSize > 0) {
        try {
          await Restaurant.insertMany(batch);
          console.log(`Inserted ${batch.length} records`);
          break;
        } catch (err) {
          console.error(`Batch insertion failed: ${err.message}`);
          currentBatchSize = Math.floor(currentBatchSize / 2);
          console.log(`Retrying with smaller batch size: ${currentBatchSize}`);
          if (currentBatchSize === 0) {
            console.error('Batch insertion failed completely. Skipping batch.');
          }
        }
      }
    };

    for (const [index, item] of data.entries()) {
      // Validate required fields
      if (!item.restaurant_id || !item.name || !item.address || !item.city || 
          !item.country || !item.location?.coordinates) {
        console.warn(`Skipping invalid record at index ${index}`);
        fs.appendFileSync('invalid_records.log', JSON.stringify(item) + '\n');
        continue;
      }

      // Map JSON fields to schema
      const restaurant = {
        restaurant_id: item.restaurant_id,
        name: item.name,
        address: item.address,
        city: item.city,
        country: item.country,
        cuisines: item.cuisines || [],
        average_cost_for_two: item.average_cost_for_two || 0,
        currency: item.currency || "Unknown Currency",
        has_online_delivery: item.has_online_delivery || false,
        price_range: item.price_range || 1,
        aggregate_rating: item.aggregate_rating || 0,
        votes: item.votes || 0,
        location: {
          type: 'Point',
          coordinates: item.location.coordinates
        }
      };

      batch.push(restaurant);

      // Insert batch into MongoDB when reaching batch size
      if (batch.length >= currentBatchSize) {
        await insertBatchWithRetry(batch);
        batch = [];
        currentBatchSize = batchSize; // Reset batch size for next batch
      }

      if (index % 1000 === 0) {
        console.log(`Processed ${index} records...`);
      }
    }

    // Insert remaining records
    if (batch.length > 0) {
      await insertBatchWithRetry(batch);
      console.log(`Inserted final batch of ${batch.length} records`);
    }

    console.log('Import completed');
  } catch (error) {
    console.error('Error processing JSON:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Call the function
processJSON()
  .then(() => console.log('Import process completed'))
  .catch((err) => console.error('Unexpected error during import:', err))
  .finally(() => mongoose.disconnect());
