🎯 MINDGUARD CHATBOT - ACTION PLAN
==================================

⏱️  ESTIMATED TIME: 5 minutes to get working

═══════════════════════════════════════════════════════════════════

🚀 DO THIS NOW (In Order):
──────────────────────────

✅ STEP 1: Test Configuration (1 minute)
────────────────────────────

Open terminal in backend folder and run:

  cd d:\MindGuardApp\backend
  node diagnostic.js

This will check everything automatically and tell you what's wrong.


✅ STEP 2: Start MongoDB (Keep terminal open)
───────────────────────────────────────────

Open NEW PowerShell/CMD:

  mongod

Wait for: "Waiting for connections on port 27017"

✅ DO NOT CLOSE THIS TERMINAL


✅ STEP 3: Start Backend (Keep terminal open)
──────────────────────────────────────────

Open ANOTHER NEW PowerShell/CMD:

  cd d:\MindGuardApp\backend
  npm start

Wait for: "✅ MongoDB Connected Successfully"
           "🚀 MindGuard Backend Server Started"

✅ DO NOT CLOSE THIS TERMINAL


✅ STEP 4: Run Mobile App
───────────────────────

In VS Code terminal:

  npm run android

Wait for app to open on device


✅ STEP 5: Test It Works
────────────────────

1. Login to app
2. Tap 💬 Chat icon at bottom
3. Type: "Hi"
4. Press Send ▶️
5. Wait for AI response (3-5 seconds normal)

✅ IF YOU SEE RESPONSE - DONE! 🎉


═══════════════════════════════════════════════════════════════════

❌ IF IT'S NOT WORKING:
─────────────────────

Check in this order:

1️⃣ Is mongod running?
   → Terminal should show "Waiting for connections"
   → If not, start it: mongod

2️⃣ Is backend running?
   → Terminal should show "✅ MongoDB Connected"
   → If not, restart: npm start
   → Check for error messages

3️⃣ Can you reach http://localhost:5000?
   → Open in browser
   → Should see server info
   → If 404 error, server is running ✅

4️⃣ Check phone can reach backend
   → Both PC and phone on SAME WiFi?
   → Try: http://192.168.0.100:5000 on phone browser
   → If fails, check PC IP: ipconfig

5️⃣ Check backend console for errors
   → Look for 🔗 📤 📥 symbols
   → Red ❌ errors show actual problem
   → Share error message for help


═══════════════════════════════════════════════════════════════════

📚 HELPFUL COMMANDS:
───────────────────

Start MongoDB:
  mongod

Start Backend:
  cd d:\MindGuardApp\backend && npm start

Run Diagnostic:
  node d:\MindGuardApp\backend\diagnostic.js

Check Backend is responding:
  curl http://localhost:5000

View Full Setup Guide:
  d:\MindGuardApp\COMPLETE_SETUP.md


═══════════════════════════════════════════════════════════════════

✅ CHECKLIST:
────────────

Before you say "it's not working", verify:

☑️ MongoDB terminal is open and showing "Waiting for connections"
☑️ Backend terminal is open and showing "✅ MongoDB Connected"
☑️ http://localhost:5000 works in browser on PC
☑️ You are logged in to the app
☑️ Chat button is tapped (at bottom of screen)
☑️ You typed a message and pressed send
☑️ You waited 3-5 seconds for AI response


═══════════════════════════════════════════════════════════════════

📞 COMMON ERRORS & QUICK FIXES:
──────────────────────────────

"Network error" / "Connection failed"
→ mongod or backend not running
→ Check both terminals are running

"Groq API key missing"
→ Check backend/.env file has AI_API_KEY
→ Get key from: https://console.groq.com

"Please log in first"
→ You need to login before using chatbot
→ The app shows this message if not logged in

"Sorry, I encountered an error"
→ Check backend terminal for red ❌ error messages
→ Backend might have crashed
→ Restart: npm start


═══════════════════════════════════════════════════════════════════

✨ IF EVERYTHING WORKS:

✅ Messages appear immediately
✅ No error messages
✅ AI responds with helpful text  
✅ Chat history loads on screen open
✅ Messages saved to database


Then you're DONE! 🎉


═══════════════════════════════════════════════════════════════════
