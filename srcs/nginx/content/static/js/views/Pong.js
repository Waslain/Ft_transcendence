import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Transcendence");
  }

  async getHtml() {
    return `
			<a href="/" class="nav__link" data-link>Go back to main page</a>
			<h1>Pong</h1>
		`;
  }

  async getJavaScript() {}
}
