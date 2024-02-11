// Call the function with the text you want to highlight
console.log("highlighting")
// document.body.innerHTML = document.body.innerHTML.replace(/(examples)/gi, '<span style="background-color: yellow;">$1</span>');



const iframe = document.createElement('iframe');

// Set properties to make the iframe cover the entire viewport
iframe.style.position = 'fixed'; // Position fixed to cover the whole screen
iframe.style.top = '0';
iframe.style.left = '0';
iframe.style.width = '100vw'; // 100% of the viewport width
iframe.style.height = '100vh'; // 100% of the viewport height
iframe.style.border = ''; // No border for a seamless look
iframe.style.zIndex = '1000000'; // High z-index to ensure it's on top

// Set the source of the iframe to your local server
iframe.src = 'https://myv.vercel.app/clean';


// overlay.appendChild(iframe)
document.body.appendChild(iframe);

// // Optional: Prevent scrolling on the body to ensure the overlay feels integrated
document.body.style.overflow = 'hidden';

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
