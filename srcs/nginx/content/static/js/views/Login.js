import AbstractView from "./AbstractView.js";
import { navigateTo } from "../index.js";
import { loginUser } from "../index.js";

export default class extends AbstractView {
	constructor() {
		super();
		this.setTitle("Transcendence");
		this.urlAfterLogin = "";
		this.redirection = {
			needed: true,
			auth: true,
			url: "/users/profile"
		}
	}

	async getStyle() {
		return `
		.container-wrapper {
			background-color:rgba(197, 197, 197, 0.1);
            backdrop-filter: blur(5px);
			border-radius: 1rem;
		}
		.btn-sumbit {
			background-color: #306598;
			color: #fff;
			border-radius: 25px;
		}
		`;
	}

	async getHtml() {
	return `
	<div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col col-xl-10 mt-5">
          <div class="card container-wrapper border-light">
            <div class="row g-0">
              <div class="col-md-6 col-lg-7 d-flex align-items-center">
                <div class="card-body p-4 p-lg-5 text-white">
  
                  <form id="loginForm">
  
                    <div class="d-flex align-items-center mb-3 pb-1">
                      <span class="h1 fw-bold mb-0">Log in</span>
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
                      <button data-mdb-button-init data-mdb-ripple-init class="btn btn-sumbit btn-lg btn-block" type="submit">Log in</button>
					<div id="response" style="color:#dd0000"></div>
                    </div>
                    <p class="mb-5 pb-lg-2" style="color: #fff;">Don't have an account?
					<a href="/users/register" class="nav-link" style="color:rgb(92, 160, 255)" data-link>register here!</a>
                  </form>

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
		let nextUrl = this.urlAfterLogin;

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
			.then(response => response.json().then(json => ({
					data: json, status: response.status})))
			.then(res => {
				if (res.status >= 400) {
					console.log(res.data.message);
					document.getElementById('response').innerText = res.data.message;
				}
				else {
					localStorage.setItem("username", res.data.username);
					if (res.data.avatar) {
						localStorage.setItem("avatar", "https://localhost" + res.data.avatar);
					}
					else {
						localStorage.setItem("avatar", "/static/img/default.png");
					}
					console.log(res.data.message);
					document.dispatchEvent(loginUser);
					if (nextUrl === "") {
						nextUrl = "/users/profile"
					}
					navigateTo(nextUrl);
				}
			})
			.catch(error => {
				console.error(error);
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
