const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

// --- TWILIO SDK (Optional) ---
let twilioClient = null;
try {
  const twilio = require('twilio');
  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    console.log('✅ Twilio initialized for WhatsApp sending');
  }
} catch (err) {
  console.log('⚠️ Twilio not installed. SMS features will use fallback.');
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MONGO_URI = 'mongodb://127.0.0.1:27017/mindguard';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ Connection Error:', err));

// --- SCHEMAS ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  guardianOne: { type: String, required: true }, // Database ke mutabiq
  guardianTwo: { type: String, required: true }, // Database ke mutabiq
}, { timestamps: true });

const assessmentSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  phqScore: { type: Number, required: true },
  phqSeverity: { type: String, required: true },
  gadScore: { type: Number, required: true },
  gadSeverity: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Assessment = mongoose.model('Assessment', assessmentSchema);

// --- ROUTES ---

app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, guardianOne, guardianTwo } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) return res.status(400).json({ success: false, message: "User already exists!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email: cleanEmail, password: hashedPassword, guardianOne, guardianTwo });
    await newUser.save();
    res.status(201).json({ success: true, message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const { password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid password!" });

    const token = jwt.sign({ id: user._id }, 'YOUR_SECRET_KEY', { expiresIn: '1h' });
    
    // Yahan hum guardianOne aur guardianTwo response mein bhej rahe hain
    res.status(200).json({ 
      success: true, 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        guardianOne: user.guardianOne, 
        guardianTwo: user.guardianTwo,
        createdAt: user.createdAt 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.post('/api/save-full-assessment', async (req, res) => {
  try {
    const { userId, phqScore, phqSeverity, gadScore, gadSeverity, timestamp } = req.body;
    const newRecord = new Assessment({ 
      userId, phqScore, phqSeverity, gadScore, gadSeverity,
      timestamp: timestamp || new Date()
    });
    await newRecord.save();
    res.status(201).json({ success: true, message: "Assessment saved!", data: newRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to save assessment" });
  }
});

// --- GET USER PROFILE (Guardian numbers ke sath) ---
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found!" });
    
    res.status(200).json({ 
      success: true, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        guardianOne: user.guardianOne, 
        guardianTwo: user.guardianTwo,
        createdAt: user.createdAt 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// --- UPDATE USER PROFILE (Guardian numbers update karein) ---
app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { guardianOne, guardianTwo } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId, 
      { guardianOne, guardianTwo },
      { new: true }
    );
    
    if (!user) return res.status(404).json({ success: false, message: "User not found!" });
    
    res.status(200).json({ 
      success: true, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        guardianOne: user.guardianOne, 
        guardianTwo: user.guardianTwo
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.get('/api/get-weekly-stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const assessments = await Assessment.find({ userId }).sort({ timestamp: -1 });
    const dailyData = {};
    assessments.forEach(item => {
      const dateKey = new Date(item.timestamp).toISOString().split('T')[0];
      if (!dailyData[dateKey]) dailyData[dateKey] = item; 
    });
    res.status(200).json({ success: true, data: Object.values(dailyData) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- EMERGENCY ALERT ENDPOINT (Send WhatsApp/SMS Automatically) ---
app.post('/api/send-emergency-alert', async (req, res) => {
  try {
    const { userId, guardianNumbers, message, location } = req.body;

    if (!guardianNumbers || guardianNumbers.length === 0) {
      console.log('❌ No guardian numbers provided');
      return res.status(400).json({ success: false, message: "No guardian numbers provided" });
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚨 EMERGENCY ALERT TRIGGERED`);
    console.log(`${'='.repeat(60)}`);
    console.log(`User ID: ${userId}`);
    console.log(`📍 Location: ${location}`);
    console.log(`📞 Guardians to notify: ${guardianNumbers.length}`);
    console.log(`${'='.repeat(60)}\n`);

    const fullMessage = `${message}\n\n📍 Live Location: ${location}`;
    let sentCount = 0;
    let failedCount = 0;
    const results = [];

    // --- TWILIO SMS/WhatsApp via REST API ---
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_FROM_NUMBER = process.env.TWILIO_SMS_NUMBER || '+1234567890';

    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
      console.log('📤 Sending via Twilio SMS API...\n');
      
      for (const number of guardianNumbers) {
        try {
          console.log(`📨 Sending to: ${number}`);
          
          // Twilio REST API call
          const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
          
          const response = await axios.post(
            `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
            {
              From: TWILIO_FROM_NUMBER,
              To: number,
              Body: fullMessage
            },
            {
              headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }
          );

          if (response.status === 201 && response.data.sid) {
            console.log(`   ✅ SMS Sent! (SID: ${response.data.sid})\n`);
            sentCount++;
            results.push({ 
              number, 
              status: 'sent via SMS', 
              sid: response.data.sid,
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          console.log(`   ❌ Failed to send SMS: ${error.response?.data?.message || error.message}\n`);
          failedCount++;
          results.push({ 
            number, 
            status: 'failed', 
            error: error.response?.data?.message || error.message 
          });
        }
      }
    } else {
      // --- DEMO MODE: Log to Console ---
      console.log('⚠️  Twilio NOT configured - Running in DEMO MODE');
      console.log('📝 Messages are logged to console instead of actually sending\n');
      console.log('To enable real SMS/WhatsApp sending:');
      console.log('1. Create Twilio account at https://www.twilio.com');
      console.log('2. Set environment variables:');
      console.log('   - TWILIO_ACCOUNT_SID=your_sid');
      console.log('   - TWILIO_AUTH_TOKEN=your_token');
      console.log('   - TWILIO_SMS_NUMBER=+1234567890\n');
      
      console.log('📨 DEMO MESSAGE THAT WOULD BE SENT:\n');
      console.log(fullMessage);
      console.log('\n' + '='.repeat(60));
      
      for (const number of guardianNumbers) {
        console.log(`📌 Would send to: ${number}`);
        sentCount++;
        results.push({ 
          number, 
          status: 'demo logged (not actually sent)',
          mode: 'demo'
        });
      }
    }

    // Log the emergency event
    console.log(`\n📊 EMERGENCY SUMMARY:`);
    console.log(`   ✅ Successfully sent: ${sentCount}`);
    console.log(`   ❌ Failed: ${failedCount}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    console.log(`${'='.repeat(60)}\n`);

    res.status(200).json({
      success: sentCount > 0,
      message: sentCount > 0 
        ? `Emergency alert sent to ${sentCount} guardian(s)` 
        : "Demo mode: Messages logged to console",
      sentCount,
      failedCount,
      results,
      mode: (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) ? 'production' : 'demo',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Emergency Alert Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send emergency alert",
      error: error.message 
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));