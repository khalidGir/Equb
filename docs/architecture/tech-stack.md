# Architecture Overview

# **docs/architecture/tech-stack.md**

# E-Qub Tracker: Technology Stack

## **Overview**

This document defines the approved technology stack for the E-Qub Tracker application. All technology decisions are frozen for the MVP development phase.

---

## **Core Stack Decisions**

### **1. Mobile Application Framework**

**✅ APPROVED: React Native**

**Version:** React Native 0.73+ with New Architecture (optional for MVP)

**Justification:**

- **Developer Experience:** TypeScript support, large ecosystem, familiar React patterns
- **Performance:** Sufficient for MVP needs, can leverage native modules when needed
- **Team Hiring:** Larger pool of React Native developers in Ethiopia
- **Cross-Platform:** Single codebase for iOS and Android
- **Time-to-Market:** Faster development with hot reload, reusable components

**Key Libraries:**

- **Navigation:** React Navigation 7.x (bottom tabs + stack)
- **State Management:** Zustand (lightweight) or React Context + Reducer
- **UI Components:** React Native Paper (Material Design implementation)
- **Forms:** React Hook Form + Zod for validation
- **HTTP Client:** Axios or React Query for API calls

**❌ REJECTED: Flutter**

- Steeper learning curve for existing React developers
- Smaller local developer community in Ethiopia
- Larger app size for MVP

---

### **2. Backend Platform**

**✅ APPROVED: Firebase Platform**

**Justification:**

- **Rapid Development:** Serverless, no infrastructure management
- **Cost-Effective:** Free tier sufficient for MVP, pay-as-you-grow
- **Real-time Updates:** Firestore provides real-time sync out of the box
- **Integrated Services:** Auth, Database, Functions, Hosting in one platform
- **Offline Support:** Built-in offline persistence for mobile

**Firebase Services Used:**

1. **Authentication:** Phone-based OTP
2. **Firestore Database:** NoSQL document database
3. **Cloud Functions:** Serverless backend logic
4. **Cloud Storage:** File storage (for profile photos, receipts)
5. **Firebase Hosting:** Landing page and future web app
6. **Cloud Messaging:** Push notifications (future phase)

---

### **3. Authentication Strategy**

**✅ APPROVED: Phone Number + OTP**

**Flow:**

```
User enters phone number (+251XXXXXXXXX)
    ↓
System sends 6-digit OTP via SMS
    ↓
User enters OTP
    ↓
Firebase Auth creates/verifies user
    ↓
User profile created in Firestore
```

**Implementation:**

- **Firebase Phone Auth:** Primary method
- **Fallback:** Custom OTP verification via Ethio Telecom SMS API
- **Session:** JWT tokens managed by Firebase SDK
- **Security:** Recaptcha integration for bot prevention

**User Profile Structure (Firestore):**

```typescript
{
  uid: string,           // Firebase Auth UID
  phoneNumber: string,   // +251XXXXXXXXX
  displayName: string,   // User's name
  photoURL?: string,     // Optional profile photo
  createdAt: Timestamp,
  lastLogin: Timestamp,
  language: 'am' | 'en', // Default: 'am'
  deviceTokens: string[] // For push notifications
}
```

---

### **4. Database**

**✅ APPROVED: Cloud Firestore**

**Structure:**

```
/collection/{document}/subcollection/{subdocument}
```

**Collections Schema:**

**1. users** (already from auth, extended with custom data)

```typescript
/users/{userId}
{
  phone: string,
  name: string,
  createdAt: timestamp,
  // ... other fields
}
```

**2. equbs** (main collection)

```typescript
/equbs/{equbId}
{
  name: string,
  description?: string,
  adminId: string,           // Reference to users/{userId}
  contributionAmount: number,
  currency: 'ETB',
  frequency: 'weekly' | 'biweekly' | 'monthly',
  startDate: timestamp,
  totalMembers: number,
  currentCycle: number,
  totalCycles: number,
  status: 'active' | 'completed' | 'archived',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**3. members** (subcollection of equbs)

```typescript
/equbs/{equbId}/members/{userId}
{
  userId: string,           // Reference to users/{userId}
  joinedAt: timestamp,
  payoutOrder: number,      // When they get the pot (1, 2, 3...)
  status: 'active' | 'inactive'
}
```

**4. cycles** (subcollection of equbs)

```typescript
/equbs/{equbId}/cycles/{cycleNumber}
{
  cycleNumber: number,
  startDate: timestamp,
  endDate: timestamp,
  potAmount: number,
  beneficiaryId: string,    // Who gets the pot this cycle
  status: 'active' | 'completed' | 'payout_pending'
}
```

**5. payments** (subcollection of cycles)

```typescript
/equbs/{equbId}/cycles/{cycleNumber}/payments/{userId}
{
  userId: string,
  amount: number,
  status: 'paid' | 'pending' | 'late',
  paidAt?: timestamp,
  markedBy: string,         // Admin who marked payment
  markedAt: timestamp,
  notes?: string
}
```

**6. notifications** (subcollection of users)

```typescript
/users/{userId}/notifications/{notificationId}
{
  type: 'payment_reminder' | 'payout_alert' | 'group_update',
  title: string,
  body: string,
  equbId?: string,          // Reference if related to equb
  read: boolean,
  createdAt: timestamp
}
```

**Database Rules (Firestore Security Rules):**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Equb rules
    match /equbs/{equbId} {
      // Anyone can read active equbs they're a member of
      allow read: if request.auth != null &&
        exists(/databases/$(database)/documents/equbs/$(equbId)/members/$(request.auth.uid));

      // Only admin can write
      allow write: if request.auth != null &&
        resource.data.adminId == request.auth.uid;

      // Subcollections
      match /members/{memberId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null &&
          get(/databases/$(database)/documents/equbs/$(equbId)).data.adminId == request.auth.uid;
      }

      match /cycles/{cycleId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null &&
          get(/databases/$(database)/documents/equbs/$(equbId)).data.adminId == request.auth.uid;
      }
    }
  }
}
```

---

### **5. Notifications System**

**✅ APPROVED: SMS Primary, Push Future**

**Tiered Approach:**

**1. SMS (Primary for MVP)**

- **Provider:** Ethio Telecom SMS Gateway API
- **Use Cases:** OTP verification, critical payment reminders
- **Fallback:** Twilio local gateway if Ethio Telecom API unavailable
- **Cost:** ~0.15 ETB per SMS (budget for MVP testing)

**2. In-App Notifications (Primary)**

- Firestore-triggered real-time updates
- Show in notification center within app

**3. Push Notifications (Future Phase)**

- Firebase Cloud Messaging (FCM)
- After SMS reliability proven

**Notification Types:**

```typescript
const NOTIFICATION_TYPES = {
  PAYMENT_REMINDER: "payment_reminder", // 24h before due
  PAYMENT_OVERDUE: "payment_overdue", // After due date
  PAYOUT_ALERT: "payout_alert", // Your payout cycle
  NEW_MEMBER: "new_member", // Someone joined
  PAYMENT_RECEIVED: "payment_received", // Admin marked you paid
  GROUP_UPDATE: "group_update", // Settings changed
  CYCLE_COMPLETE: "cycle_complete", // Payout completed
} as const;
```

---

## **Development & Deployment**

### **Mobile App Build & Distribution**

```
Development → TestFlight/Internal Testing → Play Store Beta → Production
```

**Build Tools:**

- **iOS:** Xcode 15+, macOS required for builds
- **Android:** Android Studio, JDK 17
- **CI/CD:** GitHub Actions or Fastlane

**Distribution Channels:**

- **Android:** Google Play Store (Internal Test Track → Beta → Production)
- **iOS:** TestFlight (Beta testers) → App Store

### **Backend Deployment**

```
Firebase CLI → Firebase Functions Deployment → Automatic Scaling
```

**Deployment Command:**

```bash
firebase deploy --only functions,firestore:rules,hosting
```

**Environment Variables:** Managed in Firebase Functions config

```bash
firebase functions:config:set ethiosms.key="your-api-key" ethiosms.secret="your-secret"
```

---

## **Development Environment**

### **Required Tools**

1. **Node.js:** v18+ LTS
2. **npm/yarn:** Package management
3. **React Native CLI:** `npm install -g react-native-cli`
4. **Firebase CLI:** `npm install -g firebase-tools`
5. **Git:** Version control
6. **IDE:** VS Code with extensions:
   - React Native Tools
   - Firebase Explorer
   - ES7+ React/Redux snippets

### **VS Code Workspace Configuration**

```json
{
  "folders": [
    { "path": "mobile" },
    { "path": "backend" },
    { "path": "shared" }
  ],
  "settings": {
    "typescript.preferences.importModuleSpecifier": "relative",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    }
  }
}
```

---

## **Monitoring & Analytics**

### **MVP Monitoring**

1. **Firebase Analytics:** User behavior, screen views
2. **Firebase Crashlytics:** Error reporting
3. **Custom Logging:** Cloud Functions logs
4. **SMS Delivery Tracking:** Log delivery status

### **Key Metrics to Track**

```typescript
const METRICS = {
  // User metrics
  DAU: "daily_active_users",
  MAU: "monthly_active_users",
  RETENTION: "7_day_retention",

  // Business metrics
  GROUPS_CREATED: "groups_created",
  ACTIVE_GROUPS: "active_groups",
  PAYMENTS_RECORDED: "payments_recorded",

  // Technical metrics
  APP_LOAD_TIME: "app_load_time",
  SMS_DELIVERY_RATE: "sms_delivery_rate",
  API_ERROR_RATE: "api_error_rate",
};
```

---

## **Cost Estimates (Monthly)**

### **Firebase Costs (Free Tier +)**

- **Authentication:** Free up to 10K verifications/month
- **Firestore:** Free up to 1GB storage, 50K reads/day
- **Functions:** 2M invocations/month free
- **Hosting:** 10GB storage, 360MB/day transfer free

**MVP Estimate:** $0-10/month for first 1,000 users

### **SMS Costs**

- **Ethio Telecom SMS:** ~0.15 ETB per SMS
- **MVP Estimate (100 users, 2 SMS/month):** 30 ETB/month
- **Scale Estimate (10,000 users):** 3,000 ETB/month

---

## **Security Considerations**

### **Data Protection**

1. **Phone Numbers:** Hashed in logs, encrypted in transit
2. **Financial Data:** Only transaction records, no actual money movement
3. **Backups:** Daily Firestore exports to Cloud Storage
4. **Compliance:** Data deletion requests handled manually

### **Access Controls**

1. **Phone Verification:** Required for all actions
2. **Admin Controls:** Only group admins can modify data
3. **Audit Logs:** All changes timestamped and attributed
4. **Rate Limiting:** Firebase Functions enforce limits

---

## **Alternatives Considered & Rejected**

### **Backend Alternatives**

- ❌ **Node.js + Express + MongoDB:** Too much infra management for MVP
- ❌ **AWS Amplify:** Less integrated than Firebase
- ❌ **Supabase:** Less mature Firebase alternative

### **Database Alternatives**

- ❌ **MongoDB Atlas:** Additional cost, no real-time sync out of box
- ❌ **PostgreSQL:** Overkill for document-based data
- ❌ **SQLite:** Not suitable for cloud sync

### **Auth Alternatives**

- ❌ **Email/Password:** Most users don't use email regularly
- ❌ **Social Login:** Facebook/Google less common than phone
- ❌ **Biometric:** Secondary auth for future phase

---

## **Future Scalability Considerations**

### **Phase 2+ Technologies (Post-MVP)**

1. **Payment Integration:** Telebirr/CBE Birr APIs
2. **Push Notifications:** Firebase Cloud Messaging
3. **Advanced Analytics:** Mixpanel or Amplitude
4. **CDN:** For faster asset delivery
5. **Load Testing:** k6 or Artillery before scale

### **Migration Paths**

- **Firestore to MongoDB:** If document model becomes limiting
- **Firebase Functions to Node.js microservices:** If logic becomes complex
- **SMS to Multi-provider:** Add additional SMS gateways

---

## **Approval & Freeze**

✅ **This tech stack is APPROVED and FROZEN for MVP development.**

**Change Control:**

- No changes to core stack without architecture review
- Library versions can be updated with security patches
- Additional libraries require justification and approval
- Breaking changes documented in CHANGELOG.md

**Document Version:** 1.0
**Approval Date:** [Current Date]
**Next Review:** Post-MVP launch (3 months)

---

_This document serves as the single source of truth for all technology decisions in the E-Qub Tracker project._
