// Proxy OpenAI — clé stockée en variable d'env Vercel, jamais exposée au client
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Clé API non configurée sur le serveur' });

  const { prompt, model = 'gpt-4o-mini', temperature = 0.4, max_tokens = 4000 } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt manquant' });

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens
      })
    });

    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      return res.status(r.status).json({ error: e.error?.message || 'Erreur OpenAI ' + r.status });
    }

    const data = await r.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    return res.status(200).json({ content });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
