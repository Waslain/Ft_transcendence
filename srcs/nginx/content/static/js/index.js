import Main from "./views/Main.js";
import Login from "./views/Login.js";
import Register from "./views/Register.js";
import Users from "./views/Users.js";
import Settings from "./views/Settings.js";
import WaitingRoom from "./views/WaitingRoom.js";
import LocalGame from "./views/LocalGame.js";
import LocalTournament from "./views/LocalTournament.js"
import OnlineGame from "./views/OnlineGame.js";
import OnlineTournament from "./views/OnlineTournament.js";
import { loadAndSetFont } from "./views/pong/utils/font.js";
import Friends from "./views/Friends.js";
import * as Utils from "./utils.js";


export let text = null;

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
    { path: "/settings", view: Settings },
    { path: "/pong", view: WaitingRoom },
    { path: "/pong/localGame", view: LocalGame },
    { path: "/pong/localTournament", view: LocalTournament },
    { path: "/pong/:room_id", view: OnlineGame },
    { path: "/tournament/:room_id", view: OnlineTournament },
    { path: "/friends", view: Friends },
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
    var endpoint = "https://" + location.host + "/api/users/check-auth/"
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


const updateLanguage = async () => {
	let language = localStorage.getItem("language")
	if (language === "undefined")
		language = "en"
	const url = "https://" + location.host + "/files/" + language + ".json";
	text = await fetch(url)
	.then(response => response.json())
	.catch(error => console.error(error))
}

let refreshAbortController = new AbortController();
export const refreshPage = async () => {
	/*Check if the user is authenticated*/
	var url = "https://" + location.host +"/api/users/check-auth/"
	const data = await fetch(url, {
	  method: 'GET',
	})
	.then(response => response.json())
	.catch(error => {
	  console.error(error);
	})

	localStorage.setItem("language", data.language);
	await updateLanguage();

	document.getElementById("generalChatOption").innerText = text.chat.general;
	document.getElementById("chatInput").placeholder = text.chat.placeholder;

	const chatUserSelect = document.getElementById('chatUserSelect');
    if (chatUserSelect) {
	if (refreshAbortController) {
		refreshAbortController.abort();
		refreshAbortController = null;
		refreshAbortController = new AbortController();
	}
	chatUserSelect.addEventListener('change', function() {
		const selectedValue = this.value;
		const chatMessages = document.getElementById('chatMessages');
		
		if (chatMessages) {
			chatMessages.dataset.context = selectedValue;
			
			// Update the header title
			const chatHeaderTitle = document.getElementById('chatHeaderTitle');
			if (chatHeaderTitle) {
				if (selectedValue === 'general') {
					chatHeaderTitle.textContent = text.chat.general;
				} else {
					const selectedOption = this.options[this.selectedIndex];
					chatHeaderTitle.textContent = `Chat with ${selectedOption.text}`;
				}
			}
		}
	},
	{
		signal: refreshAbortController.signal,
	});
    }

	if (data.IsAuthenticated) {
		document.dispatchEvent(loginUser);
	}
	else {
		document.dispatchEvent(logoutUser);
	}

	router();
}

document.addEventListener("DOMContentLoaded", async () => {

	document.body.addEventListener("click", (e) => {
		const link = e.target.closest("a[data-link]");
		if (link) {
		  e.preventDefault();
		  navigateTo(link.getAttribute("href"));
		}
	  });
	await refreshPage();
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

export const invitePlayer = (username) => {
	const matchOption = Array.from(chatUserSelect.options).find(option => option.text === username)
	if (matchOption) {
		chatWindow.style.display = 'block';
		const inviteEvent = new CustomEvent('invite', {
			detail: {
				username: username,
			},
		});
		document.dispatchEvent(inviteEvent);
	} else {
		alert(`Error: User "${username}" is not online`);
	}
}

export const privMsg = (userToChat) => {
	const matchOption = Array.from(chatUserSelect.options).find(option => option.text === userToChat)
	if (matchOption) {
		chatWindow.style.display = 'block';
		chatUserSelect.value = matchOption.value;
		chatHeaderTitle.textContent = `Chat with ${matchOption.text}`;
		chatMessages.dataset.context = matchOption.value;
	} else {
		alert(`Error: User "${userToChat}" is not online`);
	}
}

let chatSocket = null;
let onlineUsersIntervalId;
let blockedUsersIntervalId;

export const getChatSocket = () => {return chatSocket;}

let authAbortController = null;
document.addEventListener("authenticate", (e) => {
	if (sidebar.className === 'sidebar') {
		sidebar.classList.toggle('open');
	}

	/* Code executed on login*/
	if (e.detail.authenticated) {
		authAbortController = new AbortController();

		/* Update sidebar*/
  		document.querySelector("#sidebarItems").innerHTML = `
		<a href="/" class="nav-item d-flex align-items-center" data-link>
			<i class="fs-2 bi-house"></i><span>`+text.sidebar.main+`</span>
		</a>
		<a href="#" class="nav-item d-flex align-items-center" id="chatBox">
				<i class="fs-2 bi-chat-left-heart"></i><div id="msg-hint" class="msg-hint"><i class=" bi bi-circle-fill red-dot"></i></div><span>`+text.chat.chat+`</span>
		</a>
		<a href="/settings" class="nav-item d-flex align-items-center" data-link>
			<i class="fs-2 bi-gear"></i><span>`+text.settings.settings+`</span>
		</a>
		<a href="/friends" class="nav-item d-flex align-items-center" data-link>
			<i class="fs-2 bi-people"></i><span>`+text.friends.friends+`</span>
		</a>
		<a href="" class="nav-item d-flex align-items-center" id="signOut">
			<i class="fs-2 bi-door-open"></i><span>`+text.sidebar.signout+`</span>
		</a>
		<hr>
		<a href="/users/profile" class="nav-item d-flex align-items-center" data-link>
			<img src="#" id="sidebarAvatar" alt="avatar" width="30" height="30" class="rounded-circle" style="object-fit: cover">
			<span id="sidebarUsername"></span>
		</a>
		`
		document.getElementById('sidebarUsername').innerText = localStorage.getItem("username")

		updateAvatar();

		document.getElementById('signOut').addEventListener('click', (e) => {
			e.preventDefault();
			var url = "https://" + location.host + "/api/users/logout/"
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
					navigateTo('/');
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
				
			} else {
				chatWindow.style.display = 'none';
			}
		},
		{
			signal: authAbortController.signal,
		});

		document.addEventListener("invite", (e) => {
			sendInviteMessage(e.detail.username);
		},
		{
			signal: authAbortController.signal,
		});

		/*Hint redDot for private message*/
		let hasUnreadMessages = false;
		const hint = document.getElementById('msg-hint')
		const redDot = hint.querySelector('.red-dot');
		redDot.style.display = 'none';

		function toggleChatWindow() {
			if (chatWindow.style.display === 'block' && hasUnreadMessages) {
				hasUnreadMessages = false;
				redDot.style.display = 'none';
			}
			if (chatWindow.style.display === 'block') {
				redDot.style.diaplay = 'none';
			}
		}

		setInterval(()=> {
			if (hasUnreadMessages){
				redDot.style.display = 'block';
			}
			toggleChatWindow();
		}, 1000); //check every 1 sec;

		// Connectez-vous au WebSocket si ce n'est pas déjà fait
		if (!chatSocket || chatSocket.readyState !== WebSocket.OPEN) {
			connectWebSocket();
		}

		function connectWebSocket() {
			// Use wss:// for a secure connection (SSL/TLS)
			const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
			chatSocket = new WebSocket(protocol + window.location.host + '/ws/chat/');

			chatSocket.onopen = function(e) {
			console.log('Chat connection established');
			// Fetch online users when connection is established
			Utils.fetchOnlineUsers();
			Utils.fetchBlockedUsers();
			// Start a periodic refresh of the online users list
			onlineUsersIntervalId = setInterval(Utils.fetchOnlineUsers, 5000); // Every 5 seconds
			blockedUsersIntervalId = setInterval(Utils.fetchBlockedUsers, 30000); // Every 30 seconds
			};
		
			chatSocket.onmessage = function(e) {
			try {
				const data = JSON.parse(e.data);
				if (data.message) {
					if (data.message.is_invitation) {
						chatWindow.style.display = 'block';
					}
					if (data.message.is_private) {
						hasUnreadMessages = true;
					}
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
			//console.log(message);
			const chatMessages = document.getElementById('chatMessages');
			
			// Check if the message is from a blocked user
			if (message.sender_id) {  // Make sure sender_id exists
				const blockedUsers = JSON.parse(localStorage.getItem('blockedUsers') || '[]');
				
				// IMPORTANT: Convert both to numbers for comparison
				const senderId = Number(message.sender_id);
				// Check if this user ID is in the blocked list
				if (blockedUsers.includes(senderId)) {
					return; // Don't display messages from blocked users
				}
			}

			// Special handling for game invitations
			if (message.is_invitation) {
				// Create special invitation element
				const messageElement = document.createElement('div');
				messageElement.className = 'game-invitation-message system-message';
				
				const invitationCard = document.createElement('div');
				invitationCard.className = 'invitation-card';
				
				// Add sender info with clickable username
				if (message.username && message.username !== "Anonymous") {
					const senderInfo = document.createElement('div');
					senderInfo.className = 'invitation-sender';
					
					// Clickable username
					const usernameLink = document.createElement('a');
					usernameLink.textContent = message.username;
					usernameLink.href = `/users/profile/${message.username}`;
					usernameLink.style.color = 'inherit';
					usernameLink.style.textDecoration = 'underline';
					usernameLink.style.fontWeight = 'bold';
					usernameLink.addEventListener('click', function(e) {
						e.preventDefault();
						navigateTo(`/users/profile/${message.username}`);
					},
					{
						signal: authAbortController.signal,
					});
					
					senderInfo.appendChild(usernameLink);
					senderInfo.appendChild(document.createTextNode(' invited you to a game!'));
					invitationCard.appendChild(senderInfo);
					
					// Add action buttons
					const actionButtons = document.createElement('div');
					actionButtons.className = 'invitation-actions';
					
					// Accept button
					const acceptButton = document.createElement('button');
					acceptButton.className = 'btn btn-sm btn-success invitation-btn';
					acceptButton.textContent = text.chat.accept;
					acceptButton.addEventListener('click', function() {
						// Navigate to game page with invitation info
						navigateTo(`/pong/${message.username}`);
						chatWindow.style.display = 'none';
					},
					{
						signal: authAbortController.signal,
					});
					
					// Decline button
					const declineButton = document.createElement('button');
					declineButton.className = 'btn btn-sm btn-danger invitation-btn ms-2';
					declineButton.textContent = text.chat.decline;
					declineButton.addEventListener('click', function() {
						// Remove the invitation card
						messageElement.remove();
						
						// Send decline message
						if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
							chatSocket.send(JSON.stringify({
								'type': 'private_message',
								'recipient_id': message.sender_id,
								'message': text.chat.declineMessage
							}));
						}
					},
					{
						signal: authAbortController.signal,
					});
					
					actionButtons.appendChild(acceptButton);
					actionButtons.appendChild(declineButton);
					invitationCard.appendChild(actionButtons);
				} else {
					// Fallback for missing username
					invitationCard.textContent = "You received a game invitation";
				}
				
				// Add timestamp
				const messageTime = document.createElement('div');
				messageTime.className = 'message-time';
				const date = new Date(message.timestamp || new Date());
				messageTime.textContent = date.toLocaleTimeString();
				
				messageElement.appendChild(invitationCard);
				messageElement.appendChild(messageTime);
				
				chatMessages.appendChild(messageElement);
				chatMessages.scrollTop = chatMessages.scrollHeight;
				
				// Exit early since we've already handled this message
				return;
			}

			// Special handling for invitation sender confirmation
			if (message.is_lobby && message.is_system) {
				// Create special confirmation element
				const messageElement = document.createElement('div');
				messageElement.className = 'system-message invitation-confirmation system-message';
				
				const invitationCard = document.createElement('div');
				invitationCard.className = 'invitation-card sender-card';
				
				// Add confirmation message
				const confirmationInfo = document.createElement('div');
				confirmationInfo.className = 'confirmation-info';
				
				// Create message with clickable recipient username
				const systemText = document.createElement('span');
				systemText.textContent = text.chat.inviteMessage1 + ' ';
				confirmationInfo.appendChild(systemText);
				
				const postText = document.createElement('span');
				postText.textContent = ' ' + text.chat.inviteMessage2;
				confirmationInfo.appendChild(postText);
				
				invitationCard.appendChild(confirmationInfo);
				
				// Add action buttons
				const actionButtons = document.createElement('div');
				actionButtons.className = 'invitation-actions';
				
				// Join button
				const joinButton = document.createElement('button');
				joinButton.className = 'btn btn-sm btn-primary invitation-btn';
				joinButton.textContent = text.chat.join;
				joinButton.addEventListener('click', function() {
					// Navigate to game page as the inviter
					navigateTo(`/pong/${localStorage.getItem('username')}`);
					chatWindow.style.display = 'none';
				},
				{
					signal: authAbortController.signal,
				});
				
				// Cancel button
				const cancelButton = document.createElement('button');
				cancelButton.className = 'btn btn-sm btn-outline-secondary invitation-btn ms-2';
				cancelButton.textContent = text.chat.cancel;
				cancelButton.addEventListener('click', function() {
					// Remove the invitation card
					messageElement.remove();
					
					// Send cancellation message
					if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
						chatSocket.send(JSON.stringify({
							'type': 'private_message',
							'recipient_id': message.recipient_id,
							'message': text.chat.cancelMessage
						}));
					}
				},
				{
					signal: authAbortController.signal,
				});
				
				actionButtons.appendChild(joinButton);
				actionButtons.appendChild(cancelButton);
				invitationCard.appendChild(actionButtons);
				
				// Add timestamp
				const messageTime = document.createElement('div');
				messageTime.className = 'message-time';
				const date = new Date(message.timestamp || new Date());
				messageTime.textContent = date.toLocaleTimeString();
				
				messageElement.appendChild(invitationCard);
				messageElement.appendChild(messageTime);
				
				chatMessages.appendChild(messageElement);
				chatMessages.scrollTop = chatMessages.scrollHeight;
				
				// Exit early since we've already handled this message
				return;
			}
					
			// Create message element
			const messageElement = document.createElement('div');
			messageElement.className = message.is_own ? 'my-message' : 'their-message';
			
			const messageContent = document.createElement('div');
			messageContent.className = 'message-content';
			
			// Handle different message formats
			if (message.is_private) {
				// Private message format
				//console.log("PRIVATE MESSAGE");
				if (message.is_own) {
					// Message sent by current user
					const prefix = document.createElement('em');
					prefix.textContent = text.chat.me+` → `;
					messageContent.appendChild(prefix);
					
					// Add clickable recipient username
					if (message.recipient_username && message.recipient_username !== "Anonymous") {
						const usernameLink = document.createElement('a');
						usernameLink.textContent = message.recipient_username;
						usernameLink.href = `/users/profile/${message.recipient_username}`;
						usernameLink.style.color = 'inherit';
						usernameLink.style.textDecoration = 'underline';
						usernameLink.style.fontStyle = 'italic';
						usernameLink.addEventListener('click', function(e) {
							e.preventDefault();
							navigateTo(`/users/profile/${message.recipient_username}`);
						},
						{
							signal: authAbortController.signal,
						});
						messageContent.appendChild(usernameLink);
					} else {
						const username = document.createElement('em');
						username.textContent = message.recipient_username || "Anonymous";
						messageContent.appendChild(username);
					}
					
					const colon = document.createElement('em');
					colon.textContent = ": ";
					messageContent.appendChild(colon);
				} else {
					// Message received from another user
					const prefix = document.createElement('em');
					prefix.textContent = "";
					messageContent.appendChild(prefix);
					
					// Add clickable sender username
					if (message.username && message.username !== "Anonymous" && message.username !== "Me" && message.username !== "System") {
						const usernameLink = document.createElement('a');
						usernameLink.textContent = message.username;
						usernameLink.href = `/users/profile/${message.username}`;
						usernameLink.style.color = 'inherit';
						usernameLink.style.textDecoration = 'underline';
						usernameLink.style.fontStyle = 'italic';
						usernameLink.addEventListener('click', function(e) {
							e.preventDefault();
							navigateTo(`/users/profile/${message.username}`);
						},
						{
							signal: authAbortController.signal,
						});
						messageContent.appendChild(usernameLink);
					} else {
						const username = document.createElement('em');
						username.textContent = message.username || "Anonymous";
						messageContent.appendChild(username);
					}
					
					const arrow = document.createElement('em');
					arrow.textContent = " → "+text.chat.me+": ";
					messageContent.appendChild(arrow);
				}
			} else {
				// General chat format
				if (message.is_own) {
					// Own message in general chat
					const sender = document.createElement('strong');
					sender.textContent = text.chat.me+': ';
					messageContent.appendChild(sender);
				} else {
					// Other user's message in general chat
					if (message.username && message.username !== "Anonymous") {
						// Create clickable username
						const usernameLink = document.createElement('a');
						usernameLink.textContent = message.username;
						usernameLink.href = `/users/profile/${message.username}`;
						usernameLink.style.fontWeight = 'bold';
						usernameLink.style.color = 'inherit';
						usernameLink.style.textDecoration = 'underline';
						usernameLink.addEventListener('click', function(e) {
							e.preventDefault();
							navigateTo(`/users/profile/${message.username}`);
						},
						{
							signal: authAbortController.signal,
						});
						messageContent.appendChild(usernameLink);
						
						const colon = document.createElement('strong');
						colon.textContent = ': ';
						messageContent.appendChild(colon);
					} else {
						const sender = document.createElement('strong');
						sender.textContent = `${message.username || 'Anonymous'}: `;
						messageContent.appendChild(sender);
					}
				}
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
		},
		{
			signal: authAbortController.signal,
		});
		

		document.getElementById("sendButton").addEventListener("click", function() {
			console.log('Send button clicked');
			sendChatMessage();
		},
		{
			signal: authAbortController.signal,
		});

		function sendInviteMessage(username) {
			chatSocket.send(JSON.stringify({
				'type': 'general_chat',
				'message': "/invite " + username,
			}));
		}

		function sendChatMessage() {
			console.log('Sending chat message');
			const chatInput = document.getElementById('chatInput');
			const message = chatInput.value.trim();
			const chatMessages = document.getElementById('chatMessages');
			const chatContext = chatMessages ? chatMessages.dataset.context : 'general';
			console.log('CHAT CONTEXT:', chatContext);
			
			if (message && chatSocket && chatSocket.readyState === WebSocket.OPEN) {
				// Check if this is a private message
				if (chatContext && chatContext !== 'general') {
					// Send private message
					console.log('Sending private message to', chatContext);
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
		Utils.fetchOnlineUsers(onlineUsers);

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

		document.getElementById('closeChatBtn').addEventListener('click', function(event) {
			event.preventDefault();
			const chatWindow = document.getElementById('chatWindow');
			chatWindow.style.display = 'none';
		},
		{
			signal: authAbortController.signal,
		});
	}
	/* Code executed on logout*/
	else {
  		document.querySelector("#sidebarItems").innerHTML = `
		<a href="/users/login" class="nav-item d-flex align-items-center" data-link>
				<i class="fs-2 bi-door-open"></i><span>`+text.login.login+`</span>
		</a>
		`
		if (chatSocket) {
			chatSocket.close();
		}
		const chatWindow = document.getElementById('chatWindow');
		chatWindow.style.display = 'none';
		if (authAbortController) {
			authAbortController.abort();
		}
		localStorage.removeItem('username');
		localStorage.removeItem('avatar');
		clearInterval(onlineUsersIntervalId);
		clearInterval(blockedUsersIntervalId);
	}
});
