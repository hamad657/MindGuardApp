🚀 MINDGUARD CHATBOT - COMPLETE SETUP GUIDE
==========================================

⚠️ IMPORTANT: Follow these steps in order!

═══════════════════════════════════════════════════════════════════

STEP 1: VERIFY MONGODB IS INSTALLED
───────────────────────────────────────

Check if MongoDB is installed:
  - Go to C:\Program Files\MongoDB (or search for mongod.exe)
  - If NOT found, download from: https://www.mongodb.com/try/download/community

═══════════════════════════════════════════════════════════════════

STEP 2: START MONGODB SERVER (KEEP THIS TERMINAL OPEN)
────────────────────────────────────────────────────

1. Open NEW PowerShell/CMD terminal
2. Copy and paste:
   
   mongod

3. Wait for this message:
   [initandlisten] Waiting for connections on port 27017

4. ✅ Leave this terminal OPEN and running!


═══════════════════════════════════════════════════════════════════

STEP 3: START BACKEND SERVER (NEW TERMINAL)
────────────────────────────────────────

1. Open ANOTHER NEW terminal
2. Navigate to backend:
   
   cd d:\MindGuardApp\backend

3. Install dependencies (if not done):
   
   npm install

4. Start the server:
   
   npm start

5. Wait for these messages:
   ✅ MongoDB Connected Successfully
   🚀 MindGuard Backend Server Started
   🌐 Server: http://localhost:5000
   📱 Mobile: http://192.168.0.100:5000

6. ✅ Leave this terminal OPEN and running!


═══════════════════════════════════════════════════════════════════

STEP 4: TEST BACKEND CONNECTION (WHILE IT'S RUNNING)
──────────────────────────────────────────────────

Open your web browser and visit:
  → http://localhost:5000

You should see:
{
  "status": "OK",
  "message": "MindGuard Backend Server is Running",
  "endpoints": {...}
}

If you see this ✅ Backend is working!
If you see error ❌ Backend didn't start - check terminal output


═══════════════════════════════════════════════════════════════════

STEP 5: RUN FRONTEND APP
─────────────────────

1. In VS Code, make sure device is connected and on SAME WiFi
2. Run:
   
   npm run android
   
   OR for iOS:
   
   npm run ios

3. Wait for app to build and install on device
4. App should open


═══════════════════════════════════════════════════════════════════

STEP 6: TEST IN APP
───────────────────

1. ✅ Login to the app first
   - Use existing account or create new one
   
2. ✅ Go to ChatBot screen (tap Chat icon at bottom)

3. ✅ Type a message: "Hi"

4. ✅ Wait for response from AI

5. ✅ Check if message appears and response comes back


═══════════════════════════════════════════════════════════════════

EXPECTED BEHAVIOR AFTER SETUP:
───────────────────────────

✅ Message appears on RIGHT side (user message) - dark green
✅ AI response appears on LEFT side (bot) - white
✅ Messages are automatically saved to MongoDB
✅ Chat history loads when you open ChatBot screen
✅ No errors in console


═══════════════════════════════════════════════════════════════════

IF YOU SEE ERRORS - TROUBLESHOOT HERE:
──────────────────────────────────

ERROR: "Network error" / "Failed to send message"
FIX: 
  1. Check MongoDB terminal - must show "Waiting for connections"
  2. Check Backend terminal - must show "✅ MongoDB Connected"
  3. Verify http://localhost:5000 works in browser
  4. On phone: check if on SAME WiFi as PC


ERROR: "Groq API key missing"
FIX:
  1. Open: d:\MindGuardApp\backend\.env
  2. Check if AI_API_KEY is set
  3. If blank, get key from: https://console.groq.com
  4. Restart backend server


ERROR: "Chat history failed"
FIX:
  1. Make sure you're logged in first
  2. Send a message first (so there's history)
  3. Check backend console for database errors
  4. Make sure MongoDB is running


ERROR: App can't reach backend
FIX:
  1. PC and phone must be on SAME WiFi
  2. Find your PC's IP address:
     - Open CMD: ipconfig
     - Look for "IPv4 Address: 192.168.x.x"
  3. If IP is different from 192.168.0.100:
     - Open: src/utils/api.js
     - Change API_URLS first URL to your IP:
       'http://YOUR_IP:5000'
  4. Restart app


═══════════════════════════════════════════════════════════════════

QUICK REFERENCE - WHAT SHOULD BE RUNNING:
──────────────────────────────────────

✅ Terminal 1: mongod (MongoDB database)
✅ Terminal 2: npm start (Backend server on port 5000)
✅ Device: App connected to WiFi, logged in

All 3 must be running for chatbot to work!


═══════════════════════════════════════════════════════════════════

FILES CONFIGURATION:
────────────────

backend/.env
  - AI_API_KEY=your_groq_key_here ✅ REQUIRED
  - MONGO_URI=mongodb://127.0.0.1:27017/mindguard ✅ REQUIRED

src/utils/api.js
  - API_URLS has network addresses
  - Auto-fallback if connection fails ✅

src/screens/ChatBotScreen.tsx
  - Handles user login and message sending ✅
  - Auto-loads chat history ✅

backend/server.js
  - All endpoints configured ✅
  - MongoDB connected ✅


═══════════════════════════════════════════════════════════════════

IMPORTANT NOTES:
────────────

1. NEVER close MongoDB or Backend terminals while testing
2. App must be logged in before using ChatBot
3. First message might take 3-5 seconds (normal for AI)
4. All chat history is saved to MongoDB automatically
5. If backend restarts, MongoDB connection resets (normal)


═══════════════════════════════════════════════════════════════════

SUPPORT:
────────

Check console logs:
- Mobile: Logcat (adb logcat | grep "React" or use Android Studio)
- Backend: Terminal showing all API calls with 🔗, 📤, 📥 icons
- Logs show exact errors with 🔍 Debug info


═══════════════════════════════════════════════════════════════════
