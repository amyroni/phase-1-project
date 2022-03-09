// SET GLOBAL VARIABLES
const countBubble = document.querySelector("#count-bubble");
const searchForm = document.querySelector("#list-name-form");
const searchSelect = document.querySelector("#list-name-select");
const detailsContainer = document.querySelector("#details-container");
const buyLinksContainer = document.querySelector("#buylinks-container");
const buyInnerContainer = document.querySelector("#buylinks-inner-container");
const thumbnailsContainer = document.querySelector("#thumbnails-container");
const headingContainer = document.querySelector("#list-name-heading");
const wishlistOverlay = document.querySelector("#wishlist-overlay");
const leftContainer = document.querySelector("#leftContainer");
const rightContainer = document.querySelector("#rightContainer");
const commentFormDiv = document.querySelector("#comment-form-container");
const exitBtn = document.querySelectorAll(".exit-btn");
exitBtn.forEach(btn => btn.addEventListener("click", () => {
  detailsContainer.style.display = "none";
  buyLinksContainer.style.display = "none";
}));

let currentListName; // track current selected list name
let openWishlist = false; // initialize wishlist display
let booksInWish = []; // wishlist tracker: keep track of books in wishlist by title

// LOAD INITIAL WISHLIST + COUNT BUBBLE
fetch("http://localhost:3000/wishlist")
.then(response => response.json())
.then(books => {
  books.forEach(book => addToInitialWishlist(book));
  countBubble.textContent = books.length;
})

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

// ADD LIST-NAME SEARCH FUNCTIONALITY
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  thumbnailsContainer.innerHTML = "";
  headingContainer.innerHTML = "";
  const heading = document.createElement("h2");
  heading.textContent = searchSelect.options[searchSelect.selectedIndex].textContent;
  headingContainer.append(heading);
  currentListName = searchSelect.value;
  loadBooks(currentListName);
  searchForm.reset();
});

// FUNCTIONS
function addToInitialWishlist(book) {
  // populate wishlist tracker;
  booksInWish.push(book.title);
  // add book to wishlist display
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
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove";
  removeBtn.className = "custom-button";
  removeBtn.id = "removeBtn";
  removeBtn.addEventListener("click", () => {
    const heart = document.querySelector(`#heart-${book.primary_isbn10}`);
    if (heart) {
      heart.textContent = "♡";
      heart.classList = "open-heart";
    }
    deleteBook(book, li);
  }); 
  li.append(title, br, detailsBtn, buyBtn, removeBtn);
  document.querySelector("#booklist").append(li);
}

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
  heart.id = `heart-${book.primary_isbn10}`;
  const br = document.createElement("br");
  thumbnailCard.addEventListener("click", () => showDetails(book));
  thumbnailCard.append(thumbnailRank, heart, br);
  thumbnailsContainer.append(thumbnailCard);
}

function showDetails(book) {
  // handle left container
  document.querySelector("#detail-img").src = book.book_image;
  document.querySelector("#detail-title").textContent = toTitleCase(book.title);
  document.querySelector("#detail-author").textContent = `Author: ${book.author}`;
  document.querySelector("#detail-description").textContent = book.description;
  if (document.querySelector("#addToWish")) {
    document.querySelector("#addToWish").remove();
  }
  const addBtn = document.createElement("button");
  addBtn.classList = "custom-button";
  addBtn.id="addToWish";
  if (booksInWish.find(bookItem => bookItem === book.title)) {
    addBtn.textContent = "Already in wishlist";
    addBtn.classList = "custom-button already-in-wishlist";
  }
  else {
    addBtn.textContent = "Add to wishlist";
    addBtn.classList = "custom-button add-to-wishlist";
    addBtn.addEventListener("click", () => addToWishlist(book));
  }
  leftContainer.append(addBtn);
  // handle right container
  // show existing comments
  const commentList = document.querySelector("#comment-list");
  commentList.innerHTML = "";
  fetch("http://localhost:3000/comments")
  .then(response => response.json())
  .then(comments => {
    const bookComments = comments.filter(comment => comment.book_title === book.title);
    if (bookComments.length > 0) {
      bookComments.forEach(bookComment => {
        const li = document.createElement("li");
        li.textContent = bookComment.comment;
        commentList.append(li);
      })
    } else { 
      const p = document.createElement("p");
      p.textContent = "No comments yet";
      commentList.append(p);
    }
  })
  // add comment form
  commentFormDiv.innerHTML = "";
  const commentForm = document.createElement("form");
  commentForm.id = "comment-form";
  const commentInput = document.createElement("textarea");
  commentInput.placeholder = "Leave a comment!";
  commentInput.id = "comment-textarea";
  const commentBtn = document.createElement("button");
  commentBtn.type = "submit";
  commentBtn.classList = "custom-button";
  commentBtn.textContent = "Submit"
  commentForm.append(commentInput, commentBtn);
  commentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (commentList.querySelector("p")) {
      commentList.querySelector("p").remove();
    }
    addComment(book, commentList, commentForm.elements[0].value);
    commentForm.reset();
  })
  commentFormDiv.append(commentForm);
  // display overlay
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
  booksInWish.push(book.title); // add book to wishlist tracker
  countBubble.textContent = parseInt(countBubble.textContent) + 1; // update count bubble
  console.log(booksInWish);
  const heart = document.querySelector(`#heart-${book.primary_isbn10}`);
  if (heart) {
    heart.textContent = "♥";
    heart.classList = "full-heart";
  }
  openWishlist = true;
  wishlistOverlay.style.width = "350px";
  detailsContainer.style.display = "none";
  // add book to wishlist display
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
  // update database
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
        book_image: book.book_image,
        primary_isbn10: book.primary_isbn10
      }
    )
  })
  .then(response => response.json())
  .then(savedBook => {
    removeBtn.addEventListener("click", () => {
      const heart = document.querySelector(`#heart-${book.primary_isbn10}`);
      if (heart) {
        heart.textContent = "♡";
        heart.classList = "open-heart";
      }
      deleteBook(savedBook, li);
    });
  })
}

function showBuyLinks(book) {
  const buylinksList = document.querySelector("#buylinks-list");
  buylinksList.innerHTML = "";
  book.buy_links.forEach(link => {
    const li = document.createElement("li");
    const buyLink = document.createElement("a");
    buyLink.href = link.url;
    buyLink.target= "_blank";
    buyLink.textContent = link.name;
    li.append(buyLink);
    buylinksList.append(li);
  });
  buyLinksContainer.style.display = "block";
}

function deleteBook(book, li) {
  const index = booksInWish.indexOf(book.title);
  booksInWish.splice(index, 1); // remove book from wishlist tracker
  countBubble.textContent = parseInt(countBubble.textContent) - 1; // update count bubble
  li.remove();
  fetch(`http://localhost:3000/wishlist/${book.id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  })
}

function toTitleCase(str) {
  return str.toLowerCase().split(' ').map(function (word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
}
