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
  
                  <form id="loginForm">
  
                    <div class="d-flex align-items-center mb-3 pb-1">
                      <i class="bi bi-people" style="color: #ffffff;"></i>
                      <span class="h1 fw-bold mb-0">Login</span>
                    </div>
  
                    <h5 class="fw-normal mb-3 pb-3" style="letter-spacing: 1px;">Sign into your account</h5>
  
                    <div data-mdb-input-init class="form-outline mb-4">
                      <input type="text" id="username" name="username" class="form-control form-control-lg" />
                      <label class="username">Username</label>
                    </div>
  
                    <div data-mdb-input-init class="form-outline mb-4">
                      <input type="password" id="password" name="password" class="form-control form-control-lg" />
                      <label class="password">Password</label>
                    </div>
  
                    <div class="pt-1 mb-4">
                      <button data-mdb-button-init data-mdb-ripple-init class="btn btn-dark btn-lg btn-block" type="submit">Login</button>
                    </div>
                    <p class="mb-5 pb-lg-2" style="color: #393f81;">Don't have an account? <a href="#!"
                        style="color: #393f81;">Register here</a></p>
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

	async getJavaScript() {
		document.getElementById('loginForm').addEventListener('submit', function(event) {
			event.preventDefault();

			const formData = new FormData(this)

			var url = "http://localhost:8000/login/"
			fetch(url, {
				method: 'POST',
				body: formData,
			})
			.then(response => {
				return response.json();
			})
			.then(data => {
				console.log(data.Message);
			})
			.catch(error => {
				console.error('Error');
			});
		});
	}
}
