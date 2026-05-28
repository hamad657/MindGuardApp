require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const Pusher = require('pusher'); // Pusher dependency top par import kar li
const { getAIResponse } = require('./services/AIService');

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

// --- PUSHER INITIALIZATION ---
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "YOUR_PUSHER_APP_ID",
  key: process.env.PUSHER_KEY || "YOUR_PUSHER_KEY",
  secret: process.env.PUSHER_SECRET || "YOUR_PUSHER_SECRET",
  cluster: process.env.PUSHER_CLUSTER || "YOUR_PUSHER_CLUSTER",
  useTLS: true
});
console.log('✅ Pusher initialized for Motivational Realtime Quotes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mindguard';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📍 Database: ${MONGO_URI}`);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('Make sure MongoDB is running: mongod');
  });

// --- SCHEMAS ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  guardianOne: { type: String, required: true }, 
  guardianTwo: { type: String, required: true },
  profileImage: { type: String, default: null }, 
}, { timestamps: true });

const assessmentSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  phqScore: { type: Number, required: true },
  phqSeverity: { type: String, required: true },
  gadScore: { type: Number, required: true },
  gadSeverity: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  tokens: {
    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

// New Motivational Quotes Schema
const quoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String, default: "Unknown" },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Assessment = mongoose.model('Assessment', assessmentSchema);
const Message = mongoose.model('Message', messageSchema);
const Quote = mongoose.model('Quote', quoteSchema); // Registered Quote Model

const getRecentMessages = async (userId, limit = 5) => {
  const docs = await Message.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);

  return docs
    .reverse()
    .map((doc) => ({ role: doc.role, content: doc.content }));
};

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
    
    res.status(200).json({ 
      success: true, 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        guardianOne: user.guardianOne, 
        guardianTwo: user.guardianTwo,
        profileImage: user.profileImage,
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

// --- GET USER PROFILE ---
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
        profileImage: user.profileImage,
        createdAt: user.createdAt 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// --- UPDATE USER PROFILE ---
app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { guardianOne, guardianTwo } = req.body;
    
    // Validate both guardians are provided
    if (!guardianOne || !guardianTwo) {
      return res.status(400).json({ success: false, message: "Both guardian numbers are required!" });
    }
    
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

// --- CHANGE PASSWORD ---
app.put('/api/users/:userId/change-password', async (req, res) => {
  try {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Old password and new password are required!" });
    }
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found!" });
    
    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Old password is incorrect!" });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({ success: true, message: "Password changed successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// --- UPDATE PROFILE IMAGE ---
app.put('/api/users/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const { profileImage } = req.body;
    
    if (!profileImage) {
      return res.status(400).json({ success: false, message: "Profile image is required!" });
    }
    
    const user = await User.findByIdAndUpdate(
      userId, 
      { profileImage },
      { new: true }
    );
    
    if (!user) return res.status(404).json({ success: false, message: "User not found!" });
    
    res.status(200).json({ 
      success: true, 
      message: "Profile image updated successfully!",
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        profileImage: user.profileImage
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

// --- NEW API: TRIGGER REALTIME MOTIVATIONAL QUOTATION ---
app.get('/api/trigger-motivation', async (req, res) => {
  try {
    const count = await Quote.countDocuments({ active: true });
    
    if (count === 0) {
      // Fallback dummy quote text agar DB empty ho taake functionality crash na kare
      const defaultQuote = { text: "Keep moving forward, your mind matters.", author: "MindGuard AI" };
      pusher.trigger("motivation-channel", "new-quote", defaultQuote);
      return res.status(200).json({ success: true, data: defaultQuote, note: "Loaded default fallback quote" });
    }

    const randomRow = Math.floor(Math.random() * count);
    const randomQuote = await Quote.findOne({ active: true }).skip(randomRow);

    if (randomQuote) {
      pusher.trigger("motivation-channel", "new-quote", {
        text: randomQuote.text,
        author: randomQuote.author
      });
      return res.status(200).json({ success: true, data: randomQuote });
    }
    
    res.status(404).json({ success: false, message: "No active quotes found" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- EMERGENCY ALERT ENDPOINT ---
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

    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_FROM_NUMBER = process.env.TWILIO_SMS_NUMBER || '+1234567890';

    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
      console.log('📤 Sending via Twilio SMS API...\n');
      
      for (const number of guardianNumbers) {
        try {
          console.log(`📨 Sending to: ${number}`);
          
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

/**
 * AI RESPONSE ENDPOINT
 */
app.post("/api/ai-response", async (req, res) => {
  const { userId, message } = req.body;

  console.log("\n" + "=".repeat(60));
  console.log(`📨 Received Chat Message:`);
  console.log(`   userId: ${userId}`);
  console.log(`   message: ${message}`);
  console.log("=".repeat(60));

  if (!userId || !message || typeof message !== 'string' || !message.trim()) {
    console.error("❌ Validation Error: userId or message missing");
    return res.status(400).json({ 
      success: false, 
      message: "userId and non-empty message are required" 
    });
  }

  try {
    console.log(`📝 Fetching recent messages for userId: ${userId}`);
    const history = await getRecentMessages(userId, 5);
    console.log(`✅ Found ${history.length} previous messages`);

    console.log(`💾 Saving user message...`);
    const userMessage = new Message({ userId, role: 'user', content: message });
    await userMessage.save();
    console.log(`✅ User message saved with ID: ${userMessage._id}`);

    console.log(`🤖 Calling AI service...`);
    const aiResult = await getAIResponse(message, history);
    console.log(`✅ AI Response received:`, { success: aiResult.success, emergency: aiResult.emergency });

    if (aiResult.success && !aiResult.emergency) {
      const tokenData = {
        inputTokens: aiResult.tokens?.inputTokens || 0,
        outputTokens: aiResult.tokens?.outputTokens || 0,
        totalTokens: aiResult.tokens?.totalTokens || 0
      };
      console.log("💾 Saving bot message with tokens:", tokenData);
      
      const botMessage = new Message({ 
        userId, 
        role: 'assistant', 
        content: aiResult.response,
        tokens: tokenData
      });
      await botMessage.save();
      console.log("✅ Bot message saved with ID:", botMessage._id);
    } else if (aiResult.emergency) {
      console.log("🚨 Emergency detected, not saving bot response");
    } else {
      console.log("⚠️ AI request not successful:", aiResult.message);
    }

    const fullResponse = {
      success: aiResult.success,
      emergency: aiResult.emergency,
      response: aiResult.response,
      message: aiResult.message,
      tokens: aiResult.tokens || { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      history: [...history, { role: 'user', content: message }],
    };
    console.log("📤 Sending response to client\n");
    
    res.status(200).json(fullResponse);
  } catch (error) {
    console.error("❌ AI Response Error:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get AI response", 
      error: error.message 
    });
  }
});

app.get('/api/chat-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 50;
    
    console.log(`📖 Fetching chat history for userId: ${userId}, limit: ${limit}`);
    
    const messages = await Message.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    console.log(`✅ Found ${messages.length} messages`);

    res.status(200).json({
      success: true,
      data: messages.reverse(),
      message: `Found ${messages.length} messages`,
    });
  } catch (error) {
    console.error('❌ Chat History Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch chat history', 
      error: error.message,
      data: []
    });
  }
});

app.get('/api/token-usage/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({ userId, role: 'assistant' });

    const totalStats = messages.reduce((acc, msg) => ({
      inputTokens: acc.inputTokens + (msg.tokens?.inputTokens || 0),
      outputTokens: acc.outputTokens + (msg.tokens?.outputTokens || 0),
      totalTokens: acc.totalTokens + (msg.tokens?.totalTokens || 0),
      messageCount: acc.messageCount + 1
    }), { inputTokens: 0, outputTokens: 0, totalTokens: 0, messageCount: 0 });

    res.status(200).json({
      success: true,
      stats: totalStats,
      messages: messages.map(msg => ({
        content: msg.content.substring(0, 100),
        tokens: msg.tokens,
        createdAt: msg.createdAt
      }))
    });
  } catch (error) {
    console.error('❌ Token Usage Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch token usage', error: error.message });
  }
});

// --- QUOTES API ENDPOINTS ---

// Get a random motivational quote
app.get('/api/quotes/random', async (req, res) => {
  try {
    const count = await Quote.countDocuments({ active: true });
    
    if (count === 0) {
      // Return a default quote if database is empty
      const defaultQuote = {
        _id: 'default',
        text: "Keep moving forward, your mind matters. You are stronger than you think.",
        author: "MindGuard Team",
        active: true
      };
      return res.status(200).json({ success: true, data: defaultQuote, isDefault: true });
    }

    // Get random quote using aggregation
    const randomQuote = await Quote.aggregate([
      { $match: { active: true } },
      { $sample: { size: 1 } }
    ]);

    if (randomQuote.length > 0) {
      return res.status(200).json({ success: true, data: randomQuote[0], isDefault: false });
    }
    
    res.status(404).json({ success: false, message: "No active quotes found" });
  } catch (error) {
    console.error('❌ Error fetching random quote:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Seed quotes into database (for initial setup)
app.post('/api/quotes/seed', async (req, res) => {
  try {
    const existingCount = await Quote.countDocuments();
    if (existingCount > 0) {
      return res.status(200).json({ success: true, message: 'Quotes already exist in database', count: existingCount });
    }

    const motivationalQuotes = [
      { text: "Your life is a reflection of your thoughts. If you change your thinking, you change your life.", author: "Norman Vincent Peale" },
      { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
      { text: "The only way out is through.", author: "Robert Frost" },
      { text: "You don't have to carry the whole world on your shoulders. It's okay to ask for help.", author: "Unknown" },
      { text: "Your life has immense value. Please don't give up. Reach out to someone who cares about you.", author: "Crisis Support" },
      { text: "This pain feels overwhelming, but you are not alone. Help is available.", author: "Mental Health Support" },
      { text: "Take it one second at a time. Just breathe. You will get through this.", author: "Unknown" },
      { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
      { text: "Your mind is powerful. You have the strength to overcome any challenge.", author: "MindGuard Team" },
      { text: "Talking to someone about how you feel is a sign of strength, not weakness.", author: "Mental Health Expert" },
      { text: "Every day brings new opportunities for growth and healing.", author: "Unknown" },
      { text: "You are worthy of love, respect, and kindness - especially from yourself.", author: "Self-Care Expert" },
      { text: "It's completely okay to not be okay. That's why we're here to help.", author: "MindGuard Support" },
      { text: "Your story isn't over yet. There are so many chapters left to write.", author: "Unknown" },
      { text: "Progress, not perfection. Every small step forward counts.", author: "Recovery Expert" }
    ];

    const insertedQuotes = await Quote.insertMany(
      motivationalQuotes.map(q => ({ ...q, active: true }))
    );

    console.log(`✅ Seeded ${insertedQuotes.length} motivational quotes`);
    res.status(201).json({ 
      success: true, 
      message: `Successfully seeded ${insertedQuotes.length} quotes`,
      count: insertedQuotes.length
    });
  } catch (error) {
    console.error('❌ Error seeding quotes:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all quotes (for admin purposes)
app.get('/api/quotes', async (req, res) => {
  try {
    const quotes = await Quote.find({ active: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: quotes, total: quotes.length });
  } catch (error) {
    console.error('❌ Error fetching quotes:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

// --- Health Check Endpoint ---
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MindGuard Backend Server is Running',
    endpoints: {
      chat: '/api/ai-response',
      history: '/api/chat-history/:userId',
      tokens: '/api/token-usage/:userId',
      signup: '/api/signup',
      login: '/api/login',
      emergency: '/api/send-emergency-alert',
      motivation: '/api/trigger-motivation',
      changePassword: 'PUT /api/users/:userId/change-password',
      updateProfile: 'PUT /api/users/:userId/profile',
      quotes: {
        random: 'GET /api/quotes/random',
        all: 'GET /api/quotes',
        seed: 'POST /api/quotes/seed'
      }
    }
  });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 MindGuard Backend Server Started");
  console.log("=".repeat(60));
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📱 Mobile: http://192.168.0.100:${PORT}`);
  console.log(`✅ API Ready for requests`);
  console.log("=".repeat(60) + "\n");
});