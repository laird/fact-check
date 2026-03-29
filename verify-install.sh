#!/bin/bash
# Chip Fact Checker - Pre-Installation Verification

echo "🔍 Chip Fact Checker - Installation Verification"
echo "=================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

checks_passed=0
checks_failed=0

# Check 1: Python
echo -n "Checking Python 3... "
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    echo -e "${GREEN}✅ Found (v$PYTHON_VERSION)${NC}"
    ((checks_passed++))
else
    echo -e "${RED}❌ NOT FOUND${NC}"
    echo "   Install: brew install python3 (macOS) or apt install python3 (Linux)"
    ((checks_failed++))
fi

# Check 2: pip
echo -n "Checking pip... "
if command -v pip3 &> /dev/null; then
    PIP_VERSION=$(pip3 --version 2>&1 | awk '{print $2}')
    echo -e "${GREEN}✅ Found (v$PIP_VERSION)${NC}"
    ((checks_passed++))
else
    echo -e "${RED}❌ NOT FOUND${NC}"
    echo "   Install: python3 -m pip install --upgrade pip"
    ((checks_failed++))
fi

# Check 3: Flask
echo -n "Checking Flask... "
if python3 -c "import flask" 2>/dev/null; then
    FLASK_VERSION=$(python3 -c "import flask; print(flask.__version__)")
    echo -e "${GREEN}✅ Found (v$FLASK_VERSION)${NC}"
    ((checks_passed++))
else
    echo -e "${YELLOW}⚠️  NOT INSTALLED${NC}"
    echo "   Install: pip3 install flask requests"
    ((checks_failed++))
fi

# Check 4: Requests
echo -n "Checking Requests... "
if python3 -c "import requests" 2>/dev/null; then
    REQUESTS_VERSION=$(python3 -c "import requests; print(requests.__version__)")
    echo -e "${GREEN}✅ Found (v$REQUESTS_VERSION)${NC}"
    ((checks_passed++))
else
    echo -e "${YELLOW}⚠️  NOT INSTALLED${NC}"
    echo "   Install: pip3 install requests"
    ((checks_failed++))
fi

# Check 5: Ollama
echo -n "Checking Ollama (http://localhost:11434)... "
if curl -s http://localhost:11434/api/tags &> /dev/null; then
    echo -e "${GREEN}✅ Running${NC}"
    ((checks_passed++))
else
    echo -e "${RED}❌ NOT RUNNING${NC}"
    echo "   Start: ollama serve"
    echo "   Or: systemctl --user start ollama"
    ((checks_failed++))
fi

# Check 6: qwen3-coder:30b model
echo -n "Checking qwen3-coder:30b model... "
if curl -s http://localhost:11434/api/tags | grep -q "qwen3-coder:30b" 2>/dev/null; then
    echo -e "${GREEN}✅ Available${NC}"
    ((checks_passed++))
else
    echo -e "${YELLOW}⚠️  NOT FOUND${NC}"
    echo "   Pull: ollama pull qwen3-coder:30b"
    ((checks_failed++))
fi

# Check 7: Browser (basic check)
echo -n "Checking Chrome/Edge/Firefox... "
if command -v google-chrome &> /dev/null || \
   command -v chromium &> /dev/null || \
   command -v firefox &> /dev/null || \
   command -v microsoft-edge &> /dev/null; then
    echo -e "${GREEN}✅ Found${NC}"
    ((checks_passed++))
else
    echo -e "${YELLOW}⚠️  NO BROWSER DETECTED${NC}"
    echo "   Install: Chrome, Edge, or Firefox"
    ((checks_failed++))
fi

# Check 8: Extension files
echo -n "Checking extension files... "
FILES_OK=true
for file in manifest.json backend-server-v2.py popup.html styles.css; do
    if [ ! -f "$file" ]; then
        FILES_OK=false
        break
    fi
done
if [ "$FILES_OK" = true ]; then
    echo -e "${GREEN}✅ All present${NC}"
    ((checks_passed++))
else
    echo -e "${RED}❌ Missing files${NC}"
    echo "   Check: You're in the fact-check directory"
    ((checks_failed++))
fi

echo ""
echo "=================================================="
echo -e "Results: ${GREEN}$checks_passed passed${NC}, ${RED}$checks_failed failed${NC}"
echo ""

if [ $checks_failed -eq 0 ]; then
    echo -e "${GREEN}✅ READY TO INSTALL!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start backend: python3 backend-server-v2.py"
    echo "2. Install extension (chrome://extensions or about:debugging)"
    echo "3. Visit Reddit, Facebook, or Twitter/X"
    echo "4. Click '🔍 Fact Check' on any post"
    echo ""
    echo "Happy fact-checking! 🔥"
else
    echo -e "${RED}❌ SETUP INCOMPLETE${NC}"
    echo ""
    echo "Fix the issues above and run this script again:"
    echo "  bash verify-install.sh"
fi
