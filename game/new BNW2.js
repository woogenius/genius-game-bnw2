var BNW2game = function (player1, player2) {
	this.static = {
		TOTAL_ROUND : 9,
		INIT_POINT : 99,
		INIT_SCORE : 0,
		INIT_ROUND : 1,
		DRAW_ROUND : 3,
		DRAW_POINT : 33
	};
	this.info = {
		startPoint : null,
		startTotalRound : null,
		round : 1,
		drawRound : 0
	};

	this.getFirstPlayerAtFirstTime = function () {
		// 첫 라운드
		if (this.info.round == 1) {
			var randomInt = (function getRandomInt(min, max) {
				return Math.floor(Math.random() * (max - min + 1)) + min
			})(1,2);

			if (randomInt == 1) {
				this.firstPlayer = this.player1;
			} else {
				this.firstPlayer = this.player2;
			}

		// 나머지 라운드
		} else {
			// 라운드가 진행하면 이전라운드 위너를 첫번째 플레이어로 세팅하고 초기화
			this.firstPlayer = this.winner;
		}

		return this.firstPlayer;
	}

	this.getFirstPlayer = function () {
		return this.firstPlayer;
	}

	this.isFirstPlayer = function (player) {
		if (this.firstPlayer === player) {
			return true;
		} else{
			return false;
		};
	}

	// 위너를 리턴하고 선공을 세팅하는 함수, 비길경우 null 리턴
	this.getWinnerAndSetFirstPlayer = function () {
		var firstPlayerPoint = this.firstPlayer.usingPoint;
		var lastPlayerPoint = this.firstPlayer.otherPlayer.usingPoint;
		var winner = null;

		// 승부가 났을때 위너를 세팅하고 스코어를 올림. 비길땐 안올림.
		if (firstPlayerPoint < lastPlayerPoint) {
			winner = this.firstPlayer.otherPlayer;
			winner.score++;

			this.firstPlayer = winner;

		} else if (firstPlayerPoint > lastPlayerPoint) {
			winner = this.firstPlayer;
			winner.score++;
		// 비기면 후공이 선공이 됨.
		} else {
			this.info.drawRound ++;
			this.firstPlayer = this.firstPlayer.otherPlayer;
		}

		// 사용포인트 초기화
		this.player1.usingPoint = null;
		this.player2.usingPoint = null;

		return winner;
	}

	// 게임이 끝났으면 위너를 넘기고, 비겼으면 "Draw"를, 안끝났으면 null을 넘기고 라운드 증가.
	this.isOver = function () {
		var winScore = parseInt((this.info.startTotalRound - this.info.drawRound)/2) + 1;
		if (this.player1.score == winScore) {
			return this.player1;
		} else if (this.player2.score == winScore) {
			return this.player2;
		} else if (this.info.round == this.info.startTotalRound) {
			if (this.player1.score > this.player2.score) {
				return this.player1;
			} else if (this.player1.score < this.player2.score) {
				return this.player2;
			} else {
				return "Draw";
			}
		}

		return null;
	}

	// 포인트를 입력하는 함수.
	this.inputPoint = function (player, point) {
		var parsedPoint = parseInt(point, 10);
		player.usingPoint = parsedPoint;
		player.point -= parsedPoint;
	}

	// 유효한 포인트인지 확인하는 함수.
	this.isValidPoint = function (player, point) {
		var parsedPoint = parseInt(point, 10);
		if(point == parsedPoint && parsedPoint >= 0 && player.point - parsedPoint >= 0) 
			return true;

		return false;
	}

	this.getRoundInfo = function () {
		var roundInfo = {
			round: this.info.round,
			p1Score : this.player1.score,
			p2Score : this.player2.score
		};

		return roundInfo;
	}
	
	var getBlackOrWhite = function (point) {
		if (point > 9) {
			return "W";
		} else {
			return "B";
		}
	}

	var getPointRange = function (point) {
		if (point < 20) {
			return 1;	// 0 ~ 19
		} else if (point < 40) {
			return 2;	// 20 ~ 39
		} else if (point < 60) {
			return 3;	// 40 ~ 59
		} else if (point < 80) {
			return 4;	// 60 ~ 79
		} else {
			return 5;	// 80 ~ 99
		}
	}

	this.getPlayerInfo = function (player) {
		var info = {
			round: this.info.round
		};
		// 제시한 포인트가 있을때 흑, 백 정보를 포함해서 리턴
		if (player.usingPoint === parseInt(player.usingPoint, 10)) {
			info.color = getBlackOrWhite(player.usingPoint);
		}

		info.pointRange = getPointRange(player.point);

		return info;
	}

	this.initializeDrawGame = function () {
		// init for info
		this.info.round = 1;
		this.info.drawRound = 0;
		this.info.startTotalRound = this.static.DRAW_ROUND;
		this.info.startPoint = this.static.DRAW_POINT;

		// init for player
		this.player1.point = this.static.DRAW_POINT;
		this.player1.score = this.static.INIT_SCORE;
		this.player2.point = this.static.DRAW_POINT;
		this.player2.score = this.static.INIT_SCORE;
	}

	/* gameInfo : Object {
		p1Name : player 1 name,
		p2Name : player 2 name,
		totalRound : total round,
		initRound : round for init,
		initPoint : point for init,
		initScore : score for init,
		initPointRange : point range for init
	}*/
	this.getGameInfoForInit = function () {
		var gameInfo = {
			p1Name : this.player1.name,
			p2Name : this.player2.name,
			initScore : this.static.INIT_SCORE,
			initRound : this.static.INIT_ROUND,
			totalRound : this.info.startTotalRound,
			initPoint : this.info.startPoint,
			initPointRange : getPointRange(this.info.startPoint)
		};

		return gameInfo;
	}
}

exports.initialize = function () {
	var newGame = new BNW2game();
	newGame.player1 = {
		point : newGame.static.INIT_POINT,
		score : newGame.static.INIT_SCORE,
		usingPoint : null
	};
	newGame.player2 = {
		point : newGame.static.INIT_POINT,
		score : newGame.static.INIT_SCORE,
		usingPoint : null
	};

	newGame.player1.otherPlayer = newGame.player2;
	newGame.player2.otherPlayer = newGame.player1;

	newGame.info.startPoint = newGame.static.INIT_POINT;
	newGame.info.startTotalRound = newGame.static.TOTAL_ROUND;

	return newGame;
}