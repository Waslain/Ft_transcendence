import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
	constructor() {
		super();
		this.setTitle("Transcendence");
	}

	async getHtml() {
		return `
			<h1>Hi, I am a sample page !</h1>
			<a href="/page1" class="nav__link" data-link>page 1</a>
			<a href="/page2" class="nav__link" data-link>page 2</a>
		`;
	}
}
