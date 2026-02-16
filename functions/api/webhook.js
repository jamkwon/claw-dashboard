// Cloudflare Pages Function: /api/webhook
// Receives data updates from OpenClaw

export async function onRequest(context) {
  const { request, env } = context;
  
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  if (request.method === 'POST') {
    try {
      // Validate webhook secret (optional)
      const authHeader = request.headers.get('Authorization');
      const webhookSecret = env.WEBHOOK_SECRET;
      
      if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers
        });
      }

      // Parse incoming data
      const data = await request.json();
      
      // Add metadata
      const enrichedData = {
        ...data,
        receivedAt: new Date().toISOString(),
        source: 'webhook'
      };

      // Store in KV
      if (env.DASHBOARD_DATA) {
        await env.DASHBOARD_DATA.put('latest', JSON.stringify(enrichedData));
        
        // Also store historical entry (optional)
        const historyKey = `history:${Date.now()}`;
        await env.DASHBOARD_DATA.put(historyKey, JSON.stringify(enrichedData), {
          expirationTtl: 86400 * 7 // Keep for 7 days
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Data received',
        timestamp: enrichedData.receivedAt
      }), { headers });
      
    } catch (error) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message 
      }), { 
        status: 500, 
        headers 
      });
    }
  }

  // GET returns usage info
  return new Response(JSON.stringify({
    endpoint: '/api/webhook',
    method: 'POST',
    description: 'Send dashboard data updates',
    example: {
      projects: [],
      sessions: [],
      status: 'active'
    }
  }), { headers });
}
