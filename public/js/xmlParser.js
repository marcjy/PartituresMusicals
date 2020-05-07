

fetch('/xml')
  .then(res => res.text())
  .then(text => {
    let parser = new DOMParser();
    let xml = parser.parseFromString(text, "text/xml");
    document.getElementById('output').textContent = text;
  });
