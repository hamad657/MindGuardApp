🚀 MINDGUARD CHATBOT - QUICK START GUIDE

=== SETUP CHECKLIST ===

1. ✅ CREATED: backend/.env file with AI_API_KEY
   - Location: d:\MindGuardApp\backend\.env
   - Already has Groq API key configured
   - Also has MongoDB connection settings

2. 📋 REQUIRED: Start MongoDB Server
   - Open NEW PowerShell/CMD terminal
   - Run: mongod
   - Wait for: "waiting for connections on port 27017"
   - Keep this terminal OPEN

3. 🔧 REQUIRED: Start Backend Server
   - Open ANOTHER terminal
   - Navigate: cd d:\MindGuardApp\backend
   - Run: npm install (if not done)
   - Run: npm start
   - Wait for: "✅ MongoDB Connected" and "🚀 Server running on port 5000"
   - Keep this terminal OPEN

4. 📱 Run Frontend
   - Use VS Code terminal to run React Native
   - Device must be on SAME WiFi as PC

5. 🧪 Test It
   - Login to app first
   - Go to ChatBot screen
   - Type a message (e.g., "Hi")
   - Check mobile console (logcat) for debug messages
   - Messages should appear on both sides

=== IF STILL NOT WORKING ===

Check Console Logs:
1. Mobile: Look for 🔍 Debug messages and 📤 Sending message
2. Backend: Look for "💾 Saving message" and "✅ Message saved"
3. API calls: All logs start with 🔗, 📤, 📥, ✅, ❌

Common Issues:
- "Failed to send message" → MongoDB or backend not running
- "userId is required" → User not logged in
- "Connection failed" → Wrong IP or device not on network

Verify Connection:
- On PC: Open http://localhost:5000 in browser
- On Phone: Open http://192.168.0.100:5000 in mobile browser
- Should load (404 is fine, means server responding)

=== FILES CREATED/UPDATED ===

✅ backend/.env - Configuration with AI_API_KEY
✅ src/utils/api.js - API utility with logging
✅ src/screens/ChatBotScreen.tsx - Chatbot with userId handling
✅ backend/server.js - Already had endpoints (no changes needed)

=== NEXT STEPS ===

1. Start MongoDB (if not running)
2. Start Backend (if not running)
3. Login to app
4. Go to Chatbot and test
5. Check console logs for any errors
6. All messages automatically save to MongoDB ✅
