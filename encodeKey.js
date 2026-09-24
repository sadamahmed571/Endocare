// سكريبت تشفير المفتاح لنسخة العرض
// قم بتشغيل هذا السكريبت في سطر الأوامر لتوليد المفتاح المشفر الخاص بك:
// node encodeKey.js "YOUR-API-KEY"

const apiKey = process.argv[2];

if (!apiKey) {
    console.error("الرجاء تمرير المفتاح الحقيقي، مثال:\nnode encodeKey.js \"sk-your-api-key\"");
    process.exit(1);
}

const secret = "novacare_demo_2024";

let encoded = "";
for (let i = 0; i < apiKey.length; i++) {
    encoded += String.fromCharCode(apiKey.charCodeAt(i) ^ secret.charCodeAt(i % secret.length));
}

const base64Encoded = Buffer.from(encoded, 'binary').toString('base64');

console.log("\n====== المفتاح المشفر (انسخ هذا النص) ======\n");
console.log(base64Encoded);
console.log("\n============================================\n");
console.log("الآن قم بلصق هذا النص في ملفات (server.js) و (js/env.js) مكان عبارة YOUR_BASE64_ENCODED_KEY_HERE\n");
