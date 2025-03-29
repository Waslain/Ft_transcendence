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
    .welcome-text {
      font-size: 30px;
    }
    `;
  }

  async getHtml() {
    return `
    <div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col col-xl-10 mt-5">
          <div class="card container-wrapper border-light">
            <div class="card-body p-4 p-lg-5 d-flex justify-content-center align-items-center">
              <div class="welcome-text"></div>
            </div>
          <div class="card-footer border-light text-center">
                <div id="enterLink"></div>
          </div>
          </div>
        </div>
      </div>
    </div>
		`;
  }

  async getJavaScript() {
    function scrambleText(){
      const phrases = ['Hello!', 'Welcome to', 'Transendence', 'Have fun C:'];
      const specialChars = '!@#$%^&*()+_[]{}~<>?|/__\\';
      const el = document.querySelector('.welcome-text');
  
      let currentIndex = 0;

      el.textContent = phrases[currentIndex];
      el.style.color = 'white';
      setInterval(() => {
        currentIndex = (currentIndex + 1) % phrases.length;
        const nextPhrase = phrases[currentIndex];

        textAnimation(el, nextPhrase);
      },3000);

      function textAnimation(el, nextText) {
        let iter = 0;
        const maxiter = 5;
      
        // Timer for the scramble animation
        const interval = setInterval(() => {
          if (iter < maxiter) {
            let scrambledText = '';
            for (let i = 0; i < nextText.length; i++) {
              const randomIndex = Math.floor(Math.random() * specialChars.length);
              scrambledText += specialChars[randomIndex];
            }
            
            el.textContent = scrambledText;
            el.style.color = '#c0c2c9';
            iter++;
          } else {
            clearInterval(interval);
            el.textContent = nextText;
            el.style.color = 'white';
          }
        }, 125);
      }
    }
    scrambleText();

    var url = "https://localhost/api/users/check-auth/"
    await fetch(url, {
      method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
      if (data.IsAuthenticated) {
        document.querySelector('#enterLink').innerHTML = `
          <a href="/pong" class="nav__link text-white" style="font-size: 20px;" data-link>Let's Start!</a>
        `
      }
      else {
        document.querySelector('#enterLink').innerHTML = `
          <a href="/users/login" class="nav__link text-white" style="font-size: 20px;" data-link>Login</a>
        `
      }
    })
    .catch(error => {
      console.error(error);
    })
  }
}
