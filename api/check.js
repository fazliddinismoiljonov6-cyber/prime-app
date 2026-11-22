export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { topic, essay } = req.body || {};
  if (!essay || essay.length > 6000) return res.status(400).json({ error: 'bad input' });
  const prompt = 'You are a strict IELTS Writing examiner. Score this Task 2 essay using the four official criteria (0-9, steps of 0.5). Reply ONLY with JSON: {"overall":number,"task":number,"coherence":number,"lexical":number,"grammar":number,"strengths":[2 short strings],"fixes":[3 short concrete strings quoting the essay where possible],"tip":"one sentence"}. Write all strings in Uzbek (keep English quotes from the essay in English).\nTopic: ' + String(topic).slice(0, 400) + '\nEssay:\n' + essay;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({ model: 'claude-sonnet-5-5', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] })
    });
    const d = await r.json();
    const t = (d.content || []).map(c => c.text || '').join('').replace(/```json|```/g, '').trim();
    res.status(200).json(JSON.parse(t));
  } catch (e) {
    res.status(500).json({ error: 'failed' });
  }
}
