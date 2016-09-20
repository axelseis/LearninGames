var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/index.html');
  //response.render('pages/index');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


