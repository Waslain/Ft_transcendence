import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Transcendence");
  }

  async getHtml() {
    return `
			<h1>Hi, I am a sample page !</h1>
			<a href="users/login" class="nav__link" data-link>login</a><br>
			<a href="/pong" class="nav__link" data-link>pong</a><br>
      <a href="/tournament" class="nav__link" data-link>tournament</a><br>
			<a href="/test" class="nav__link" data-link>test page for redirections<a><br>
		`;
  }
}
