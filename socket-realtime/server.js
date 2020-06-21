// server.js

var express = require('express');
var app = express();
var http = require('http').Server(app); 
var io = require('socket.io')(http);    
var path = require('path');

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {  
  res.render('chat');  // 루트 페이지로 접속시 chat.pug 렌더링
});

var count=1; 
io.on('connection', function(socket){  // 채팅방에 접속했을 때 - 1
	console.log('user connected: ', socket.id);  // 사용자를 구별하는 socket.id
	var name = "익명" + count++;	// 변수 name에 닉네임 넣어주기
	socket.name = name;	// 닉네임이 변경될 때 비교해주기 위한 값으로 socket.name에 name을 넣어줌
	io.to(socket.id).emit('create name', name);	// io.to(socket.id).emit은 서버가 해당 socket id에만 이벤트를 전달함. 채팅방에 접속한 유저마다 닉네임이 다른데, 모두 바뀌지 않고 각 유저에게만 닉네임이 보여지기 위해 io.to(socket.id).emit을 이용해서 create name이라는 이벤트를 발생시켜준다
	io.emit('new_connect', name);
	
	socket.on('disconnect', function(){   // 채팅방 접속이 끊어졌을 때 - 2
		console.log('user disconnected: '+ socket.id + ' ' + socket.name);	// 접속한 사용자가 채팅방을 나가면, "user disconnected"라는 말과 함께 socket.id와 socket.name을 서버 콘솔에 찍어준다
		io.emit('new_disconnect', socket.name);
	});

	socket.on('send message', function(name, text){  // 메세지를 보냈을 때 - 3 
		var msg = name + ' : ' + text; // 사용자가 전송 버튼을 눌러서 메세지를 보냈을 경우, 채팅방에 출력해줄 메세지를 msg 변수에 넣어준다. 여기서는 닉네임과 메세지를 합쳐준다
		if (name != socket.name) {
			socket.name = name;
			io.emit('change name', socket.name, name);
			io.emit('receive message', msg); //  receive message 라는 이벤트를 발생시키고 메세지를 전달해 준다
		} else {
			console.log(msg); // 서버 콘솔에 메세지를 출력
			io.emit('receive message', msg); //  receive message 라는 이벤트를 발생시키고 메세지를 전달해 준다
		}
	});
	
});

http.listen(3000, function(){ 
	console.log('server on..');
});