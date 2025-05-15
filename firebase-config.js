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

console.log("بدء تهيئة Firebase...");

// تهيئة Firebase
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("تم تهيئة Firebase لأول مرة");
  } else {
    firebase.app();
    console.log("تم استخدام تطبيق Firebase الحالي");
  }
  
  // التحقق من وجود دالة database
  if (typeof firebase.database !== 'function') {
    throw new Error("دالة firebase.database غير متوفرة");
  }
  
  // إنشاء مرجع قاعدة البيانات
  const database = firebase.database();
  console.log("تم إنشاء كائن database:", !!database);
  
  // التحقق من وجود دالة ref
  if (typeof database.ref !== 'function') {
    throw new Error("دالة database.ref غير متوفرة");
  }
  
  // اختبار إنشاء مرجع
  const testRef = database.ref("test_connection");
  console.log("تم إنشاء مرجع اختبار:", !!testRef);
  
  // جعل قاعدة البيانات متاحة عالمياً
  window.database = database;
  
  // جعل Firebase متاحاً عالمياً
  window.firebase = firebase;
  
  console.log("تم تهيئة Firebase بنجاح!");
  
  // اختبار الاتصال
  const connectedRef = database.ref(".info/connected");
  connectedRef.on("value", (snap) => {
    if (snap.val() === true) {
      console.log("متصل بقاعدة بيانات Firebase");
    } else {
      console.log("غير متصل بقاعدة بيانات Firebase");
    }
  });
  
} catch (error) {
  console.error("خطأ أثناء تهيئة Firebase:", error);
  alert("حدث خطأ في تهيئة Firebase: " + error.message);
}