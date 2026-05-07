exports.handler = async (event) => {
  const { dbId, filter } = JSON.parse(event.body || '{}');
  const token = process.env.NOTION_TOKEN;

  if (!token) return { statusCode: 500, body: JSON.stringify({ error: 'No token' }) };
  if (!dbId)  return { statusCode: 400, body: JSON.stringify({ error: 'No dbId' }) };

  const results = [];
  let cursor;

  try {
    do {
      const body = {};
      if (cursor) body.start_cursor = cursor;
      if (filter) body.filter = filter;

      const resp = await fetch('https://api.notion.com/v1/databases/' + dbId + '/query', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await resp.json();
      if (!resp.ok) return { statusCode: resp.status, body: JSON.stringify(data) };
      results.push(...(data.results || []));
      cursor = data.has_more ? data.next_cursor : null;
    } while (cursor);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ results })
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
