Ext.onReady(function() {

	Ext.EventManager.on('loginButton', 'click', formLogin);
	Ext.EventManager.on('newUserButton', 'click', formCreateUser);

});

function formLogin(event) {

	event.stopEvent();
	form = Ext.get('loginForm')
	loginURL = '/login/'
	Ext.Ajax.request( {
		method : 'POST',
		url : loginURL,
		form : form,
		success : function() {
			window.location = '/';
		},
		failure : function(responseObject) {
			userMessage('errors', responseObject.responseText)
		}
	})

}

function formCreateUser(event) {
	event.stopEvent();
	form = Ext.get('loginForm')
	loginURL = '/createUser/'
	Ext.Ajax.request( {
		method : 'POST',
		url : loginURL,
		form : form,
		success : function() {
			window.location = '/';
		},
		failure : function(responseObject) {
			userMessage('errors', responseObject.responseText)
		}
	});

}


