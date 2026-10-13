// LandAction - Master Application Controller
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initVeritasChat();
    initGlobalSearch();
    initProductModules();
  });

  // Product Navigation
  function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-tab-btn, .mobile-nav-link');
    const sections = document.querySelectorAll('.app-section');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');
        
        // Update active nav
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Show targeted section
        sections.forEach(s => {
          if (s.id === targetId) {
            s.classList.add('active');
            s.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            s.classList.remove('active');
          }
        });

        // Trigger module redraws if needed
        if (targetId === 'sec-pricemap' && window.LandActionPriceMap) {
          window.LandActionPriceMap.init();
        } else if (targetId === 'sec-buildscope' && window.LandActionBuildScope) {
          window.LandActionBuildScope.calculate();
        } else if (targetId === 'sec-legal' && window.LandActionLegalOpinion) {
          window.LandActionLegalOpinion.init();
        } else if (targetId === 'sec-tracker' && window.LandActionTracker) {
          window.LandActionTracker.init();
        } else if (targetId === 'sec-dealroom' && window.LandActionDealRoom) {
          window.LandActionDealRoom.init();
        } else if (targetId === 'sec-mcp' && window.LandActionMcpTester) {
          window.LandActionMcpTester.init();
        }
      });
    });
  }

  // Initialize individual submodules
  function initProductModules() {
    if (window.LandActionOneMap) window.LandActionOneMap.init();
    if (window.LandActionMinis) window.LandActionMinis.init();
    if (window.LandActionVerify) window.LandActionVerify.init();
    if (window.LandActionPriceMap) window.LandActionPriceMap.init();
    if (window.LandActionBuildScope) window.LandActionBuildScope.init();
    if (window.LandActionLegalOpinion) window.LandActionLegalOpinion.init();
    if (window.LandActionTracker) window.LandActionTracker.init();
    if (window.LandActionDealRoom) window.LandActionDealRoom.init();
    if (window.LandActionMcpTester) window.LandActionMcpTester.init();
  }

  // Veritas AI Chatbot
  function initVeritasChat() {
    const chatInput = document.getElementById('chat-input-text');
    const sendBtn = document.getElementById('chat-send-btn');
    const messagesContainer = document.getElementById('chat-messages-container');
    const quickPrompts = document.querySelectorAll('.chat-quick-prompt');

    if (!chatInput || !sendBtn || !messagesContainer) return;

    const sendMessage = async (text) => {
      const msg = text || chatInput.value.trim();
      if (!msg) return;

      // Append User message
      appendChatMessage('user', msg);
      chatInput.value = '';

      // Typing indicator
      const typingId = appendTypingIndicator();

      try {
        const resp = await fetch('/api/v1/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg })
        });
        const data = await resp.json();
        removeTypingIndicator(typingId);
        appendChatMessage('assistant', data.reply);
      } catch (err) {
        removeTypingIndicator(typingId);
        appendChatMessage('assistant', "I'm experiencing a temporary network error. You can still use the 123 free Minis tools and One Map layers directly!");
      }
    };

    sendBtn.addEventListener('click', () => sendMessage());
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });

    quickPrompts.forEach(p => {
      p.addEventListener('click', () => {
        sendMessage(p.textContent.trim());
      });
    });

    function appendChatMessage(sender, text) {
      const div = document.createElement('div');
      div.className = `chat-bubble ${sender}`;
      
      const avatar = sender === 'assistant' ? '🛡️' : '👤';
      const name = sender === 'assistant' ? 'Veritas AI' : 'You';

      div.innerHTML = `
        <div class="bubble-header">
          <span class="bubble-avatar">${avatar}</span>
          <span class="bubble-name font-mono">${name}</span>
          <span class="bubble-time">${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="bubble-content">${formatChatMarkdown(text)}</div>
      `;

      messagesContainer.appendChild(div);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function appendTypingIndicator() {
      const id = 'typing-' + Date.now();
      const div = document.createElement('div');
      div.id = id;
      div.className = 'chat-bubble assistant typing';
      div.innerHTML = `
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      `;
      messagesContainer.appendChild(div);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      return id;
    }

    function removeTypingIndicator(id) {
      const el = document.getElementById(id);
      if (el) el.remove();
    }

    function formatChatMarkdown(raw) {
      // Basic markdown parser for bold, code, lists, and linebreaks
      let html = raw
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code class="chat-code">$1</code>')
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n- /g, '<br/>• ')
        .replace(/\n/g, '<br/>');
      return html;
    }
  }

  // Global Search
  function initGlobalSearch() {
    const searchInput = document.getElementById('global-search-input');
    const searchResults = document.getElementById('global-search-results');

    if (!searchInput || !searchResults) return;

    searchInput.addEventListener('input', async (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        searchResults.classList.remove('active');
        return;
      }

      try {
        const resp = await fetch('/data/tn_registers.json');
        const data = await resp.json();
        const parcels = data.sample_parcels || [];

        const matchingParcels = parcels.filter(p => 
          p.survey_number.toLowerCase().includes(q) ||
          p.village.toLowerCase().includes(q) ||
          p.taluk.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q)
        );

        if (matchingParcels.length > 0) {
          searchResults.innerHTML = matchingParcels.map(p => `
            <div class="search-result-item" onclick="window.LandActionApp.selectParcel('${p.survey_number}')">
              <span class="sr-tag">Cadastral Survey</span>
              <strong>S.No ${p.survey_number}</strong>
              <div class="text-xs text-muted">${p.village}, ${p.taluk}, ${p.district} • ₹${p.guideline_value.current_rate_sqft}/sqft</div>
            </div>
          `).join('');
          searchResults.classList.add('active');
        } else {
          searchResults.innerHTML = `
            <div class="search-result-item no-match">
              <span>No direct parcel match for "${q}". Search by Survey No (e.g., 112/5, 163/2)</span>
            </div>
          `;
          searchResults.classList.add('active');
        }
      } catch (err) {
        console.error('Search error', err);
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.global-search-wrapper')) {
        searchResults.classList.remove('active');
      }
    });
  }

  window.LandActionApp = {
    selectParcel: (surveyNo) => {
      // Directs to Verify My Land or PriceMap
      const searchResults = document.getElementById('global-search-results');
      if (searchResults) searchResults.classList.remove('active');

      const verifyInput = document.getElementById('verify-input-survey');
      if (verifyInput) verifyInput.value = surveyNo;

      // Switch to verify tab
      const verifyTab = document.querySelector('[data-target="sec-verifymyland"]');
      if (verifyTab) verifyTab.click();

      // Trigger verification
      const verifyBtn = document.getElementById('verify-run-btn');
      if (verifyBtn) verifyBtn.click();
    }
  };
})();
