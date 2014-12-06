var path = require('path');
var session = require('express-session');
var express = require('express');
var game = require('./game/new BNW2.js');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// routing
app.use(express.static(path.join(__dirname, 'public')));

var gameResources = {
	INIT_TIME : 60,
	MAX_ROOM_NUM : 20,
	isFirstPlayer : true,
	tempRoom : null,
	rooms : [],
	initRooms : function () {
		for (var i = 0; i < this.MAX_ROOM_NUM; i++) {
			this.rooms.push({roomName : 'room'+ (i+1)});
		};
	}
}

gameResources.initRooms();

io.on('connection', function (socket) {
	socket.on('inputPlayerName', function(playerName) {
		// 첫번째 플레이어
		if(gameResources.isFirstPlayer === true){
			socket.room = gameResources.rooms.pop();
			socket.room.game = game.initialize();
			socket.player = socket.room.game.player1;
			socket.player.name = playerName;
			socket.player.num = 1;
			socket.player.socketId = socket.id;

			tempRoom = socket.room;
			socket.join(socket.room.roomName);

			console.log(playerName + " join " + socket.room.roomName);

			socket.emit('waitForPlayer2');

			gameResources.isFirstPlayer = false;
		// 두번째 플레이어
		} else {
			if(!io.sockets.adapter.rooms[tempRoom.roomName]) {
				gameResources.isFirstPlayer = true;
				socket.emit('counterDisconnected');
				return;
			}

			socket.room = tempRoom;
			socket.player = socket.room.game.player2;
			socket.player.name = playerName;
			socket.player.num = 2;
			socket.player.socketId = socket.id;

			socket.join(socket.room.roomName);

			socket.broadcast.to(socket.room.roomName).emit('player2Connected');

			console.log(playerName + " join " + socket.room.roomName);

			gameResources.isFirstPlayer = true;

		}
	});

	socket.on('sendStart', function () {
		var game = socket.room.game;
		var firstPlayer = game.getFirstPlayerAtFirstTime();

		// 게임시작
		io.sockets.in(socket.room.roomName).emit('gameStart', game.getGameInfoForInit());

		// 자기이름 컬러표시
		io.to(game.player1.socketId).emit('checkMyName', '.player1Name', game.player1.num);
		io.to(game.player2.socketId).emit('checkMyName', '.player2Name', game.player2.num);

		// 선공, 후공 인풋 세팅
		gc.settingInputAtRoundStart(firstPlayer);

		// 현재 인풋을 할 플레이어는 퍼스트 플레이어다.
		game.presentPlayer = firstPlayer;
	});

	socket.on('inputPoint', function (point) {
		var game = socket.room.game;

		// 현재 플레이어가 인풋을 한게 아니면 리턴
		if(socket.player !== game.presentPlayer)
			return;

		// 유효하지 않은 숫자면 리턴
		if(!game.isValidPoint(socket.player, point)) {
			socket.emit('invalidPointInput');
			return;
		}

		// 플레이어에게 포인트를 인풋하고 타이머를 멈춤.
		game.inputPoint(socket.player, point);
		clearInterval(socket.room.timer);

		// 다른 플레이어에게 현재 플레이어의 정보를 넘김.
		io.to(socket.player.otherPlayer.socketId).emit('setCounterInfo', game.getPlayerInfo(socket.player));

		// 포인트 게이지를 업데이트하고, 포인트 입력창을 블락
		socket.emit('updatePointAndBlockPointInput', socket.player.point);

		// 입력한 플레이어가 첫번째 플레이어라면.
		if (game.isFirstPlayer(socket.player)) {
			// 후공으로 턴넘기기
			var lastPlayer = socket.player.otherPlayer;
			gc.settingInputAfterFirstPlayerAttacked(lastPlayer);

			// 현재 인풋을 할 플레이어는 라스트 플레이어다.
			game.presentPlayer = lastPlayer;

		// 입력한 플레이어가 라스트 플레이어라면.
		} else {
			// 승부를 가리고 다음번 선공을 세팅하는 함수. 승부가 났으면 위너를 안났으면 null을 리턴.
			var winner = game.getWinnerAndSetFirstPlayer();

			// 게임이 끝났는지 검사하고 끝났으면 위너를, 비겼으면 "Draw"를 안끝났으면 null을 넘기는 함수.
			var isOver = game.isOver();

			// 게임이  안끝났다면.
			if(!isOver) {
				// 정보를 보내고
				gc.finishRoundAndSendInfo(winner, game.info.round);
				// 라운드를 1 증가시키고
				game.info.round ++;
				// 3초후에 라운드를 진행
				gc.wait3SecondsAndProceedRound(game.getRoundInfo(), game);

			// 비겼다면.
			} else if (isOver === "Draw") {
				io.sockets.in(socket.room.roomName).emit('gameOverDraw');
				game.initializeDrawGame();

				var firstPlayer = game.getFirstPlayerAtFirstTime();

				setTimeout(function () {
					if (socket.room) {
						// 게임시작
						io.sockets.in(socket.room.roomName).emit('gameStart', game.getGameInfoForInit());

						// 선공, 후공 인풋 세팅
						gc.settingInputAtRoundStart(firstPlayer);

						// 현재 인풋을 할 플레이어는 퍼스트 플레이어다.
						game.presentPlayer = firstPlayer;
					}
				}, 3000);

			// 끝났다면.
			} else {
				io.to(isOver.socketId).emit('gameOverWinner', isOver.name);
				io.to(isOver.otherPlayer.socketId).emit('gameOverLoser', isOver.otherPlayer.name);
			}
		}


	});

	socket.on('inputMsg', function (msg) {
		io.sockets.in(socket.room.roomName).emit('updatechat', socket.player.num, msg);
	})

	socket.on('disconnect', function () {
		if(socket.room) {
			clearInterval(socket.room.timer);
			console.log(io.sockets.adapter.rooms[socket.room.roomName]);
			if(io.sockets.adapter.rooms[socket.room.roomName]) {
				var newRoom = {
					roomName : socket.room.roomName
				};
				socket.broadcast.to(socket.room.roomName).emit('counterDisconnected');

				if (gameResources.rooms.length < gameResources.MAX_ROOM_NUM) {
					gameResources.rooms.push(newRoom);
				}
				socket.leave(socket.room.roomName);
			}

			delete socket.room;
		}
	});

	// game controller
	var gc = {
		// 퍼스트 플레이어 인풋가능하게 만들고 라스트 플레이어는 막는 함수.
		settingInputAtRoundStart : function (firstPlayer) {
			io.to(firstPlayer.socketId).emit('firstPlayerSetting');
			io.to(firstPlayer.socketId).emit('showNotification', '당신 차례입니다. 포인트를 입력하세요.');

			io.sockets.in(socket.room.roomName).emit('setRemainingTime', gameResources.INIT_TIME);

			this.settingTimer(firstPlayer);

			io.to(firstPlayer.otherPlayer.socketId).emit('lastPlayerSetting');
		},
		// 라스트플레이어가 인풋 가능하게 만드는 함수.
		settingInputAfterFirstPlayerAttacked : function (lastPlayer) {
			io.to(lastPlayer.socketId).emit('showNotification', '당신 차례입니다. 포인트를 입력하세요.');
			io.to(lastPlayer.socketId).emit('activatePointInput');

			this.settingTimer(lastPlayer);
		},
		settingTimer : function (player) {
			socket.room.remaingTime = gameResources.INIT_TIME;
			socket.room.timer = setInterval(function(){
				if(!socket.room) {
					clearInterval(socket.room.timer);
					return;
				}

				if(socket.room.remaingTime >= 0) {
					io.to(player.socketId).emit('setRemainingTime', socket.room.remaingTime);
				} else {
					io.to(player.socketId).emit('inputTimeout');
					clearInterval(socket.room.timer);

				}
				socket.room.remaingTime--;
			}, 1000);
		},
		// 라운드를 끝내고 정보를 보내는 함수.
		finishRoundAndSendInfo : function (winner, round) {
			if(winner) {
				io.to(winner.socketId).emit('showRoundInfoByNotiModal', round, '승리');
				io.to(winner.otherPlayer.socketId).emit('showRoundInfoByNotiModal', round, '패배');
			} else {
				io.sockets.in(socket.room.roomName).emit('showRoundInfoByNotiModal', round, '비김');
			}
		},
		// 3초를 기다리고 라운드를 진행하는 함수.
		wait3SecondsAndProceedRound : function (roundInfo, game) {
			setTimeout(function () {
				if (socket.room) {
					// 모달을 없애고 라운드 정보를 업데이트.
					io.sockets.in(socket.room.roomName).emit('proceedRound', roundInfo);

					// 첫번째 플레이어 세팅
					var firstPlayer = game.getFirstPlayer();
					this.settingInputAtRoundStart(firstPlayer);

					game.presentPlayer = firstPlayer;
				}
			}.bind(this),3000);
		}

	}

});


http.listen(3000, function () {
	console.log('Express server listening on port 3000');
});
