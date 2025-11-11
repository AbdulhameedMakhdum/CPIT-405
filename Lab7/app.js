const accessKey = "QC_1l3lxccjF4d6Duu-KZsJAJMvGQ61KZ0NsJyWnF5A";

document.getElementById('searchBtn').addEventListener('click', searchImages);

async function searchImages() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return alert("Please enter a search term!");

  try {
    const res = await fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=12`, {
      headers: {
        Authorization: `Client-ID ${accessKey}`
      }
    });
    const data = await res.json();
    displayImages(data.results);
  } catch (err) {
    console.error("Error fetching images:", err);
  }
}

function displayImages(images) {
  const results = document.getElementById('results');
  results.innerHTML = ""; // clear previous results

  images.forEach(img => {
    const image = document.createElement('img');
    image.src = img.urls.small;
    image.alt = img.alt_description || "Unsplash Image";
    results.appendChild(image);
  });
}
