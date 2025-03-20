import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
	constructor() {
		super();
		this.setTitle("Transcendence");
		this.redirection = {
			needed: false,
			auth: true,
			url: '/'
		}
	}

	async getHtml() {
	return `
	<div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col col-xl-10">
          <div class="card" style="border-radius: 1rem;">
            <div class="row g-0">
              <div class="col-md-6 col-lg-7 d-flex align-items-center">
                <div class="card-body p-4 p-lg-5 text-black">
  
                  <form id="loginForm">
  
                    <div class="d-flex align-items-center mb-3 pb-1">
                      <span class="h1 fw-bold mb-0">Login</span>
                    </div>
  
                    <h5 class="fw-normal mb-3 pb-3" style="letter-spacing: 1px;">Sign into your account</h5>
  
                    <div data-mdb-input-init class="form-outline mb-4">
                      <input type="text" id="username" name="username" class="form-control form-control-lg" placeholder="Username" maxlength="20">
					  <div id="usernameCheck" style="color:#dd0000"></div>
                    </div>
  
                    <div data-mdb-input-init class="form-outline mb-4">
                      <input type="password" id="password" name="password" class="form-control form-control-lg" placeholder="Password" maxlength="20">
					  <div id="passwordCheck" style="color:#dd0000"></div>
                    </div>
  
                    <div class="pt-1 mb-4">
                      <button data-mdb-button-init data-mdb-ripple-init class="btn btn-dark btn-lg btn-block" type="submit">Login</button>
					<div id="response" style="color:#dd0000"></div>
                    </div>
                    <p class="mb-5 pb-lg-2" style="color: #000000;">Don't have an account?
					<a href="/user/register" class="nav-link" style="color: #0000dd" data-link>register here!</a>
                  </form>

				  <div>
				  	<button id=testBtn>Am I logged in ?</button>
				  	<button id=logoutBtn>Logout</button>
					<div id="test"></div>
				  </div>
  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
		`;
	}

	#abortController;

	async getJavaScript() {
		this.#abortController = new AbortController();

		document.getElementById('loginForm').addEventListener('submit', function(event) {
			event.preventDefault();
			document.getElementById('response').innerText = "";

			const formData = new FormData(this)
			const username = formData.get("username");
			const password = formData.get("password");
			let inputCheck = false;

			if (username === "") {
				inputCheck = true;
				document.getElementById('usernameCheck').innerText = "Please enter a username";
			}
			else {
				document.getElementById('usernameCheck').innerText = "";
			}

			if (password === "") {
				inputCheck = true;
				document.getElementById('passwordCheck').innerText = "Please enter a password";
			}
			else {
				document.getElementById('passwordCheck').innerText = "";
			}

			if (inputCheck) {
				return;
			}

			var url = "https://localhost/api/users/login/"
			fetch(url, {
				method: 'POST',
				body: formData,
			})
			.then(response => {
				if (response.status >= 400) {
					document.getElementById('response').innerText = "Invalid username or password";
				}
				return response.json();
			})
			.then(data => {
				console.log(data.message)
			})
		},
		{
			signal: this.#abortController.signal,
		});

		document.getElementById('testBtn').addEventListener('click', function(event) {
			var url = "https://localhost/api/users/session/"
			fetch(url, {
				method: 'GET',
			})
			.then(response => {
				return response.json();
			})
			.then(data => {
				if (data.IsAuthenticated === true) {
					document.getElementById('test').innerText = 'User is logged in';
				}
				else {
					document.getElementById('test').innerText = 'User is not logged in';
				}
			})
		},
		{
			signal: this.#abortController.signal,
		});

		document.getElementById('logoutBtn').addEventListener('click', function(event) {
			var url = "https://localhost/api/users/logout/"
			fetch(url, {
				method: 'GET',
			})
			.then(response => {
				if (response.status === 200) {
					document.getElementById('test').innerText = 'Successfully logged out';
				}
				else {
					document.getElementById('test').innerText = 'User is not logged in';
				}
			})
		},
		{
			signal: this.#abortController.signal,
		});
		
	}

	async cleanUp() {
		this.#abortController.abort();
	}
}
