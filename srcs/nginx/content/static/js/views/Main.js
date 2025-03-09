import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Transcendence");
  }

  async getHtml() {
    return `
			<h1>Hi, I am a sample page !</h1>
			<a href="/login" class="nav__link" data-link>login</a><br>
			<a href="/pong" class="nav__link" data-link>pong</a><br>
		`;
  }
}
