// Extract the full HTML of the page
const pageHTML = document.documentElement.outerHTML;
const pageUrl = window.location.href; // Get the current page URL

// Send the HTML and page URL to the backend
fetch('http://localhost:3000/save-html', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ html: pageHTML, pageUrl })
}).then(response => {
  console.log('HTML sent successfully:', response);
}).catch(error => {
  console.error('Error sending HTML:', error);
});
