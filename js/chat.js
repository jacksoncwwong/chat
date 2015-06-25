// Initialize global user 
// (a good idea to store the information you need
// when sending messages here)
var CURRENT_USER = null;
var site = "http://chat-app.brainstation.io";
var chatDiv = $('.chat_client');
var username = "";
var currentMessages = [];
var loggedIn = false;
$('#signup a').click(function(){
	$('#signup').css('display','none');
	$('#login').css('display','block');
});

// sendMessage() sends a message to the API
function sendMessage() {
	event.preventDefault();
	var form = $('#entry');
	var input = $('#entry input');
	var entry = form.find('input[name="message"]').val();

	$.ajax({
		url: site + "/messages",
		type: "POST",
		data: {'userID':CURRENT_USER, 'message':entry},
		xhrFields: { withCredentials:true },
		success: function(data) {
			// the code below does not check for any new messages
			// $('.chat_client').append('<div class="message"><div class="user"><div class="user_img"><img src="img/minion.jpeg"></div><div class="username">' + data.username + '</div><div class="time">' + getReadableTime(data.timestamp) + '</div></div><div class="text"><p>' + data.message + '</p></div></div>');
			// currentMessages.push(data);
			updateMessages();
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

// parameters for sorting array of messages based on timestamp
function sortTime(a, b){
	var aTime = a.timestamp;
	var bTime = b.timestamp; 
	if (aTime < bTime) {
		return -1;
	}
	else {
		return 1;
	}
}

// getMessages() gets all messages from the API.
// we can use diff() to get only the new ones.
function getMessages() {
	event.preventDefault();

	$.ajax({
		url: site + "/messages",
		type: "GET",
		success: function(data) {
			data.sort(sortTime);
			currentMessages = data;

			data.forEach(function(element) {
				$('.chat_client').append('<div class="message"><div class="user"><div class="user_img"><img src="img/minion.jpeg"></div><div class="username">' + element.username + '</div><div class="time">' + getReadableTime(element.timestamp) + '</div></div><div class="text"><p>' + element.message + '</p><a class="delete btn" href="#">Delete</a><div class="messageID">' +element.id+ '</div></div>');
			});
			$('.delete').click(function(event){ //binding listener to delete class
				var test = $(event.target);
				console.log(test);
				var deleteID= $(event.target).closest('.messageID');
				console.log(deleteID);
				// delete(deleteID);
			});
			scrollBottom(chatDiv, 1000);
		},
		error: function(data) {
			console.log(data);
		}
	});
}

// delete() deletes the message
// function delete(deleteID) {
// 	event.preventDefault();

// 	$.ajax({
// 		url: site + "/messages/" + deleteID,
// 		type: "DELETE",
//		xhrFields: { withCredentials:true },
		// success: function() {
			
		// },
		// error: function() {
			
		// }
// 	});
	
// }



// login() logs in a user by creating a session
function login() {
	event.preventDefault();
	var form = $('#login');
	username = form.find('input[name="username"]').val();

	$.ajax({
		url: site + "/users/login",
		type: "POST",
		data: form.serialize(),
		xhrFields: { withCredentials:true },
		success: function(data) {
			CURRENT_USER = data.uid;
			$('#login').css('display','none');
			$('.username').html('Username: ' + username + '<div><a href="#" id="logout" class="btn">Log Out</a></div');
			$('#logout').click(function(event){
				logout();
			});
			$('.username').css('display','inline-block');
			getMessages();
			loggedIn = true;
		},
		error: function(data) {
			console.log(data);
		}
	});
}
$('#login').on('submit', function(event){
	login();
});

setInterval(function() { //this is going to run updateMessages every 2 seconds
		updateMessages();
}, 2000);


// logout() logs out a user
function logout() {
	event.preventDefault();

	$.ajax({
		url: site + "/users/logout",
		type: "POST",
		xhrFields: { withCredentials:true },
		success: function() {
			console.log('logged out');
			CURRENT_USER = "";
			$('.username').css('display','none');
			$('#signup').css('display','block');
			$('.chat_client').html('');
		},
		error: function() {
		}
	});
}


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
			$('#signup').css('display','none');
			$('#login').css('display','block');
		},
		error: function(data) {
			console.log(data);
		}
	});
}
$('#signup').on('submit', function(event){
	signup();
});

// updateMessages() checks current array of messages and compares it 
//to array of messages on server, and will rewrite if array is completely different, 
//or write in new messages
function updateMessages() {
	if (loggedIn === true) {
		$.ajax({
			url: site + "/messages",
			type: "GET",
			success: function(data) {
				var diffMessages = diff(data, currentMessages);
				if (diffMessages.length > 0) {
					currentMessages.sort(sortTime);
					var currentLength = currentMessages.length - 1;
					if (diffMessages[0].timestamp < currentMessages[currentLength].timestamp) {
						console.log("this is rewrite");
						getMessages();
					}
					else {
						for (var i=0; i<diffMessages.length; i++) {
							console.log("no rewrite");
							$('.chat_client').append('<div class="message"><div class="user"><div class="user_img"><img src="img/minion.jpeg"></div><div class="username">' + diffMessages[i].username + '</div><div class="time">' + getReadableTime(diffMessages[i].timestamp) + '</div></div><div class="text"><p>' + diffMessages[i].message + '</p><a class="delete btn" href="#">Delete</a><div class="messageID">' +diffMessages[i].id+ '</div></div>');
							currentMessages.push(diffMessages[i]);
							scrollBottom(chatDiv, 1000);
						}
					}
				}
			},
			error: function(data) {
				console.log(data);
			}
		});
	}
}

$('#testingUpdate').click(function(event){
	updateMessages();
})

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

function scrollUpdate(element, duration) {
	var scrollStart = element.length - 1;
	element.animate({ scrollTop: element[scrollStart].scrollHeight}, duration);
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