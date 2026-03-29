#!/usr/bin/env python3
"""
Chip Fact Checker Backend Server
Receives text from browser extension, fact-checks with qwen3-coder:30b, returns results
"""

from flask import Flask, request, jsonify
import requests
import json
import re

app = Flask(__name__)

# Ollama configuration
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen3-coder:30b"

def extract_claims(text):
    """Extract factual claims from text"""
    # Simple claim extraction (could be enhanced with NLP)
    sentences = re.split(r'[.!?]+', text)
    claims = []
    
    for sentence in sentences:
        sentence = sentence.strip()
        if len(sentence) > 20:  # Only substantive sentences
            claims.append(sentence)
    
    return claims[:10]  # Limit to first 10 claims

def fact_check_claim(claim):
    """Use Chip AI to fact-check a single claim"""
    prompt = f"""Fact-check this claim: "{claim}"

Your response MUST be valid JSON (no markdown, no code blocks):
{{
  "claim": "the claim text",
  "status": "true", "false", or "unclear",
  "confidence": 0.0 to 1.0,
  "explanation": "brief explanation",
  "sources": ["source1", "source2"] or []
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
            # Try to parse as pure JSON
            data = json.loads(text)
            return data
        except json.JSONDecodeError:
            # Try to extract JSON from text
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
    """Main fact-check endpoint"""
    try:
        data = request.json
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        if len(text) > 5000:
            return jsonify({"error": "Text too long (max 5000 chars)"}), 400
        
        # Extract claims
        claims = extract_claims(text)
        
        # Fact-check each claim
        results = []
        for claim in claims:
            result = fact_check_claim(claim)
            if result:
                results.append({
                    "text": claim,
                    "status": result.get('status', 'unclear'),
                    "confidence": result.get('confidence', 0.5),
                    "notes": result.get('explanation', ''),
                    "sources": result.get('sources', [])
                })
        
        # Generate summary
        total = len(results)
        verified = sum(1 for r in results if r['status'] == 'true')
        false_claims = sum(1 for r in results if r['status'] == 'false')
        
        if false_claims > 0:
            summary = f"Found {false_claims} potentially false claim(s) out of {total} checked."
        elif verified == total:
            summary = f"All {total} claims appear accurate."
        else:
            summary = f"Mixed results: {verified} verified, {total - verified} unclear."
        
        return jsonify({
            "claims": results,
            "summary": summary,
            "total_claims": total
        })
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        # Test Ollama connection
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        ollama_ok = response.status_code == 200
    except:
        ollama_ok = False
    
    return jsonify({
        "status": "ok" if ollama_ok else "degraded",
        "ollama": "online" if ollama_ok else "offline"
    })

if __name__ == '__main__':
    print("🚀 Chip Fact Checker Backend Server")
    print(f"Model: {MODEL}")
    print(f"Ollama: {OLLAMA_URL}")
    print("\nStarting server on http://localhost:8000")
    print("Make sure Ollama is running: ollama serve")
    print("\nExtension should connect automatically.")
    
    app.run(host='localhost', port=8000, debug=True)
