/**
 * Twitter/X Fact Checker Content Script
 * Injects fact-check buttons on Twitter/X posts
 */

// Configuration
const BACKEND_URL = 'http://localhost:8000/api/factcheck';
const BUTTON_CLASS = 'chip-fact-check-button';
const PROCESSED_CLASS = 'chip-processed';

// Selectors for Twitter/X posts
const POST_SELECTORS = [
  '[data-testid="tweet"]',
  'article',
  '[role="article"]'
];

// Get text content from a Twitter post
function getPostContent(postElement) {
  // Try multiple selectors for post text
  const textSelectors = [
    '[data-testid="tweetText"]',
    '[dir="auto"] span',
    '.css-901oao'
  ];
  
  let text = '';
  for (let selector of textSelectors) {
    const el = postElement.querySelector(selector);
    if (el) {
      text = el.innerText || el.textContent;
      if (text.length > 20) break;
    }
  }
  
  // Fallback: get all text from post
  if (!text || text.length < 20) {
    text = postElement.innerText || postElement.textContent;
  }
  
  return text.trim().substring(0, 2000);  // Limit to 2000 chars
}

// Create fact-check button
function createFactCheckButton(postElement) {
  // Check if already processed
  if (postElement.classList.contains(PROCESSED_CLASS)) {
    return;
  }
  
  // Look for the action buttons area
  const actionArea = postElement.querySelector('[role="group"]') ||
                    postElement.querySelector('[data-testid="tweet"]');
  
  if (!actionArea) return;
  
  // Create button
  const button = document.createElement('button');
  button.className = BUTTON_CLASS;
  button.innerHTML = '🔍 Fact Check';
  button.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: none;
    border: 1px solid #667eea;
    border-radius: 20px;
    color: #667eea;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s;
    margin-right: 8px;
  `;
  
  // Hover effect
  button.addEventListener('mouseover', () => {
    button.style.backgroundColor = '#667eea';
    button.style.color = 'white';
  });
  button.addEventListener('mouseout', () => {
    button.style.backgroundColor = 'transparent';
    button.style.color = '#667eea';
  });
  
  // Click handler
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    const content = getPostContent(postElement);
    if (content) {
      showFactCheckModal(content);
    } else {
      showError('Could not extract post content');
    }
  });
  
  // Find the action buttons container
  const buttonsArea = postElement.querySelector('[role="group"]');
  if (buttonsArea) {
    buttonsArea.insertBefore(button, buttonsArea.firstChild);
  }
  
  // Mark as processed
  postElement.classList.add(PROCESSED_CLASS);
}

// Show fact-check modal with results
function showFactCheckModal(content) {
  // Remove existing modal
  const existing = document.getElementById('chip-modal');
  if (existing) existing.remove();
  
  // Create modal
  const modal = document.createElement('div');
  modal.id = 'chip-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999999;
  `;
  
  const content_div = document.createElement('div');
  content_div.style.cssText = `
    background: white;
    border-radius: 16px;
    padding: 24px;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  `;
  
  // Loading state
  content_div.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <div style="font-size: 24px; margin-bottom: 16px;">🔍</div>
      <div style="font-size: 16px; color: #667eea; font-weight: 600;">Analyzing...</div>
      <div style="font-size: 12px; color: #999; margin-top: 8px;">Checking facts against current news</div>
    </div>
  `;
  
  modal.appendChild(content_div);
  document.body.appendChild(modal);
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  
  // Fetch fact-check
  fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: content })
  })
  .then(r => r.json())
  .then(data => {
    renderResults(content_div, data);
  })
  .catch(err => {
    showError('Backend server not running (http://localhost:8000)');
    modal.remove();
  });
}

// Render results
function renderResults(container, data) {
  const claims = data.claims || [];
  
  let html = `
    <div style="margin-bottom: 24px;">
      <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #333;">📋 Fact Check Results</h2>
      <div style="font-size: 13px; color: #666; margin-bottom: 16px;">${claims.length} claims analyzed</div>
  `;
  
  // Summary
  const true_count = claims.filter(c => c.verdict === 'true').length;
  const false_count = claims.filter(c => c.verdict === 'false').length;
  const unverifiable = claims.filter(c => c.verdict === 'unverifiable').length;
  
  html += `
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px;">
      <div style="background: #e8f5e9; padding: 12px; border-radius: 8px; text-align: center;">
        <div style="font-size: 18px; font-weight: 600; color: #4caf50;">✅</div>
        <div style="font-size: 12px; color: #333;">Verified: ${true_count}</div>
      </div>
      <div style="background: #ffebee; padding: 12px; border-radius: 8px; text-align: center;">
        <div style="font-size: 18px; font-weight: 600; color: #f44336;">❌</div>
        <div style="font-size: 12px; color: #333;">False: ${false_count}</div>
      </div>
      <div style="background: #fff3e0; padding: 12px; border-radius: 8px; text-align: center;">
        <div style="font-size: 18px; font-weight: 600; color: #ff9800;">⏳</div>
        <div style="font-size: 12px; color: #333;">Unverified: ${unverifiable}</div>
      </div>
    </div>
  `;
  
  // Verdict
  let verdict = '✅ APPEARS ACCURATE';
  let verdict_color = '#4caf50';
  if (false_count > 0) {
    verdict = '❌ CONTAINS MISINFORMATION';
    verdict_color = '#f44336';
  } else if (unverifiable > 0) {
    verdict = '⏳ PARTIALLY UNVERIFIABLE';
    verdict_color = '#ff9800';
  }
  
  html += `
    <div style="padding: 12px; border-radius: 8px; background: #f5f5f5; margin-bottom: 16px;">
      <div style="font-weight: 600; color: ${verdict_color}; font-size: 14px;">${verdict}</div>
    </div>
  `;
  
  // Claims
  if (claims.length > 0) {
    html += '<div style="margin-top: 16px;"><strong style="font-size: 13px;">Claims Analyzed:</strong>';
    
    claims.forEach(claim => {
      const emoji = claim.verdict === 'true' ? '✅' : claim.verdict === 'false' ? '❌' : '⏳';
      const color = claim.verdict === 'true' ? '#4caf50' : claim.verdict === 'false' ? '#f44336' : '#ff9800';
      
      html += `
        <div style="margin-top: 10px; padding: 10px; background: #fafafa; border-left: 3px solid ${color}; border-radius: 4px;">
          <div style="font-size: 12px; color: #333;">
            <strong>${emoji} ${claim.verdict.toUpperCase()}</strong> (${claim.confidence}%)
          </div>
          <div style="font-size: 11px; color: #666; margin-top: 4px;">
            "${claim.text.substring(0, 70)}..."
          </div>
        </div>
      `;
    });
    
    html += '</div>';
  }
  
  html += `
    <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #eee;">
      <button style="
        width: 100%;
        padding: 10px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 13px;
      " onclick="document.getElementById('chip-modal').remove();">Close</button>
    </div>
  `;
  
  html += '</div>';
  
  container.innerHTML = html;
}

// Show error
function showError(message) {
  const modal = document.getElementById('chip-modal');
  if (modal) modal.remove();
  
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #f44336;
    color: white;
    padding: 16px 20px;
    border-radius: 6px;
    z-index: 999999;
    font-size: 13px;
    max-width: 300px;
  `;
  errorDiv.innerHTML = `❌ ${message}`;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => errorDiv.remove(), 5000);
}

// Process posts
function processPosts() {
  document.querySelectorAll(POST_SELECTORS.join(',')).forEach(post => {
    if (!post.classList.contains(PROCESSED_CLASS)) {
      createFactCheckButton(post);
    }
  });
}

// Initialize
console.log('🔍 Chip Fact Checker loaded on Twitter/X');
processPosts();

// Watch for new posts
const observer = new MutationObserver(processPosts);
observer.observe(document.body, {
  childList: true,
  subtree: true
});
