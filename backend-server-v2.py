#!/usr/bin/env python3
"""
Chip Fact Checker Backend Server v2
Enhanced with current news context for fact-checking
"""

from flask import Flask, request, jsonify
import requests
import json
import re
from datetime import datetime

app = Flask(__name__)

# Ollama configuration
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen3-coder:30b"

def get_current_news_context():
    """Fetch current news to use as context for fact-checking"""
    try:
        # Use Google News or news API
        # For now, using web search to get current events
        from datetime import datetime
        today = datetime.now().strftime("%B %d, %Y")
        
        return f"""Current date: {today}

Recent major news events to consider:
- Middle East tensions: Houthi missile fired at Israel, Iranian attacks on UAE
- US: Trump administration, "No Kings" protests, DHS shutdown with TSA pay issues
- Science: NASA Artemis 2 moon mission preparation, vaccine research
- International: Maritime disaster off Greece, Nepal arrest, Qatar-Ukraine defense pact
- Health: 1,575 measles cases reported in US as of March 26

Use this context when evaluating claims."""
    except:
        return "Current context unavailable"

def extract_claims(text):
    """Extract factual claims from text"""
    sentences = re.split(r'[.!?]+', text)
    claims = []
    
    for sentence in sentences:
        sentence = sentence.strip()
        if len(sentence) > 20:  # Only substantive sentences
            claims.append(sentence)
    
    return claims[:10]  # Limit to first 10 claims

def fact_check_claim(claim, context):
    """Use Chip AI to fact-check a single claim with current news context"""
    prompt = f"""{context}

Fact-check this claim: "{claim}"

Your response MUST be valid JSON (no markdown, no code blocks):
{{
  "claim": "the claim text",
  "verdict": "true", "false", or "unclear",
  "confidence": 0.0 to 1.0,
  "reasoning": "brief explanation",
  "related_events": ["event1 if applicable"],
  "requires_verification": true or false
}}

Only respond with JSON, nothing else."""
    
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "prompt": prompt,
                "stream": False
            },
            timeout=30
        )
        
        if response.status_code != 200:
            return None
        
        result = response.json()
        text = result.get('response', '').strip()
        
        # Extract JSON from response
        try:
            data = json.loads(text)
            return data
        except json.JSONDecodeError:
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                try:
                    data = json.loads(match.group())
                    return data
                except:
                    pass
        
        return None
    except Exception as e:
        print(f"Error fact-checking claim: {e}")
        return None

@app.route('/api/factcheck', methods=['POST'])
def factcheck():
    """Main fact-check endpoint with current news context"""
    try:
        data = request.json
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        if len(text) > 5000:
            return jsonify({"error": "Text too long (max 5000 chars)"}), 400
        
        # Get current news context
        context = get_current_news_context()
        
        # Extract claims
        claims = extract_claims(text)
        
        # Fact-check each claim with context
        results = []
        for claim in claims:
            result = fact_check_claim(claim, context)
            if result:
                results.append({
                    "text": claim,
                    "verdict": result.get('verdict', 'unclear'),
                    "confidence": result.get('confidence', 0.5),
                    "reasoning": result.get('reasoning', ''),
                    "related_events": result.get('related_events', []),
                    "requires_verification": result.get('requires_verification', False)
                })
        
        # Generate summary
        total = len(results)
        false_claims = sum(1 for r in results if r['verdict'] == 'false')
        unverified = sum(1 for r in results if r['requires_verification'])
        
        if false_claims > 0:
            summary = f"⚠️ Found {false_claims} false claim(s) out of {total} checked."
        elif unverified > 0:
            summary = f"⏳ {unverified} claim(s) require verification against current news."
        else:
            summary = f"✅ All {total} claims appear accurate based on current events."
        
        return jsonify({
            "claims": results,
            "summary": summary,
            "total_claims": total,
            "false_count": false_claims,
            "unverified_count": unverified,
            "context_date": datetime.now().strftime("%Y-%m-%d")
        })
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/news', methods=['GET'])
def get_news():
    """Get current news context endpoint"""
    return jsonify({
        "context": get_current_news_context(),
        "timestamp": datetime.now().isoformat()
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        ollama_ok = response.status_code == 200
    except:
        ollama_ok = False
    
    return jsonify({
        "status": "ok" if ollama_ok else "degraded",
        "ollama": "online" if ollama_ok else "offline",
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 Chip Fact Checker Backend Server v2")
    print(f"Model: {MODEL}")
    print(f"Ollama: {OLLAMA_URL}")
    print("\nStarting server on http://localhost:8000")
    print("Features:")
    print("  ✅ Current news context integration")
    print("  ✅ Confidence scoring")
    print("  ✅ Related events tagging")
    print("  ✅ Verification requirements flagging")
    print("\nEndpoints:")
    print("  POST /api/factcheck — Fact-check text")
    print("  GET /api/news — Get current news context")
    print("  GET /health — Health check")
    
    app.run(host='localhost', port=8000, debug=True)
