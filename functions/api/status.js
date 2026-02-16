// Cloudflare Pages Function: /api/status
// Returns current dashboard status from KV store

export async function onRequest(context) {
  const { request, env } = context;
  
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Cache-Control': 'public, max-age=30',
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    // Try to get data from KV
    let data = null;
    if (env.DASHBOARD_DATA) {
      data = await env.DASHBOARD_DATA.get('latest', { type: 'json' });
    }

    // Return data or default status
    const response = data || {
      status: 'online',
      message: 'Dashboard API ready',
      timestamp: new Date().toISOString(),
      note: 'No data exported yet. Run export-data.sh or wait for cron.'
    };

    return new Response(JSON.stringify(response, null, 2), { headers });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }), { 
      status: 500,
      headers 
    });
  }
}
