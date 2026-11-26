# fact-check (Chip Fact Checker)

A browser extension plus a local Python backend that adds a **Fact Check** button on Reddit (posts and comments), Facebook, and Twitter/X. The backend splits that text into sentences and asks a local [Ollama](https://ollama.com) model for a verdict on each one.

This is a personal/experimental project, not a packaged store extension. It does **not** fetch live news. The news context in `backend-server-v2.py` is a fixed event list (one entry says "as of March 26"), and the prompt stamps today's date from the server clock. Verdicts are only as good as the local model and that list.

## What you need

- Python 3.8 or later
- [Ollama](https://ollama.com/download) running locally
- Enough RAM/VRAM to run `qwen3-coder:30b` (or change `MODEL` in `backend-server-v2.py` to a smaller model)
- Chrome, Edge, or Firefox

## Install

```bash
git clone https://github.com/laird/fact-check.git
cd fact-check

# Install Ollama from https://ollama.com/download, then pull the model the backend expects
ollama pull qwen3-coder:30b

python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install flask requests

python3 backend-server-v2.py
```

The API listens on `http://localhost:8000`. Leave that process running.

### Load the extension

**Chrome / Edge**

1. Open `chrome://extensions` or `edge://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked** and select this `fact-check` folder.

**Firefox**

1. Open `about:debugging`, then **This Firefox**.
2. Click **Load Temporary Add-on** and select `manifest.json`.
   Temporary add-ons are removed when Firefox quits.

## First run

1. Confirm the backend is up: `curl http://localhost:8000/health`
   Expect HTTP 200. `"status": "ok"` and `"ollama": "online"` mean Ollama answered `http://localhost:11434/api/tags`. `"status": "degraded"` and `"ollama": "offline"` mean it did not.
2. Open Reddit, Facebook, or Twitter/X and refresh the page.
3. Click **Fact Check** on a post. Results appear in a modal on the page.

Optional API check. After punctuation is stripped, a sentence has to be longer than 20 characters or the backend will not send it to the model:

```bash
curl -X POST http://localhost:8000/api/factcheck \
  -H "Content-Type: application/json" \
  -d '{"text": "The Eiffel Tower is in Paris."}'
```

The model is prompted for `verdict` of `"true"`, `"false"`, or `"unclear"`, and for `confidence` from 0.0 to 1.0. If those fields are missing, the API fills in `"unclear"` and `0.5`.

## How it actually works

1. A content script injects a button on supported sites (`platforms/reddit.js` on posts and comments, `facebook.js` and `twitter.js` on posts).
2. The extension posts the extracted text to `POST /api/factcheck`.
3. Text longer than 5000 characters is rejected. Otherwise the backend splits on `.`, `!`, and `?`, keeps at most 10 sentences longer than 20 characters, calls Ollama for each of those, and returns JSON. A sentence is omitted when Ollama errors, times out, or returns text that is not JSON.

The model setting is in `backend-server-v2.py`:

```python
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen3-coder:30b"
```

`qwen3-coder` is a coding model. If fact-checking quality is poor, try a general chat model and update `MODEL`.

Each claim object has `text`, `verdict`, `confidence`, `reasoning`, `related_events`, and `requires_verification`. The response also has `summary`, `total_claims`, `false_count` (verdict exactly `"false"`), `unverified_count` (claims whose `requires_verification` is true), and `context_date` (`YYYY-MM-DD`).

## Privacy

Analysis runs on your machine through local Ollama. The extension does not upload posts to a fact-check vendor. That is not the same as "no network use at all": the page is still a social-media site, and the backend does not currently call a live news API despite some older wording.

## Troubleshooting

| Problem | What to try |
|---|---|
| Backend will not start | `curl http://localhost:11434/api/tags` — start Ollama if that fails; `ollama pull` the configured model |
| `Address already in use` | Another process owns port 8000 |
| No Fact Check button | Refresh the page; confirm the extension is enabled and the site is reddit.com, facebook.com, twitter.com, or x.com |
| Timeouts | The backend uses a 30-second timeout *per claim*. Long posts are slow. Try a smaller model. |

Related write-ups in this repo (`INSTALL.md`, `SETUP.md`, `QUICK_START.md`) overlap this README and have drifted. Prefer this file, or fold those guides into it so there is a single source of truth.

## License

The README previously said MIT, but there is no `LICENSE` file. Add one if you want others to reuse the code.
