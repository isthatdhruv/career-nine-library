// document.getElementById('toggleMode').addEventListener('change', (event) => {
//   const parentDirectoryDropdown = document.getElementById('parentDirectory');
//   parentDirectoryDropdown.style.display = event.target.checked ? 'block' : 'none';
// });

document.getElementById('scrapeButton').addEventListener('click', async () => {
  const timestamp = new Date().toISOString();
  console.log(`Scrape button clicked at ${timestamp}`);
  const loadingIndicator = document.getElementById('loading');
  if (loadingIndicator) loadingIndicator.style.display = 'block';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        html: document.documentElement.outerHTML,
        pageUrl: window.location.href
      })
    });

    const { html, pageUrl } = result[0].result;


    // Send only to /save-html endpoint with html and pageUrl
    const requestBody = { html, pageUrl , timestamp };
    await fetch('http://localhost:3000/save-html', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    
  } catch (error) {
    console.error('Error sending HTML:', error);
    alert('Failed to send HTML.');
  } finally {
    if (loadingIndicator) loadingIndicator.style.display = 'none';
  }
});
