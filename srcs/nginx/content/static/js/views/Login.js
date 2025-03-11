import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
	constructor() {
		super();
		this.setTitle("Transcendence");
	}

	async getHtml() {
	return `
		<a href="/" class="nav__link" data-link>return to main page</a><br>
		<h4>Register a new user:</h4>
		<form id="registerForm">
			<label>
				Username:<br>
				<input type="text" name="username">
			</label><br>
			<label>
				Password:<br>
				<input type="password" name="password">
			</label><br>
			<label>
				Confirm password:<br>
				<input type="password" name="confirmPassword">
			</label><br>
			<input type="submit" value="Register">
		</form>
		<div id="responseRegister"></div><br>

		<h4>Login user:</h4>
		<form id="loginForm">
			<label>
				Username:<br>
				<input type="text" name="username">
			</label><br>
			<label>
				Password:<br>
				<input type="password" name="password">
			</label><br>
			<input type="submit" value="Login">
		</form>
		<div id="responseLogin"></div>
		`;
	}

	async getJavaScript() {
		document.getElementById('registerForm').addEventListener('submit', function(event) {
			event.preventDefault();

			const formData = new FormData(this)
			const username = formData.get("username")
			const password = formData.get("password")
			const confirmPassword = formData.get("confirmPassword")
			formData.delete("confirmPassword");

			if (username.length === 0|| password.length === 0) {
				document.getElementById('responseRegister')
					.innerText = 'All fields must be provided';
				return;
			}

			if (password !== confirmPassword) {
				document.getElementById('responseRegister')
					.innerText = 'Password must be equal';
				return;
			}

			var url = "http://localhost:8000/register/"
			fetch(url, {
				method: 'POST',
				body: formData,
			})
			.then(response => {
				return response.json();
			})
			.then(data => {
				document.getElementById('responseRegister')
				.innerText = data.message;
			})
			.catch(error => {
				console.error('Error:', error);
				document.getElementById('responseRegister')
				.innerText = 'An error occurred.';
			});
			document.getElementById('registerForm').reset()
		});

		document.getElementById('loginForm').addEventListener('submit', function(event) {
			event.preventDefault();

			const formData = new FormData(this)
			const username = formData.get("username")
			const password = formData.get("password")

			if (username.length === 0|| password.length === 0) {
				document.getElementById('responseLogin')
					.innerText = 'All fields must be provided';
				return;
			}

			var url = "http://localhost:8000/login/"
			fetch(url, {
				method: 'POST',
				body: formData,
			})
			.then(response => {
				return response.json();
			})
			.then(data => {
				document.getElementById('responseLogin')
				.innerText = data.message;
			})
			.catch(error => {
				console.error('Error:', error);
				document.getElementById('responseLogin')
				.innerText = 'An error occurred.';
			});
			document.getElementById('loginForm').reset()
		});
	}
}
