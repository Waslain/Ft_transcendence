import AbstractView from "./AbstractView.js";
import { updateAvatar } from "../index.js";

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
                      <span class="h1 fw-bold mb-0">Settings</span>
                    </div>
  
                    <h5 class="fw-normal mb-3 pb-3" style="letter-spacing: 1px;">Update avatar:</h5>
  
                    <div data-mdb-input-init class="form-outline mb-4">
                      <input type="file" id="avatar" name="avatar" class="form-control form-control-lg" accept="image/*">
        			  <div class="row-fluid d-flex align-items-center" style="padding-top:15px; margin-left:20px display: none" id="preview">
					    <img id="avatarPreview" src="#" width="100" height="100" class="rounded-circle" style="display:none">
                      <button data-mdb-button-init data-mdb-ripple-init class="btn btn-dark btn-lg btn-block" type="button" id="removeBtn" style="display:none;margin-left:30px">remove</button>
				      </div>
                    </div>
  
                    <div class="pt-1 mb-4">
                      <button data-mdb-button-init data-mdb-ripple-init class="btn btn-sumbit btn-lg btn-block" type="submit" id="updateBtn">Update</button>
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
		const updateForm = document.getElementById('updateForm');
		const preview = document.getElementById('preview');
		const avatarPreview = document.getElementById('avatarPreview');
		const removeBtn = document.getElementById('removeBtn');
		const result = document.getElementById('result');

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

		// display the chosen image
		avatar.addEventListener('change', function(event) {
			const [file] = avatar.files
			if (file) {
				showPreview();
				avatarPreview.src = URL.createObjectURL(file);
			}
		},
		{
			signal: this.#abortController.signal,
		});

		// remove the chosen image
		removeBtn.addEventListener('click', function(event) {
			hidePreview();
			updateForm.reset();
		},
		{
			signal: this.#abortController.signal,
		});
		

		// submit the file
		updateForm.addEventListener('submit', function(event) {
			event.preventDefault();

			result.innerText = "";
			const formData = new FormData(this)
			if (!formData.get('avatar').name) {
				formData.set('avatar', '')
			}

			updateBtn.disabled = true;
			var endpoint = "https://localhost/api/users/updateUser/"
			fetch(endpoint, {
				method: 'PUT',
				body: formData,
			})
			.then(response => response.json().then(json => ({
				data: json, status: response.status})))
			.then(res => {
				if (res.status == 200) {
					console.log(res.data.message);
					if (res.data.avatar) {
						localStorage.setItem("avatar", "https://localhost" + res.data.avatar);
					}
					else {
						localStorage.setItem("avatar", "/static/img/default.png");
					}
					hidePreview();
					updateForm.reset();
					updateAvatar();
				}
				else {
					result.style.color = '#dd0000';
					result.innerText = "An error occurred"
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
