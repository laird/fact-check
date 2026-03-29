/**
 * Background Service Worker
 * Handles cross-platform coordination and caching
 */

console.log('🔍 Chip Fact Checker background service worker initialized');

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'factcheck') {
    // Forward fact-check request to backend
    fetch('http://localhost:8000/api/factcheck', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: request.text })
    })
    .then(r => r.json())
    .then(data => sendResponse({ success: true, data }))
    .catch(err => sendResponse({ success: false, error: err.message }));
    
    return true;  // Keep connection open for async response
  }
});

// Store check cache for performance
let checkCache = {};

// Cache results for 1 hour
const CACHE_TTL = 3600000;

function cacheKey(text) {
  return text.substring(0, 100).toLowerCase();
}

function getCachedResult(text) {
  const key = cacheKey(text);
  const cached = checkCache[key];
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  delete checkCache[key];
  return null;
}

function setCachedResult(text, data) {
  const key = cacheKey(text);
  checkCache[key] = {
    data,
    timestamp: Date.now()
  };
}

// Cleanup old cache entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(checkCache).forEach(key => {
    if (now - checkCache[key].timestamp > CACHE_TTL) {
      delete checkCache[key];
    }
  });
}, 300000);  // Every 5 minutes
