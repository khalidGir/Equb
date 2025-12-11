MVP Features Specification: E-Qub Tracker v1.0
Product Philosophy
A digital ledger and communication tool for eQub groups - NOT a payment processor. We track promises and build trust, not move money.

Technical Stack (Frozen)
Frontend: React Native (iOS & Android)

Backend: Firebase (Authentication, Firestore, Cloud Functions)

SMS: Ethio Telecom SMS API (primary), Twilio local gateway (backup)

Hosting: Firebase Hosting (landing page only)

Analytics: Firebase Analytics + custom event logging

Design Language: Material Design with Amharic language support

Core Features (IN SCOPE)

1. Authentication & Onboarding ✅
   User Registration:

Phone number input with country code (+251)

SMS verification code (6-digit)

Basic profile: Name (required), optional photo

Language preference: Amharic (default), English

First-Time Experience:

Simple tutorial (3-screen walkthrough)

Option to create or join a group immediately

Permission requests: Notifications, Contacts (optional)

2. Group Management ✅
   Create New E-Qub:

Group name (e.g., "Family Holiday 2024")

Purpose/description (optional)

Contribution amount (ETB only)

Cycle frequency: Weekly / Bi-weekly / Monthly

Number of members (5-30 range)

Total duration (auto-calculated based on members)

Start date

Group Settings:

Invite method: Shareable link, QR code, or manual entry

Admin controls: Edit basic info, change admin

Group visibility: Private (invite only)

Data export: CSV download of all transactions

3. Member Management ✅
   Add Members:

Via invite link/QR code

Manual addition by admin (name + phone)

Bulk import from contacts (optional)

Member Profile:

Name, phone number (mandatory)

Role: Admin or Member

Status: Active / Inactive

Join date

Total contributions

Payment history

4. Payment Tracking ✅
   Dashboard View:

Current cycle number and date range

Pot total (auto-calculated)

Visual payment status for each member:

✅ Paid (green, with date)

🔄 Pending (gray, default)

⚠️ Late (orange, after due date)

Quick action buttons for admin

Payment Recording:

Admin-only action to mark payment

Single tap to toggle paid/unpaid

Add payment date (defaults to today)

Optional note for special cases

Automatic total update

5. Payout Management ✅
   Payout Schedule:

Auto-generated based on member count

Two assignment methods:

Manual order (admin assigns each cycle)

Random shuffle (system assigns)

Clear visual timeline

Current beneficiary highlighted

Payout Completion:

Admin marks payout as "completed"

Optional: Add receipt photo or note

System advances to next cycle automatically

History of past payouts viewable

6. Notifications System ✅
   Automated Triggers:

48-hour payment reminder (all members)

24-hour payment reminder (pending members only)

Payment due today (pending members)

Payout day notification (all members)

Welcome message for new members

Admin Controls:

Send custom message to all members

Toggle notifications on/off per group

Notification history

Delivery Methods:

Push notification (primary)

SMS fallback (for critical reminders)

WhatsApp integration (future consideration)

7. Transparency Features ✅
   Member View:

See all same data as admin (except edit controls)

Real-time updates

Personal payment history

Group statistics

Audit Log:

All payment changes logged

Who made change (admin only)

Timestamp

Before/after values

Trust Indicators:

100% payment rate display

On-time payment streaks

Group longevity metrics

8. Security & Privacy ✅
   Access Control:

Phone number verification for all actions

Admin-only for sensitive operations

Invite codes expire after 7 days

Maximum 2 devices per account

Data Protection:

End-to-end encryption for sensitive data

Local data caching with expiry

Automatic logout after 30 days inactivity

No financial data stored (only transaction records)

Compliance:

Privacy policy in plain language

Terms of service

Data deletion request process

Features OUT OF SCOPE (v1.0) ❌
Payment Processing
❌ Mobile money integration (M-Pesa, Telebirr, CBE Birr)

❌ Bank transfer facilitation

❌ Digital wallet

❌ Payment gateway

Advanced Features
❌ Multiple currency support

❌ Investment tracking

❌ Loan management within group

❌ Interest calculation

❌ Penalty/fine system

❌ Document storage/attachment

❌ Chat/messaging system

❌ Voice notes or video calls

Platform Expansion
❌ Web portal/desktop version

❌ API for third-party integration

❌ Browser extension

❌ Wearable app

Complex Scenarios
❌ Offline synchronization (requires internet)

❌ Split payments/partial payments

❌ Member substitution/replacement

❌ Multiple concurrent eQub cycles

❌ Advanced reporting/analytics

❌ Tax calculation/reporting

Success Metrics (MVP)
Primary Metrics
User Activation: 70% of registered users join/create a group

Retention: 40% of groups active after 3 cycles

Administrative Time: 50% reduction in admin work reported

Payment Accuracy: 99.9% error-free transaction recording

Technical Metrics
App Performance: < 2-second load time on 3G

Reliability: 99.5% uptime

SMS Delivery: 95% successful delivery rate

Battery Impact: < 2% per hour of active use

Business Metrics
User Acquisition: 1,000 active users in first 90 days

Group Formation: 200 active groups in first 90 days

Monetization Readiness: 20% of users express willingness to pay

Referral Rate: 15% organic growth through invites

Deployment Requirements
Phase 1: Alpha (Week 11-12)
Test with 3-5 real eQub groups

Basic functionality working

Critical bugs fixed

Phase 2: Beta (Week 13-16)
10-15 groups testing

Polish features added

App store submission

Phase 3: Launch (Week 17-18)
Production deployment

App store live

Support system active

Monitoring in place

Assumptions & Dependencies
Internet: Users have intermittent internet access (design for offline-first)

SMS: Ethio Telecom SMS API is reliable and affordable

Devices: Users have Android/iOS smartphones with basic capabilities

Literacy: Users can read Amharic/English at basic level

Trust: Users willing to try digital solution for traditional practice
