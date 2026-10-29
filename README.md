# EduPulse - Modern Student Productivity Suite & Android App

EduPulse is an all-in-one student productivity, academic management, and coursework tracking platform built with **React 19, Vite, and Capacitor 8** for Android.

---

## 🚀 Quick Launch (Web Dev Server)

To test the application immediately in your browser:

```powershell
$env:Path = "C:\Users\A7\AppData\Local\Programs\nodejs;$env:Path"
cd "c:\Users\A7\OneDrive\Desktop\edu_apk_ready"

npm run dev
```

Open `http://localhost:5173` to test:
- **Dashboard**: Study progress bar, upcoming assignment deadlines with countdowns.
- **My Tasks**: Interactive study checklist and to-do lists.
- **Assignments**: Add, edit, delete, priority filters, and deadline countdowns.
- **Alarms & Reminders**: Real-time auditory chimes, browser notifications, and scheduled triggers.
- **Calendar**: Month grid and agenda views for exams and deadlines.
- **Notes**: Subject-wise revision notes with pinning.
- **Settings**: Student profile, notification intervals, and Light/Dark mode.

---

## 📱 Generating the Android APK

The native Android platform wrapper is located in [`android/`](./android) configured with:
- **App ID:** `com.edupulse.studenthub`
- **Plugin:** `@capacitor/local-notifications` (for background deadline alerts)
- **Permissions:** `POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`, `USE_EXACT_ALARM`, `VIBRATE`, `WAKE_LOCK`

### 1. Build and Sync Latest Web Assets
```powershell
$env:Path = "C:\Users\A7\AppData\Local\Programs\nodejs;$env:Path"
cd "c:\Users\A7\OneDrive\Desktop\edu_apk_ready"

npm run build
robocopy "dist" "android\app\src\main\assets\public" /MIR /NFL /NDL /NJH /NJS
npx cap update android
```

### 2. Open in Android Studio & Generate APK
```powershell
npx cap open android
```

In Android Studio:
1. Wait for Gradle sync to complete.
2. Select **Build > Build Bundle(s) / APK(s) > Build APK(s)** for immediate sideloading.
3. Or select **Build > Generate Signed Bundle / APK** for Google Play Store release.

---

## 📦 Store & Release Assets

- **Privacy Policy:** [`public/privacy.html`](./public/privacy.html) (packaged inside the app) and [`PRIVACY_POLICY.md`](./PRIVACY_POLICY.md).
- **Store Listing Copy:** [`STORE_LISTING.md`](./STORE_LISTING.md) with complete Google Play title, descriptions, and permission justifications.
- **Backend Schema:** [`supabase/schema.sql`](./supabase/schema.sql) and [`supabase/seed.sql`](./supabase/seed.sql).
