# ⚡ Quick Start (5 Minutes)

## 1️⃣ Install Dependencies

```bash
# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate

# Install Flask and Requests
pip install flask requests
```

## 2️⃣ Start Backend Server

```bash
python3 backend-server-v2.py
```

**You should see:**
```
🚀 Chip Fact Checker Backend Server v2
Starting server on http://localhost:8000
```

✅ **Leave this running**

## 3️⃣ Install Extension

### Chrome / Edge
1. Go to `chrome://extensions` (or `edge://extensions`)
2. Turn on **Developer Mode** (top right)
3. Click **Load unpacked**
4. Select the `fact-check` folder
5. Done! ✅

### Firefox
1. Go to `about:debugging`
2. Click **This Firefox**
3. Click **Load Temporary Add-on**
4. Select `manifest.json` from `fact-check` folder
5. Done! ✅

## 4️⃣ Test It

1. Go to **Reddit** (reddit.com) or **Facebook** (facebook.com) or **Twitter** (twitter.com)
2. Find any post with text
3. Look for **"🔍 Fact Check"** button
4. Click it
5. See results in 3-5 seconds! 📊

## 🎯 Expected Results

```
📋 Fact Check Results

✅ 2 verified
❌ 1 false
⏳ 0 unverifiable

🎯 VERDICT: Contains misinformation
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Flask not found | `pip install flask requests` |
| Port 8000 in use | `lsof -i :8000` then `kill -9 <PID>` |
| No buttons on page | Refresh page (Ctrl+R) |
| Timeout error | Wait 10 sec, try again |
| Wrong result | Check backend terminal for errors |

---

## What's Next?

✅ Fact-check your daily social media feeds
✅ Share findings with friends
✅ Report issues on GitHub
✅ Enjoy fighting misinformation! 🔥

---

For detailed setup, see [INSTALL.md](INSTALL.md)
