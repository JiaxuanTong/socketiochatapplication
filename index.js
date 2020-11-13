var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var currentUser = [];
let chatLogHistory = new Array();
app.get('/', (req, res) => {
    // res.send('<h1>Hello world</h1>');
    res.sendFile(__dirname + '/index.html');
});
// io.on('connection', (socket) => {
//     console.log('a user connected');
// });
io.on('connection', (socket) => {
    console.log('a user connected');
    let randomN = numberGenerator();;
    currentUser.push(randomN);
    console.log('The given username is: User', randomN);
    console.log('now the current users are:');
    for(let i = 0; i < currentUser.length;i++){
        console.log(currentUser[i]);
    }
    // userName = 'User'+randomN;
    socket.emit('connection', randomN);
    socket.emit('chat-log-history',chatLogHistory);
    io.emit('update-currentUser', currentUser);
    socket.on('disconnect', () => {
        console.log('user disconnected');
        currentUser.forEach((data)=>{
            if (data == randomN){
                const index =  currentUser.indexOf(data);
                if (index > -1) {
                    currentUser.splice(index, 1);
                }
            }
        })
        console.log('The disconnected user is is: User', randomN);
        console.log('now the current users are:');
        for(i = 0; i < currentUser.length;i++){
            console.log(currentUser[i]);
        }
        io.emit('update-currentUser', currentUser);
    });
});
io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        let d =  new Date();
        let mins;
        let hours;
        let userName;
        if(d.getMinutes()<10)
            mins ='0'+ d.getMinutes();
        else
            mins = d.getMinutes();
        if(d.getHours()<10)
            hours ='0'+ d.getHours();
        else
            hours = d.getHours();
        let timeString = hours+':'+ mins+' : ';
        let result = timeString +' '+ msg;
        console.log('message: '+ result );
        chatLogHistory.push(result);
        if(chatLogHistory.length>200){
            chatLogHistory.shift();
        }
        io.emit('chat message', result);
    });
});
http.listen(3000, () => {
    console.log('listening on *:3000');
});

function numberGenerator(){
    let result;
    while(1){
        let uniqueNum = true;
        result = Math.floor(Math.random()*100);
        for(let i = 0; i < currentUser.length; i++){
           if(result === currentUser[i]){
               uniqueNum = false;
               break;
           }
        }
        if(uniqueNum === true){
            break;
        }
    }
    return result;
}


