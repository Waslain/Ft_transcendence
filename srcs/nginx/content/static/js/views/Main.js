import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Transcendence");
  }

  async getStyle() {
    return `
    .container-wrapper {
			background-color:rgba(197, 197, 197, 0.1);
      backdrop-filter: blur(5px);
			border-radius: 1rem;
		}
    `;
  }

  async getHtml() {
    return `
    <div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col col-xl-10 mt-5">
          <div class="card container-wrapper border-light ">
            <div class="row g-0">
              <div class="col-md-6 col-lg-7 d-flex align-items-center">
                <div class="card-body p-4 p-lg-5 text-black">
  
                  <h1 class="text-white">I'm a sample page</h1>
			            <a href="/pong" class="nav__link" data-link>pong</a><br>

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
