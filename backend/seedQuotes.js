require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mindguard';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    seedQuotes();
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Quote Schema (same as in server.js)
const quoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String, default: "Unknown" },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const Quote = mongoose.model('Quote', quoteSchema);

// Seed Function
const seedQuotes = async () => {
  try {
    // Check if quotes already exist
    const existingCount = await Quote.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Database already has ${existingCount} quotes. Skipping seed.`);
      console.log('💡 To re-seed, delete existing quotes first or modify this script.');
      mongoose.connection.close();
      return;
    }

    // Read quotes from JSON file
    const filePath = path.join(__dirname, 'quotes.json');
    
    if (!fs.existsSync(filePath)) {
      console.log("❌ quotes.json file not found in backend folder!");
      mongoose.connection.close();
      return;
    }

    const quotesData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`📖 Found ${quotesData.length} quotes to insert...`);

    // Insert quotes
    const result = await Quote.insertMany(quotesData);
    console.log(`✅ Successfully seeded ${result.length} motivational quotes!`);
    console.log('\n📊 Sample quotes:');
    result.slice(0, 3).forEach((q, idx) => {
      console.log(`  ${idx + 1}. "${q.text}" — ${q.author}`);
    });

    mongoose.connection.close();
    console.log('\n✨ Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during seed:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};
