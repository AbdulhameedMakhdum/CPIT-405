const accessKey = "QC_1l3lxccjF4d6Duu-KZsJAJMvGQ61KZ0NsJyWnF5A";
const results = document.getElementById('results');

function searchWithXHR() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return alert("Please enter a search term!");
  const xhr = new XMLHttpRequest();
  xhr.open("GET", `https://api.unsplash.com/search/photos?query=${query}&per_page=12`);
  xhr.setRequestHeader("Authorization", `Client-ID ${accessKey}`);
  xhr.onload = function() {
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      displayImages(data.results);
    } else {
      alert("Error fetching images via XHR");
    }
  };
  xhr.send();
}

function searchWithFetch() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return alert("Please enter a search term!");
  fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=12`, {
    headers: { Authorization: `Client-ID ${accessKey}` }
  })
  .then(res => {
    if (!res.ok) throw new Error("Network response not ok");
    return res.json();
  })
  .then(data => displayImages(data.results))
  .catch(err => alert("Error fetching images via Fetch: " + err));
}

async function searchWithAsync() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return alert("Please enter a search term!");
  try {
    const res = await fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=12`, {
      headers: { Authorization: `Client-ID ${accessKey}` }
    });
    if (!res.ok) throw new Error("Network response not ok");
    const data = await res.json();
    displayImages(data.results);
  } catch (err) {
    alert("Error fetching images via Async/Await: " + err);
  }
}

function displayImages(images) {
  results.innerHTML = "";
  images.forEach(img => {
    const image = document.createElement('img');
    image.src = img.urls.small;
    image.alt = img.alt_description || "Unsplash Image";
    results.appendChild(image);
  });
}
