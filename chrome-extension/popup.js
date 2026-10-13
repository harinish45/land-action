document.getElementById('open-app-btn').addEventListener('click', () => {
  const query = document.getElementById('survey-input').value || '112/5';
  chrome.tabs.create({ url: `http://localhost:3000/?q=${encodeURIComponent(query)}` });
});
