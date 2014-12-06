var socket = io();

(function (gc) {
	var bindInputAndBtn = function (inputEl, btnEl, fn) {
		btnEl.on('click', fn);

		inputEl.bind("keypress", {}, function(e) {
			var code = (e.keyCode ? e.keyCode : e.which);
		    if (code == 13) { //Enter keycode                        
		    	e.preventDefault();
		    	fn();
		    }
		});
	}

	// init for noti Modal
	$('#notiModal').modal({backdrop: 'static', keyboard: false});

	// init for input name
	$("#inputName").popover({
		placement : 'top',
		content : '이름을 입력하세요.',
		trigger : 'manual'
	});

	bindInputAndBtn($("#inputName"), $('#inputNameBtn'), function () {
		if ($("#inputName").val()) {
			socket.emit('inputPlayerName', $("#inputName").val());
			$('#inputName').val('');
		} else {
			$("#inputName").popover('show');
		}
	});

	// init for input point
	$("#inputPoint").popover({
		placement : 'top',
		content : '적절하지 않습니다. 다시 입력하세요.',
		trigger : 'manual'
	});

	bindInputAndBtn($("#inputPoint"), $('.inputPointBtn'), function () {
		if ($("#inputPoint").val()) {
			socket.emit('inputPoint', $("#inputPoint").val());
			$('#inputPoint').val('');
		} else {
			gc.showInvalidPointPopover();
		}
	});

	// init for chatting
	bindInputAndBtn($("#inputMsg"), $('.inputMsgBtn'), function () {
		socket.emit('inputMsg', $("#inputMsg").val());
		$('#inputMsg').val('');
	});	

	// init for notification
	$('#notification .close').on('click', function () {
		$('#notification').addClass('displayNone');
	});

	// modal binding Event
	$('#notiModal').on('hidden.bs.modal', function () {
		var inputPointEl = document.getElementById('inputPoint');

		if(!inputPointEl.hasAttribute('disabled')) {
			// 포커스가 안먹는 부분
			$("#inputPoint").focus();
		}
	});
})(gc);


socket.on('connect', function(){	
	gc.showNotiModal();
	$("#inputName").focus();
	$("#inputName").popover('hide');
});

socket.on('waitForPlayer2', function () {
	console.log('플레이어 2의 접속을 기다리는 중입니다.');
	gc.changeNotiModal("<p>다른 플레이어의<br> 접속을 기다리는 중입니다.</p><span class='glyphicon glyphicon-refresh glyphicon-refresh-animate loading'></span>");
});

socket.on('player2Connected', function (p1Name, p2Name){
	console.log("플레이어 2 접속");
	socket.emit("sendStart", p1Name, p2Name);
});

/* gameInfo : Object {
	p1Name : player 1 name,
	p2Name : player 2 name,
	totalRound : total round,
	initRound : round for init,
	initPoint : point for init,
	initScore : score for init,
	initPointRange : point range for init
}*/
socket.on("gameStart", function (gameInfo) {
	console.log("게임이 시작됩니다.");
	gc.changeNotiModal("<p>게임이 시작됩니다.</p>");

	// default setting
	gameInfo.totalRound = gameInfo.totalRound || 9;
	gameInfo.initRound = gameInfo.initRound || 1;
	gameInfo.initPoint = gameInfo.initPoint || 99;
	gameInfo.initScore = gameInfo.initScore || 0;
	gameInfo.initPointRange = gameInfo.initPointRange || 5;

	// name setting
	gc.changePlayerName(gameInfo.p1Name, gameInfo.p2Name);

	// round setting
	gc.setRound(gameInfo.initRound);
	document.styleSheets[0].addRule('.statusField .round:after', "content: 'R/"+gameInfo.totalRound+"R';");

	// prev round setting
	gc.resetColor();

	// score setting
	gc.setScore(gameInfo.initScore, gameInfo.initScore);

	// point range setting
	gc.setPointRange(gameInfo.initPointRange);

	// point setting
	gc.setRemainingPoint(gameInfo.initPoint);

	setTimeout(function() {
		gc.hideNotiModal();
	}, 1000);
});

// className : .player1Name or .player2Name
socket.on('checkMyName', function (className, playerNum) {
	gc.myNum = playerNum;
	document.querySelector(className).classList.add('playerMe');
});

socket.on('firstPlayerSetting', function () {
	gc.setFirstPlayer();
	gc.activatePointInput();
});

socket.on('lastPlayerSetting', function () {
	gc.setLastPlayer();
	gc.deactivatePointInput();
});

socket.on('setRemainingTime', function (time) {
	gc.setRemainingTime(time);
});

socket.on('invalidPointInput', function () {
	gc.showInvalidPointPopover();
});

socket.on('updatePointAndBlockPointInput', function (point) {
	gc.setRemainingPoint(point);
	gc.deactivatePointInput();
});

socket.on('activatePointInput', function () {
	gc.activatePointInput();
});

socket.on('showNotification', function (message) {
	gc.showNotification(message);
});

socket.on('hideNotification', function () {
	gc.hideNotification();
});

// var methods = ['activatePointInput', 'showNotification', 'hideNotification'];

// for (var i = 0; i < methods.length; i++) {
// 	// (function (method) {
// 		socket.on(method, function (message) {
// 			gc[method[i]](message);
// 		}
// 	// })(methods[i]);
// };

socket.on('showRoundInfoByNotiModal', function (round, text) {
	gc.changeNotiModal('<h1>라운드'+round+"</h1><span class='bigFont'>"+text+"</span><br><br>3초 후 다음라운드로 진행합니다.");
	gc.showNotiModal();
});

socket.on('proceedRound', function (roundInfo) {
	gc.hideNotiModal();
	gc.setRound(roundInfo.round);
	gc.setScore(roundInfo.p1Score, roundInfo.p2Score);
});

socket.on('setCounterInfo', function (counterInfo) {
	gc.setPointRange(counterInfo.pointRange);
	gc.setBlackAndWhite(counterInfo.color);
	gc.setPrevBlackAndWhite(counterInfo.round, counterInfo.color);
});

socket.on('inputTimeout', function () {
	gc.showNotification('입력시간이 초과되었습니다. 0이 입력됩니다.');
	socket.emit('inputPoint', 0);
});

socket.on('gameOverWinner', function (playerName) {
	gc.changeNotiModal(playerName+"<br><span class='bigFont'>승리!</span><br><br> 3초 후에 Reload 됩니다.");
	gc.showNotiModal();
});

socket.on('gameOverLoser', function (playerName) {
	gc.changeNotiModal(playerName+"<br><span class='bigFont'>패배!</span><br><br> 3초 후에 Reload 됩니다.");
	gc.showNotiModal();

	setTimeout(function () {
		window.location.reload(true);
	}, 3000);
});

socket.on('gameOverDraw', function () {
	gc.changeNotiModal("<span class='bigFont'>비김!</span><br><br>3초 후에 추가게임이 시작됩니다.");
	gc.showNotiModal();
});

socket.on('updatechat', function (num, msg) {
	gc.appendMessage(num, msg);
});

socket.on('counterDisconnected', function(){
	gc.changeNotiModal("상대방이 나갔습니다. <br> 3초 후에 Reload 됩니다.");
	gc.showNotiModal();

	setTimeout(function () {
		window.location.reload(true);
	}, 3000);
});


