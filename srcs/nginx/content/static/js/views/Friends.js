import AbstractView from "./AbstractView.js";

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
        .card-body {
            padding: 0.5rem;
            padding-left: 0;
            margin-left: 0;
        }
        .card-header {
            background-color: #9cafc9;
            color: #fff;
        }
        .card-footer {
            background-color: #9cafc9;
        }
        `;}

    async getHtml() {
	return `
    <div class="container py-5 h-100">
        <div class="row-fluid d-flex justify-content-center align-items-center">
                <img src="#" id="avatarDisplay" alt="user's image" width="50" height="50" class="rounded-circle">
                <h2 class="d-sm-inline mx-3 mb-0 text-white" id=usernameDisplay></h2>
        </div>
        <br>
        <div class="row-fluid d-flex justify-content-center align-items-center">
            <input type="text" class="search-btn form-control" placeholder="Search user">
        </div>
        <hr/>
        <section>
            <div class="row justify-content-center chart-container">
                <div class="col-12 col-sm-10 col-md-6 col-lg-5 col-xl-5 col-xxl-5 mb-4">
                    <div class="card widget-card border-light shadow-sm chart-wrapper">
                        <div class="card-header text-center fw-medium align-items-cente fs-5">Friends List</div>
                        <div class="card-body overflow-auto" id="friend-list-container">
                            <ul id="friendList"></ul>
                        </div>
                        <div class="card-footer"></div>
                    </div>
                </div>
                <div class="col-12 col-sm-10 col-md-6 col-lg-5 col-xl-5 col-xxl-5 mb-4">
                    <div class="card widget-card border-light shadow-sm chart-wrapper">
                        <div class="card-header text-center fw-medium align-items-cente fs-5">Block List</div>
                        <div class="card-body overflow-auto" id="block-list-container">
                            <ul id="blockList"></ul>
                        </div>
                        <div class="card-footer"></div>
                    </div>
                </div>
            </div>
        </section>
	`;
    }

    async getJavaScript() {
        const username = localStorage.getItem("username");
		const avatar = localStorage.getItem("avatar");

		document.getElementById('usernameDisplay').innerText = username;
		document.getElementById('avatarDisplay').src = avatar;

		let endpoint = "https://localhost/api/users/friends/list/" + username + "/";
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
		//console.log(data);

		if (data === null) {
			return;
		}

        document.getElementById('friendList').innerHTML = '';
        document.getElementById('blockList').innerHTML = '';
        const flistContainer = document.getElementById('friend-list-container');
        const blistContainer = document.getElementById('block-list-container');
        /*Pending List*/
        if (data.friends.length === 0){
            flistContainer.style.height = '70px';
            const NoFriendsMsg = document.createElement('li');
            NoFriendsMsg.classList.add('list-group-item', 'text-center', 'text-secondary');
            NoFriendsMsg.textContent = 'No friends yet';
            document.getElementById('friendList').appendChild(NoFriendsMsg);
        } else {
            data.friends.forEach(friend => {
                flistContainer.style.height = '350px';
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item', 'd-flex', 'align-items-center', 'p-2');
                
                const status = document.createElement('i');
                if (friend.is_online === true) {
                    status.classList.add('bi', 'bi-emoji-laughing-fill', 'me-3', 'text-warning');
                }
                else {
                    status.classList.add('bi', 'bi-emoji-dizzy-fill', 'me-3', 'text-body-tertiary');
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
                actionBtn.onclick = () => unfriendUser(friend.id);

                listItem.appendChild(status);
                listItem.appendChild(img);
                listItem.appendChild(name);
                listItem.appendChild(actionBtn);

                 document.getElementById('friendList').appendChild(listItem);
            });
        }

		data = {blocked: {length: 0}};
		console.log(data);
        /*Blocked List*/
        if (data.blocked.length === 0){
            blistContainer.style.height = '70px';
            const NoBlockedMsg = document.createElement('li');
            NoBlockedMsg.classList.add('list-group-item', 'text-center', 'text-secondary');
            NoBlockedMsg.textContent = 'No blocked users';
            document.getElementById('blockList').appendChild(NoBlockedMsg);
        } else {
            data.blocked.forEach(blocked => {
                blistContainer.style.height = '350px';
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item', 'd-flex', 'align-items-center', 'p-2');

                const img = document.createElement('img');
                img.src = blocked.avatar || '/static/img/default.png';
                img.alt = blocked.username;
                img.classList.add('rounded-circle', 'me-2');
                img.style.height = '30px';
                img.style.width = '30px';

                const name = document.createTextNode(blocked.username);

                const actionBtn = document.createElement('button');
                actionBtn.classList.add('btn', 'btn-primary', 'btn-sm', 'ms-auto');
                actionBtn.textContent = 'Unblock';
                actionBtn.onclick = () => unblockUser(blocked.id);

                listItem.appendChild(img);
                listItem.appendChild(name);
                listItem.appendChild(actionBtn);

                document.getElementById('blockList').appendChild(listItem);
            });
        }
        /*Blocked List*/

        function unfriendUser(friendId) {
            console.log('Unfriend user ID:', friendId);
            //API to unfriend request
        }

        function unblockUser(userId) {
            console.log('Unblock user ID:', userId);
            //API to unfriend request
        }
	}
}
