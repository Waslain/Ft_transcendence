import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
	constructor() {
		super();
		this.setTitle("Transcendence");
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
  
                  <form id="registerForm">
  
                    <div class="d-flex align-items-center mb-3 pb-1">
                      <span class="h1 fw-bold mb-0">Register</span>
                    </div>
  
                    <h5 class="fw-normal mb-3 pb-3" style="letter-spacing: 1px;">Create a new account</h5>
  
                    <div data-mdb-input-init class="form-outline mb-4">
                      <input type="text" id="username" name="username" class="form-control form-control-lg" placeholder="Username" maxlength="20">
					  <div id="usernameCheck" style="color:#dd0000"></div>
                    </div>
  
                    <div data-mdb-input-init class="form-outline mb-4">
                      <input type="password" id="password" name="password" class="form-control form-control-lg" placeholder="Password" maxlength="20">
					  <div id="passwordCheck" style="color:#dd0000"></div>
                    </div>

                    <div data-mdb-input-init class="form-outline mb-4">
                      <input type="password" id="confirmPassword" name="confirmPassword" class="form-control form-control-lg" placeholder="Confirm password" maxlength="20">
					  <div id="confirmPasswordCheck" style="color:#dd0000"></div>
                    </div>
  
                    <div class="pt-1 mb-4">
                      <button data-mdb-button-init data-mdb-ripple-init class="btn btn-dark btn-lg btn-block" type="submit">Register</button>
                    </div>
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

		document.getElementById('registerForm').addEventListener('submit', function(event) {
			event.preventDefault();

			const formData = new FormData(this)
			const username = formData.get("username");
			const password = formData.get("password");
			const confirmPassword = formData.get("confirmPassword");
			formData.delete("confirmPassword");
			let inputCheck = false;

			if (username === "") {
				inputCheck = true;
				document.getElementById('usernameCheck').innerText = "Please enter a username";
			}
			else if (!username.match(/^[A-Za-z0-9-_@+.]*$/)) {
				inputCheck = true;
				document.getElementById('usernameCheck').innerText = "Username can only contain alphanumeric characters and special characters - _ @ + .";
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

			if (password !== confirmPassword) {
				inputCheck = true;
				document.getElementById('confirmPasswordCheck').innerText = "Those passwords didn't match";
			}
			else {
				document.getElementById('confirmPasswordCheck').innerText = "";
			}

			if (inputCheck === true) {
				return;
			}

			var url = "https://localhost/api/users/register/"
			fetch(url, {
				method: 'POST',
				body: formData,
			})
			.then(response => {
				if (response.status >= 400) {
						document.getElementById('usernameCheck').innerText = "A user with that username already exists";
				}
				return response.json();
			})
			.then(data => {
				console.log(data.Message);
			})
			.catch(error => {
				console.error('Error');
			});
		},
		{
			signal: this.#abortController.signal,
		});
	}

	async cleanUp() {
		this.#abortController.abort();
	}
}
