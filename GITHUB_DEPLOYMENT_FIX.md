# دليل إصلاح مشكلة Firebase مع GitHub Pages

## 1. إضافة رابط GitHub Pages كمجال مصرح به في Firebase

1. انتقل إلى [لوحة تحكم Firebase](https://console.firebase.google.com/)
2. اختر مشروعك: `zllawi-game`
3. انقر على "Authentication" من القائمة الجانبية
4. اذهب إلى تبويب "Settings" ثم "Authorized domains"
5. أضف رابط GitHub Pages بالصيغة التالية:
   ```
   [اسم_المستخدم].github.io
   ```
   حيث [اسم_المستخدم] هو اسم مستخدمك في GitHub.

## 2. التأكد من قواعد أمان Firebase Realtime Database

1. اذهب إلى صفحة [Realtime Database](https://console.firebase.google.com/project/zllawi-game/database/zllawi-game-default-rtdb/data) في لوحة تحكم Firebase
2. انتقل إلى تبويب "Rules"
3. ضع القواعد التالية للاختبار:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
4. انقر على "Publish" لحفظ التغييرات

## 3. إضافة ملف CORS لتجنب مشاكل الحظر

1. قم بإنشاء ملف `cors.json` في مشروعك إذا لم يكن موجودًا:
   ```json
   [
     {
       "origin": ["*"],
       "method": ["GET", "POST", "PUT", "DELETE"],
       "maxAgeSeconds": 3600
     }
   ]
   ```

2. قم بإضافة ملف `_headers` إذا لم يكن موجودًا:
   ```
   /*
     Access-Control-Allow-Origin: *
     Access-Control-Allow-Methods: GET, POST, PUT, DELETE
     Access-Control-Allow-Headers: Content-Type
   ```

## 4. تعديل صفحات HTML ليتم استخدام HTTPS فقط 

1. تأكد من أن جميع الروابط في صفحاتك تستخدم HTTPS وليس HTTP

## 5. التأكد من التكوين الصحيح لـ firebase-config.js

1. تأكد من أن ملف `firebase-config.js` يحتوي على الإعداد الصحيح:
   ```javascript
   // For Firebase JS SDK v7.20.0 and later, measurementId is optional
   const firebaseConfig = {
     apiKey: "AIzaSyCv5d-8DJbJ2YknSzn3mKIIkwUcSHuabb0",
     authDomain: "zllawi-game.firebaseapp.com",
     databaseURL: "https://zllawi-game-default-rtdb.europe-west1.firebasedatabase.app",
     projectId: "zllawi-game",
     storageBucket: "zllawi-game.firebasestorage.app",
     messagingSenderId: "799121556211",
     appId: "1:799121556211:web:d83819665cd646a243ed86",
     measurementId: "G-YY4S0ECENF"
   };

   // تهيئة Firebase
   if (typeof firebase !== 'undefined') {
     if (!firebase.apps.length) {
       firebase.initializeApp(firebaseConfig);
     } else {
       firebase.app();
     }
     
     // إنشاء مرجع قاعدة البيانات
     const database = firebase.database();
     
     console.log("تم تهيئة Firebase بنجاح!");
   } else {
     console.error("Error: Firebase library is not loaded!");
   }
   ```

## 6. أداة تشخيص على صفحة GitHub Pages

1. ارفع ملف `debug-test.html` إلى GitHub Pages
2. اختبر الاتصال باستخدام هذا الملف لتحديد المشكلة بالضبط

## 7. إعدادات Storage (إذا كنت تستخدم Storage)

1. اذهب إلى [Storage](https://console.firebase.google.com/project/zllawi-game/storage)
2. انتقل إلى "Rules" وقم بتحديثها للاختبار كالتالي:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write;
       }
     }
   }
   ```

## 8. التحقق من وحدة التحكم في المتصفح

1. افتح Developer Console في المتصفح (F12)
2. انتقل إلى تبويب "Console" للتحقق من وجود أي أخطاء
3. انتقل إلى تبويب "Network" للتحقق من الطلبات إلى Firebase

## 9. في حالة وجود مشكلة في الترخيص السحابي

في بعض الحالات، قد تكون هناك قيود على الوصول إلى Firebase من نطاقات غير مصرح بها. اتبع الخطوات التالية:

1. فتح [مركز Google Cloud Console](https://console.cloud.google.com/)
2. اختيار المشروع (zllawi-game)
3. البحث عن "API Credentials" وفتحه
4. التحقق من القيود على مفتاح API وإزالة أي قيود على النطاق إذا لزم الأمر

## 10. استخدام مسار مطلق لمكتبات Firebase

في حالة كنت تستخدم مسارات نسبية، استبدلها بمسارات مطلقة:

```html
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
``` 