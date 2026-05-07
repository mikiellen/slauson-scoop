exports.handler = async (event) => {
  const { dbId, name, url, today } = JSON.parse(event.body || '{}');
  const token = process.env.NOTION_TOKEN;
  if (!token) return { statusCode: 500, body: JSON.stringify({ error: 'No token' }) };

  const resp = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      parent: { database_id: dbId },
      properties: {
        'Name': { title: [{ text: { content: name } }] },
        'URL': { url: url },
        'Email': { rich_text: [{ text: { content: '' } }] },
        'Type': { select: { name: 'Website' } },
        'Notes': { rich_text: [{ text: { content: 'Submitted via Slauson Scoop' } }] },
        'Active': { checkbox: true },
        'Date Added': { date: { start: today } }
      }
    })
  });

  const data = await resp.json();
  return {
    statusCode: resp.ok ? 200 : resp.status,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(data)
  };
};
