import AbstractView from "./AbstractView.js";
import { text } from "../index.js";

export default class extends AbstractView {
	constructor() {
		super();
		this.setTitle("Transcendence");
		this.redirection = {
      needed: true,
      auth: false,
      url: "/users/login",
      urlAfterLogin: "/pong/localGame",
    };
	}

	async getStyle() {
		return ``;
	}

	async getHtml() {
		return `
		<div>
			<h1>Local Game Page</h1>
		</div>
		`;
	}

	async getJavaScript() {
		return ``;
	}
}
