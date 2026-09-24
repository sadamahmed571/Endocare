import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

function getApiKey() {
    const encodedBase64 = "LyYMADAYMQARLBAOIw5KY3REKxoGNhkrOCcVDDcMDgxaR35EPxw/"; // الصق النص المشفر هنا
    if (encodedBase64 && encodedBase64 !== "YOUR_BASE64_ENCODED_KEY_HERE") {
        const secret = "novacare_demo_2024";
        const decodedStr = Buffer.from(encodedBase64, 'base64').toString('binary');
        let originalKey = "";
        for (let i = 0; i < decodedStr.length; i++) {
            originalKey += String.fromCharCode(decodedStr.charCodeAt(i) ^ secret.charCodeAt(i % secret.length));
        }
        return originalKey;
    }

    let key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.VITE_POE_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY' || key.startsWith('your-')) {
        const parsed = dotenv.config({ override: true }).parsed;
        if (parsed && parsed.GEMINI_API_KEY && parsed.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
            key = parsed.GEMINI_API_KEY;
        }
    }
    return key;
}

app.post('/api/chat', async (req, res) => {
    try {
        const { text, systemPrompt } = req.body;
        const apiKey = getApiKey();
        if (!apiKey) {
            return res.status(500).json({ error: 'API Key is missing on the server' });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
        const payload = {
            contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${text}` }] }]
        };

        const apiRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiRes.ok) {
            const errText = await apiRes.text();
            console.error('Gemini API Error:', apiRes.status, errText);
            return res.status(apiRes.status).json({ error: errText });
        }

        const data = await apiRes.json();
        res.json(data);
    } catch (error) {
        console.error('Chat endpoint error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');

if (isProd) {
    app.use(express.static(join(__dirname, 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(join(__dirname, 'dist', 'index.html'));
    });
} else {
    // In dev mode, use Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
        server: { middlewareMode: true },        
        appType: 'spa'
    });
    app.use(vite.middlewares);
}

const PORT = process.env.PORT || 3012;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
