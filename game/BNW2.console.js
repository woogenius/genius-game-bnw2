BNW2.consoleGame = function () {
	// progress : 	0 = Game Start
	// 				1 = Input Player1 Id
	// 				2 = Input Player2 Id
	// 				3 = 선공
	// 				4 = 후공
	// 				5 = 게임 끝
	//				6 = 비김
	// 입력 후 콘솔창에 출력하는 함수
	this.doSomething = function (progress) {
		switch (progress) {
		    case 0:
		    	start();
		        break;
		    case 1:
		    	inputPlayer2Id();
		        break;
		    case 2:
		    	firstStrike();
		        break;
		    case 3:
		    	lastStrike();
		        break;
		    case 4:
		    	printWinner();
		    	firstStrike();
		        break;
		    case 5:
		    	gameOver();
		        break;
		    case 6:
		    	firstStrike();
		        break;
		}
	}

	this.getInputContent = function () {
		var content = document.querySelector("#inputField").value;
		document.querySelector("#inputField").value = "";

		return content;
	}

	this.retry = function () {
		console.log("적절하지 않은 입력입니다. 다시입력하세요.");
	}

	this.draw = function () {
		console.log("%c비겼습니다. 게임을 다시 시작합니다.", 'background: red; color: white');
	}

	var start = function () {
		console.log("흑과백2 게임을 시작합니다.");
		console.log("Player 1 ID를 입력하세요.");
	}

	var inputPlayer2Id = function () {
		console.log("Player 2 ID를 입력하세요.");
	}

	var firstStrike = function () {
		var fp = BNW2.firstPlayer;
		var lp = BNW2.firstPlayer.otherPlayer;
		var info = BNW2.getPlayerInfomation(lp);
		console.log("%c" +BNW2.round+ "라운드" , 'background: blue; color: white');
		console.log("%c" + "스코어 " + BNW2.player1.score + " : " + BNW2.player2.score , 'background: #222; color: #bada55');
		console.log("선공 : " + fp.id + " " + "후공 : " + lp.id);
		console.log("%c상대방 점수범위 : " + getPointRange(info.pointRange), 'color: blue');
		console.log(fp.id + " 선공입니다. 포인트를 입력하세요.");
	}

	var printWinner = function () {
		if (BNW2.prevDraw) {
			console.log("%c비김!", 'background: #222; color: #bada55');
		} else{
			console.log("%c" + BNW2.winner.id + " 승리!", 'background: #222; color: #bada55');
		};
	}

	var lastStrike = function () {
		var fp = BNW2.firstPlayer;
		var lp = BNW2.firstPlayer.otherPlayer;
		var info = BNW2.getPlayerInfomation(fp);
		console.log("%c상대방 점수범위 : " + getPointRange(info.pointRange), 'color: blue');
		console.log("%c상대방 색깔 : " + info.color, 'color: blue');
		console.log(lp.id + " 후공입니다. 포인트를 입력하세요.");
	}

	var gameOver = function () {
		console.log("%c게임 끝", 'background: red; color: white');
		console.log("%c" + "스코어 " + BNW2.player1.score + " : " + BNW2.player2.score , 'background: #222; color: #bada55');
		console.log("%c승자는 " + BNW2.lastWinner.id + "입니다.", 'background: red; color: white');
	}

	var getPointRange = function (num) {
		switch (num) {
		    case 1:
		    	return "0 ~ 19";
		        break;
		    case 2:
		    	return "20 ~ 39";
		        break;
		    case 3:
		    	return "40 ~ 59";
		        break;
		    case 4:
		    	return "60 ~ 79";
		        break;
		    case 5:
		    	return "80 ~ 99";
		    	break;
		}
	}
}
