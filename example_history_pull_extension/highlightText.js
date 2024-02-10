// Call the function with the text you want to highlight
console.log("highlighting")
document.body.innerHTML = document.body.innerHTML.replace(/(examples)/gi, '<span style="background-color: yellow;">$1</span>');
 