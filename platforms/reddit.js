// Chip Fact Checker - Content Script for Reddit
// Injects "Fact Check" buttons on posts and comments

const CHIP_BACKEND = "http://localhost:8000"; // Change to your server

// Add fact-check button to posts
function addFactCheckButtons() {
  // Find all post containers
  const posts = document.querySelectorAll('[data-testid="post-container"]');
  posts.forEach(post => {
    if (post.querySelector('.chip-factcheck-btn')) return; // Already added
    
    const postContent = post.querySelector('[data-testid="post-content"]');
    if (!postContent) return;
    
    const text = postContent.textContent;
    const button = createFactCheckButton(text, 'post');
    
    const menuBar = post.querySelector('[data-testid="post-menu-bar"]');
    if (menuBar) {
      menuBar.appendChild(button);
    }
  });
  
  // Find all comments
  const comments = document.querySelectorAll('[data-testid="comment"]');
  comments.forEach(comment => {
    if (comment.querySelector('.chip-factcheck-btn')) return; // Already added
    
    const commentBody = comment.querySelector('[data-testid="comment-body"]');
    if (!commentBody) return;
    
    const text = commentBody.textContent;
    const button = createFactCheckButton(text, 'comment');
    
    commentBody.appendChild(button);
  });
}

// Create fact-check button
function createFactCheckButton(text, type) {
  const button = document.createElement('button');
  button.className = 'chip-factcheck-btn';
  button.textContent = '🔍 Fact Check';
  button.title = 'Check facts with Chip AI';
  
  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    button.textContent = '⏳ Checking...';
    button.disabled = true;
    
    try {
      const result = await factCheckText(text);
      showFactCheckResult(result, type);
    } catch (error) {
      showError(`Error: ${error.message}`);
    } finally {
      button.textContent = '🔍 Fact Check';
      button.disabled = false;
    }
  });
  
  return button;
}

// Send text to Chip for fact-checking
async function factCheckText(text) {
  const response = await fetch(`${CHIP_BACKEND}/api/factcheck`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text })
  });
  
  if (!response.ok) {
    throw new Error(`Server error: ${response.statusText}`);
  }
  
  return await response.json();
}

// Show fact-check results in a modal
function showFactCheckResult(result, type) {
  const modal = document.createElement('div');
  modal.className = 'chip-modal';
  
  const content = document.createElement('div');
  content.className = 'chip-modal-content';
  
  const title = document.createElement('h2');
  title.textContent = '✅ Fact Check Results';
  content.appendChild(title);
  
  // Display analysis
  if (result.claims && result.claims.length > 0) {
    const claimsList = document.createElement('div');
    claimsList.className = 'chip-claims';
    
    result.claims.forEach(claim => {
      const claimDiv = document.createElement('div');
      claimDiv.className = `chip-claim ${claim.confidence >= 0.7 ? 'verified' : 'questionable'}`;
      
      const icon = claim.confidence >= 0.7 ? '✓' : '⚠️';
      claimDiv.innerHTML = `
        <div class="chip-claim-header">
          <span class="chip-icon">${icon}</span>
          <span class="chip-claim-text">${claim.text}</span>
          <span class="chip-confidence">${Math.round(claim.confidence * 100)}%</span>
        </div>
        <div class="chip-notes">${claim.notes || ''}</div>
      `;
      
      claimsList.appendChild(claimDiv);
    });
    content.appendChild(claimsList);
  }
  
  // Summary
  const summary = document.createElement('div');
  summary.className = 'chip-summary';
  summary.innerHTML = `
    <p><strong>Summary:</strong> ${result.summary || 'No significant issues found.'}</p>
  `;
  content.appendChild(summary);
  
  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'chip-close-btn';
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', () => modal.remove());
  content.appendChild(closeBtn);
  
  modal.appendChild(content);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  
  document.body.appendChild(modal);
}

// Show error message
function showError(message) {
  const modal = document.createElement('div');
  modal.className = 'chip-modal chip-error';
  
  const content = document.createElement('div');
  content.className = 'chip-modal-content';
  content.innerHTML = `
    <h2>❌ Error</h2>
    <p>${message}</p>
    <button class="chip-close-btn" onclick="this.parentElement.parentElement.remove()">OK</button>
  `;
  
  modal.appendChild(content);
  document.body.appendChild(modal);
}

// Watch for new posts/comments (infinite scroll)
const observer = new MutationObserver(() => {
  addFactCheckButtons();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial scan
addFactCheckButtons();
