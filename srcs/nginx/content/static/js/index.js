import Main from "./views/Main.js";
import Login from "./views/Login.js";
import Register from "./views/Register.js";
import Users from "./views/Users.js";
import WaitingRoom from "./views/WaitingRoom.js";
import Pong from "./views/Pong.js";
import { loadAndSetFont } from "./views/pong/utils/font.js";
import Tournament from "./views/Tournament.js";
import Dashboard from "./views/Dashboard.js";

export const navigateTo = (url) => {
  if (url !== location.pathname) {
  	history.pushState(null, null, url);
  }
  router();
};

let view = null;
let fontLoad = false;
let running = false;
let urlAfterLogin = "";

const router = async () => {
  if (running === true) {
    return;
  }
  if (location.pathname === "/users/profile") {
    const url = "/users/profile/" + localStorage.getItem("username");
    if (url !== location.pathname) {
    	history.pushState(null, null, url);
    }
  }
  running = true;
  const routes = [
    { path: "/", view: Main },
    { path: "/users/login", view: Login },
    { path: "/users/register", view: Register },
	{ path: "/users/profile/:username", view: Users },
    { path: "/pong", view: WaitingRoom },
    { path: "/pong/:room_id", view: Pong },
    { path: "/tournament", view: Tournament },
    { path: "/dashboard", view: Dashboard },
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
    var endpoint = "https://localhost/api/users/check-auth/"
    const update = await fetch(endpoint, {
      method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
      if (data.IsAuthenticated === redirection.auth) {
		  return true;
      }
      return false;
    })
    .catch(error => {
      console.error(error);
    })
	if (update) {
	  view = null;
  	  running = false;
      urlAfterLogin = redirection.urlAfterLogin;
	  navigateTo(redirection.url);
	  return;
	}
  }

  if (match.route.path === "/users/login") {
    view.urlAfterLogin = urlAfterLogin;
  }
  urlAfterLogin = "";

  document.querySelector("#style").innerHTML = await view.getStyle();
  document.querySelector("#app").innerHTML = await view.getHtml();
  await view.getJavaScript();
  running = false;
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

/*Custom events for login and logout*/
export const loginUser = new CustomEvent('authenticate', {
  detail: {
	  authenticated: true
  },
});

export const logoutUser = new CustomEvent('authenticate', {
  detail: {
	  authenticated: false
  },
});

let authAbortController = null;
document.addEventListener("authenticate", (e) => {
	/* Code executed on login*/
	if (e.detail.authenticated) {
		authAbortController = new AbortController();

		/* Update sidebar*/
  		document.querySelector("#sidebarItems").innerHTML = `
		<li class="nav-item">
			<a href="/dashboard" class="nav-link align-middle px-0" data-link>
				<i class="fs-4 bi-grid"></i> <span class="ms-1 d-none d-sm-inline">Dashboard</span>
			</a>
		</li>
		<li class="nav-item">
			<a href="#" class="nav-link align-middle px-0" id="chatBox">
				<i class="fs-4 bi-chat-left-heart"></i> <span class="ms-1 d-none d-sm-inline">Chat</span>
			</a>
		</li>
		<li class="nav-item">
			<a href="#" class="nav-link align-middle px-0">
				<i class="fs-4 bi-gear"></i> <span class="ms-1 d-none d-sm-inline">Settings</span>
			</a>
		</li>
		<li>
			<a href="#" class="nav-link px-0 align-middle">
				<i class="fs-4 bi-people"></i> <span class="ms-1 d-none d-sm-inline">Friends</span> </a>
		</li>
		<li>
			<a href="" class="nav-link px-0 align-middle" id="signOut">
				<i class="fs-4 bi-door-open"></i> <span class="ms-1 d-none d-sm-inline">Sign out</span></a>
		</li>
		`
		/*Update dropdown user menu*/
  		document.querySelector("#dropdownUserMenu").innerHTML = `
		<div class="dropdown pb-4">
			<div class="d-flex align-items-center text-white text-decoration-none">
				<img src="/static/img/cat.png" alt="sample cat photo" width="30" height="30" class="rounded-circle">
				<span class="d-none d-sm-inline mx-1" id="dropdownMenuUsername"></span>
			</div>
		</div>
		`;
		document.getElementById('dropdownMenuUsername').innerText = localStorage.getItem("username")

		document.getElementById('signOut').addEventListener('click', (e) => {
			e.preventDefault();
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
					document.dispatchEvent(logoutUser)
					router();
				}
			})
			.catch(error => {
			  console.error(error);
			})
		},
		{
			signal: authAbortController.signal,
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
		},
		{
			signal: authAbortController.signal,
		});

		document.getElementById('closeChatBtn').addEventListener('click', function() {
		  document.getElementById('chatWindow').style.display = 'none';
		},
		{
			signal: authAbortController.signal,
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
		},
		{
			signal: authAbortController.signal,
		});

		document.getElementById("sendButton").addEventListener("click", function() {
		  var message = document.getElementById("chatInput").value;
		  if (message.trim() !== "") {
			  var messageElement = document.createElement("div");
			  messageElement.textContent = message;
			  document.getElementById("chatMessages").appendChild(messageElement);
			  document.getElementById("chatInput").value = "";
		  }
		},
		{
			signal: authAbortController.signal,
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
		},
		{
			signal: authAbortController.signal,
		});

		document.addEventListener("mousemove", function(e) {
		  if (isDragging) {
			chatWindow.style.left = (e.clientX - offsetX) + "px";
			chatWindow.style.top = (e.clientY - offsetY) + "px";
		  }
		},
		{
			signal: authAbortController.signal,
		});

		document.addEventListener("mouseup", function() {
		  isDragging = false;
		  document.body.style.cursor = 'default';
		},
		{
			signal: authAbortController.signal,
		});
	}
	/* Code executed on logout*/
	else {
  		document.querySelector("#sidebarItems").innerHTML = `
		<li>
			<a href="/users/login"class="nav-link px-0 align-middle" data-link>
				<i class="fs-4 bi-door-open"></i> <span class="ms-1 d-none d-sm-inline">Login</span></a>
		</li>
		`
  		document.querySelector("#dropdownUserMenu").innerHTML = ``
		const chatWindow = document.getElementById('chatWindow');
		chatWindow.style.display = 'none';
		if (authAbortController) {
			authAbortController.abort();
		}
	}
});

/*Check if the user is authenticated when loading the page*/
var url = "https://localhost/api/users/check-auth/"
await fetch(url, {
  method: 'GET',
})
.then(response => response.json())
.then(data => {
	if (data.IsAuthenticated) {
		document.dispatchEvent(loginUser);
	}
	else {
		document.dispatchEvent(logoutUser);
	}
})
.catch(error => {
  console.error(error);
})
