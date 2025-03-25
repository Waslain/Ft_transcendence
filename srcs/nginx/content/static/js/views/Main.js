import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Transcendence");
  }

  async getHtml() {
    return `
    <div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col col-xl-10">
          <div class="card" style="border-radius: 1rem;">
            <div class="row g-0">
              <div class="col-md-6 col-lg-7 d-flex align-items-center">
                <div class="card-body p-4 p-lg-5 text-black">
  
                  <h1>Hi, I am a sample page !</h1>
			            <a href="/pong" class="nav__link" data-link>pong</a><br>
                  <a href="/tournament" class="nav__link" data-link>tournament</a><br>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
		`;
  }
}
