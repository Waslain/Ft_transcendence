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
			urlAfterLogin: '/users/profile/'
		}
	}

	async getHtml() {
	return `
	<p>USER PROFILE<p>
	<div id="test"></div>
		`
	}

	async getJavaScript() {
		document.getElementById("test").innerText = "username: " + this.params.username;
	}
}
