// Call the function with the text you want to highlight
console.log("highlighting")
// document.body.innerHTML = document.body.innerHTML.replace(/(examples)/gi, '<span style="background-color: yellow;">$1</span>');

// Create a new iframe element
const overlay = document.createElement('div');
overlay.style.position = 'fixed';
overlay.style.top = '0';
overlay.style.left = '0';
overlay.style.width = '100%';
overlay.style.height = '100%';
overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
overlay.style.zIndex = '10000'; // Ensure it's on top
overlay.style.display = 'flex';
overlay.style.flexDirection = 'column';
overlay.style.alignItems = 'center';
overlay.style.paddingTop = '100px'; // Add some padding to top for better visibility
document.body.appendChild(overlay);



const iframe = document.createElement('iframe');

// Set properties to make the iframe cover the entire viewport
iframe.style.position = 'fixed'; // Position fixed to cover the whole screen
iframe.style.top = '0';
iframe.style.left = '25vw';
iframe.style.width = '50vw'; // 100% of the viewport width
iframe.style.height = '50vh'; // 100% of the viewport height
iframe.style.border = ''; // No border for a seamless look
iframe.style.zIndex = '1000000'; // High z-index to ensure it's on top

// Set the source of the iframe to your local server
iframe.src = 'http://localhost:5175/clean';


overlay.appendChild(iframe)

iframe.addEventListener('click', function(event) {
  console.log('iframe clicked')
  if (event.target === iframe) {
    iframe.style.display = 'none';
    overlay.style.display = 'none';
  }
});

overlay.addEventListener('click', function(event) {
  console.log('iframe clicked')
  if (event.target === overlay) {
    iframe.style.display = 'none';
    overlay.style.display = 'none';
  }
});


window.addEventListener('message', function(event) {
  // Check the origin of the message for security
  // if (event.origin !== "http://example.com%22/) return;
  console.log('message.parent')
  if (event.data === 'closeOverlay') {
    overlay.style.display = 'none';
  }
});
// // Append the iframe to the body of the current page
// document.body.appendChild(iframe);

// // Optional: Prevent scrolling on the body to ensure the overlay feels integrated
// document.body.style.overflow = 'hidden';

// listen to messages from the iframe
window.addEventListener('message', (event) => {
  console.log('Message received:', event.data);
  // Check if the message is from the iframe
  if (event.source === iframe.contentWindow) {
    // Log the message data
    console.log('Message from iframe:', event.data);
    // send on chrome message passing
    chrome.runtime.sendMessage(event.data);
  }
});
