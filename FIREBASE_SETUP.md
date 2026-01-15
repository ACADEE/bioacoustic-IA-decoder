# Firebase Setup Guide

## 1. Database Structure

Your Firestore database has been configured with the following structure:

### Collection: `audio_prints`

Each document represents a learned audio pattern:

```json
{
  "id": "auto_generated_by_firestore",
  "created_at": 1234567890,  // Unix timestamp
  "audio_url": "https://storage.googleapis.com/...",
  "embedding_vector": [0.12, -0.45, 0.88, ...],  // 1024 dimensions from YAMNet
  "metadata": {
    "species_en": "Nightingale",  // Always in English
    "name": "Tweety",
    "intent_en": "Danger alert",  // The raw data
    "intent_fr": "Attention, danger"  // Optional: French translation
  },
  "confidence_score": 0.95
}
```

## 2. Security Rules

### To Apply Security Rules:

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **bioacoustic-ai-decoder**
3. Go to **Firestore Database** > **Rules**
4. Copy the contents of `firestore.rules` file
5. Paste and click **Publish**

### Current Rules (Development Mode):
- **Read**: Public (anyone can read audio prints)
- **Write**: Public (anyone can create new patterns)

### For Production:
You should implement Firebase Authentication and restrict write access:
```
allow create: if request.auth != null;
```

## 3. Storage Rules

### To Configure Storage:

1. Go to **Storage** in Firebase Console
2. Click on **Rules** tab
3. Use these rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /audio_files/{fileName} {
      // Anyone can read
      allow read: if true;

      // Anyone can upload (change for production)
      allow write: if true;
    }
  }
}
```

## 4. Database Indexes

For optimal performance, create these composite indexes:

1. Go to **Firestore Database** > **Indexes**
2. Create index on `audio_prints`:
   - Field: `created_at` (Descending)
   - Query scope: Collection

This index is created automatically when you run queries.

## 5. Initial Testing

To test your setup:

1. Run the application: `npm run dev`
2. Record or upload an audio file
3. Annotate it (since no patterns exist yet)
4. Check Firebase Console:
   - **Firestore**: You should see a new document in `audio_prints`
   - **Storage**: You should see the audio file in `audio_files/`

## 6. Production Checklist

Before deploying to production:

- [ ] Enable Firebase Authentication
- [ ] Update security rules to require authentication
- [ ] Add rate limiting
- [ ] Set up Firebase App Check to prevent abuse
- [ ] Configure CORS for Storage if needed
- [ ] Add error logging and monitoring
- [ ] Implement automatic translation API for French translations
- [ ] Add data validation in security rules
- [ ] Set up backup strategy for Firestore

## 7. Cost Optimization

Free tier limits (as of 2024):
- **Firestore**: 1 GB storage, 50K reads/day, 20K writes/day
- **Storage**: 5 GB storage, 1 GB/day downloads
- **Hosting**: 10 GB storage, 360 MB/day bandwidth

Monitor usage in Firebase Console > Usage and Billing.
