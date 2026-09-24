import { createClient } from '@supabase/supabase-js'

function getEnv(key) {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
        return import.meta.env[key]
    }
    if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[key]) {
        return window.__ENV__[key]
    }
    return ''
}

const VITE_SUPABASE_URL = getEnv('VITE_SUPABASE_URL')
const VITE_SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY')
function getSecureGeminiKey() {
    const encodedBase64 = "LyYMADAYMQARLBAOIw5KY3REKxoGNhkrOCcVDDcMDgxaR35EPxw/"; // الصق النص المشفر هنا
    if (encodedBase64 && encodedBase64 !== "YOUR_BASE64_ENCODED_KEY_HERE") {
        const secret = "novacare_demo_2024";
        const decodedStr = atob(encodedBase64);
        let originalKey = "";
        for (let i = 0; i < decodedStr.length; i++) {
            originalKey += String.fromCharCode(decodedStr.charCodeAt(i) ^ secret.charCodeAt(i % secret.length));
        }
        return originalKey;
    }
    return getEnv('GEMINI_API_KEY') || getEnv('VITE_GEMINI_API_KEY') || getEnv('VITE_POE_API_KEY');
}

const GEMINI_API_KEY = getSecureGeminiKey();

window.__ENV__ = Object.assign(window.__ENV__ || {}, {
    GEMINI_API_KEY: GEMINI_API_KEY,
    VITE_SUPABASE_URL: VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: VITE_SUPABASE_ANON_KEY
});

if (VITE_SUPABASE_URL && VITE_SUPABASE_ANON_KEY) {
    window.__supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
        auth: { persistSession: true }
    });
}
