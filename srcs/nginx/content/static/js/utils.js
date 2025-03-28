export function fetchBlockedUsers() {
	fetch('https://localhost/api/users/blocked/', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include'
	})
	.then(response => {
		if (!response.ok) {
			throw new Error(`Network response was not ok: ${response.status}`);
		}
		return response.json();
	})
	.then(blockedUsers => {
		//console.log("Fetched blocked users:", blockedUsers);
		// Store the blocked users in localStorage for quick access
		localStorage.setItem('blockedUsers', JSON.stringify(blockedUsers));
	})
	.catch(error => {
		console.error('Error fetching blocked users:', error);
	});
}

export function fetchOnlineUsers(usersArray) {
    return fetch('https://localhost/api/users/online/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
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
        // Update the passed array if provided
        if (usersArray && Array.isArray(usersArray)) {
            // Clear the array without creating a new reference
            usersArray.length = 0;
            // Fill with new values
            users.forEach(user => usersArray.push(user));
        }
        
        // Update UI
		console.log("Updating online users list:", users);
        updateOnlineUsersList(users);
        
        // Return users for chaining
        return users;
    })
    .catch(error => {
        console.error('Error fetching online users:', error);
        return [];
    });
}

// Function to update the users dropdown
export function updateOnlineUsersList(users) {
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


// // Add this function to update the users list in the UI
// function updateUsersList() {
// 	const usersList = document.getElementById('chatUsers');
// 	if (!usersList) return;
	
// 	usersList.innerHTML = '<div class="chat-user selected" data-user-id="general">General Chat</div>';
	
// 	onlineUsers.forEach(user => {
// 		// Don't add current user to the list
// 		if (user.username === localStorage.getItem("username")) return;
		
// 		const userItem = document.createElement('div');
// 		userItem.className = 'chat-user';
// 		userItem.dataset.userId = user.id;
// 		userItem.textContent = user.username;
// 		usersList.appendChild(userItem);
// 	});
	
// 	// Add click handlers to user items
// 	document.querySelectorAll('.chat-user').forEach(item => {
// 		item.addEventListener('click', function() {
// 		document.querySelectorAll('.chat-user').forEach(el => el.classList.remove('selected'));
// 		this.classList.add('selected');
		
// 		// Update the chat context (general or private)
// 		const userId = this.dataset.userId;
// 		document.getElementById('chatMessages').dataset.context = userId;
		
// 		// Update the header to show who you're chatting with
// 		const chatHeader = document.getElementById('chatHeaderTitle');
// 		chatHeader.textContent = userId === 'general' ? 'General Chat' : `Chat with ${this.textContent}`;
// 		},
// 		{
// 			signal: authAbortController.signal,
// 		});
// 	});
// 	}