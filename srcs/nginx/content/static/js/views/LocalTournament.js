import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Transcendence");
    this.redirection = {
      needed: true,
      auth: false,
      url: "/users/login",
      urlAfterLogin: "/pong/localTournament",
    };
  }

  async getStyle() {
    return ``;
  }

  async getHtml() {
    return `
		<div>
			<h1>Local Tournament Page</h1>
		</div>
		`;
  }

  async getJavaScript() {
    return ``;
  }
}
