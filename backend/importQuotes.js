const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Quote = require('./models/Quote'); // Aapka existing Quote model use kiya hai

// 1. MongoDB Connection Setup (Aapki server IP ya localhost)
const MONGO_URI = 'mongodb://127.0.0.1:27017/mindguard'; // Agar database name kuch aur hai toh change kar lein

mongoose.connect(MONGO_URI)
  .then(() => console.log('🚀 MongoDB Connected! Ready to import quotes...'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// 2. Data Import Function
const importData = async () => {
  try {
    // quotes.json file ko read karna
    const filePath = path.join(__dirname, 'quotes.json');
    
    if (!fs.existsSync(filePath)) {
      console.log("❌ Error: quotes.json file 'backend' folder me nahi mili! Pehle wo file yahan banayein.");
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    // Pehle purane quotes clear karna (optional, takay duplicate na hon)
    await Quote.deleteMany();
    console.log('🧹 Purana quotes data clear kar diya gaya hai.');

    // Naya data insert karna
    await Quote.insertMany(data);
    console.log('🎉 100 Motivational Quotes database me direct import ho chuke hain!');
    
    process.exit();
  } catch (error) {
    console.error('❌ Data import karte hue error aaya:', error);
    process.exit(1);
  }
};

// Data import function ko trigger karna jab connection handle ho jaye
mongoose.connection.once('open', () => {
  importData();
});