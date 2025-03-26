import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
	constructor(params) {
		super();
		this.setTitle("Transcendence");
		this.params = params;
		this.redirection = {
			needed: true,
			auth: false,
			url: '/users/login',
			urlAfterLogin: '/users/profile'
		}
	}

    async getStyle() {
        return `
        .profile-btn {
            justify-content: space-evely;
            padding: 5px;
            margin: 10px;
            border-radius: 50px;
            background-color: #306598;
            color: #fff;
        }
        .profile-btn:hover {
            background-color: #9cafc9;
        }
        .chart-container {
            display: flex;
            justify-content: space-around;
            align-items: center;
            flex-wrap: wrap;
        }
        .chart-wrapper {
            flex: 1 1 45%;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 300px; /* Fixed height for charts */
            position: relative;
            padding: 10px;
        }
        canvas {
            width: 100% !important;
            height: 100% !important;
        }
        #winsCountChart {
            max-width: 200px;
            width: 100%;
            height: auto;
          }
        `;}

	async getHtml() {
	return `
	<div id="mainView"><div>
	`
	}

	error(msg) {
  		document.querySelector("#mainView").innerHTML = `
		<div class="container py-5 h-100">
			<div class="row-fluid d-flex justify-content-center align-items-center">
					<h2 class="d-sm-inline mx-3 mb-0 text-white" id=errorDisplay></h2>
			</div>
		}
		`
		document.getElementById('errorDisplay').innerText = msg;
	}

	async getProfileHtml() {
	return `
    <div class="container py-5 h-100">
        <div class="row-fluid d-flex justify-content-center align-items-center">
                <img src="#" id="avatarDisplay" alt="user's image" width="50" height="50" class="rounded-circle">
                <h2 class="d-sm-inline mx-3 mb-0 text-white" id=usernameDisplay></h2>
        </div>
        <br>
        <div id="profileBtns"></div>
        <hr/>
        <section>
            <div class="row justify-content-center chart-container">
                <div class="col-12 col-sm-10 col-md-7 col-lg-6 col-xl-5 col-xxl-4">
                    <div class="card widget-card border-light shadow-sm chart-wrapper">
                        <div class="card-body p-4">
                            <h5 class="card-title widget-card-title mb-1 text-center">Win Stats</h5>
                            <canvas id="winsCountChart" style="width: 100%; height: auto;"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-sm-10 col-md-7 col-lg-6 col-xl-5 col-xxl-4">
                    <div class="card widget-card border-light shadow-sm chart-wrapper">
                        <div class="card-body p-4">
                            <h5 class="card-title widget-card-title mb-1 text-center">Goals Chart</h5>
                            <canvas id="goalsChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <hr/>
        <section>
            <div class="row">
                <div class="col-12 col-md-3 col-sm-3">
                    <p class="fs-1 fs-sm-2 fs-md-3 fs-lg-5 text-center text-white" id="statWins">Wins</p>
                </div>
                <div class="col-12 col-md-3 col-sm-3">
                    <p class="fs-1 fs-sm-2 fs-md-3 fs-lg-5 text-center text-white" id="statLosses"></p>
                </div>
                <div class="col-12 col-md-3 col-sm-3">
                    <p class="fs-1 fs-sm-2 fs-md-3 fs-lg-5 text-center text-white" id="statWinRate"></p>
                </div>
                <div class="col-12 col-md-3 col-sm-3">
                    <p class="fs-1 fs-sm-2 fs-md-3 fs-lg-5 text-center text-white" id="statGameTime"></p>
                </div>
            </div>
        </section>
    </div>
    `;
    }

    async getJavaScript() {

		const username = this.params.username; 

		let endpoint = "https://localhost/api/users/get/" + username;
		const dataUser = await fetch(endpoint, {
			method: 'GET',
		})
		.then(response => response.json().then(json => ({
			data: json, status: response.status})))
		.then(res => {
			if (res.status > 400) {
					this.error("Error " + res.status + ": " + res.data.message);
				console.log(res.data.message);
				return null;
			}
			else {
				return res.data
			}
		})
		.catch(error => {
			console.error(error);
			this.error("Error: " + error);
			return null;
		})

		if (dataUser === null) {
			return;
		}

		let avatar = "/static/img/default.png"
		if (dataUser.avatar) {
			avatar = "https://localhost" + dataUser.avatar;
		}

		endpoint = "https://localhost/api/stats/" + username;
		const data = await fetch(endpoint, {
			method: 'GET',
		})
		.then(response => response.json().then(json => ({
			data: json, status: response.status})))
		.then(res => {
			if (res.status > 400) {
				this.error("Error " + res.status + ": " + res.data.message);
				console.log(res.data.message);
				return null;
			}
			else {
				return res.data
			}
		})
		.catch(error => {
			console.error(error);
			this.error("Error: " + error);
			return null;
		})

		if (data === null) {
			return;
		}

  		document.querySelector("#mainView").innerHTML = await this.getProfileHtml();
		document.getElementById('usernameDisplay').innerText = username;
		document.getElementById('avatarDisplay').src = avatar;

		const number_of_wins = data.wins;
		const number_of_losses = data.losses;
		const number_of_games = number_of_wins + number_of_losses
		const game_time = data.play_time;
		const goals_scored = data.goals_scored;
		const goals_taken = data.goals_taken;

		let rate_of_wins = 100;
		if (number_of_games) {
			rate_of_wins = ((number_of_wins / number_of_games) * 100).toFixed(2);
		}

        
        document.getElementById('statWins').innerHTML = `Wins<br/><span style="color: #4169e1;">${number_of_wins}</span>`;
        document.getElementById('statLosses').innerHTML = `Losses<br/><span style="color: #98afc7;">${number_of_losses}</span>`;
        document.getElementById('statWinRate').innerHTML = `Win Rate<br/><span style="color: orange;">${rate_of_wins}%</span>`;
        document.getElementById('statGameTime').innerHTML = `Game Time<br/><span style="color: pink;">${game_time} min</span>`;
		
        /*Doughnut chart */
        const dctx = document.getElementById('winsCountChart').getContext('2d');

        const winsLossesChart = new Chart(dctx, {
            type: 'doughnut',  // Doughnut chart type
            data: {
                labels: ['Wins', 'Losses'],  // Labels for the segments
                datasets: [{
                    label: 'Wins vs Losses',
                    data: [number_of_wins, number_of_losses],  // Data for wins and losses
                    backgroundColor: ['#4169e1', '#98afc7'],  // Colors for the segments
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.label + ': ' + tooltipItem.raw; // Display value as number
                            }
                        }
                    }
                },
                cutout: '70%',
            }
        });

        /*Bar chart */
        var barctx = document.getElementById('goalsChart').getContext('2d');
        var goalsChart = new Chart(barctx, {
            type: 'bar',
            data: {
                labels: ['Goals Scored', 'Goals Taken'],
                datasets: [{
                    label: 'Goals',
                    data: [goals_scored, goals_taken], // Need to replace with data from API
                    backgroundColor: ['#4CAF50', '#FF5733'],
                    borderColor: ['#4CAF50', '#FF5733'], // Border colors
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true, // Make the chart responsive
                scales: {
                    y: {
                        beginAtZero: true, // Start y-axis from 0
                        title: {
                            display: true,
                            text: 'Total Number of Goals'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        /*profileBtns*/
        const currentUser = localStorage.getItem('username');
        const profileName = username;

        if (currentUser == profileName) {
            document.querySelector("#profileBtns").innerHTML = `
            <div class="row text-center">
                 <div class="col text-nowrap">
                    <button type="button" class="btn profile-btn"><i class="bi bi-box-arrow-up" style="padding-right: 5px;"></i>Update Photo</button>
                </div>
            </div>
            `
        } else {
            document.querySelector("#profileBtns").innerHTML = `
            <div class="row text-center">
                 <div class="col-12 col-md-3 col-sm-3 text-nowrap">
                    <button type="button" class="btn profile-btn"><i class="bi bi-plus-circle" style="padding-right: 5px;"></i>Add Friend</button>
                </div>
                <div class="col-12 col-md-3 col-sm-3 text-nowrap">
                    <button type="button" class="btn profile-btn"><i class="bi bi-joystick" style="padding-right: 5px;"></i>Match Invite</button>
                </div>
                <div class="col-12 col-md-3 col-sm-3 text-nowrap">
                    <button type="button" class="btn profile-btn" ><i class="bi bi-send" style="padding-right: 5px;"></i>Message</button>
                </div>
                <div class="col-12 col-md-3 col-sm-3 text-nowrap">
                    <button type="button" class="btn profile-btn"><i class="bi bi-ban" style="padding-right: 5px;"></i>Block</button>
                </div>
            </div>
            `
        }
	}
}
