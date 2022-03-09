const searchForm = document.querySelector("#list-name-form");
const searchSelect = document.querySelector("#list-name-select");
const detailsContainer = document.querySelector("#details-container");
const buyLinksContainer = document.querySelector("#buylinks-container");
const booksContainer = document.querySelector("#books-container");
const headingContainer = document.querySelector("#list-name-heading");
const wishlistOverlay = document.querySelector("#wishlist-overlay");

let currentListName;
let openWishlist = false;

// loading initial wishlist
fetch("http://localhost:3000/wishlist")
.then(response => response.json())
.then(books => books.forEach(book => {
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
    deleteBook(book, li);
    // reload thumbnails so hearts refresh
    booksContainer.innerHTML = "";
    loadBooks(currentListName);
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
  let exists2;
  const thumbnailCard = document.createElement("div");
  thumbnailCard.className = "thumbnail";
  thumbnailCard.style.backgroundImage = `url("${book.book_image}")`;
  const thumbnailRank = document.createElement("span");
  thumbnailRank.textContent = `#${book.rank}`;
  thumbnailRank.id = "rank";
  const heart = document.createElement("span");
  // make a fetch request + find if find true then heart textContent = red
  fetch("http://localhost:3000/wishlist")
  .then(response => response.json())
  .then(books => {
    const exists = books.find(dbBook => dbBook.title === book.title);
    exists2 = exists;
    if (exists) {
      heart.textContent = "♥";
      heart.classList = "full-heart";
    } else { 
      heart.textContent = "♡" ;
      heart.classList = "open-heart";
    }
  })
  heart.className = "heart";
  const br = document.createElement("br");
  thumbnailCard.addEventListener("click", () => showDetails(book, heart, exists2));
  thumbnailCard.append(thumbnailRank, heart, br);
  booksContainer.append(thumbnailCard);
}

function showDetails(book, heart, exists) {
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
  const bookAuthor = document.createElement("h4");
  bookAuthor.textContent = `Author: ${book.author}`;
  const bookDescription = document.createElement("p");
  bookDescription.textContent = book.description;
  // show existing comments
  const commentsHeading = document.createElement("h4");
  commentsHeading.textContent = "Comments:";
  commentsHeading.style.fontWeight = "bold";
  const commentList = document.createElement("ul");
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
  //add comment form
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
  commentBtn.className = "custom-button";
  commentBtn.textContent = "Submit"
  commentForm.append(commentInput, commentBtn);
  commentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addComment(book, commentList, commentForm.elements[0].value);
    commentForm.reset();
  })
  commentFormDiv.append(commentForm);

  const addBtn = document.createElement("button");
  addBtn.className = "custom-button";
  if (exists) {
    addBtn.textContent = "Already in wishlist"
    addBtn.style.background = "rgba(93, 189, 206)";
    addBtn.style.color = "white";
  }
  else {
    addBtn.textContent = "Add to wishlist";
    addBtn.style.background = "white";
    addBtn.style.color = "black";
    addBtn.addEventListener("click", () => addToWishlist(book, heart));
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

function addToWishlist(book, heart) {
  heart.textContent = "♥";
  heart.classList = "full-heart"
  openWishlist = true;
  //overlay slide
  // wishlistOverlay.style.right = "300px";
  hideDetails();

  const li = document.createElement("li");
  const title = toTitleCase(book.title);
  const br = document.createElement("br");
  const detailsBtn = document.createElement("button");
  detailsBtn.className = "custom-button";
  detailsBtn.id = "detailsBtn";
  detailsBtn.textContent = "Details";
  detailsBtn.addEventListener("click", () => showDetails(book, heart, "true"));
  const buyBtn = document.createElement("button");
  buyBtn.textContent = "Buy";
  buyBtn.className = "custom-button";
  buyBtn.id = "buyBtn";
  buyBtn.addEventListener("click", () => showBuyLinks(book));
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove";
  removeBtn.className = "custom-button";
  removeBtn.id = "removeBtn";

  li.append(title, br, detailsBtn, buyBtn, removeBtn);
  document.querySelector("#booklist").append(li);

  postToDatabase(book, li, heart, removeBtn);
}

function postToDatabase(book, li, heart, removeBtn) {
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
  .then(book => {
    removeBtn.addEventListener("click", () => {
    heart.textContent = "♡";
    heart.style.color = "black";
    deleteBook(book, li);
    });
    // reload thumbnails so hearts/addbtn refresh
    booksContainer.innerHTML = "";
    loadBooks(currentListName);
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
  li.remove();
  fetch(`http://localhost:3000/wishlist/${book.id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  })
  // reload thumbnails so hearts/addbtn refresh
  booksContainer.innerHTML = "";
  loadBooks(currentListName);
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
  // openWishlist = !openWishlist;
  if (openWishlist) {
    wishlistOverlay.style.width = "0";
    openWishlist = false;
  } else { 
    wishlistOverlay.style.width = "350px"
    openWishlist = true;
  }
}