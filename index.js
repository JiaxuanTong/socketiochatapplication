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
    let randomN = nameGenerator();
    currentUser.push(randomN);
    console.log('The given username is: User', randomN);
    console.log('now the current users are:');
    for(let i = 0; i < currentUser.length;i++){
        console.log(currentUser[i].name);
    }
    // userName = 'User'+randomN;
    socket.emit('connection', randomN);
    socket.emit('chat-log-history',chatLogHistory);
    io.emit('update-currentUser', currentUser);
    socket.on('disconnect', () => {
        console.log('user disconnected');
        currentUser.forEach((data)=>{
            if (data.name == randomN.name){
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
        let timeString = hours+':'+ mins+' ';
        let result = timeString +' '+ msg;
        chatLogHistory.push(result);
        if(chatLogHistory.length>200){
            chatLogHistory.shift();
        }
        // let result={
        //     time: timeString,
        //     user: msgData.name,
        //     msg: msgData.msg
        // }
        console.log('message: '+ result );
        io.emit('chat message', result);
    });
});
io.on('connection',(socket)=>{
    socket.on('update-usercolor',(tagColorMsg)=>{
        let userName = tagColorMsg.first;
        let newColor = tagColorMsg.second;
        console.log('User:', userName, 'send the request of change the usercolor to be: ', newColor);
        let valid = true;
        if(newColor.length != 6 || isNaN(newColor)===true){
            valid =  false;
        }
        if(valid === false){
            socket.emit('invalid-color-message', valid);
        }else if(valid === true){
            //delete the older userColor
            currentUser.forEach((data) => {
                if (data.name == userName) {
                    const index = currentUser.indexOf(data);
                    if (index > -1) {
                        currentUser[index].color = newColor;
                    }
                }
            })
            socket.emit('update-usercolor', newColor);
            io.emit('update-currentUser', currentUser);
        }
    })
})
io.on('connection', (socket) => {
    socket.on('update-username', (tagNameMsg) => {
        let userName = tagNameMsg.first;
        let newUserName = tagNameMsg.second;
        console.log('User:', userName, 'send the request of change the username to be: ', newUserName);
        let valid = true;
        let tooLong = false;
        if(newUserName.length>30){
            valid = false;
            tooLong = true;
        }
        currentUser.forEach((data) => {
            if (data.name == newUserName) {
                valid = false;
            }
        })
        if(tooLong === true){
            socket.emit('tooLong-username-message', tooLong);
        }
        if(valid === false){
            socket.emit('existing-username-message', valid);
        }
        else if (valid === true) {
            //delete the older username
            currentUser.forEach((data) => {
                if (data.name == userName) {
                    const index = currentUser.indexOf(data);
                    if (index > -1) {
                        currentUser[index].name = newUserName;
                    }
                }
            })
            socket.emit('update-username', newUserName);
            io.emit('update-currentUser', currentUser);
        }
    });
});
http.listen(3000, () => {
    console.log('listening on *:3000');
});

function nameGenerator(){
    // let result;
    // while(1){
    //     let uniqueNum = true;
    //     result = Math.floor(Math.random()*10000);
    //     for(let i = 0; i < currentUser.length; i++){
    //        if(result === currentUser[i]){
    //            uniqueNum = false;
    //            break;
    //        }
    //     }
    //     if(uniqueNum === true){
    //         break;
    //     }
    // }
    // return result;
    let result;
    while(1) {
        let uniqueName = true;
        let a = ["Smart", "Baby", "Lexi"];
        let b = ["Fruit", "Bear", "Cracker"];
        let rA = Math.floor(Math.random() * a.length);
        let rB = Math.floor(Math.random() * b.length);
        let nC = Math.floor(Math.random()*100);
        result = ''+ a[rA] + b[rB] + nC;
        for(let i = 0; i < currentUser.length; i++){
           if(result === currentUser[i].name){
               uniqueName = false;
               break;
           }
        }
        if(uniqueName === true){
            break;
        }
    }
    let userObject ={
        name: result,
        color: '000000',
    }
    return userObject;
}


