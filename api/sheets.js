// QCM IA — Proxy Vercel vers Google Apps Script
// Résout les problèmes CORS des redirections Apps Script

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyRtrDgr3gXqWdezz1j2z9YS05PWfRMCuByGdAWTcXOlc0Sy1t_kRlrBut8IRsYa6vf/exec';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let response;

    if (req.method === 'POST') {
      // Collecter le body
      const body = await new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => resolve(data));
      });
      response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        redirect: 'follow',
        signal: AbortSignal.timeout(20000)
      });
    } else {
      // GET avec query string
      const qs = req.url.split('?')[1] || '';
      const url = qs ? `${SCRIPT_URL}?${qs}` : SCRIPT_URL;
      response = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(20000)
      });
    }

    const text = await response.text();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(text);

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
