const searchForm = document.querySelector("#list-name-form");
const searchSelect = document.querySelector("#list-name-select");
const detailsContainer = document.querySelector("#details-container");
const buyLinksContainer = document.querySelector("#buylinks-container");
const booksContainer = document.querySelector("#books-container");
const headingContainer = document.querySelector("#list-name-heading");
const wishlistOverlay = document.querySelector("#wishlist-overlay");

let currentListName;
let openWishlist = false;
let booksInWish = []; // wishlist tracker: keep track of books in wishlist by title

// loading initial wishlist
fetch("http://localhost:3000/wishlist")
.then(response => response.json())
.then(books => books.forEach(book => {
  // populate wishlist tracker;
  booksInWish.push(book.title);
  const li = document.createElement("li");
  const title = toTitleCase(book.title);
  const br = document.createElement("br");
  const detailsBtn = document.createElement("button");
  detailsBtn.className = "custom-button";
  detailsBtn.id = "detailsBtn";
  detailsBtn.textContent = "Details";
  detailsBtn.addEventListener("click", () => showDetails(book, "heart", "true"));
  const buyBtn = document.createElement("button");
  buyBtn.textContent = "Buy";
  buyBtn.className = "custom-button";
  buyBtn.id = "buyBtn";
  buyBtn.addEventListener("click", () => showBuyLinks(book));
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove";
  removeBtn.className = "custom-button";
  removeBtn.id = "removeBtn";
  removeBtn.addEventListener("click", () => {
    const heart = document.querySelector(`#heart-${book.rank}`);
    heart.textContent = "♡";
    heart.classList = "open-heart";
    deleteBook(book, li);
  }); 
  li.append(title, br, detailsBtn, buyBtn, removeBtn);
  document.querySelector("#booklist").append(li);
}))

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  booksContainer.innerHTML = "";
  headingContainer.innerHTML = "";
  const heading = document.createElement("h2");
  heading.textContent = searchSelect.options[searchSelect.selectedIndex].textContent;
  headingContainer.append(heading);
  currentListName = searchSelect.value;
  loadBooks(currentListName);
  searchForm.reset();
});

function loadBooks(listName) {
  fetch(`https://api.nytimes.com/svc/books/v3/lists/current/${listName}.json?api-key=aNs4DvNstJ3L1WqPFzC9YFpp07TYJ95D`)
  .then(response => response.json())
  .then(books => books.results.books.forEach(book => loadThumbnail(book)))
}

function loadThumbnail(book) {
  let exists = false;
  const thumbnailCard = document.createElement("div");
  thumbnailCard.className = "thumbnail";
  thumbnailCard.style.backgroundImage = `url("${book.book_image}")`;
  const thumbnailRank = document.createElement("span");
  thumbnailRank.textContent = `#${book.rank}`;
  thumbnailRank.className = "rank";
  const heart = document.createElement("span");
  if (booksInWish.find(element => element === book.title)) {
    heart.textContent = "♥";
    heart.classList = "full-heart";
    exists = true;
  } else {
    heart.textContent = "♡" ;
    heart.classList = "open-heart";
  }
  heart.id = `heart-${book.rank}`;
  const br = document.createElement("br");
  thumbnailCard.addEventListener("click", () => showDetails(book));
  thumbnailCard.append(thumbnailRank, heart, br);
  booksContainer.append(thumbnailCard);
}

function showDetails(book) {
  detailsContainer.innerHTML = "";
  const detailsInnerContainer = document.createElement("div");
  detailsInnerContainer.classList = "details-inner-container d-flex inline";
  const leftContainer = document.createElement("div");
  leftContainer.id = "leftContainer";
  leftContainer.classList = "d-flex flex-column align-items-center";
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
  const bookAuthor = document.createElement("h5");
  bookAuthor.textContent = `Author: ${book.author}`;
  const bookDescription = document.createElement("p");
  bookDescription.textContent = book.description;
  // show existing comments
  const commentsHeading = document.createElement("h6");
  commentsHeading.textContent = "Comments:";
  commentsHeading.style.fontWeight = "bold";
  const commentList = document.createElement("ul");
  commentList.id = "comment-list"
  fetch("http://localhost:3000/comments")
  .then(response => response.json())
  .then(comments => {
    const bookComments = comments.filter(comment => comment.book_title === book.title);
    bookComments.forEach(bookComment => {
      const li = document.createElement("li");
      li.textContent = bookComment.comment;
      commentList.append(li);
    })
  })
  // add comment form
  const commentFormDiv = document.createElement("div");
  commentFormDiv.classList = "d-flex flex-row align-items-center justify-content-center mt-3 mb-3";
  const commentForm = document.createElement("form");
  commentForm.id = "comment-form";
  const commentInput = document.createElement("textarea");
  commentInput.placeholder = "Leave a comment!";
  commentInput.style.padding = "5px";
  commentInput.style.marginRight = "5px";
  const commentBtn = document.createElement("button");
  commentBtn.type = "submit";
  commentBtn.classList = "custom-button";
  commentBtn.textContent = "Submit"
  commentForm.append(commentInput, commentBtn);
  commentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addComment(book, commentList, commentForm.elements[0].value);
    commentForm.reset();
  })
  commentFormDiv.append(commentForm);
  // make wishlist add button + functionality depending on if book is already in wishlist
  const addBtn = document.createElement("button");
  addBtn.classList = "custom-button add-to-wish";
  if (booksInWish.find(bookItem => bookItem === book.title)) {
    addBtn.textContent = "Already in wishlist"
    addBtn.style.background = "rgba(93, 189, 206)";
    addBtn.style.color = "white";
  }
  else {
    addBtn.textContent = "Add to wishlist";
    addBtn.style.background = "white";
    addBtn.style.color = "black";
    addBtn.addEventListener("click", () => addToWishlist(book));
  }
  leftContainer.append(bookImg, addBtn);
  rightContainer.append(bookTitle, bookAuthor, bookDescription, commentsHeading, commentList, commentFormDiv);
  detailsInnerContainer.append(exitBtn, leftContainer, rightContainer);
  detailsContainer.append(detailsInnerContainer);
  detailsContainer.style.display = "block";
}

function addComment(book, commentList, comment) {
  fetch("http://localhost:3000/comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      book_title: book.title,
      comment: comment
    })
  })
  .then(response => response.json())
  .then(newComment => {
    const li = document.createElement("li");
    li.textContent = newComment.comment;
    commentList.append(li);
  })
}

function addToWishlist(book) {
  // add book to wishlist tracker
  booksInWish.push(book.title);
  console.log(booksInWish);
  const heart = document.querySelector(`#heart-${book.rank}`);
  heart.textContent = "♥";
  heart.classList = "full-heart";
  openWishlist = true;
  wishlistOverlay.style.width = "350px";
  hideDetails();
  const li = document.createElement("li");
  const title = toTitleCase(book.title);
  const br = document.createElement("br");
  const detailsBtn = document.createElement("button");
  detailsBtn.className = "custom-button";
  detailsBtn.id = "detailsBtn";
  detailsBtn.textContent = "Details";
  detailsBtn.addEventListener("click", () => showDetails(book));
  const buyBtn = document.createElement("button");
  buyBtn.textContent = "Buy";
  buyBtn.className = "custom-button";
  buyBtn.id = "buyBtn";
  buyBtn.addEventListener("click", () => showBuyLinks(book));
  // remove button + functionality
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove";
  removeBtn.className = "custom-button";
  removeBtn.id = "removeBtn";

  li.append(title, br, detailsBtn, buyBtn, removeBtn);
  document.querySelector("#booklist").append(li);

  postToDatabase(book, li, removeBtn);
}

function postToDatabase(book, li, removeBtn) {
  fetch("http://localhost:3000/wishlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(
      {
        title: book.title,
        author: book.author,
        description: book.description,
        buy_links: book.buy_links,
        rank: book.rank,
        book_image: book.book_image
      }
    )
  })
  .then(response => response.json())
  .then(savedBook => {
    removeBtn.addEventListener("click", () => {
      const heart = document.querySelector(`#heart-${book.rank}`);
      heart.textContent = "♡";
      heart.classList = "open-heart";
      deleteBook(savedBook, li);
    });
  })
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
  const exitBtn = document.createElement("button");
  exitBtn.textContent = "x";
  exitBtn.className = "custom-button";
  exitBtn.id = "exit-btn";
  exitBtn.addEventListener("click", () => hideBuyLinks());
  buyInnerContainer.append(exitBtn, header, ul);
  buyLinksContainer.append(buyInnerContainer);
  buyLinksContainer.style.display = "block";
}

function deleteBook(book, li) {
  // remove book from wishlist tracker
  const index = booksInWish.indexOf(book.title);
  console.log(index)
  booksInWish.splice(index, 1);
  console.log(booksInWish);
  li.remove();
  fetch(`http://localhost:3000/wishlist/${book.id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  })
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

// OPEN/CLOSE WISHLIST - CART ICON
document.querySelector("#wishlist-icon").addEventListener("click", () => toggleWishlist())
function toggleWishlist() {
  openWishlist = !openWishlist;
  if (openWishlist) {
    wishlistOverlay.style.width = "350px";
  } else { 
    wishlistOverlay.style.width = "0px";
  }
}