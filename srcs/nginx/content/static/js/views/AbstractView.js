export default class {
  constructor() {
	  this.redirection = {
		  needed: false,
		  auth: false,
		  url: '',
		  urlAfterLogin: ""
	  }
  }

  redirect() {
	  return this.redirection;
  }

  setTitle(title) {
    document.title = title;
  }

  async getStyle() {
    return "";
  }

  async getHtml() {
    return "";
  }

  async getJavaScript() {
    return "";
  }
}
