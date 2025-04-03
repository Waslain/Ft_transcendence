import AbstractView from "./AbstractView.js";
import { navigateTo } from "../index.js";
import { refreshPage } from "../index.js";
import { text } from "../index.js";

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
                      <span class="h1 fw-bold mb-0">`+text.login.login+`</span>
                    </div>
  
                    <h5 class="fw-normal mb-3 pb-3" style="letter-spacing: 1px;">`+text.login.description+`</h5>
  
                    <div data-mdb-input-init class="form-outline mb-4">
                      <input type="text" id="username" name="username" autocomplete="off" class="form-control form-control-lg" placeholder="`+text.login.username+`" maxlength="20">
					  <div id="usernameCheck" style="color:#dd0000"></div>
                    </div>
  
                    <div data-mdb-input-init class="form-outline mb-4">
                      <input type="password" id="password" name="password" autocomplete="off" class="form-control form-control-lg" placeholder="`+text.login.password+`" maxlength="20">
					  <div id="passwordCheck" style="color:#dd0000"></div>
                    </div>

                    <div class="pt-1 mb-4">
                      <button data-mdb-button-init data-mdb-ripple-init class="btn btn-sumbit btn-lg btn-block" id="loginBtn" type="submit">`+text.login.login+`</button>
                    </div>
  
                    <div class="pt-1 mb-4">
					  <button data-mdb-button-init data-mdb-ripple-init class="btn btn-sumbit btn-lg btn-block" id="login42Btn" type="button">`+text.login.login42+`</button>
                    </div>
					<div id="response" style="color:#dd0000"></div>

                    <p class="mb-5 pb-lg-2" style="color: #fff;">`+text.login.noAccount+`
					<a href="/users/register" class="nav-link" style="color:rgb(92, 160, 255); width:fit-content" data-link>`+text.login.registerHere+`</a>
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

		const loginBtn = document.getElementById("loginBtn");
		const login42Btn = document.getElementById("login42Btn");

		let searchParams = new URLSearchParams(location.search);
		if (searchParams.has("error")) {
			const msg = params.get("error") + ": " + params.get("error_description");
			console.log(msg);
		}
		if (searchParams.has("code")) {
			loginBtn.disabled = true;
			login42Btn.disabled = true;

			const code = searchParams.get("code");
			const endpoint = "https://" + location.host + "/api/users/login42/";
			fetch(endpoint, {
				method: 'POST',
				headers: {
					'Accept':'application/json',
					'Content-Type':'application/json'
				},
				body: JSON.stringify({
					"code": code,
					"redirect_uri": location.origin + location.pathname
				})
			})
			.then(response => response.json().then(json => ({
					data: json, status: response.status})))
			.then(res => {
				if (res.status >= 400) {
					console.log(res.data.message);
					document.getElementById('response').innerText = res.data.message;
				}
				else if (res.status === 202) {
					console.log(res.data.message);
					const url = "https://" + location.host + "/users/register?42auth"
						+ "&username=" + res.data.username
						+ "&avatar=" + res.data.avatar;
					navigateTo(url);
				}
				else {
					localStorage.setItem("username", res.data.username);
					if (res.data.avatar) {
						localStorage.setItem("avatar", "https://" + location.host + res.data.avatar);
					}
					else {
						localStorage.setItem("avatar", "/static/img/default.png");
					}
					localStorage.setItem("language", res.data.language);
					console.log(res.data.message);
					refreshPage();
					if (nextUrl === "") {
						nextUrl = "/users/profile"
					}
					navigateTo(nextUrl);
				}
				loginBtn.disabled = false;
				login42Btn.disabled = false;
			})
			.catch(error => {
				console.error(error);
				loginBtn.disabled = false;
				login42Btn.disabled = false;
			})

		}


		login42Btn.addEventListener('click', async (e) => {
			loginBtn.disabled = true;
			login42Btn.disabled = true;

			const endpoint = "https://" + location.host + "/api/users/client_id/";
			const client_id = await fetch(endpoint, {
				method: 'GET',
			})
			.then(response => response.json().then(json => ({
					data: json, status: response.status})))
			.then(res => {
				return (res.data.client_id);
			})
			.catch(error => {
				console.error(error);
			})
			if (!client_id) {
				loginBtn.disabled = false;
				login42Btn.disabled = false;
				return;
			}

			const url = "https://api.intra.42.fr/oauth/authorize" + "?client_id=" + client_id + "&redirect_uri=" + encodeURIComponent(location) + "&response_type=code"
			window.location.href = url;
		},
		{
			signal: this.#abortController.signal,
		});


		document.getElementById('loginForm').addEventListener('submit', function(event) {
			event.preventDefault();
			document.getElementById('response').innerText = "";

			loginBtn.disabled = true;
			login42Btn.disabled = true;

			const formData = new FormData(this)
			const username = formData.get("username");
			const password = formData.get("password");
			let inputCheck = false;

			if (username === "") {
				inputCheck = true;
				document.getElementById('usernameCheck').innerText = text.login.usernameCheck;
			}
			else {
				document.getElementById('usernameCheck').innerText = "";
			}

			if (password === "") {
				inputCheck = true;
				document.getElementById('passwordCheck').innerText = text.login.passwordCheck;
			}
			else {
				document.getElementById('passwordCheck').innerText = "";
			}

			if (inputCheck) {
				loginBtn.disabled = false;
				login42Btn.disabled = false;
				return;
			}

			var url = "https://" + location.host + "/api/users/login/"
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
						localStorage.setItem("avatar", "https://" + location.host + res.data.avatar);
						console.log(res.data.avatar);
					}
					else {
						localStorage.setItem("avatar", "/static/img/default.png");
					}
					localStorage.setItem("language", res.data.language);
					console.log(res.data.message);
					refreshPage();
					if (nextUrl === "") {
						nextUrl = "/users/profile"
					}
					navigateTo(nextUrl);
				}
			})
			.catch(error => {
				console.error(error);
			})
			loginBtn.disabled = false;
			login42Btn.disabled = false;
		},
		{
			signal: this.#abortController.signal,
		});
	}

	async cleanUp() {
		this.#abortController.abort();
	}
}
