# 💪 MindGuard Motivational Quotes Feature

## Overview
This feature displays a motivational quote notification when a user opens the app, providing daily encouragement and mental health support.

## Setup Instructions

### 1. Seed the Database with Quotes

Run one of these commands from the `backend` folder:

#### Option A: Using the Seed Script (Recommended)
```bash
node seedQuotes.js
```

#### Option B: Using the API Endpoint
```bash
curl -X POST http://localhost:5000/api/quotes/seed
```

After running one of these, you should see:
```
✅ Successfully seeded 25 motivational quotes!
✨ Database seeding completed successfully!
```

### 2. Verify Quotes in Database

Check if quotes were successfully added:
```bash
curl http://localhost:5000/api/quotes
```

Or get a random quote:
```bash
curl http://localhost:5000/api/quotes/random
```

## API Endpoints

### Get a Random Motivational Quote
```
GET /api/quotes/random
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "text": "Your life has immense value. Please don't give up.",
    "author": "Crisis Support",
    "active": true
  },
  "isDefault": false
}
```

### Get All Active Quotes
```
GET /api/quotes
```

### Seed Quotes into Database
```
POST /api/quotes/seed
```

Response:
```json
{
  "success": true,
  "message": "Successfully seeded 25 quotes",
  "count": 25
}
```

## Frontend Implementation

### How It Works
1. When user logs in and navigates to Dashboard
2. App checks if notification has been shown in this session
3. Fetches a random quote from `/api/quotes/random`
4. Displays it as a notification Alert
5. Tracks that notification was shown to prevent repeats in same session
6. When app is closed and reopened, notification shows again (new session)

### Session Tracking
- The flag is stored in `UserContext`
- Resets when user logs out
- Persists during app navigation
- Resets when app is fully closed

## Files Modified

### Backend
- `server.js` - Added `/api/quotes/*` endpoints
- `seedQuotes.js` - New script for seeding quotes
- `quotes.json` - New file with 25 motivational quotes

### Frontend
- `UserContext.tsx` - Added `quoteNotificationShown` state
- `DashboardScreen.tsx` - Added quote fetching and notification display

## Customizing Quotes

To add more quotes:

1. Edit `backend/quotes.json`
2. Add new objects with `text`, `author`, and `active` fields
3. Run seed script again:
   ```bash
   # First, manually delete old quotes in MongoDB or modify seedQuotes.js
   node seedQuotes.js
   ```

## Troubleshooting

### Quotes not showing?
1. Verify backend is running: `node server.js`
2. Check if quotes are in database: `curl http://localhost:5000/api/quotes`
3. Check frontend API URL matches backend IP/port
4. Check browser console for API errors

### Seed script fails?
1. Ensure MongoDB is running
2. Check `.env` file has correct `MONGO_URI`
3. Verify `quotes.json` file exists in backend folder

### Multiple notifications showing?
- This shouldn't happen. Session flag prevents repeats.
- Check UserContext state is being maintained

## Future Enhancements
- [ ] Daily quote scheduling
- [ ] Category-based quotes (anxiety, depression, motivation, etc.)
- [ ] User-specific quotes based on assessment results
- [ ] Push notifications instead of Alert
- [ ] Quote ratings/favorites system
- [ ] Admin dashboard to manage quotes

---
**Created:** May 19, 2026 | **MindGuard Team**
