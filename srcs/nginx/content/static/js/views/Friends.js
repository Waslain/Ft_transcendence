import AbstractView from "./AbstractView.js";
import * as Utils from "../utils.js";
import { navigateTo } from "../index.js";

export default class extends AbstractView {
	constructor(params) {
		super();
		this.setTitle("Transcendence");
		this.params = params;
		this.redirection = {
			needed: true,
			auth: false,
			url: '/users/login',
			urlAfterLogin: '/friends'
		}
	}

    async getStyle() {
        return `
        ul{
            padding: 0.5rem;
            margin: 0;
        }
        .search-btn{
            width: 200px;
            border-radius: 25px;
        }
        .btn {
            border-radius: 25px;
        }
        .box-wrapper {
            background-color:rgba(197, 197, 197, 0.1);
            backdrop-filter: blur(5px);
        }
        .card-body {
            padding: 0.5rem;
            padding-left: 0;
            margin-left: 5px;
            color: white;
        }
        .card-header {
            color: #fff;
        }
        .list-item-clickable {
            border-radius: 25px;
        }
        .list-item-clickable:hover {
            background-color:rgba(248, 249, 250, 0.4);
            border-radius: 25px;
            color: black;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transform: scale(1.02);
            z-index: 10;
        }
        `;}

    async getHtml() {
	return `
    <div class="container py-5 h-100">
        <div class="row-fluid d-flex justify-content-center align-items-center">
                <img src="#" id="avatarDisplay" alt="user's image" width="50" height="50" class="rounded-circle" style="border: solid #fff;">
                <h2 class="d-sm-inline mx-3 mb-0 text-white" id=usernameDisplay></h2>
        </div>
        <br>
        <div class="row-fluid d-flex justify-content-center align-items-center">
            <input type="text" class="search-btn form-control" placeholder="Search user" id="searchBar">
        </div>
        <hr/>
        <section>
            <div class="row justify-content-center chart-container">
                <div class="col-12 col-sm-10 col-md-6 col-lg-5 col-xl-5 col-xxl-5 mb-4">
                    <div class="card widget-card border-light shadow-sm box-wrapper">
                        <div class="card-header text-center border-light fw-medium align-items-cente fs-5">Friends List</div>
                        <div class="card-body overflow-auto" id="friend-list-container">
                            <ul id="friendList"></ul>
                        </div>
                        <div class="card-footer border-light"></div>
                    </div>
                </div>
                <div class="col-12 col-sm-10 col-md-6 col-lg-5 col-xl-5 col-xxl-5 mb-4">
                    <div class="card widget-card border-light shadow-sm box-wrapper">
                        <div class="card-header border-light text-center fw-medium align-items-cente fs-5">Block List</div>
                        <div class="card-body overflow-auto" id="block-list-container">
                            <ul id="blockList"></ul>
                        </div>
                        <div class="card-footer border-light"></div>
                    </div>
                </div>
            </div>
        </section>
    </div>
	`;
    }

	#abortController;

    async getJavaScript() {
		this.#abortController = new AbortController();
        const username = localStorage.getItem("username");
		const avatar = localStorage.getItem("avatar");

		document.getElementById('usernameDisplay').innerText = username;
		document.getElementById('avatarDisplay').src = avatar;

		const searchBar = document.getElementById('searchBar');
		searchBar.addEventListener("keydown", function(event) {
			if (event.keyCode === 13) {
				navigateTo("https://localhost/users/profile/" + searchBar.value);
			}
		},
		{
			signal: this.#abortController.signal,
		});

		const updateFriendsList = async () => {
			let endpoint = "https://localhost/api/users/friends/list/";
			let data = await fetch(endpoint, {
				method: 'GET',
			})
			.then(response => response.json().then(json => ({
				data: json, status: response.status})))
			.then(res => {
				if (res.status > 400) {
					console.log(res.data.message);
					return null;
				}
				else {
					return res.data
				}
			})
			.catch(error => {
				console.error(error);
				return null;
			})

			if (data === null) {
				return;
			}

			document.getElementById('friendList').innerHTML = '';
			const flistContainer = document.getElementById('friend-list-container');

			/*Pending List*/
			if (!data.friends || data.friends.length === 0){
				flistContainer.style.height = '70px';
				const NoFriendsMsg = document.createElement('li');
				NoFriendsMsg.classList.add('list-group-item', 'text-center', 'text-secondary');
				NoFriendsMsg.textContent = 'No friends yet';
				document.getElementById('friendList').appendChild(NoFriendsMsg);
			} else {
				data.friends.forEach(friend => {
					flistContainer.style.height = '350px';
					const listItem = document.createElement('li');
					listItem.classList.add('list-group-item', 'd-flex', 'align-items-center', 'p-2', 'list-item-clickable');

                    listItem.style.cursor = 'pointer';
                    listItem.addEventListener('click', (event) => {
                        if (event.target.classList.contains('btn-danger')) return;
						navigateTo(`/users/profile/${friend.username}`);
					},
					{
						signal: this.#abortController.signal,
                    });
					
					const status = document.createElement('i');
					if (friend.is_online === true) {
						status.classList.add('bi', 'bi-emoji-laughing-fill', 'me-3', 'text-warning');
					}
					else {
						status.classList.add('bi', 'bi-emoji-dizzy-fill', 'me-3', 'text-secondary');
					}

					const img = document.createElement('img');
					img.src = friend.avatar || '/static/img/default.png';
					img.alt = friend.username;
					img.classList.add('rounded-circle', 'me-2');
					img.style.height = '30px';
					img.style.width = '30px';

					const name = document.createTextNode(friend.username);

					const actionBtn = document.createElement('button');
					actionBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'ms-auto');
					actionBtn.textContent = 'Unfriend';
					actionBtn.onclick = () => unfriendUser(friend.username);

					listItem.appendChild(status);
					listItem.appendChild(img);
					listItem.appendChild(name);
					listItem.appendChild(actionBtn);

					 document.getElementById('friendList').appendChild(listItem);
				});
			}
		}

		const updateBlockList = async () => {
			let endpoint = "https://localhost/api/users/block/list/";
			let data = await fetch(endpoint, {
				method: 'GET',
			})
			.then(response => response.json().then(json => ({
				data: json, status: response.status})))
			.then(res => {
				if (res.status > 400) {
					console.log(res.data.message);
					return null;
				}
				else {
					return res.data
				}
			})
			.catch(error => {
				console.error(error);
				return null;
			})

			if (data === null) {
				return;
			}

			/*Blocked List*/
			document.getElementById('blockList').innerHTML = '';
			const blistContainer = document.getElementById('block-list-container');

			if (!data.blocked ||data.blocked.length === 0){
				blistContainer.style.height = '70px';
				const NoBlockedMsg = document.createElement('li');
				NoBlockedMsg.classList.add('list-group-item', 'text-center', 'text-secondary');
				NoBlockedMsg.textContent = 'No blocked users';
				document.getElementById('blockList').appendChild(NoBlockedMsg);
			} else {
				data.blocked.forEach(block => {
					blistContainer.style.height = '350px';
					const listItem = document.createElement('li');
					listItem.classList.add('list-group-item', 'd-flex', 'align-items-center', 'p-2', 'list-item-clickable');

                    listItem.style.cursor = 'pointer';
                    listItem.addEventListener('click', (event) => {
                        if (event.target.classList.contains('btn-primary')) return;
						navigateTo(`/users/profile/${block.username}`);
					},
					{
			signal: this.#abortController.signal,
                    });

					const img = document.createElement('img');
					img.src = block.avatar || '/static/img/default.png';
					img.alt = block.username;
					img.classList.add('rounded-circle', 'me-2');
					img.style.height = '30px';
					img.style.width = '30px';

					const name = document.createTextNode(block.username);

					const actionBtn = document.createElement('button');
					actionBtn.classList.add('btn', 'btn-primary', 'btn-sm', 'ms-auto');
					actionBtn.textContent = 'Unblock';
					actionBtn.onclick = () => unblockUser(block.username);

					listItem.appendChild(img);
					listItem.appendChild(name);
					listItem.appendChild(actionBtn);

					document.getElementById('blockList').appendChild(listItem);
				});
			}
			/*Blocked List*/
		}

		updateFriendsList();
		updateBlockList();

        function unfriendUser(username) {
			let formData = new FormData();
			formData.set('username', username);

			const endpoint = "https://localhost/api/users/friends/remove/";
			fetch(endpoint, {
				method: 'PUT',
				body: formData,
			})
			.then(response => response.json().then(json => ({
				data: json, status: response.status})))
			.then(res => {
				if (res.status > 400) {
					console.log(res.data.message);
				}
				else {
					console.log(username + ": " + res.data.message);
					updateFriendsList();
				}
			})
			.catch(error => {
				console.error(error);
			})
        }

        function unblockUser(username) {
			let formData = new FormData();
			formData.set('username', username);

			const endpoint = "https://localhost/api/users/block/remove/";
			fetch(endpoint, {
				method: 'PUT',
				body: formData,
			})
			.then(response => response.json().then(json => ({
				data: json, status: response.status})))
			.then(res => {
				if (res.status > 400) {
					console.log(res.data.message);
				}
				else {
					console.log(username + ": " + res.data.message);
					updateBlockList();
				}
			})
			.catch(error => {
				console.error(error);
			})
        }

	}

	async cleanUp() {
		this.#abortController.abort();
	}
}
