import Main from "./views/Main.js";
import Login from "./views/Login.js";
import Register from "./views/Register.js";
import Users from "./views/Users.js";
import WaitingRoom from "./views/WaitingRoom.js";
import Pong from "./views/Pong.js";
import { loadAndSetFont } from "./views/pong/utils/font.js";
import Tournament from "./views/Tournament.js";
import Dashboard from "./views/Dashboard.js";
import Test from "./views/Test.js";

export const navigateTo = (url) => {
  if (url !== location.pathname) {
  	history.pushState(null, null, url);
  }
  router();
};

let view = null;
let fontLoad = false;

const router = async () => {
  const routes = [
    { path: "/", view: Main },
    { path: "/users/login", view: Login },
    { path: "/users/register", view: Register },
	{ path: "/users/profile/:username", view: Users },
    { path: "/pong", view: WaitingRoom },
    { path: "/pong/:room_id", view: Pong },
    { path: "/tournament", view: Tournament },
    { path: "/dashboard", view: Dashboard },
    { path: "/test", view: Test },
  ];

  const potentialMatches = routes.map((route) => {
    const resultMatch = checkMatch(route.path);
    return {
      route: route,
      result: resultMatch,
    };
  });

  let match = potentialMatches.find(
    (potentialMatch) => potentialMatch.result !== null
  );

  if (!match) {
    match = {
      route: routes[0],
      result: [location.pathname],
    };
  }

  await view?.cleanUp?.();
  if (!fontLoad) {
    await loadAndSetFont("/static/js/views/pong/utils/typeFont/typeFont.json");
    fontLoad = true;
  }
  let params = getParams(match);
  view = new match.route.view(params);

  const redirection = view.redirect();
  if (redirection.needed) {
    var url = "https://localhost/api/users/check-auth/"
    const update = await fetch(url, {
      method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
      if (data.IsAuthenticated === redirection.auth) {
		  return true;
      }
      return false;
    })
	if (update) {
	  view = null;
	  navigateTo(redirection.url);
	  return;
	}
  }

  document.querySelector("#style").innerHTML = await view.getStyle();
  document.querySelector("#app").innerHTML = await view.getHtml();
  await view.getJavaScript();
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-link]");
    if (link) {
      e.preventDefault();
      navigateTo(link.getAttribute("href"));
    }
  });

  router();
});

const getParams = (match) => {
  const values = match.result.slice(1);
  if (!values) return {};
  const keys = [...match.route.path.matchAll(/:(\w+)/g)].map(
    (result) => result[1]
  );
  return keys.reduce((acc, key, i) => {
    acc[key] = values[i];
    return acc;
  }, {});
};

const checkMatch = (path) => {
  const regex = new RegExp(
    "^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "([^\\/]+)") + "$"
  );
  return location.pathname.match(regex);
};

document.getElementById('dropdownProfile').addEventListener('click', function(event) {
	navigateTo("/users/profile/" + localStorage.getItem("username"));
});

document.getElementById('dropdownSignOut').addEventListener('click', function(event) {
	var url = "https://localhost/api/users/logout/"
	fetch(url, {
		method: 'GET',
	})
	.then(response => response.json().then(json => ({
			data: json, status: response.status})))
	.then(res => {
		if (res.status === 200) {
			localStorage.removeItem("username");
			console.log(res.data.message)
			router();
		}
	})
});


/*Chat Box*/
document.getElementById('chatBox').addEventListener('click', function(event) {
  let logStatus = 1;
  if (!logStatus) {
    alert('Please log in to access the chat.')
  }
  else {
    event.preventDefault();

    const chatWindow = document.getElementById('chatWindow');
    if (chatWindow.style.display === 'none' || chatWindow.style.display === '') {
        chatWindow.style.display = 'block';
    } else {
        chatWindow.style.display = 'none';
    }
  }
});

document.getElementById('closeChatBtn').addEventListener('click', function() {
  document.getElementById('chatWindow').style.display = 'none';
});

document.getElementById('chatInput').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
      const message = event.target.value;
      if (message.trim()) {
          const chatMessages = document.getElementById('chatMessages');
          const newMessage = document.createElement('div');
          newMessage.textContent = message;
          chatMessages.appendChild(newMessage);
          event.target.value = '';
          chatMessages.scrollTop = chatMessages.scrollHeight;
      }
  }
});

document.getElementById("sendButton").addEventListener("click", function() {
  var message = document.getElementById("chatInput").value;
  if (message.trim() !== "") {
      var messageElement = document.createElement("div");
      messageElement.textContent = message;
      document.getElementById("chatMessages").appendChild(messageElement);
      document.getElementById("chatInput").value = "";
  }
});

const chatWindow = document.getElementById("chatWindow");
const chatHeader = document.getElementById("chatHeader");

let isDragging = false;
let offsetX, offsetY;

chatHeader.addEventListener("mousedown", function(e) {
  isDragging = true;
  offsetX = e.clientX - chatWindow.offsetLeft;
  offsetY = e.clientY - chatWindow.offsetTop;
  document.body.style.cursor = 'move';
});

document.addEventListener("mousemove", function(e) {
  if (isDragging) {
    chatWindow.style.left = (e.clientX - offsetX) + "px";
    chatWindow.style.top = (e.clientY - offsetY) + "px";
  }
});

document.addEventListener("mouseup", function() {
  isDragging = false;
  document.body.style.cursor = 'default';
});
