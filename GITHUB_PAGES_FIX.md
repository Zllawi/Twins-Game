# إصلاح مشكلة الربط بين GitHub Pages وFirebase

إذا واجهت مشكلة في لعب لعبة المافيا مع أصدقائك عبر GitHub Pages، فاتبع هذه الخطوات:

## 1. تحديث إعدادات Firebase Authentication

1. انتقل إلى [لوحة تحكم Firebase](https://console.firebase.google.com/)
2. اختر مشروعك من القائمة
3. انقر على "Authentication" في القائمة الجانبية
4. انتقل إلى تبويب "Settings" ثم "Authorized domains"
5. أضف نطاق GitHub Pages الخاص بك بالصيغة التالية:
   ```
   [username].github.io
   ```
   حيث [username] هو اسم المستخدم الخاص بك على GitHub.

## 2. تحديث قواعد الأمان في Realtime Database

1. انتقل إلى "Realtime Database" في لوحة تحكم Firebase
2. انقر على تبويب "Rules"
3. قم بتحديث القواعد للسماح بالقراءة والكتابة (مؤقتاً للاختبار):
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   > ملاحظة: هذه الإعدادات مفتوحة تماماً للاختبار. لتحسين الأمان، قم بتعديلها لاحقاً.

## 3. تحديث تكوين Firebase في مشروعك

تأكد من أن ملف `firebase-config.js` يحتوي على المعلومات الصحيحة ويتضمن `databaseURL`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 4. حل مشكلة CORS

أحياناً قد تحدث مشكلة CORS عند استخدام GitHub Pages مع Firebase. لحل هذه المشكلة:

1. أنشئ ملف `_headers` في مجلد المشروع الرئيسي:
   ```
   /*
     Access-Control-Allow-Origin: *
   ```

2. إذا كنت تستخدم خدمة استضافة أخرى، تأكد من إضافة هذه الرؤوس CORS.

## 5. تأكد من تسجيل الخروج وإعادة تسجيل الدخول

قد تكون هناك مشكلات في تخزين الجلسة. اطلب من صديقك:

1. مسح ذاكرة التخزين المؤقت للمتصفح
2. إعادة تحميل الصفحة
3. محاولة الانضمام مرة أخرى

## 6. فحص سجلات الخطأ

1. اطلب من صديقك فتح وحدة تحكم المتصفح (F12 أو Ctrl+Shift+I)
2. الانتقال إلى تبويب "Console"
3. محاولة الانضمام وفحص أي رسائل خطأ تظهر
4. ارسل لك هذه الرسائل للمساعدة في تشخيص المشكلة

## 7. إضافة كود تصحيح الأخطاء

قم بتعديل ملف `join-game.js` لإضافة المزيد من رسائل الخطأ المفصلة: 