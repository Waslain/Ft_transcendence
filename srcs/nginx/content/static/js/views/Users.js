import AbstractView from "./AbstractView.js";
import { invitePlayer, privMsg, navigateTo } from "../index.js";
import { text } from "../index.js";

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
            background-color:rgba(197, 197, 197, 0.1);
            backdrop-filter: blur(5px);
		}
        .no-data-text {
            margin-top: 1rem;
            color: #888;
            justify-content: center;
			align-items: center;
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
		.table-wrapper {
			background-color:rgba(197, 197, 197, 0.1);
			backdrop-filter: blur(5px);
			border-radius: 8px;
		}
		.table-loading {
            text-align: center;
            padding: 20px;
        }
        .table-error {
            color: #fff;
            padding: 20px;
            text-align: center;
        }
        .table-container {
            overflow-x: auto;
			max-height: 600px;
			overflow-y: auto;
        }
		.table-fixed-header thead {
			position: sticky;
			top: 0;
			z-index: 1;
			background-color:rgb(35, 41, 41);
		}
		.table-transparent {
			background-color: transparent !important;
		}
		.table-transparent thead th,
		.table-transparent thead tr,
		.table-transparent tbody td,
		.table-transparent tbody tr {
			background-color: transparent !important;
			color: white;
		}
		@media (max-width: 576px) {
			.table {
				font-size: 11px;
			}
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
				<img src="#" id="avatarDisplay" alt="user's image" width="50" height="50" class="rounded-circle" style="border: solid #fff;">
				<h2 class="d-sm-inline mx-3 mb-0 text-white" id=usernameDisplay></h2>
		</div>
		<br>
		<div id="profileBtns"></div>
		<hr/>
		<section>
			<div class="row justify-content-center chart-container g-4">
				<div class="col-12 col-sm-10 col-md-7 col-lg-6 col-xl-5 col-xxl-4">
					<div class="card widget-card border-light shadow-sm chart-wrapper">
						<div class="card-body p-4">
							<h5 class="card-title widget-card-title mb-1 text-center text-white">`+text.profile.winStats+`</h5>
                            <div id="noDataText" class="no-data-text">No data available</div>
							<canvas id="winsCountChart" style="width: 100%; height: auto;"></canvas>
						</div>
					</div>
				</div>
				<div class="col-12 col-sm-10 col-md-7 col-lg-6 col-xl-5 col-xxl-4">
					<div class="card widget-card border-light shadow-sm chart-wrapper">
						<div class="card-body p-4">
							<h5 class="card-title widget-card-title mb-1 text-center text-white">`+text.profile.goalChart+`</h5>
                            <div id="noDataTextBar" class="no-data-text">No data available</div>
							<canvas id="goalsChart"></canvas>
						</div>
					</div>
				</div>
			</div>
		</section>
		<hr>
		<section>
			<div class="row">
				<div class="col-12 col-md-3 col-sm-3">
					<p class="fs-1 fs-sm-2 fs-md-3 fs-lg-5 text-center text-white" id="statWins">`+text.profile.wins+`</p>
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
		<hr>
		<section>
			<div class="row-fluid d-flex justify-content-center">
				<div class="col-10">
					<div class="card widget-card d-flex border-light table-wrapper">
						<div class="card-header border-light text-center text-white">Match History</div>
						<div class="card-body">
							<div id="table-loading" class="table-loading text-white">Loading data...</div>
							<div id="table-error" class="table-error text-white" style="display: none;"></div>
							<div id="table-container" class="table-container" style="display: none;">
								<table class="table border-light table-transparent table-fixed-header">
									<thead>
										<tr>
											<th>ID</th>
											<th>`+text.profile.playerA+`</th>
											<th>`+text.profile.playerB+`</th>
											<th>`+text.profile.scoreA+`</th>
											<th>`+text.profile.scoreB+`</th>
											<th>`+text.profile.duration+`</th>
											<th>`+text.profile.winner+`</th>
										</tr>
									</thead>
									<tbody id="table-body"></tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
	`;
	}

	#abortController;

	async getJavaScript() {
		this.#abortController = new AbortController();
		const username = this.params.username; 

		let endpoint = "https://localhost:8080/api/users/get/" + username;
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

		endpoint = "https://localhost:8080/api/stats/" + username;
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

		function formatGameTime(totalSeconds) {
			if (isNaN(totalSeconds)) return "0:00";
			totalSeconds = Number(totalSeconds);
			const minutes = Math.floor(totalSeconds / 60);
			const seconds = Math.floor(totalSeconds % 60);

			const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
			return `${minutes}m${formattedSeconds}s`;
		}
		
		document.getElementById('statWins').innerHTML = text.profile.wins+`<br/><span style="color: #4169e1;">${number_of_wins}</span>`;
		document.getElementById('statLosses').innerHTML = text.profile.losses+`<br/><span style="color: #98afc7;">${number_of_losses}</span>`;
		document.getElementById('statWinRate').innerHTML = text.profile.winRate+`<br/><span style="color: orange;">${rate_of_wins}%</span>`;
		document.getElementById('statGameTime').innerHTML = text.profile.gameTime+`<br/><span style="color: pink;">${formatGameTime(game_time)}</span>`;
		
        const noDataText = document.getElementById('noDataText');
        const noDataTextBar = document.getElementById('noDataTextBar');
		/*Doughnut chart */
		const dctx = document.getElementById('winsCountChart').getContext('2d');
        if (number_of_games === 0) {
            noDataText.style.display = 'flex';
            dctx.clearRect(0, 0, dctx.canvas.width, dctx.canvas.height);
        } else {
            noDataText.style.display = 'none';
            const winsLossesChart = new Chart(dctx, {
                type: 'doughnut',  // Doughnut chart type
                data: {
                    labels: [text.profile.wins, text.profile.losses],  // Labels for the segments
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
        }

		/*Bar chart */
		var barctx = document.getElementById('goalsChart').getContext('2d');
        if (number_of_games === 0) {
            noDataTextBar.style.display = 'flex';
            barctx.clearRect(0, 0, barctx.canvas.width, barctx.canvas.height);
        } else {
            noDataTextBar.style.display = 'none';
            var goalsChart = new Chart(barctx, {
                type: 'bar',
                data: {
                    labels: [text.profile.goalsScored, text.profile.goalsTaken],
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
                                text: text.profile.text
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
        }

		/*profileBtns*/
		const currentUser = localStorage.getItem('username');
		const profileName = username;
		let friend;
		let blocked;

		if (currentUser == profileName) {
			document.querySelector("#profileBtns").innerHTML = `
			<div class="row text-center">
				<div class="col text-nowrap">
					<button type="button" class="btn profile-btn" id="playGameBtn"><i class="bi bi-controller" style="padding-right: 5px;"></i>`+text.profile.play+`</button>
				</div>
			</div>
			`
		} else {
			document.querySelector("#profileBtns").innerHTML = `
			<div class="row text-center">
				<div class="col-12 col-md-3 col-sm-6 text-nowrap">
					<button type="button" class="btn profile-btn" id="friendBtn"><span id="friendDisplay"></span></button>
				</div>
				<div class="col-12 col-md-3 col-sm-6 text-nowrap">
					<button type="button" class="btn profile-btn" id="inviteBtn"><i class="bi bi-joystick" style="padding-right: 5px;"></i>`+text.profile.invite+`</button>
				</div>
				<div class="col-12 col-md-3 col-sm-6 text-nowrap">
				<button type="button" class="btn profile-btn" id="messageBtn"><i class="bi bi-send" style="padding-right: 5px;""></i>`+text.profile.message+`</button>
				</div>
				<div class="col-12 col-md-3 col-sm-6 text-nowrap">
					<button type="button" class="btn profile-btn" id="blockBtn"><i class="bi bi-ban" style="padding-right: 5px;"></i><span id="blockDisplay"></span></button>
				</div>
			</div>
			`

			let formData = new FormData();
			formData.set('username', username);

			const endpoint = "https://localhost:8080/api/users/friends/check/";
			const tmpData = await fetch(endpoint, {
				method: 'POST',
				body: formData,
			})
			.then(response => response.json().then(json => ({
				data: json, status: response.status})))
			.then(res => {
				if (res.status > 400) {
					console.log(res.data.message);
				}
				else {
					return res.data;
				}
			})
			.catch(error => {
				console.error(error);
			})
			if (!tmpData) {
				return ;
			}
			friend = tmpData.is_friend;
			blocked = tmpData.is_blocked;
			updateDisplay();
		}

		function updateDisplay()
		{
			if (friend) {
				document.getElementById("friendDisplay").innerHTML = '<i class="bi bi-dash-circle" style="padding-right: 5px;"></i><span>'+text.profile.removeFriend+'</span>';
			}
			else {
				document.getElementById("friendDisplay").innerHTML = '<i class="bi bi-plus-circle" style="padding-right: 5px;"></i><span>'+text.profile.addFriend+'</span>';
			}
			if (blocked) {
				document.getElementById("blockDisplay").innerText = text.friends.unblock
			}
			else {
				document.getElementById("blockDisplay").innerText = text.profile.block
			}
		}


		const inviteBtn = document.getElementById('inviteBtn');
		if (inviteBtn) {
			inviteBtn.addEventListener('click', (e) => {
				invitePlayer(username);
			},
			{
				signal: this.#abortController.signal,
			});
		}

		const messageBtn = document.getElementById('messageBtn');
		if (messageBtn) {
			messageBtn.addEventListener('click', () => {
				console.log("Here is the username: " + username);
				privMsg(username);
			});
		}

		const friendBtn = document.getElementById('friendBtn');
		if (friendBtn) {
			friendBtn.addEventListener('click', (e) => {
				let formData = new FormData();
				formData.set('username', username);

				let endpoint;
				if (friend) {
					endpoint = "https://localhost:8080/api/users/friends/remove/";
				}
				else {
					endpoint = "https://localhost:8080/api/users/friends/add/";
				}
				fetch(endpoint, {
					method: 'PUT',
					body: formData,
				})
				.then(response => response.json().then(json => ({
					data: json, status: response.status})))
				.then(res => {
					if (res.status > 400) {
						console.log(res.data.message);
					}
					else {
						console.log(username + ": " + res.data.message);
						friend = !friend;
						updateDisplay();
					}
				})
				.catch(error => {
					console.error(error);
				})
			},
			{
				signal: this.#abortController.signal,
			});
		}


		const blockBtn = document.getElementById('blockBtn');
		if (blockBtn) {
			blockBtn.addEventListener('click', (e) => {
				let formData = new FormData();
				formData.set('username', username);

				let endpoint;
				if (blocked) {
					endpoint = "https://localhost:8080/api/users/block/remove/";
				}
				else {
					endpoint = "https://localhost:8080/api/users/block/add/";
				}
				fetch(endpoint, {
					method: 'PUT',
					body: formData,
				})
				.then(response => response.json().then(json => ({
					data: json, status: response.status})))
				.then(res => {
					if (res.status > 400) {
						console.log(res.data.message);
					}
					else {
						console.log(username + ": " + res.data.message);
						blocked = !blocked;
						updateDisplay();
					}
				})
				.catch(error => {
					console.error(error);
				})
			},
			{
				signal: this.#abortController.signal,
			});
		}

		const playGameBtn = document.getElementById('playGameBtn');
		if (playGameBtn) {
			playGameBtn.addEventListener('click', () => {
				navigateTo(`/pong`);
			});
		}

		/*Match History Table*/
		endpoint = "https://localhost:8080/api/matchhistory/list/";
		const tableData = await fetch(endpoint, {
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
				return res.data;
			}
		})
		.catch(error => {
			console.error(error);
			this.error("Error: " + error);
			return null;
		})

		if (tableData === null) {
			return;
		}
		displayMatchData(tableData);

		function displayMatchData(data) {
			document.getElementById('table-loading').style.display = 'none';
			if (!data || !data.matches || data.matches.length === 0) {
				showError('No match data available');
				return;
			}
			const tableBody = document.getElementById('table-body');
			tableBody.innerHTML = '';

			data.matches.forEach(match => {
				const row = document.createElement('tr');
				const duration = formatDuration(match.game_time);

				let winner = 'Tie';
				if (match.score_a > match.score_b) {
					winner = match.user_a;
				} else if (match.score_b > match.score_a) {
					winner = match.user_b;
				}

				row.innerHTML = `
					<td>${match.id}</td>
					<td>${match.user_a}</td>
					<td>${match.user_b}</td>
					<td>${match.score_a}</td>
					<td>${match.score_b}</td>
					<td>${duration}</td>
					<td>${winner}</td>
				`;

				tableBody.appendChild(row);
			});
			document.getElementById('table-container').style.display = 'block';
		}

		function formatDuration(isoDuration) {
			try{
				const regex = /P(\d+)DT(\d+)H(\d+)M([\d.]+)S/;
				const match = isoDuration.match(regex);

				if (!match) {
					return isoDuration;
				}

				const days = parseInt(match[1]);
				const hours = parseInt(match[2]);
				const minutes = parseInt(match[3]);
				const seconds = parseFloat(match[4]).toFixed(1);

				let readableDuration = '';
				if (days > 0) readableDuration += `${days}d `;
				if (hours > 0) readableDuration += `${hours}h `;
				if (minutes > 0) readableDuration += `${minutes}m `;
				if (seconds > 0) readableDuration += `${seconds}s`;

				return readableDuration.trim() || '0s';
			} catch (e) {
				console.error('Error parsing duration:', e);
				return isoDuration;
			}
		}

		function showError(message) {
			const errorElement = document.getElementById('table-error');
			errorElement.textContent = message;
			errorElement.style.display = 'block';
			document.getElementById('table-container').style.display = 'none';
		}
	}

	async cleanUp() {
		this.#abortController.abort();
	}
}
