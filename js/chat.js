// Initialize global user 
// (a good idea to store the information you need
// when sending messages here)
var CURRENT_USER = null;
var site = "http://chat-app.brainstation.io";
var username = "";

// sendMessage() sends a message to the API
function sendMessage() {
	event.preventDefault();
	var form = $('#entry');
	var input = $('#entry input');
	var entry = form.find('input[name="message"]').val();
	console.log(entry);

	$.ajax({
		url: site + "/messages",
		type: "POST",
		data: {'userID':CURRENT_USER, 'message':entry},
		xhrFields: { withCredentials:true },
		success: function(data) {
			console.log(data);
			$('.chat_client').append('<div class="message"><div class="user"><div class="user_img"><img src="img/minion.jpeg"></div><div class="username">' + data.username + '</div></div><div class="text"><p>' + data.message + '</p></div></div>');
			input.val("");
		},
		error: function(data) {
			console.log(data);
		}
	});
}
$('#entry').on('submit', function(event){
	sendMessage();
});

// getMessages() gets all messages from the API.
// we can use diff() to get only the new ones.
function getMessages() {
	event.preventDefault();

	$.ajax({
		url: site + "/messages",
		type: "GET",
		success: function(data) {
			console.log(data);

			data.forEach(function(element) {
				$('.chat_client').append('<div class="message"><div class="user"><div class="user_img"><img src="img/minion.jpeg"></div><div class="username">' + element.username + '</div><div class="time">' + getReadableTime(element.timestamp) + '</div></div><div class="text"><p>' + element.message + '</p></div></div>');
			});
		},
		error: function(data) {
			console.log(data);
		}
	});
}

// login() logs in a user by creating a session
function login() {
	event.preventDefault();
	var form = $('#login');
	username = form.find('input[name="username"]').val();
	console.log(username);

	$.ajax({
		url: site + "/users/login",
		type: "POST",
		data: form.serialize(),
		xhrFields: { withCredentials:true },
		success: function(data) {
			CURRENT_USER = data.uid;
			$('#login').css('display','none');
			$('.username').append("Username: " + username);
			$('.username').css('display','inline-block');
			getMessages();
		},
		error: function(data) {
			console.log(data);
		}
	});
}
$('#login').on('submit', function(event){
	login();
});

// signup() creates an account that we can sign in with
function signup() {
	event.preventDefault();
	var form = $('#signup');

	$.ajax({
		url: site + "/users",
		type: "POST",
		data: form.serialize(),
		xhrFields: {withCredentials:true },
		success: function(data) {
			console.log(data);
			$('#signup').css('display','none');
			$('#login').css('display','block');
		},
		error: function(data) {
			console.log(data);
		}
	})
}

// HELPERS -------
// You can use these and modify them to fit your needs. 
// If you are going to use them, make sure you understand
// how they work!

// Helper - returns all elements in an array A, that are not in B
function diff(a, b) {
	var bIds = {}
	b.forEach(function(obj){
	    bIds[obj.id] = obj;
	});
	return a.filter(function(obj){
	    return !(obj.id in bIds);
	});
}

// Helper - scrolls to the bottom of the messages div
function scrollBottom(element, duration) {
	element.animate({ scrollTop: element[0].scrollHeight}, duration);
}

// Helper - turns JavaScript timestamp into something useful
function getReadableTime(stamp) {
	var time = new Date()
	time.setTime(stamp)
	return time.getMonth()+"/"+time.getDate()+" "+pad(time.getHours(),2)+":"+pad(time.getMinutes(),2);
}

// Helper - pads a number with zeros to a certain size. Useful for time values like 10:30.
function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

// Prints a useful error message to the console. Used when AJAX fails. A message can help us find the problem
function error(data, message) {
	console.log('Error '+message+': '+JSON.stringify(JSON.parse(data.responseText)))
}