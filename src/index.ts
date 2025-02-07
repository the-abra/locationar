export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname === "/" && request.method === "GET") {
      return await handleComments(env);
    }

    if (url.pathname === "/update" && request.method === "POST") {
      return await handleUpdate(request, env);
    }

    return new Response("Not Found", { status: 404 });
  },
};

// Yorumları listeleme fonksiyonu
async function handleComments(env: Env) {
  try {
    const stmt = env.DB.prepare("SELECT * FROM comments LIMIT 3");
    const { results } = await stmt.all();

    return new Response(renderHtml(JSON.stringify(results, null, 2)), {
      headers: {
        "content-type": "text/html",
      },
    });
  } catch (error) {
    return new Response("Error fetching comments: " + error.message, { status: 500 });
  }
}

// Kullanıcı konumunu güncelleme fonksiyonu
async function handleUpdate(request: Request, env: Env) {
  try {
    const { id, location } = await request.json();

    if (!id || !location) {
      return new Response("Missing id or location", { status: 400 });
    }

    const stmt = env.DB.prepare("UPDATE users SET location = ? WHERE id = ?");
    const result = await stmt.bind(location, id).run();

    if (result.success) {
      return new Response("Location updated successfully", { status: 200 });
    } else {
      return new Response("Update failed", { status: 500 });
    }
  } catch (error) {
    return new Response("Error processing request: " + error.message, { status: 500 });
  }
}

// Basit HTML render fonksiyonu
function renderHtml(content: string): string {
  return `
    <html>
      <head><title>Comments</title></head>
      <body><pre>${content}</pre></body>
    </html>
  `;
}
