/*global io*/
let socket = io();

// Listen for user events (join/leave announcements)
socket.on('user', data => {
  $('#num-users').text(data.currentUsers + ' users online');
  let message =
    data.username +
    (data.connected ? ' has joined the chat.' : ' has left the chat.');
  $('#messages').append($('<li>').html('<b>' + message + '</b>'));
});

// Listen for chat messages
socket.on('chat message', data => {
  $('#messages').append($('<li>').html('<b>' + data.username + ':</b> ' + data.message));
});

$(document).ready(function () {
  // Form submittion with new message in field with id 'm'
  $('form').submit(function () {
    var messageToSend = $('#m').val();

    // Emit chat message to server
    socket.emit('chat message', messageToSend);

    $('#m').val('');
    return false; // prevent form submit from refreshing page
  });
});
