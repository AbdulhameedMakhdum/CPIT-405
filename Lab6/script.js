function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (let c of cookies) {
    const [key, val] = c.split("=");
    if (key === name) return val;
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

const likeBtn = document.getElementById("likeBtn");
const dislikeBtn = document.getElementById("dislikeBtn");
const likeCount = document.getElementById("likeCount");
const dislikeCount = document.getElementById("dislikeCount");
const commentInput = document.getElementById("commentInput");
const submitComment = document.getElementById("submitComment");
const commentList = document.getElementById("commentList");
const resetBtn = document.getElementById("resetBtn");

let likes = 0;
let dislikes = 0;
let comments = [];

window.onload = () => {
  const savedLikes = getCookie("likes");
  const savedDislikes = getCookie("dislikes");
  const savedVote = getCookie("vote");
  const savedComments = getCookie("comments");

  if (savedLikes) likes = parseInt(savedLikes);
  if (savedDislikes) dislikes = parseInt(savedDislikes);
  likeCount.textContent = likes;
  dislikeCount.textContent = dislikes;

  if (savedVote === "like") likeBtn.disabled = true;
  if (savedVote === "dislike") dislikeBtn.disabled = true;

  if (savedComments) {
    comments = JSON.parse(savedComments);
    displayComments();
  }
};

likeBtn.onclick = () => {
  if (getCookie("vote")) {
    alert("You already voted!");
    return;
  }
  likes++;
  likeCount.textContent = likes;
  setCookie("likes", likes, 7);
  setCookie("vote", "like", 7);
  likeBtn.disabled = true;
};

dislikeBtn.onclick = () => {
  if (getCookie("vote")) {
    alert("You already voted!");
    return;
  }
  dislikes++;
  dislikeCount.textContent = dislikes;
  setCookie("dislikes", dislikes, 7);
  setCookie("vote", "dislike", 7);
  dislikeBtn.disabled = true;
};

submitComment.onclick = () => {
  if (getCookie("commented")) {
    alert("You already commented!");
    return;
  }
  const text = commentInput.value.trim();
  if (text === "") {
    alert("Please enter a comment!");
    return;
  }
  comments.push(text);
  setCookie("comments", JSON.stringify(comments), 7);
  setCookie("commented", "true", 7);
  commentInput.value = "";
  displayComments();
};

resetBtn.onclick = () => {
  deleteCookie("likes");
  deleteCookie("dislikes");
  deleteCookie("vote");
  deleteCookie("commented");
  deleteCookie("comments");
  likes = 0;
  dislikes = 0;
  comments = [];
  likeCount.textContent = likes;
  dislikeCount.textContent = dislikes;
  likeBtn.disabled = false;
  dislikeBtn.disabled = false;
  commentList.innerHTML = "";
  alert("Reset complete! You can vote and comment again.");
};

function displayComments() {
  commentList.innerHTML = "";
  comments.forEach((c, i) => {
    const li = document.createElement("li");
    const user = document.createElement("div");
    const text = document.createElement("div");
    user.className = "comment-user";
    text.className = "comment-text";
    user.textContent = "User " + (i + 1);
    text.textContent = c;
    li.appendChild(user);
    li.appendChild(text);
    commentList.appendChild(li);
  });
}
