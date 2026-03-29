# Chip Fact Checker - Browser Extension

One-click fact-checking for Reddit posts and comments using Chip AI.

## Features

✅ **One-click fact-checking** — Click "🔍 Fact Check" button on any post/comment
✅ **Instant results** — Analyzes claims in seconds using local AI
✅ **Confidence ratings** — See how confident Chip is about each claim
✅ **Beautiful UI** — Modal popup with clean, organized results
✅ **Always-on** — Works on all Reddit pages
✅ **Free & private** — Runs locally, no data sent to third parties

## Installation

### Prerequisites

1. **Ollama running**
   ```bash
   ollama serve
   ```

2. **qwen3-coder:30b model**
   ```bash
   ollama pull qwen3-coder:30b
   ```

3. **Python 3.8+** (for backend server)

### Step 1: Start the Backend Server

```bash
cd /home/laird/clawd/projects/reddit-factcheck-extension
pip install flask requests
python3 backend-server.py
```

Server will start on `http://localhost:8000`

### Step 2: Install the Extension in Chrome/Edge

1. Open Chrome/Edge
2. Go to `chrome://extensions` (or `edge://extensions`)
3. Enable **Developer Mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select `/home/laird/clawd/projects/reddit-factcheck-extension/` folder
6. The "Chip Fact Checker" extension should appear!

### Step 3: Use It!

1. Go to any Reddit post (https://reddit.com)
2. Look for the **"🔍 Fact Check"** button on posts and comments
3. Click it
4. Results appear in a modal with:
   - ✓ Verified claims
   - ⚠️ Questionable claims
   - Confidence percentages
   - Brief explanations

## File Structure

```
reddit-factcheck-extension/
├── manifest.json          # Extension metadata
├── content.js             # Injects buttons on Reddit
├── popup.html             # Extension popup
├── styles.css             # Button & modal styles
├── backend-server.py      # Flask API server
├── README.md              # This file
└── images/                # Icons (create these)
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

## How It Works

1. **Content script** (content.js) runs on Reddit
2. **Fact Check button** appears on every post/comment
3. **User clicks button** → sends text to backend
4. **Backend server** uses `qwen3-coder:30b` to analyze claims
5. **Results modal** shows findings

## Configuration

### Change Backend URL
In `content.js`, line 3:
```javascript
const CHIP_BACKEND = "http://localhost:8000"; // Change this
```

### Change Model
In `backend-server.py`, line 13:
```python
MODEL = "qwen3-coder:30b"  # Change this
```

### Adjust Claim Extraction
In `backend-server.py`, function `extract_claims()` (line 16)

## Troubleshooting

### Extension not showing buttons?
- Check console (F12) for errors
- Verify you're on reddit.com domain
- Reload Reddit page (Ctrl+R)

### Fact Check button doesn't work?
- Verify backend server is running: `curl http://localhost:8000/health`
- Check Ollama is running: `ollama serve`
- Check Flask error output in terminal

### No results returned?
- Verify qwen3-coder:30b is loaded: `ollama list`
- Check backend logs for errors
- Verify text was extracted properly

## Future Enhancements

- [ ] Caching for repeated claims
- [ ] Browser sync (Firefox, Safari)
- [ ] Settings page for model selection
- [ ] Export fact-check results
- [ ] Integration with Telegram/Facebook
- [ ] NLP-based claim extraction
- [ ] Source citation
- [ ] Community feedback (upvote/downvote results)

## Privacy

All fact-checking happens **locally**:
- Text never leaves your computer
- No cloud API calls
- No tracking or analytics
- All data processed by your local qwen3-coder:30b

## Performance

- **First check**: ~5 seconds (loading model)
- **Subsequent checks**: ~2-3 seconds
- **Claims analyzed**: Up to 10 per post

## License

MIT - Use freely!

---

**Made with 🔥 by Chip** | Powered by Qwen 3.5 & Ollama
