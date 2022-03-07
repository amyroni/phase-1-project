const searchForm = document.querySelector("#list-name-form");
const searchSelect = document.querySelector("#list-name-select");
const detailsContainer = document.querySelector("#details-container");
const buyLinksContainer = document.querySelector("#buylinks-container");
const booksContainer = document.querySelector("#books-container");
let openWishlist = false;

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  booksContainer.innerHTML = "";
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
  const heart = document.createElement("span");
  heart.textContent = "♡";
  heart.className = "heart";
  const br = document.createElement("br");
  const thumbnailImg = document.createElement("img");
  thumbnailImg.src = book.book_image;
  thumbnailImg.className = "thumbnail";
  thumbnailImg.style.cursor = "pointer";
  thumbnailImg.addEventListener("click", () => showDetails(book, heart));
  const thumbnailHeader = document.createElement("p");
  thumbnailHeader.textContent = toTitleCase(book.title);
  thumbnailHeader.className = "title";
  const thumbnailRank = document.createElement("p");
  thumbnailRank.textContent = `Rank: ${book.rank}`;
  thumbnailCard.append(heart, br, thumbnailImg, thumbnailHeader, thumbnailRank);
  booksContainer.append(thumbnailCard);
}

function showDetails(book, heart) {
  detailsContainer.innerHTML = "";
  const detailsInnerContainer = document.createElement("div");
  detailsInnerContainer.classList = "details-inner-container d-flex inline";
  const leftContainer = document.createElement("div");
  leftContainer.id = "leftContainer";
  const rightContainer = document.createElement("div");
  rightContainer.id = "rightContainer";
  const exitBtn = document.createElement("button")
  exitBtn.textContent = "x";
  exitBtn.className = "custom-button";
  exitBtn.id = "exit-btn";
  exitBtn.addEventListener("click", () => hideDetails());
  const bookImg = document.createElement("img");
  bookImg.src = book.book_image;
  bookImg.className = "big-image";
  const bookTitle = document.createElement("h2");
  bookTitle.textContent = toTitleCase(book.title);
  const bookAuthor = document.createElement("h4");
  bookAuthor.textContent = `Author: ${book.author}`;
  const bookDescription = document.createElement("p");
  bookDescription.textContent = book.description;
  const addBtn = document.createElement("button");
  addBtn.textContent = "Add to wishlist";
  addBtn.className = "custom-button";
  addBtn.addEventListener("click", () => addToCart(book, heart));

  leftContainer.append(bookImg);
  rightContainer.append(bookTitle, bookAuthor, bookDescription, addBtn);
  detailsInnerContainer.append(exitBtn, leftContainer, rightContainer);
  detailsContainer.append(detailsInnerContainer);
  detailsContainer.style.display = "block";
}

function addToCart(book, heart) {
  heart.textContent = "♥";
  heart.style.color = "red";
  openWishlist = true;
  document.querySelector("#wishlist-overlay").style.display = "block";
  hideDetails();
  const li = document.createElement("li");
  const title = toTitleCase(book.title);
  const br = document.createElement("br");
  const buyBtn = document.createElement("button");
  buyBtn.textContent = "Buy";
  buyBtn.className = "custom-button";
  buyBtn.id = "buyBtn";
  buyBtn.addEventListener("click", () => showBuyLinks(book));
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove";
  removeBtn.className = "custom-button";
  removeBtn.id = "removeBtn";
  removeBtn.addEventListener("click", () => deleteItem(li, heart));

  li.append(title, br, buyBtn, removeBtn);
  document.querySelector("#booklist").append(li);
}

function showBuyLinks(book) {
  buyLinksContainer.innerHTML = "";
  const buyInnerContainer = document.createElement("div");
  buyInnerContainer.classList = "details-inner-container";
  const header = document.createElement("h3");
  header.textContent = "Links to Purchase Book";
  const ul = document.createElement("ul");
  book.buy_links.forEach(link => {
    const li = document.createElement("li");
    const buyLink = document.createElement("a");
    buyLink.href = link.url;
    buyLink.target= "_blank";
    buyLink.textContent = link.name;
    li.append(buyLink);
    ul.append(li);
  });
  const exitBtn = document.createElement("button")
  exitBtn.textContent = "x";
  exitBtn.className = "custom-button";
  exitBtn.id = "exit-btn";
  exitBtn.addEventListener("click", () => hideBuyLinks());
  buyInnerContainer.append(exitBtn, header, ul);
  buyLinksContainer.append(buyInnerContainer);
  buyLinksContainer.style.display = "block";
}

function deleteItem(item, heart) {
  item.remove();
  heart.textContent = "♡";
  heart.style.color = "black";
}

function hideDetails() {
  detailsContainer.style.display = "none";
}

function hideBuyLinks() {
  buyLinksContainer.style.display = "none";
}

function toTitleCase(str) {
  return str.toLowerCase().split(' ').map(function (word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
}

// CLOSE WISHLIST - BUTTON INSIDE WISHLIST
document.querySelector("#close-wishlist").addEventListener("click", () => {
  toggleWishlist();
})

// OPEN/CLOSE WISHLIST - CART ICON
document.querySelector("#wishlist-icon").addEventListener("click", () => toggleWishlist())
function toggleWishlist() {
  openWishlist = !openWishlist;
  if (openWishlist) {
    document.querySelector("#wishlist-overlay").style.display = "block";
  } else { document.querySelector("#wishlist-overlay").style.display = "none" }
}