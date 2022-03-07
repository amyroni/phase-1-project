const searchForm = document.querySelector("#list-name-form");
const searchSelect = document.querySelector("#list-name-select");
const detailsContainer = document.querySelector("#details-container");
const wishlistContainer = document.querySelector("#wishlist");

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
  thumbnailImg.className = "thumbnail";
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
  detailsContainer.innerHTML = "";
  const detailsInnerContainer = document.createElement("div");
  detailsInnerContainer.className = "details-inner-container";
  const exitBtn = document.createElement("button")
  exitBtn.textContent = "x";
  exitBtn.id = "exit-btn";
  exitBtn.addEventListener("click", () => hideDetails());
  const bookImg = document.createElement("img");
  bookImg.src = book.book_image;
  bookImg.className = "big-image";
  const bookTitle = document.createElement("h2");
  bookTitle.textContent = toTitleCase(book.title);
  const bookDescription = document.createElement("p");
  bookDescription.textContent = book.description;
  const addBtn = document.createElement("button");
  addBtn.textContent = "Add to wishlist";
  addBtn.addEventListener("click", () => addToCart(book));
  detailsInnerContainer.append(exitBtn, bookImg, bookTitle, bookDescription, addBtn);
  detailsContainer.append(detailsInnerContainer);
  detailsContainer.style.display = "block";
}

function addToCart(book) {
  hideDetails();
  const li = document.createElement("li");
  const title = toTitleCase(book.title);
  const buyBtn = document.createElement("button");
  buyBtn.textContent = "Buy";
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => deleteItem(li));

  li.append(title, buyBtn, removeBtn);
  document.querySelector("#booklist").append(li);
}

function deleteItem(item) {
  item.remove();
}

function hideDetails() {
  detailsContainer.style.display = "none";
}

function toTitleCase(str) {
  return str.toLowerCase().split(' ').map(function (word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
}