# 🚀 Installation Guide - Chip Fact Checker

**One-click fact-checking for Reddit, Facebook, Twitter/X**

---

## Prerequisites

✅ **Ollama** running locally (for AI backend)
✅ **Python 3.8+** (for Flask backend)
✅ **Chrome, Edge, or Firefox** (for extension)

---

## Step 1: Start Backend Server

### 1a. Install Python dependencies
```bash
pip install flask requests
```

### 1b. Start the server
```bash
cd /path/to/fact-check
python3 backend-server-v2.py
```

**Expected output:**
```
🚀 Chip Fact Checker Backend Server v2
Model: qwen3-coder:30b
Ollama: http://localhost:11434/api/generate

Starting server on http://localhost:8000
Features:
  ✅ Current news context integration
  ✅ Confidence scoring
  ✅ Related events tagging
  ✅ Verification requirements flagging

Endpoints:
  POST /api/factcheck — Fact-check text
  GET /api/news — Get current news context
  GET /health — Health check
```

✅ **Server is running** — Leave it running in terminal or background

---

## Step 2: Install Browser Extension

### Chrome / Microsoft Edge

1. **Open extensions page**
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`

2. **Enable Developer Mode**
   - Toggle in top-right corner

3. **Load Unpacked**
   - Click "Load unpacked"
   - Select the `fact-check` folder

4. **Extension appears in toolbar** ✅
   - Pin it for easy access
   - Icon shows magnifying glass + checkmark

### Firefox

1. **Open about:debugging**
   - Type `about:debugging` in address bar
   - Press Enter

2. **Go to "This Firefox"**
   - Left sidebar → "This Firefox"

3. **Load Temporary Add-on**
   - Click "Load Temporary Add-on"
   - Select `manifest.json` from `fact-check` folder

4. **Extension appears in toolbar** ✅
   - Icon shows magnifying glass + checkmark

---

## Step 3: Test on Social Media

### Visit a Platform
- **Reddit:** https://reddit.com
- **Facebook:** https://facebook.com
- **Twitter/X:** https://twitter.com or https://x.com

### Find a Post

Pick any post or comment with text content.

### Click "🔍 Fact Check"

Look for the **"🔍 Fact Check"** button that appears on posts.

### See Results

Beautiful modal appears with:
- ✅ Number of claims analyzed
- ✅ True / False / Unverifiable breakdown
- ✅ Confidence percentages
- ✅ Individual claim analysis
- ✅ Overall verdict

---

## Troubleshooting

### Backend won't start

**Error:** `Connection refused` or `Port 8000 in use`

**Solutions:**
```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# If not running:
systemctl --user start ollama

# Or if port 8000 is in use:
lsof -i :8000  # Find process
kill -9 <PID>  # Kill it
```

### Extension not showing buttons

**Error:** No "🔍 Fact Check" button appears on posts

**Solutions:**
1. **Refresh the page** (Ctrl+R or Cmd+R)
2. **Check browser console** (F12 → Console tab)
3. **Verify backend is running**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status": "ok"}`

4. **Reload extension**
   - Chrome/Edge: Find extension, click refresh icon
   - Firefox: Go to about:debugging, click "Reload"

### Fact-check taking forever

**Cause:** Large posts have many claims to analyze (1-2 sec each)

**Solutions:**
- Try smaller posts first
- Wait patiently for analysis (2-5 seconds typical)
- Check backend terminal for errors

### Backend returns error

**Error:** "Backend server not running"

**Solutions:**
```bash
# Verify backend is accessible
curl http://localhost:8000/api/health

# Check Ollama is responsive
curl http://localhost:11434/api/generate \
  -d '{"model":"qwen3-coder:30b","prompt":"test","stream":false}'

# Restart everything
# 1. Kill backend (Ctrl+C in terminal)
# 2. Restart: python3 backend-server-v2.py
# 3. Reload extension
# 4. Refresh page
```

---

## What Happens Next?

### When you click "🔍 Fact Check":

1. **Extension extracts text** from the post
2. **Backend receives text** via HTTP POST
3. **Server fetches current news** (March 2026 context)
4. **AI analyzes claims** using qwen3-coder:30b
5. **Results cached** for 1 hour (performance)
6. **Modal shows verdict**
   - ✅ Claims verified
   - ❌ Claims false
   - ⏳ Claims unverifiable

---

## First Use Checklist

- [ ] Backend server running (`python3 backend-server-v2.py`)
- [ ] Extension installed (chrome://extensions or about:debugging)
- [ ] Social media page loaded (reddit.com, facebook.com, twitter.com)
- [ ] Found a post with text content
- [ ] Clicked "🔍 Fact Check" button
- [ ] Modal appears with results
- [ ] Read verdict and claims
- [ ] Shared with friends!

---

## Pro Tips

✅ **Bookmark the GitHub repo**
- https://github.com/laird/fact-check
- Star for updates

✅ **Keep backend running in background**
- Terminal window or tmux session
- Or use `nohup python3 backend-server-v2.py &`

✅ **Test accuracy first**
- Run on posts you know are false
- Run on posts you know are true
- Compare results

✅ **Clear browser cache if issues**
- Chrome: Ctrl+Shift+Delete
- Edge: Ctrl+Shift+Delete
- Firefox: Ctrl+Shift+Delete

✅ **Share findings**
- Screenshot results
- Share with friends/family
- Help combat misinformation!

---

## Performance Expectations

| Metric | Value |
|--------|-------|
| **First load** | 2-3 seconds |
| **Cached check** | <100ms |
| **Per-claim analysis** | 1-2 seconds |
| **Modal appear time** | 3-5 seconds total |
| **Browser extension size** | ~100 KB |
| **Memory usage** | ~50-100 MB (extension + Ollama) |

---

## Next Steps

1. **Install and test** (15 minutes)
2. **Verify accuracy** on known claims (10 minutes)
3. **Use daily** on social media!
4. **Report issues** on GitHub
5. **Suggest improvements** via GitHub issues

---

## Get Help

**GitHub Issues:** https://github.com/laird/fact-check/issues

**Common questions:**
- How do I update the extension?
- Can I use it on mobile?
- Does it work offline?
- How accurate is it?

Check the [README.md](README.md) for full documentation!

---

## Have Fun! 🔥

You now have a powerful fact-checking tool at your fingertips.

**Use it to fight misinformation, one post at a time.**

Happy fact-checking! 🎉
