import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
	constructor() {
		super();
		this.setTitle("Transcendence");
		this.redirection = {
			needed: true,
			auth: true,
			url: '/'
		}
	}

	async getHtml() {
	return `
	<p>This page will redirect on the main page if the user is authenticated</p>
		`}
}
