import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
	constructor() {
		super();
		this.setTitle("Transcendence");
		this.redirection = {
			needed: true,
			auth: false,
			url: "/users/login"
		}
	}

    async getStyle() {
        return `
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
    <div class="container py-5 h-100">
        <div class="row-fluid d-flex justify-content-center align-items-center">
                <img src="/static/img/cat.png" alt="user's image" width="50" height="50" class="rounded-circle">
                <h2 class="d-sm-inline mx-3 mb-0">{USER NAME}</h2>
        </div>
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
                    <p class="fs-1 fs-sm-2 fs-md-3 fs-lg-5 text-center" id="statWins">Wins</p>
                </div>
                <div class="col-12 col-md-3 col-sm-3">
                    <p class="fs-1 fs-sm-2 fs-md-3 fs-lg-5 text-center" id="statLoses"></p>
                </div>
                <div class="col-12 col-md-3 col-sm-3">
                    <p class="fs-1 fs-sm-2 fs-md-3 fs-lg-5 text-center" id="statWinRate"></p>
                </div>
                <div class="col-12 col-md-3 col-sm-3">
                    <p class="fs-1 fs-sm-2 fs-md-3 fs-lg-5 text-center" id="statGameTime"></p>
                </div>
            </div>
        </section>
    </div>
    `;
    }

    async getJavaScript() {
        
        /*This part needs to replace with API to fetch data*/
        let numbers_of_wins = 120;
        let numbers_of_loses = 50;
        let rate_of_wins = ((numbers_of_wins / (numbers_of_wins + numbers_of_loses)) * 100).toFixed(2);
        let game_time = 20

        document.getElementById('statWins').innerHTML = `Wins<br/><span style="color: #4169e1;">${numbers_of_wins}</span>`;
        document.getElementById('statLoses').innerHTML = `Loses<br/><span style="color: #98afc7;">${numbers_of_loses}</span>`;
        document.getElementById('statWinRate').innerHTML = `Win Rate<br/><span style="color: orange;">${rate_of_wins}%</span>`;
        document.getElementById('statGameTime').innerHTML = `Game Time<br/><span style="color: black;">${game_time} min</span>`;
		
        /*Doughnut chart */
        const dctx = document.getElementById('winsCountChart').getContext('2d');

        const winsLossesChart = new Chart(dctx, {
            type: 'doughnut',  // Doughnut chart type
            data: {
                labels: ['Wins', 'Loses'],  // Labels for the segments
                datasets: [{
                    label: 'Wins vs Loses',
                    data: [numbers_of_wins, numbers_of_loses],  // Data for wins and losses
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
                    data: [25, 15], // Need to replace with data from API
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
	}
}
