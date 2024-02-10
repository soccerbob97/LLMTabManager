// Create the overlay
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

const textbox = document.createElement('input'); // Use input for simplicity
textbox.setAttribute('type', 'text');
textbox.style.margin = '20px 0'; // Add margin to space out elements
textbox.style.padding = '10px';
textbox.style.width = '60%'; // Adjust width as needed
textbox.style.fontSize = '16px';
overlay.appendChild(textbox);


// Optional: Add a close function
overlay.addEventListener('click', function(event) {
  if (event.target === overlay) {
    overlay.style.display = 'none';
  }
});

const resultsContainer = document.createElement('div');
resultsContainer.style.width = '60%'; // Match textbox width
resultsContainer.style.maxHeight = '60%'; // Limit height to prevent overflow
resultsContainer.style.overflowY = 'auto'; // Enable scroll for overflow
resultsContainer.style.marginTop = '20px'; // Space between textbox and results
resultsContainer.style.backgroundColor = '#fff'; // Background for visibility
resultsContainer.style.borderRadius = '8px'; // Rounded corners for aesthetics
resultsContainer.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'; // Add shadow for depth
overlay.appendChild(resultsContainer);

// Function to perform the search
function performSearch(query) {
    const apiKey = 'AIzaSyCnRVwDmCPmDTiidxXXlUymp8QIRIYUbm0';
    const cx = '16624c8c8d1704979';
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;
  
    fetch(url)
      .then(response => response.json())
      .then(data => {
        displayResults(data.items); // Assuming `displayResults` is a function you'll implement to display the search results.
      })
      .catch(error => console.error('Error fetching search results:', error));
  }

  function displayResults(items) {
    resultsContainer.innerHTML = ''; // Clear previous results

    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.style.display = 'flex';
        itemElement.style.justifyContent = 'space-between';
        itemElement.style.alignItems = 'center';
        itemElement.style.padding = '10px';
        itemElement.style.borderBottom = '1px solid #eee'; // Divider between items

        const textContainer = document.createElement('div');
        textContainer.style.flexGrow = '1';

        const title = document.createElement('a');
        title.href = item.link;
        title.textContent = item.title;
        title.style.display = 'block';
        title.style.fontSize = '18px';
        title.style.color = '#1a0dab';
        title.style.marginRight = '10px'; // Ensure some space between the text and the image
        title.target = '_blank'; // Open in new tab

        const snippet = document.createElement('p');
        snippet.textContent = item.snippet;
        snippet.style.fontSize = '14px';

        textContainer.appendChild(title);
        textContainer.appendChild(snippet);

        title.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default link behavior
            const url = this.href; // Get the href value from the clicked link
        
            // Send a message to the background script
            chrome.runtime.sendMessage({action: "openOrFocus", url: url}, function(response) {
                console.log(response.result); // Log the response from the background script
            });
        });

        // Assuming the image URL is in item.pagemap.cse_image[0].src
        let imageUrl = item.pagemap?.cse_image?.[0]?.src;
        if (imageUrl) {
            const imageContainer = document.createElement('div');
            imageContainer.style.flexShrink = '0';
            imageContainer.style.width = '120px'; // Fixed width for the image
            imageContainer.style.height = '120px'; // Fixed height for the image
            imageContainer.style.backgroundImage = `url(${imageUrl})`;
            imageContainer.style.backgroundSize = 'cover';
            imageContainer.style.backgroundPosition = 'center';
            imageContainer.style.marginLeft = '10px'; // Space between text and image

            itemElement.appendChild(textContainer);
            itemElement.appendChild(imageContainer);
        } else {
            itemElement.appendChild(textContainer);
        }

        resultsContainer.appendChild(itemElement);
    });
}

// Listen for 'Enter' keypress to perform search
textbox.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission or new lines
        performSearch(textbox.value.trim()); // Trim whitespace and perform search
    }
});