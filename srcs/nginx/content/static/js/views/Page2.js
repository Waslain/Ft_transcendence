import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
	constructor() {
		super();
		this.setTitle("Page 2");
	}

	async getHtml() {
		return `
			<a href="/" class="nav__link" data-link>Go back to main page</a>
			<h1>Hello, I'm page 2</h1>
		`;
	}
}
