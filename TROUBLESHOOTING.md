# 🔧 Quick Troubleshooting Guide

## ✅ Before You Test

1. **Backend Server Running?**
   ```bash
   cd backend
   node server.js
   ```
   Should show: `✅ MongoDB Connected Successfully`

2. **MongoDB Running?**
   Make sure MongoDB is running. You should see it in the backend server logs.

3. **Using Correct Network IP?**
   - For Android Device: Use your PC's IP (e.g., 192.168.1.15)
   - For Emulator: App will try 10.0.2.2 automatically
   - The app tries multiple IPs automatically

---

## 🚨 If Profile Image Upload Fails

**Error: "Failed to upload profile image"**

### Checklist:
1. Backend running? Check terminal for `express running on 5000`
2. MongoDB connected? Check logs
3. Image URI valid? (Should start with `file://`)
4. Network accessible? 
   - On device: Can ping PC from phone?
   - On emulator: Should auto-work

### Solution:
```bash
# Kill any existing server
taskkill /F /IM node.exe

# Restart server
cd backend
node server.js
```

---

## 🔐 If Password Change Fails

**Error: "Failed to change password" or "Old password is incorrect"**

### Checklist:
1. Old password correct? (Case-sensitive)
2. Backend running?
3. MongoDB has the user?
4. Password hash format correct?

### Debug:
1. Check backend console for error messages
2. Verify user email/ID in database
3. Confirm password is being sent (check console logs)

---

## 👥 If Guardian Update Fails

**Error: "Failed to update guardians"**

### Checklist:
1. Both fields filled? (This is validated first)
2. Numbers format correct?
3. Backend running?
4. Network connection stable?

### Solution:
Ensure both guardian fields have values:
- Guardian 1: At least 1 character
- Guardian 2: At least 1 character

---

## 🖼️ Console Logs to Check

The app now logs everything. Check React Native console or terminal:

```
📥 Fetching profile for userId: ...
✅ Profile fetched successfully

📤 Updating guardians...
✅ Guardians updated successfully

📤 Uploading profile image...
✅ Profile image updated successfully

📤 Changing password...
✅ Password changed successfully
```

If you see ❌ errors, the API call failed. Check backend.

---

## 🌐 Network Configuration

The app tries these URLs in order:
1. `http://192.168.1.15:5000` ← Update if your PC has different IP
2. `http://10.0.2.2:5000` ← Android emulator
3. `http://localhost:5000` ← Local

If all fail, you'll see detailed error in console.

### To find your PC IP:
```bash
# Windows
ipconfig

# Look for IPv4 Address under your network adapter
# Usually something like 192.168.1.x or 10.0.0.x
```

---

## 📊 Database Reset (If Needed)

If you want to test from fresh:

1. **Delete user from MongoDB:**
   ```bash
   # Use MongoDB Compass or command line
   db.users.deleteOne({email: "user@example.com"})
   ```

2. **Sign up new user in app**

3. **Test all features fresh**

---

## 📱 Testing on Real Device vs Emulator

### Android Device:
- Use your PC's local network IP
- Both phone and PC must be on same WiFi
- Disable any VPNs

### Android Emulator:
- App automatically tries `10.0.2.2` after `192.168.1.15`
- Should work automatically
- If not, update PC IP in api.js

### iOS Simulator:
- Use `localhost:5000` or `127.0.0.1:5000`
- Should work automatically

---

## 🆘 Still Not Working?

1. **Check Backend Console** for errors
2. **Check React Native Console** for network errors
3. **Verify MongoDB** is running
4. **Try restarting everything**:
   ```bash
   # Kill processes
   taskkill /F /IM node.exe

   # Restart backend
   cd backend
   node server.js
   
   # In another terminal, restart app
   npm start
   ```

5. **Clear app data** and sign up fresh
6. **Check firewall** isn't blocking port 5000

---

## ✨ Success Indicators

✅ Profile image uploads and persists
✅ Guardian numbers save to database  
✅ Password change works without re-login
✅ Help center displays all 6 numbers
✅ No errors in console
✅ All modals open/close smoothly

---

Good luck testing! Everything should work perfectly now! 🎉
