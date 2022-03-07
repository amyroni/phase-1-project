const searchForm = document.querySelector("#list-name-form");
const searchSelect = document.querySelector("#list-name-select");

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadBooks(searchSelect.value);
  searchForm.reset();
});

function loadBooks(listName) {
  fetch(`https://api.nytimes.com/svc/books/v3/lists/current/${listName}.json?api-key=aNs4DvNstJ3L1WqPFzC9YFpp07TYJ95D`)
  .then(response => response.json())
  .then(books => books.results.books.forEach(book => loadThumbnail(book)))
}

function loadThumbnail(book) {
  const thumbnailCard = document.createElement("div");
  thumbnailCard.className = "thumbnail";
  const thumbnailImg = document.createElement("img");
  thumbnailImg.src = book.book_image;
  thumbnailImg.style.cursor = "pointer";
  thumbnailImg.addEventListener("click", () => showDetails(book));
  const thumbnailHeader = document.createElement("p");
  thumbnailHeader.textContent = toTitleCase(book.title);
  thumbnailHeader.className = "title";
  const thumbnailRank = document.createElement("p");
  thumbnailRank.textContent = `Rank: ${book.rank}`;
  thumbnailCard.append(thumbnailImg, thumbnailHeader, thumbnailRank);
  document.querySelector("#books-container").append(thumbnailCard);
}

function showDetails(book) {
  const bookImg = document.createElement("img");
  bookImg.src = book.book_image;
  const bookTitle = document.createElement("h2");
  bookTitle.textContent = book.title;
  const bookDescription = document.createElement("p");
  bookDescription.textContent = book.description;
  document.querySelector("#details-container").append(bookImg, bookTitle, bookDescription);
}

function toTitleCase(str) {
  return str.toLowerCase().split(' ').map(function (word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
}