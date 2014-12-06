/*
	만들 부분
	1 gameStart -> Player1 Name, P2 Name
	2 changeRound -> int roundNum
	3 updateScore
	4 updatePointRange
	5 updateRemainingPoint
	6 inputPlayerName
	7 initialize
*/

var socket = io();

socket.on('connect', function(){
	$('#inputNameModal').modal('show');
	document.getElementById("inputNameModal").focus();
	//socket.emit('adduser', prompt("Write Your Name"));
});

// P1 P2 Name
socket.on('gameStart', function (inputPlayerName) {

});

socket.on('changeRound', function(roundNum){

});

socket.on('updateScore', function(){

});

socket.on('updateRemainingPoint', function(){

});

socket.on('updatechat', function (roomName) {
	console.log('you join ' + roomName);
});

socket.on('counterDisconnected', function(){
	console.log('상대방이 채팅방을 나갔습니다. 연결이 끊어집니다.');
});

