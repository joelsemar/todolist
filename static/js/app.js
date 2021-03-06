var MAX_OPACITY = 0.6;
var MIN_OPACITY = 0;
var MESSAGE_DURATION = 4000;
var FADE_DURATION = 0.6;


Ext.QuickTips.init();
function userMessage(type, messageText) {
	// Takes custom text and displays it to the user
	// an 'errors' type will result in a red box, while anyting else will be green
	
	var alertBox = Ext.getDom('alertBox');
	Ext.fly('alertBoxText').update(messageText);
	alertBox.style.display = 'block';
	var callback = function() {
		setTimeout(fadeOutMessage, MESSAGE_DURATION);
	};
	if (type == 'errors') {
		alertBox.className = 'errorAlert';
	}
	else {
		alertBox.className = 'messageAlert';
	}
	Ext.fly(alertBox).setOpacity(MAX_OPACITY, {
		duration : FADE_DURATION,
		callback : callback
	});
}

function fadeOutMessage() {
	var alertBox = Ext.getDom('alertBox');
	Ext.fly(alertBox).setOpacity(MIN_OPACITY, {
		duration : FADE_DURATION,
		callback : function() {
			alertBox.style.display = 'none';
		}
	});
}
