import Main from "./views/Main.js";
import Login from "./views/Login.js";
import Register from "./views/Register.js";
import Users from "./views/Users.js";
import Settings from "./views/Settings.js";
import WaitingRoom from "./views/WaitingRoom.js";
import Pong from "./views/Pong.js";
import { loadAndSetFont } from "./views/pong/utils/font.js";
import Tournament from "./views/Tournament.js";

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
	{ path: "/settings", view: Settings},
    { path: "/pong", view: WaitingRoom },
    { path: "/pong/:room_id", view: Pong },
    { path: "/tournament", view: Tournament },
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
	.then(response => response.json().then(json => ({
      data: json, status: response.status})))
	.then(res => {
	  let auth = res.data.IsAuthenticated;
      if (res.status > 400) {
		  auth = false;
      }
      if (auth === redirection.auth) {
		  return true;
      }
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

	const styleElement = document.querySelector("#style");
	const appElement = document.querySelector("#app");

	if (styleElement) {
	styleElement.innerHTML = await view.getStyle();
	}

	if (appElement) {
	appElement.innerHTML = await view.getHtml();
	}
  await view.getJavaScript();
  running = false;
};

window.addEventListener("popstate", router);

// document.addEventListener("DOMContentLoaded", () => {
//   document.body.addEventListener("click", (e) => {
//     const link = e.target.closest("a[data-link]");
//     if (link) {
//       e.preventDefault();
//       navigateTo(link.getAttribute("href"));
//     }
//   });

//   router();
// });

document.addEventListener("DOMContentLoaded", function() {
    const chatUserSelect = document.getElementById('chatUserSelect');
    if (chatUserSelect) {
        chatUserSelect.addEventListener('change', function() {
            const selectedValue = this.value;
            const chatMessages = document.getElementById('chatMessages');
            
            if (chatMessages) {
                chatMessages.dataset.context = selectedValue;
                
                // Update the header title
                const chatHeaderTitle = document.getElementById('chatHeaderTitle');
                if (chatHeaderTitle) {
                    if (selectedValue === 'general') {
                        chatHeaderTitle.textContent = 'General Chat';
                    } else {
                        const selectedOption = this.options[this.selectedIndex];
                        chatHeaderTitle.textContent = `Chat with ${selectedOption.text}`;
                    }
                }
            }
        });
    }
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

export const updateAvatar = () => {
	document.getElementById('sidebarAvatar').src = localStorage.getItem("avatar")
}

const sidebar = document.getElementById('sidebar');
const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');

sidebarToggleBtn.addEventListener('click', () =>{
	sidebar.classList.toggle('open');
});

let authAbortController = null;
document.addEventListener("authenticate", (e) => {
	/* Code executed on login*/
	if (e.detail.authenticated) {
		authAbortController = new AbortController();

		/* Update sidebar*/
  		document.querySelector("#sidebarItems").innerHTML = `
		<a href="#" class="nav-item d-flex align-items-center" id="chatBox">
				<i class="fs-2 bi-chat-left-heart"></i><span>Chat</span>
		</a>
		<a href="/settings" class="nav-item d-flex align-items-center" data-link>
			<i class="fs-2 bi-gear"></i><span>Settings</span>
		</a>
		<a href="#" class="nav-item d-flex align-items-center" data-link>
			<i class="fs-2 bi-people"></i><span>Friends</span>
		</a>
		<a href="" class="nav-item d-flex align-items-center" id="signOut">
			<i class="fs-2 bi-door-open"></i><span>Sign out</span>
		</a>
		<hr>
		<a href="/users/profile" class="nav-item d-flex align-items-center" data-link>
			<img src="#" id="sidebarAvatar" alt="avatar" width="30" height="30" class="rounded-circle">
			<span id="sidebarUsername"></span>
		</a>
		`
		document.getElementById('sidebarUsername').innerText = localStorage.getItem("username")

		updateAvatar();

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
		let chatSocket = null;

		document.getElementById('chatBox').addEventListener('click', function(event) {
		// Vérifiez si l'utilisateur est connecté
		const username = localStorage.getItem("username");
		if (!username) {
			alert('Please log in to access the chat.')
			return;
		}
		
		event.preventDefault();

		const chatWindow = document.getElementById('chatWindow');
		if (chatWindow.style.display === 'none' || chatWindow.style.display === '') {
			chatWindow.style.display = 'block';
			
			// Connectez-vous au WebSocket si ce n'est pas déjà fait
			if (!chatSocket || chatSocket.readyState !== WebSocket.OPEN) {
			connectWebSocket();
			}
		} else {
			chatWindow.style.display = 'none';
		}
		});

		function connectWebSocket() {
				// Use wss:// for a secure connection (SSL/TLS)
				const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
				chatSocket = new WebSocket(protocol + window.location.host + '/ws/chat/');
				
				chatSocket.onopen = function(e) {
				console.log('Chat connection established');
				// Fetch online users when connection is established
				fetchOnlineUsers();
				// Start a periodic refresh of the online users list
				setInterval(fetchOnlineUsers, 30000); // Every 30 seconds
			};
		
			chatSocket.onmessage = function(e) {
			try {
				const data = JSON.parse(e.data);
				if (data.message) {
					// Display the message
					displayMessage(data.message);
				}
			} catch (error) {
				console.error("Error parsing message:", error);
			}
			};
		
			chatSocket.onclose = function(e) {
			console.log('Chat connection closed');
			};
		
			chatSocket.onerror = function(e) {
			console.error('WebSocket error:', e);
			};
		}

		function displayMessage(message) {
			const chatMessages = document.getElementById('chatMessages');
			
			// Create message element
			const messageElement = document.createElement('div');
			messageElement.className = message.is_own ? 'my-message' : 'their-message';
			
			const messageContent = document.createElement('div');
			messageContent.className = 'message-content';
			
			// Handle different message formats
			if (message.is_private) {
			// Private message format
			if (message.is_own) {
				// Message sent by current user
				const prefix = document.createElement('em');
				prefix.textContent = `Me → ${message.recipient_username}: `;
				messageContent.appendChild(prefix);
			} else {
				// Message received from another user
				const prefix = document.createElement('em');
				prefix.textContent = `${message.username} → Me: `;
				messageContent.appendChild(prefix);
			}
			} else {
				// General chat format
				const sender = document.createElement('strong');
				sender.textContent = message.is_own ? 'Me: ' : `${message.username}: `;
				messageContent.appendChild(sender);
			}
			
			// Add the message content
			const textNode = document.createTextNode(message.message || "");
			messageContent.appendChild(textNode);
			
			// Add timestamp
			const messageTime = document.createElement('div');
			messageTime.className = 'message-time';
			const date = new Date(message.timestamp || new Date());
			messageTime.textContent = date.toLocaleTimeString();
			
			messageElement.appendChild(messageContent);
			messageElement.appendChild(messageTime);
			
			chatMessages.appendChild(messageElement);
			chatMessages.scrollTop = chatMessages.scrollHeight;
		}
		
		document.getElementById('chatInput').addEventListener('keydown', function(event) {
			if (event.key === 'Enter') {
				sendChatMessage();
			}
		});
		

		document.getElementById("sendButton").addEventListener("click", function() {
			sendChatMessage();
		});

		function sendChatMessage() {
			const chatInput = document.getElementById('chatInput');
			const message = chatInput.value.trim();
			const chatMessages = document.getElementById('chatMessages');
			const chatContext = chatMessages ? chatMessages.dataset.context : 'general';
			
			if (message && chatSocket && chatSocket.readyState === WebSocket.OPEN) {
				// Check if this is a private message
				if (chatContext && chatContext !== 'general') {
					// Send private message
					chatSocket.send(JSON.stringify({
						'type': 'private_message',
						'recipient_id': chatContext,
						'message': message
					}));
				} else {
					// Send general chat message
					chatSocket.send(JSON.stringify({
						'type': 'general_chat',
						'message': message
					}));
				}
				
				chatInput.value = "";
			}
		}
		

		// Add online users list for private messaging
		let onlineUsers = [];

		// Add this function to fetch online users
		function fetchOnlineUsers() {
			fetch('/api/users/online/', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
					// No need to add token header if using session auth
				},
				credentials: 'include' // Important for session auth
			})
			.then(response => {
				if (!response.ok) {
					throw new Error(`Network response was not ok: ${response.status}`);
				}
				return response.json();
			})
			.then(users => {
				console.log("Fetched users:", users);
				onlineUsers = users; // Save users to onlineUsers array
				updateOnlineUsersList(users);
			})
			.catch(error => {
				console.error('Error fetching online users:', error);
			});
		}
		
		// Function to update the users dropdown
		function updateOnlineUsersList(users) {
			const chatUserSelect = document.getElementById('chatUserSelect');
			if (!chatUserSelect) return;
			
			// Save current selection
			const currentSelection = chatUserSelect.value;
			
			// Clear all options except "General Chat"
			while (chatUserSelect.options.length > 1) {
				chatUserSelect.remove(1);
			}
			
			// Add online users
			users.forEach(user => {
				// Don't add current user
				if (user.username === localStorage.getItem('username')) return;
				
				const option = document.createElement('option');
				option.value = user.id;
				option.textContent = user.username;
				chatUserSelect.appendChild(option);
			});
			
			// Try to restore previous selection if it still exists
			if (Array.from(chatUserSelect.options).some(option => option.value === currentSelection)) {
				chatUserSelect.value = currentSelection;
			} else {
				chatUserSelect.value = 'general';
			}
		}

		// Add this function to update the users list in the UI
		function updateUsersList() {
		const usersList = document.getElementById('chatUsers');
		if (!usersList) return;
		
		usersList.innerHTML = '<div class="chat-user selected" data-user-id="general">General Chat</div>';
		
		onlineUsers.forEach(user => {
			// Don't add current user to the list
			if (user.username === localStorage.getItem("username")) return;
			
			const userItem = document.createElement('div');
			userItem.className = 'chat-user';
			userItem.dataset.userId = user.id;
			userItem.textContent = user.username;
			usersList.appendChild(userItem);
		});
		
		// Add click handlers to user items
		document.querySelectorAll('.chat-user').forEach(item => {
			item.addEventListener('click', function() {
			document.querySelectorAll('.chat-user').forEach(el => el.classList.remove('selected'));
			this.classList.add('selected');
			
			// Update the chat context (general or private)
			const userId = this.dataset.userId;
			document.getElementById('chatMessages').dataset.context = userId;
			
			// Update the header to show who you're chatting with
			const chatHeader = document.getElementById('chatHeaderTitle');
			chatHeader.textContent = userId === 'general' ? 'General Chat' : `Chat with ${this.textContent}`;
			});
		});
		}

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
		<a href="/users/login" class="nav-item d-flex align-items-center" data-link>
				<i class="fs-2 bi-door-open"></i><span>Login</span>
		</a>
		`
		const chatWindow = document.getElementById('chatWindow');
		chatWindow.style.display = 'none';
		if (authAbortController) {
			authAbortController.abort();
		}
		localStorage.removeItem('username');
		localStorage.removeItem('avatar');
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

// /*Chat CSS*/
// const getStyle = async () => {
// 	return `#chatWindow {
//   position: fixed;
//   bottom: 20px;
//   right: 20px;
//   width: 400px;
//   height: 500px;
//   background-color: white;
//   border-radius: 8px;
//   box-shadow: 0 0 10px rgba(0,0,0,0.2);
//   display: flex;
//   flex-direction: column;
//   z-index: 1000;
// }

// #chatHeader {
//   padding: 10px;
//   background-color: #4a76a8;
//   color: white;
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   border-top-left-radius: 8px;
//   border-top-right-radius: 8px;
//   cursor: move;
// }

// #chatBody {
//   display: flex;
//   flex: 1;
//   overflow: hidden;
// }

// #chatSidebar {
//   width: 120px;
//   border-right: 1px solid #ddd;
//   overflow-y: auto;
// }

// #chatUsers {
//   overflow-y: auto;
// }

// .chat-user {
//   padding: 8px;
//   cursor: pointer;
//   border-bottom: 1px solid #eee;
//   font-size: 0.9em;
// }

// .chat-user:hover {
//   background-color: #f0f0f0;
// }

// .chat-user.selected {
//   background-color: #e0f0ff;
//   font-weight: bold;
// }

// #chatMain {
//   flex: 1;
//   display: flex;
//   flex-direction: column;
// }

// #chatMessages {
//   flex: 1;
//   padding: 10px;
//   overflow-y: auto;
// }

// #chatControls {
//   display: flex;
//   padding: 10px;
//   border-top: 1px solid #ddd;
// }

// #chatInput {
//   flex: 1;
//   padding: 8px;
//   border: 1px solid #ddd;
//   border-radius: 4px;
//   margin-right: 5px;
// }

// #sendButton {
//   padding: 8px 12px;
//   background-color: #4a76a8;
//   color: white;
//   border: none;
//   border-radius: 4px;
//   cursor: pointer;
// }

// .my-message, .their-message {
//   margin-bottom: 10px;
//   padding: 8px;
//   border-radius: 5px;
//   max-width: 80%;
//   word-break: break-word;
// }

// .my-message {
//   background-color: #dcf8c6;
//   margin-left: auto;
// }

// .their-message {
//   background-color: #f1f1f1;
// }

// .message-time {
//   font-size: 0.7em;
//   color: #999;
//   text-align: right;
//   margin-top: 3px;
// }

// .message-content em {
//   color: #666;
//   font-style: italic;
// }

// .message-content strong {
//   font-weight: bold;
// }`;};