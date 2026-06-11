#!/usr/bin/env node
/**
 * Queue UI for pi-runner — zero dependencies, Node built-ins only.
 * Serves a mobile-friendly form on :8080 (or QUEUE_UI_PORT) that appends
 * items to /app/data/vault/RESEARCH_QUEUE.md.
 *
 * Features:
 *   - View current queue items
 *   - Add new items (max 500 chars, auto-truncated)
 *   - Remove items
 *   - HTTP Basic Auth
 *
 * Protected by HTTP Basic Auth (QUEUE_UI_USER / QUEUE_UI_PASSWORD).
 */
const http = require("http");
const fs = require("fs");

const PORT = parseInt(process.env.QUEUE_UI_PORT || "8080", 10);
const QUEUE_FILE =
    process.env.QUEUE_FILE || "/app/data/vault/RESEARCH_QUEUE.md";
const AUTH_USER = process.env.QUEUE_UI_USER || "admin";
const AUTH_PASS = process.env.QUEUE_UI_PASSWORD || "";
const MAX_TOPIC_LEN = 500;

// ── Helpers ──

function checkAuth(req) {
    const header = req.headers["authorization"] || "";
    const parts = header.split(" ");
    if (parts[0] !== "Basic" || !parts[1]) return false;
    const decoded = Buffer.from(parts[1], "base64").toString("utf8");
    const [user, pass] = decoded.split(":");
    return user === AUTH_USER && pass === AUTH_PASS;
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/**
 * Parse the queue file into sections with their items.
 * Returns { sections: [{ tag, items: [{ text, checked, raw }] }], raw: string }
 */
function parseQueue() {
    const content = fs.readFileSync(QUEUE_FILE, "utf8");
    const sections = [];
    const sectionRe = /^## #(\w+)/gm;
    let match;
    while ((match = sectionRe.exec(content)) !== null) {
        const tag = match[1];
        const start = match.index + match[0].length;
        // Find next section or end of file
        const nextSection = content.indexOf("\n## ", start);
        const end = nextSection === -1 ? content.length : nextSection;
        const block = content.slice(start, end);

        const items = [];
        const lines = block.split("\n");
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("- [ ] ")) {
                items.push({
                    text: trimmed.slice(6),
                    checked: false,
                    raw: line,
                });
            } else if (trimmed.startsWith("- [x] ")) {
                items.push({
                    text: trimmed.slice(6),
                    checked: true,
                    raw: line,
                });
            } else if (
                trimmed &&
                !trimmed.startsWith("<!--") &&
                !trimmed.startsWith("#")
            ) {
                // Malformed item — text without checkbox. Treat as unchecked.
                items.push({
                    text: trimmed,
                    checked: false,
                    raw: line,
                    malformed: true,
                });
            }
        }
        sections.push({ tag, items });
    }
    return sections;
}

function removeItem(tag, index) {
    const content = fs.readFileSync(QUEUE_FILE, "utf8");
    const marker = `## #${tag}`;
    if (!content.includes(marker)) return false;

    const parts = content.split(marker);
    const after = parts[1];
    // Find the next ## section to bound our search
    const nextSection = after.indexOf("\n## ");
    const block = nextSection === -1 ? after : after.slice(0, nextSection);

    // Find all items (checkbox and malformed)
    const lines = block.split("\n");
    let itemIdx = 0;
    const newLines = [];
    for (const line of lines) {
        const trimmed = line.trim();
        const isItem =
            trimmed.startsWith("- [ ] ") ||
            trimmed.startsWith("- [x] ") ||
            (trimmed &&
                !trimmed.startsWith("<!--") &&
                !trimmed.startsWith("#") &&
                !trimmed.startsWith("Add items below"));
        if (isItem && !trimmed.startsWith("Add items below")) {
            if (itemIdx === index) {
                itemIdx++;
                continue; // skip this item
            }
            itemIdx++;
        }
        newLines.push(line);
    }

    const newBlock = newLines.join("\n");
    if (nextSection === -1) {
        parts[1] = newBlock;
    } else {
        parts[1] = newBlock + after.slice(nextSection);
    }
    fs.writeFileSync(QUEUE_FILE, parts.join(marker), "utf8");
    return true;
}

// ── HTML ──

function renderItemHtml(items, tag) {
    if (items.length === 0) {
        return '<p style="color:var(--muted);font-size:.9rem;margin:4px 0">Empty</p>';
    }
    return items
        .map((item, i) => {
            const display = escapeHtml(
                item.text.length > 120
                    ? item.text.slice(0, 120) + "…"
                    : item.text,
            );
            const malformatted = item.malformed
                ? ' <span style="color:var(--bad);font-size:.75rem">⚠ malformed</span>'
                : "";
            const checked = item.checked
                ? ' <span style="color:var(--muted);font-size:.75rem">✓ done</span>'
                : "";
            return `<div style="display:flex;align-items:flex-start;gap:8px;padding:8px 0;border-bottom:1px solid #f0f0f0">
      <form method="POST" action="/remove" style="flex-shrink:0;margin:0">
        <input type="hidden" name="tag" value="${escapeHtml(tag)}">
        <input type="hidden" name="index" value="${i}">
        <button type="submit" style="background:none;border:none;color:var(--bad);cursor:pointer;font-size:1.1rem;padding:0;line-height:1.3" title="Remove">×</button>
      </form>
      <div style="flex:1;font-size:.9rem;line-height:1.4">${display}${malformatted}${checked}</div>
    </div>`;
        })
        .join("\n");
}

const page = ({ message = "", status = "" } = {}) => {
    let sections;
    try {
        sections = parseQueue();
    } catch (e) {
        sections = [];
    }

    const queueHtml = sections
        .map((s) => {
            const count = s.items.filter((i) => !i.checked).length;
            const total = s.items.length;
            return `<div style="background:var(--card);border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,.06)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <h3 style="margin:0;font-size:1rem">#${escapeHtml(s.tag)}</h3>
          <span style="font-size:.8rem;color:var(--muted)">${count} pending${total > count ? `, ${total - count} done` : ""}</span>
        </div>
        ${renderItemHtml(s.items, s.tag)}
      </div>`;
        })
        .join("\n");

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Research Queue</title>
<style>
  :root { --bg:#f5f5f7; --card:#fff; --accent:#007aff; --good:#34c759; --bad:#ff3b30; --text:#1c1c1e; --muted:#8e8e93; }
  * { box-sizing:border-box; }
  body { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; margin:0; padding:24px 16px; background:var(--bg); color:var(--text); }
  .wrap { max-width:520px; margin:0 auto; }
  h1 { font-size:1.5rem; margin:0 0 4px; }
  h2 { font-size:1.1rem; margin:24px 0 12px; color:var(--muted); }
  p.sub { margin:0 0 20px; color:var(--muted); font-size:.9rem; }
  form.card { background:var(--card); border-radius:16px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,.06); }
  label { display:block; font-size:.85rem; font-weight:600; margin:16px 0 6px; color:var(--muted); text-transform:uppercase; letter-spacing:.4px; }
  label:first-of-type { margin-top:0; }
  select, textarea { width:100%; padding:12px 14px; font-size:1rem; border:1px solid #d1d1d6; border-radius:10px; background:#fafafc; }
  textarea { resize:vertical; min-height:80px; }
  button.btn { width:100%; margin-top:18px; padding:14px; font-size:1rem; font-weight:600; color:#fff; background:var(--accent); border:none; border-radius:12px; cursor:pointer; }
  button.btn:active { transform:scale(.98); }
  .msg { margin-top:16px; padding:14px; border-radius:12px; font-size:.95rem; }
  .msg.ok { background:#e6f9ee; color:#0a5c2a; }
  .msg.err { background:#ffe5e5; color:#7a1f1f; }
  .counter { text-align:right; font-size:.8rem; color:var(--muted); margin-top:4px; }
  .counter.warn { color:#ff9500; }
  .counter.over { color:var(--bad); font-weight:600; }
  .footer { text-align:center; margin-top:24px; font-size:.8rem; color:var(--muted); }
</style>
</head>
<body>
<div class="wrap">
  <h1>Research Queue</h1>
  <p class="sub">Pick a tag, type a topic, submit — done.</p>

  ${status ? `<div class="msg ${status}">${message}</div>` : ""}

  <form class="card" method="POST" action="/">
    <label for="tag">Tag</label>
    <select id="tag" name="tag">
      <option value="engineering">engineering</option>
      <option value="research">research</option>
      <option value="personal">personal</option>
    </select>
    <label for="topic">Topic</label>
    <textarea id="topic" name="topic" placeholder="What should we research? (max ${MAX_TOPIC_LEN} chars)" required maxlength="${MAX_TOPIC_LEN}" oninput="updateCounter()"></textarea>
    <div id="counter" class="counter">0 / ${MAX_TOPIC_LEN}</div>
    <button class="btn" type="submit">Add to Queue</button>
  </form>

  <h2>Current Queue</h2>
  ${queueHtml || '<p style="color:var(--muted);font-size:.9rem">No sections found in queue file.</p>'}

  <div class="footer">pi-runner · research.v1truv1us.dev</div>
</div>
<script>
function updateCounter() {
  const ta = document.getElementById('topic');
  const counter = document.getElementById('counter');
  const len = ta.value.length;
  counter.textContent = len + ' / ${MAX_TOPIC_LEN}';
  counter.className = 'counter' + (len > ${MAX_TOPIC_LEN} * 0.9 ? (len >= ${MAX_TOPIC_LEN} ? ' over' : ' warn') : '');
}
</script>
</body>
</html>`;
};

// ── Server ──

const server = http.createServer((req, res) => {
    if (!checkAuth(req)) {
        res.writeHead(401, {
            "WWW-Authenticate": 'Basic realm="Research Queue"',
            "Content-Type": "text/plain",
        });
        return res.end("Unauthorized");
    }

    // GET / — show form + current queue
    if (req.method === "GET" && req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        return res.end(page());
    }

    // GET /api/queue — JSON dump of current queue
    if (req.method === "GET" && req.url === "/api/queue") {
        const sections = parseQueue();
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ sections }, null, 2));
    }

    // POST / — add item
    if (req.method === "POST" && req.url === "/") {
        let body = "";
        req.on("data", (c) => {
            body += c;
        });
        req.on("end", () => {
            const params = new URLSearchParams(body);
            const tag = params.get("tag");
            let topic = (params.get("topic") || "").trim();

            if (
                !tag ||
                !topic ||
                !["engineering", "research", "personal"].includes(tag)
            ) {
                res.writeHead(422, {
                    "Content-Type": "text/html; charset=utf-8",
                });
                return res.end(
                    page({
                        message: "Pick a valid tag and enter a topic.",
                        status: "err",
                    }),
                );
            }

            // Truncate to max length
            if (topic.length > MAX_TOPIC_LEN) {
                topic = topic.slice(0, MAX_TOPIC_LEN).trim();
            }

            // Collapse whitespace
            topic = topic.replace(/\s+/g, " ");

            try {
                const content = fs.readFileSync(QUEUE_FILE, "utf8");
                const marker = `## #${tag}`;
                if (!content.includes(marker)) {
                    throw new Error(`Section ${marker} not found`);
                }
                const parts = content.split(marker);
                const after = parts[1];
                const nl = after.indexOf("\n");
                const line = `\n- [ ] ${topic}`;
                parts[1] = after.slice(0, nl + 1) + line + after.slice(nl + 1);
                fs.writeFileSync(QUEUE_FILE, parts.join(marker), "utf8");
                res.writeHead(200, {
                    "Content-Type": "text/html; charset=utf-8",
                });
                return res.end(
                    page({
                        message: `Added to #${escapeHtml(tag)}: ${escapeHtml(topic)}`,
                        status: "ok",
                    }),
                );
            } catch (e) {
                res.writeHead(500, {
                    "Content-Type": "text/html; charset=utf-8",
                });
                return res.end(
                    page({
                        message: `Error: ${escapeHtml(e.message)}`,
                        status: "err",
                    }),
                );
            }
        });
        return;
    }

    // POST /remove — remove item by tag + index
    if (req.method === "POST" && req.url === "/remove") {
        let body = "";
        req.on("data", (c) => {
            body += c;
        });
        req.on("end", () => {
            const params = new URLSearchParams(body);
            const tag = params.get("tag") || "";
            const index = parseInt(params.get("index"), 10);

            if (
                !["engineering", "research", "personal"].includes(tag) ||
                isNaN(index)
            ) {
                res.writeHead(422, {
                    "Content-Type": "text/html; charset=utf-8",
                });
                return res.end(
                    page({
                        message: "Invalid tag or index.",
                        status: "err",
                    }),
                );
            }

            try {
                const ok = removeItem(tag, index);
                if (!ok) {
                    return res.end(
                        page({
                            message: "Item not found.",
                            status: "err",
                        }),
                    );
                }
                res.writeHead(200, {
                    "Content-Type": "text/html; charset=utf-8",
                });
                return res.end(
                    page({
                        message: `Removed item ${index} from #${escapeHtml(tag)}.`,
                        status: "ok",
                    }),
                );
            } catch (e) {
                res.writeHead(500, {
                    "Content-Type": "text/html; charset=utf-8",
                });
                return res.end(
                    page({
                        message: `Error: ${escapeHtml(e.message)}`,
                        status: "err",
                    }),
                );
            }
        });
        return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
});

server.listen(PORT, () => {
    console.log(`[queue-ui] Listening on :${PORT} (auth user: ${AUTH_USER})`);
});
