import AbstractView from "./../AbstractView.js";

export default class extends AbstractView {
  constructor() {
    super();
  }

  async getStyle() {
    return `
				body {
				margin: 0;
				display: flex;
				justify-content: center;
				align-items: center;
				height: 100vh;
				overflow: hidden;
			}
			.keyboxes {
				position: absolute;
				display: flex;
				justify-content: space-between;
				width: 100%;
				bottom: 0px;
				padding: 15px;
			}
			.keybox {
				width: 160px;
				height: 220px;
				display: flex;
				align-items: center;
				justify-content: center;
				background: #333;
				border-radius: 15px;
				border: 2px solid #999;
				box-shadow: 0 0 30px #ffffff60;
				user-select: none;
			}
			.keyboard {
					display: grid;
					grid-gap: 8px;
					padding: 20px;
					background-color: #e0e0e0;
					border-radius: 10px;
					box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
			}
			.key {
					width: 60px;
					height: 60px;
					display: flex;
					justify-content: center;
					align-items: center;
					background-color: white;
					border-radius: 8px;
					font-size: 24px;
					font-weight: bold;
					color: #333;
					box-shadow: 0 4px 0 #999, 0 5px 10px rgba(0, 0, 0, 0.15);
					transition: all 0.1s ease;
					user-select: none;
					position: relative;
			}
			.key.active {
					transform: translateY(4px);
					box-shadow: 0 0 0 #999, 0 1px 5px rgba(0, 0, 0, 0.1);
			}
			.box {
				position: absolute;
				width: 50px;
				height: 275px;
				display: flex;
				align-items: center;
				justify-content: center;
				background: #333;
				border-radius: 15px;
				border: 2px solid #999;
				box-shadow: 0 0 30px #ffffff60;
				top: 15px;
				right: 15px;
				user-select: none;
			}
			#soundBtn {
				background: none;
				color: rgb(255, 255, 255);
				border: none;
				padding: 10px 20px;
				cursor: pointer;
				border-radius: 5px;
				position: absolute;
				top: 0px;
				user-select: none;
				display: flex;
				align-items: center;
			}
			#volume {
				position: absolute;
				top: 50px;
				cursor: pointer;
				writing-mode: vertical-lr;
				transform: rotate(180deg);
				height: 200px;
				accent-color: #b1b1b1;
			}
		`;
  }

  async getHtml() {
    return `
			<div>
				<div class="keyboxes">
					<div class="keybox">
						<div class="keyboard">
							<div class="key" id="w">w</div>
							<div class="key" id="s">s</div>
						</div>
					</div>
					<div class="keybox">
						<div class="keyboard">
							<div class="key" id="ArrowUp">↑</div>
							<div class="key" id="ArrowDown">↓</div>
						</div>
					</div>
				</div>
				<div class="box">
					<button id="soundBtn">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-volume-off"
						>
							<path d="M16 9a5 5 0 0 1 .95 2.293" />
							<path d="M19.364 5.636a9 9 0 0 1 1.889 9.96" />
							<path d="m2 2 20 20" />
							<path
								d="m7 7-.587.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298V11"
							/>
							<path d="M9.828 4.172A.686.686 0 0 1 11 4.657v.686" />
						</svg>
					</button>
					<input type="range" id="volume" name="volume" />
				</div>
			</div>
		`;
  }
}
