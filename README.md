# RETRIVO 🎒🔍
> AI-Powered Campus Lost, Found, and Recovery Mobile Application

Built with **React Native (Expo SDK 57)**, **Expo Router**, **TypeScript**, **Supabase (`pgvector` + Auth)**, and **Lucide Icons**.

---

## 🚀 Quick Start (Running Locally)

To launch the app on your local machine:

```bash
cd "C:\Users\ASUS\.gemini\antigravity\scratch\retrivo"

# Run in Web Browser
npm run web

# Or launch Expo Dev Server for iOS / Android (Expo Go)
npx expo start
```

- Press **`w`** in the terminal to open the web version in your default browser.
- Press **`a`** for Android emulator, or scan the QR code with **Expo Go** on your physical device.

---

## 🏛️ Core Workflow Implementation

| Stage | Feature | Implementation |
|---|---|---|
| **1. Multimodal Match** | Text + Image + Location + Time | Evaluated via `src/utils/aiMatcher.ts` and `search_multimodal_matches` using pgvector embeddings. |
| **2. Rank** | Contextual Similarity (0.0 to 10.0) | Ranked scoring combining Text (35%), Visual (40%), Geo-decay (15%), and Time-decay (10%). |
| **3. Verify** | Private "Hidden Ownership Detail" | Zero-trust field in `src/types/retrivo.ts` and `app/item/[id].tsx` hidden from public view until challenge review. |
| **4. Return** | Traceable Handover PIN | Double-blind verification with a generated 6-digit Handover PIN (`app/(tabs)/claims.tsx`). |

---

## 📁 Project Architecture

```
retrivo/
├── app/                          # Expo Router routes
│   ├── _layout.tsx               # Root layout with SafeAreaProvider & AppProvider
│   ├── index.tsx                 # Root redirect to (tabs)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── login.tsx             # Campus SSO & Quick Demo login
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab bar with Lucide icons
│   │   ├── index.tsx             # Campus Feed with filters & search
│   │   ├── matches.tsx           # Multimodal AI Match rankings
│   │   ├── report.tsx            # Report Lost/Found with Hidden Clue field
│   │   ├── claims.tsx            # Claim verification & Handover PIN
│   │   └── profile.tsx           # Student identity & Trust Score (96%)
│   └── item/
│       └── [id].tsx              # Detailed inspection & claim challenge
├── src/
│   ├── components/
│   │   ├── common/Header.tsx     # Header with Trust badge
│   │   ├── items/ItemCard.tsx    # Feed card with badges
│   │   ├── items/MatchCard.tsx   # Multimodal breakdown card
│   │   └── claims/ClaimCard.tsx  # Clue challenge & Handover PIN confirmation
│   ├── context/AppContext.tsx    # State store & active workflows
│   ├── lib/supabase.ts           # Supabase client with SecureStore
│   ├── services/mockData.ts      # Campus test dataset
│   ├── styles/theme.ts           # Design tokens & colors
│   ├── types/retrivo.ts          # Canonical TypeScript models
│   └── utils/aiMatcher.ts        # 4-channel multimodal similarity engine
└── supabase/
    └── migrations/               # PostgreSQL + pgvector schema & RLS policies
```

---

## 🔐 Supabase Configuration

Set your Supabase credentials in `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Execute the SQL migration at `supabase/migrations/20240101_init_retrivo.sql` in your Supabase SQL editor to create the `profiles`, `campus_items`, `claim_verifications`, and `pgvector` tables.
