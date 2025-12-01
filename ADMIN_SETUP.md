# Admin Portal Setup Guide

## Overview
The admin portal allows designated users to view all user accounts and their data (clients, invoices, revenue).

## Setting Up Admin Access

### 1. Create the `user_roles` Collection in Firestore

In your Firebase Console:
1. Go to Firestore Database
2. Create a new collection called `user_roles`
3. Add a document for each admin user with the following structure:

```
Document ID: (auto-generated)
Fields:
  - userId: (string) - The Firebase Auth UID of the admin user
  - role: (string) - "admin"
  - createdAt: (timestamp) - Current timestamp
```

### 2. Update Firestore Security Rules

Add the following rules to your `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User roles collection - only admins can read
    match /user_roles/{roleId} {
      allow read: if request.auth != null;
      allow write: if false; // Manually manage roles in console
    }
    
    // Allow users to read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Clients - users can manage their own, admins can read all
    match /clients/{clientId} {
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        exists(/databases/$(database)/documents/user_roles/$(request.auth.uid))
      );
      allow write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Invoices - users can manage their own, admins can read all
    match /invoices/{invoiceId} {
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        exists(/databases/$(database)/documents/user_roles/$(request.auth.uid))
      );
      allow write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Allow authenticated users to read/write their own data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow read access to public data
    match /public/{document=**} {
      allow read: if true;
    }
  }
}
```

### 3. Grant Admin Access to a User

To make a user an admin:

1. Log into Firebase Console
2. Go to Firestore Database
3. Navigate to the `user_roles` collection
4. Click "Add Document"
5. Set the fields:
   - `userId`: Copy the UID from Authentication > Users
   - `role`: Type "admin"
   - `createdAt`: Use the current timestamp

### 4. Accessing the Admin Portal

Once a user has the admin role:
1. Log into the application
2. Navigate to `/admin`
3. You'll see a dashboard with all users
4. Click "View Portal" on any user to see their complete data

## Security Notes

- ⚠️ Only users with a document in `user_roles` with `role: "admin"` can access the admin portal
- ⚠️ Admin roles should ONLY be managed manually through the Firebase Console
- ⚠️ Never allow users to write to the `user_roles` collection through the app
- ⚠️ Admins have read-only access to user data - they cannot modify it

## Admin Features

The admin portal provides:
- **Dashboard Overview**: See all users, total clients, invoices, and revenue
- **User Portals**: View individual user's complete data including:
  - Client list
  - Invoice list
  - Revenue statistics
- **Read-only Access**: Admins can view but not modify user data
