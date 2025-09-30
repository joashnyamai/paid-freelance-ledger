# Firebase Setup Instructions

## Firestore Security Rules

To ensure your data is secure, you need to set up Firestore security rules in your Firebase console.

1. Go to your Firebase Console: https://console.firebase.google.com/
2. Select your project: `smart-car-parking-1862c`
3. Navigate to Firestore Database > Rules
4. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only the user can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Clients collection - only the owner can access
    match /clients/{clientId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
    }
    
    // Invoices collection - only the owner can access
    match /invoices/{invoiceId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
    }
    
    // Migrations collection - only the user can access their own migration status
    match /migrations/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. Click "Publish" to save the rules

## Data Migration

The app will automatically migrate any existing localStorage data to Firestore when you first log in with your Firebase account. Look for a toast notification confirming the migration.

## Authentication Setup

Make sure to enable Email/Password authentication in Firebase:

1. Go to Authentication > Sign-in method
2. Enable "Email/Password" provider
3. Save changes

Your existing account data for "nyamaibigjoash" will be automatically migrated when you first sign in with your Firebase credentials.
