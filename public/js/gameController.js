// game controller
var gc = {
	changePlayerName : function (p1Name, p2Name) {
		document.querySelector('.player1Name').innerHTML = p1Name;
		document.querySelector('.player2Name').innerHTML = p2Name;
	},
	setFirstPlayer : function () {
		document.querySelector('.attackOrder span').className = 'first';
	},
	setLastPlayer : function () {
		document.querySelector('.attackOrder span').className = 'last';
	},
	deactivatePointInput : function () {
		var inputPointEl = document.getElementById('inputPoint');
		inputPointEl.setAttribute("disabled", "");
		inputPointEl.setAttribute("placeholder", "입력을 기다리는 중.");
	},
	activatePointInput : function () {
		var inputPointEl = document.getElementById('inputPoint');
		inputPointEl.removeAttribute('disabled');
		inputPointEl.setAttribute('placeholder', '포인트를 입력하세요.');
		$("#inputPoint").focus();
		// inputPointEl.focus();
	},
	setRemainingTime : function (remainingTime) {
		var remainingTimeEl = document.querySelector('.remainingTime');
		remainingTimeEl.innerHTML = remainingTime;

		if (remainingTime < 15) {
			remainingTimeEl.style.color = '#d9534f';
		} else{
			remainingTimeEl.style.color = '#ebebeb';
		}
	},
	setRemainingPoint : function (remainingPoint) {
		var remainingPointEl = document.querySelector('.remainingPoint');
		remainingPointEl.innerHTML = remainingPoint;
		remainingPointEl.setAttribute('style', 'width:'+remainingPoint+'%;')
	},
	showInvalidPointPopover : function () {
		$("#inputPoint").popover('show');
		setTimeout (function () {
			$("#inputPoint").popover('hide');
		}, 1000);
		$('#inputPoint').val('');
	},
	showNotification : function (message) {
		$('#notification .content').text(message);
		$('#notification').removeClass('displayNone');
		setTimeout(function () {
			this.hideNotification();
		}.bind(this), 5000);
	},
	hideNotification : function () {
		if(!$('#notification').hasClass('displayNone')) {
			$('#notification').addClass('displayNone');
		}
	},
	showNotiModal : function () {
		this.changeNotiModal();
		$('#notiModal').modal('show');
		$('body').css('overflow','hidden');
		$('body').css('position','fixed');
	},
	hideNotiModal : function () {
		$('#notiModal').modal('hide');
		$('body').css('overflow','visible');
		$('body').css('position','static');
	},
	changeNotiModal : function (text) {
		$('#notiModal > div.modal-dialog > div > div.modal-body > div.wrap').html(text);
		this.centerNotiModal();
	},
	centerNotiModal : function () {
		$('#notiModal').css('display', 'block');
		var $dialog = $('#notiModal').find(".modal-dialog");
		var offset = ($(window).height() - $dialog.height()) / 2;
		// Center modal vertically in window
		$dialog.css("margin-top", offset);
	},
	setRound : function (round) {
		var roundEl = document.querySelector('.round');
		roundEl.textContent = round;
	},
	setScore : function (p1Score, p2Score) {
		var p1ScoreEl = document.querySelector('.player1Score');
		var p2ScoreEl = document.querySelector('.player2Score');
		p1ScoreEl.textContent = p1Score;
		p2ScoreEl.textContent = p2Score;
	},
	setPointRange : function (num) {
		var pointRangeEl = document.querySelectorAll('.pointBoard tr');
		var length = pointRangeEl.length;
		var startingPoint = 5 - num;

		for (var i = 0; i < length; i++) {
			if (i < startingPoint) {
				pointRangeEl[i].className = '';
			} else {
				pointRangeEl[i].className = 'primary';
			}
		};
	},
	setBlackAndWhite : function (bw) {
		var counterColorEl = document.querySelector('.counterColor');
		if (bw === 'B') {
			counterColorEl.className = 'counterColor colorBlack';
		} else if (bw === 'W') {
			counterColorEl.className = 'counterColor colorWhite';
		} else {
			counterColorEl.className = 'counterColor colorNone';
		}
	},
	resetColor : function () {
		var counterColorEl = document.querySelector('.counterColor');
		var aCounterPrevColorEl = document.querySelectorAll('.counterPrevColor div');
		var length = aCounterPrevColorEl.length;

		for (var i = 1; i < length; i++) {
			aCounterPrevColorEl[i].className = 'col-xs-3 colorNone';
		}

		counterColorEl.className = 'counterColor colorNone';
	},
	setPrevBlackAndWhite : function (round, bw) {
		if(round == 9)
			return;

		var aCounterPrevColorEl = document.querySelectorAll('.counterPrevColor div');
		if (bw === 'B') {
			aCounterPrevColorEl[round].className = 'col-xs-3 colorBlack';
		} else if (bw === 'W') {
			aCounterPrevColorEl[round].className = 'col-xs-3 colorWhite';
		} else {
			aCounterPrevColorEl[round].className = 'col-xs-3 colorNone';
		}
	},
	appendMessage : function (playerNum, message) {
		var chattingMessagesEl = document.querySelector('#chattingMessages');
		var chattingMessagesListEl = document.querySelector('#chattingMessages ul');
		if(playerNum == this.myNum) {
			var inputString = "<li class='myMessage'><span>" + message + "</span></li>";
		} else {
			var inputString = "<li><span>" + message + "</span></li>";
		}
		chattingMessagesListEl.innerHTML = chattingMessagesListEl.innerHTML + inputString;	

		chattingMessagesEl.scrollTop = chattingMessagesEl.scrollHeight;
	}
}
