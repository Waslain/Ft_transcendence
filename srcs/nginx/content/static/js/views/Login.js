import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
	constructor() {
		super();
		this.setTitle("Transcendence");
	}

	async getHtml() {
	return `
		<a href="/" class="nav__link" data-link>return to main page</a><br>
			<form id="loginForm">
				<label for="username">Username:</label><br>
				<input type="text" id="username" name="username"><br>
				<label for="password">Password:</label><br>
				<input type="text" id="password" name="password"><br>
				<input type="submit" value="Login">
			</form>
			<div id="response"></div>
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
				document.getElementById('response').innerText = JSON.stringify(data);
			})
			.catch(error => {
				console.error('Error:', error);
				document.getElementById('response').innerText = 'An error occurred.';
			});
		});
	}
}
