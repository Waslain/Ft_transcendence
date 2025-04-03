import AbstractView from "./AbstractView.js";
import { refreshPage } from "../index.js";
import { text } from "../index.js";

export default class extends AbstractView {
	constructor() {
		super();
		this.setTitle("Transcendence");
		this.redirection = {
			needed: true,
			auth: false,
			url: "/users/login",
			urlAfterLogin: "/settings"
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
        <div class="col col-xl-10">
          <div class="card container-wrapper border-light mt-5">
            <div class="row g-0">
              <div class="col-md-6 col-lg-7 d-flex align-items-center">
                <div class="card-body p-4 p-lg-5 text-white">
  
                  <form id="updateForm">
  
                    <div class="d-flex align-items-center mb-3 pb-1">
                      <span class="h1 fw-bold mb-0">`+text.settings.settings+`</span>
                    </div>
  
  
                    <div data-mdb-input-init class="form-outline mb-4">
				      <label for="avatar">`+text.settings.updateAvatar+`</label>
                      <input type="file" id="avatar" name="avatar" class="form-control form-control-lg" accept="image/*">
        			  <div class="row-fluid d-flex align-items-center" style="padding-top:15px; margin-left:20px display: none" id="preview">
					    <img id="avatarPreview" src="#" width="100" height="100" class="rounded-circle" style="display:none; object-fit: cover">
                      <button data-mdb-button-init data-mdb-ripple-init class="btn btn-dark btn-lg btn-block" type="button" id="removeBtn" style="display:none;margin-left:30px">`+text.register.remove+`</button>
				      </div>
                    </div>
  
                    <div data-mdb-input-init class="form-outline mb-4">
				      <label for="language">`+text.settings.updateLanguage+`</label>
				      <select id="language" name="language" class="form-control form-control-lg">
				        <option value="en">`+text.settings.english+`</option>
				        <option value="fr">`+text.settings.french+`</option>
						<option value="es">`+text.settings.spanish+`</option>
						<option value="zh-cn">`+text.settings.simplifiedChinese+`</option>
						<option value="zh-tw">`+text.settings.traditionChinese+`</option>
				      </select>
                    </div>
	
                    <div data-mdb-input-init class="form-outline mb-4">
				      <label for="password">`+text.settings.updatePassword+`</label>
                      <input type="password" id="password" name="password" autocomplete="off" class="form-control form-control-lg" placeholder="`+text.login.password+`" maxlength="20">
					  <div id="passwordCheck" style="color:#dd0000"></div>
                    </div>

                    <div data-mdb-input-init class="form-outline mb-4">
                      <input type="password" id="confirmPassword" name="confirmPassword" autocomplete="off" class="form-control form-control-lg" placeholder="`+text.register.confirmPassword+`" maxlength="20">
					  <div id="confirmPasswordCheck" style="color:#dd0000"></div>
                    </div>
  
                    <div class="pt-1 mb-4">
                      <button data-mdb-button-init data-mdb-ripple-init class="btn btn-sumbit btn-lg btn-block" type="submit" id="updateBtn">`+text.settings.update+`</button>
                    </div>
                  </form>

				  <div id="result"></div>
  
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
		const updateBtn = document.getElementById('updateBtn');
		const avatar = document.getElementById('avatar');
		const language = document.getElementById('language');
		const updateForm = document.getElementById('updateForm');
		const preview = document.getElementById('preview');
		const avatarPreview = document.getElementById('avatarPreview');
		const removeBtn = document.getElementById('removeBtn');
		const result = document.getElementById('result');
		const password = document.getElementById('password');
		const confirmPassword = document.getElementById('confirmPassword');
		const confirmPasswordCheck = document.getElementById('confirmPasswordCheck');

		language.value = localStorage.getItem("language");

		const currentAvatar = localStorage.getItem('avatar');

		const showPreview = () => {
			avatarPreview.style.display = 'block';
			removeBtn.style.display = 'block';
			preview.style.display = 'block';
		}

		const hidePreview = () => {
			avatarPreview.style.display = 'none';
			removeBtn.style.display = 'none';
			preview.style.display = 'none';
		}

		let update = false
		let image_set = false

		if (currentAvatar !== "/static/img/default.png") {
			avatarPreview.src = currentAvatar;
			showPreview();
		}

		// display the chosen image
		avatar.addEventListener('change', function(event) {
			const [file] = avatar.files
			if (file) {
				showPreview();
				avatarPreview.src = URL.createObjectURL(file);
				image_set = true
				update = true;
			}
		},
		{
			signal: this.#abortController.signal,
		});

		language.addEventListener('change', function(event) {
			update = true;
		},
		{
			signal: this.#abortController.signal,
		});

		// remove the chosen image
		removeBtn.addEventListener('click', function(event) {
			hidePreview();
			updateForm.reset();
			image_set = true
			update = true;
		},
		{
			signal: this.#abortController.signal,
		});
		
		password.addEventListener('change', function(event) {
			update = true;
		},
		{
			signal: this.#abortController.signal,
		});

		// submit the file
		updateForm.addEventListener('submit', function(event) {
			event.preventDefault();

			result.innerText = "";
			if (!update) {
				return ;
			}

			const formData = new FormData(this)
			formData.append('image_set', image_set);

			confirmPasswordCheck.innerText = "";
			if (formData.get("password") === "") {
				formData.delete('password');
			}
			else if (formData.get("password") !== formData.get("confirmPassword")) {
				confirmPasswordCheck.innerText = text.register.confirmPasswordCheck;
				return ;
			}
			formData.delete('confirmPassword');

			updateBtn.disabled = true;
			var endpoint = "https://" + location.host + "/api/users/updateUser/"
			fetch(endpoint, {
				method: 'PUT',
				body: formData,
			})
			.then(response => response.json().then(json => ({
				data: json, status: response.status})))
			.then(res => {
				if (res.status == 200) {
					console.log(res.data.message);
					result.innerText = text.settings.response;
					if (res.data.avatar) {
						localStorage.setItem("avatar", "https://" + location.host + res.data.avatar);
					}
					else {
						localStorage.setItem("avatar", "/static/img/default.png");
					}
					localStorage.setItem("language", res.data.language);
					hidePreview();
					updateForm.reset();
					language.value = localStorage.getItem("language");
					refreshPage();
				}
				else {
					result.style.color = '#dd0000';
					result.innerText = text.settings.error;
				}
				updateBtn.disabled = false;
			})
			.catch(error => {
				console.error(error);
				updateBtn.disabled = false;
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
