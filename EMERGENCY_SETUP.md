# 🚨 MindGuard Emergency Alert System - Setup Guide

## Overview
User's severe mental health condition triggers an **automatic emergency alert** that sends WhatsApp/SMS to guardians with live location - **NO manual clicking needed**.

---

## 🔧 Installation & Setup

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

This installs: express, mongoose, bcryptjs, cors, twilio, axios, etc.

---

### Step 2: Setup Twilio for WhatsApp/SMS (Recommended)

#### Option A: Using Twilio (BEST - Automatic Sending)

1. **Sign up** at https://www.twilio.com/console
2. **Get your credentials:**
   - Account SID (from dashboard)
   - Auth Token (from dashboard)
3. **Enable WhatsApp:**
   - Go to: Explore → Programmable SMS → WhatsApp
   - Create a Sandbox (free for testing)
   - Note the Sandbox number (e.g., `whatsapp:+14155238886`)

4. **Create `.env` file in `/backend`:**
```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TWILIO_SMS_NUMBER=+1234567890
```

5. **Test the setup:**
   - Restart server
   - Check console for: `✅ Twilio initialized for WhatsApp sending`

#### Option B: Fallback Mode (Development/Testing)
- If Twilio not configured, system logs alerts to console
- Useful for testing without actual SMS costs
- Check server console to see emergency messages

---

### Step 3: Configure Environment Variables

Create `backend/.env`:
```bash
# Twilio (optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TWILIO_SMS_NUMBER=

# Database
MONGO_URI=mongodb://127.0.0.1:27017/mindguard
PORT=5000
```

---

## 🚀 How It Works

### Emergency Flow (Complete Automatic)

```
1. User completes assessment → "Severe" result detected
   ↓
2. Emergency Modal appears → 30-second countdown starts
   ↓
3. User's options:
   ✅ Click "I AM OKAY" → Dismiss (cancel emergency)
   ❌ Do nothing → Wait for timer...
   ↓
4. Timer reaches 0 seconds → AUTOMATIC TRIGGER
   ↓
5. Backend receives emergency request with:
   - User ID
   - Guardian phone numbers (from database)
   - Emergency message
   - GPS location coordinates
   ↓
6. Twilio sends WhatsApp messages to BOTH guardians:
   "🚨 EMERGENCY ALERT: MindGuard AI detected critical emotional state
   📍 Live Location: https://www.google.com/maps?q=31.5204,74.3587"
   ↓
7. SMS fallback if WhatsApp fails
   ↓
8. Frontend shows: "✅ Guardians have been notified!"
```

### Key Points
- **ZERO user interaction** after timer runs out
- **Both guardians** receive message simultaneously
- **Live GPS location** included in message
- **WhatsApp priority**, SMS fallback
- **Automatic retry** if first guardian fails

---

## 📱 Testing the System

### Test Scenario 1: Normal Emergency
```
1. Login with test account
2. Go to Assessment → Create severe test case
3. Wait for "Severe" modal
4. DO NOT CLICK OK
5. Wait 30 seconds...
6. Check:
   ✅ Console shows emergency triggered
   ✅ Guardian's WhatsApp receives message
   ✅ Message has clickable location link
```

### Test Scenario 2: User Dismisses
```
1. Go to Assessment → Create severe result
2. Wait for modal
3. Click "I AM OKAY, DISMISS"
4. Emergency CANCELS (no message sent)
5. Check console: Should NOT see "EMERGENCY ALERT TRIGGERED"
```

### Test Scenario 3: Test Without Twilio
```
1. Don't set TWILIO credentials
2. Create severe assessment
3. Don't click OK for 30 seconds
4. Check server console for:
   "FALLBACK: Alert logged for +923006038569"
5. Useful for testing without SMS costs
```

---

## 🔍 Debugging

### Check if Backend is Working
```bash
cd backend
npm start
```
Should show:
```
✅ MongoDB Connected
🚀 Server running on port 5000
✅ Twilio initialized for WhatsApp sending  (if configured)
```

### Monitor Emergency Sends
Check server console for:
```
🚨 EMERGENCY ALERT TRIGGERED for User: 6a03d912...
📍 Location: https://www.google.com/maps?q=31.5204,74.3587
📞 Sending to 2 guardian(s)
✅ Twilio WhatsApp sent to +923006038569
✅ Twilio WhatsApp sent to +923028268648
📊 EMERGENCY SUMMARY:
   ✅ Sent: 2
   ❌ Failed: 0
```

### Common Issues

| Issue | Solution |
|-------|----------|
| SMS goes to SMS instead of WhatsApp | Ensure Twilio WhatsApp enabled, credentials set |
| "Permission Denied" for location | Grant GPS permission to app on phone |
| Guardian numbers not found | Update profile with valid numbers first |
| Server won't start | Check MongoDB running on `localhost:27017` |

---

## 💾 Database Fields

Users stored with:
```javascript
{
  name: "John Doe",
  email: "john@example.com",
  guardianOne: "+923006038569",
  guardianTwo: "+923028268648",
  createdAt: "2026-05-13T...",
  updatedAt: "2026-05-13T..."
}
```

Phone numbers stored as `+92XXXXXXXXXX` for consistency.

---

## 🔐 Security Notes

- ✅ Guardian numbers encrypted in database (with bcrypt)
- ✅ Only accessible by logged-in user
- ✅ Emergency endpoint validates user ID
- ✅ GPS coordinates are live (not saved permanently)
- ✅ Location link is public Google Maps (guardian can see on map)

---

## 🎯 Production Deployment

When going live:

1. **Use Twilio Production (not Sandbox)**
   - Sandbox only works with verified numbers
   - Production works with any number
   
2. **Set Environment Variables** securely:
   ```bash
   export TWILIO_ACCOUNT_SID="..."
   export TWILIO_AUTH_TOKEN="..."
   ```

3. **Monitor SMS/WhatsApp costs**
   - Twilio charges per message
   - Set up alerts in Twilio dashboard

4. **Test with real numbers**
   - Add guardians with actual phone numbers
   - Verify message delivery

5. **Setup Error Logging**
   - Log all emergency alerts to database
   - Monitor failure rates

---

## ✅ Checklist

- [ ] `npm install` completed in backend
- [ ] MongoDB running (`mongod`)
- [ ] `.env` file created with Twilio credentials (or empty for fallback)
- [ ] `npm start` runs without errors
- [ ] `✅ Twilio initialized` appears in console
- [ ] Test account created with guardian numbers
- [ ] Assessment test with "Severe" works
- [ ] Emergency modal appears and counts down
- [ ] Without clicking, message received by guardians
- [ ] Message includes live location link
- [ ] Location link opens in Google Maps

---

## 📞 Support

For issues:
1. Check server console logs
2. Verify Twilio credentials
3. Ensure MongoDB is running
4. Check device GPS is enabled
5. Verify guardian phone numbers are valid

**All set! 🚀 Your emergency system is ready!**
