const app = require('express')();
const http = require('http').createServer(app);
const mysql = require('mysql');

let servers = [];
let usersInMain = [];
let visibleServers = [];


const io = require('socket.io')(http, {
    cors: {
      origins: ['http://localhost:8080']
    }
});

const conn = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "chess",
  })
  
  conn.connect( err =>{
    if(err){
      console.log(err);
      return err;
    }else{
      console.log('Database is OK ----------');
    }
  })

io.on('connection', (socket) => {

    function sendGames(){
        for(let user of usersInMain){
            io.to(user).emit('getGamesList', visibleServers);
        }
    }

    socket.on('getGamesList', (data) =>{
        usersInMain.push(data['socket_id']);
        let array = [];
        for(let i = 0; i < 10; i++){
            if(i >= servers.length) break;
            array.push({id: servers[i][0], name: servers[i][1].name, color: servers[i][1].color == 'Black' ? 'White' : 'Black'});
        }
        io.to(data['socket_id']).emit('getGamesList', array);
    })
    
    socket.on('createGame', (data) =>{
        var color = Math.floor(Math.random() * 2) == 0 ? "White" : "Black"; 
        data.color = color;
        servers.push([servers.length + 1, data]);
        if(visibleServers.length < 10) visibleServers.push({id: servers.length + 1, name: data['name'], color: color == "White" ? "Black" : "White"});
        io.to(data['socket_id']).emit('createGame', {id: servers.length, color: color});
        sendGames();
    })

    socket.on('enterGame', (data) => {
        //console.log(servers.findIndex((server) => server.id == data['game_id']));
        for(let element of servers){
            if (element.length == 2){
                var color = element[1].color == "Black" ? "White" : "Black";
                data.color = color;
                element.push(data);
                let returnedData = {id: element[0], 
                                    nicknameWhite: element[1]['color'] === "White" ? element[1]['name'] : data['name'],
                                    nicknameBlack: element[1]['color'] === "Black" ? element[1]['name'] : data['name'], 
                                    color: color};
                io.to(data['socket_id']).emit('enterGame', returnedData);
                io.to(element[1]['socket_id']).emit('SecondPlayerConnected', {nickname: data['name']});
                break;
            }
        }
    })

    socket.on('connectionGame', (data) => {
        for(let element of servers){
            if (element[0] === parseInt(data['id'])){
                for(var i = 1; i < element.length; i++){
                    if(element[i]['color'] === data['color']) element[i]['socket_id'] = data['socket_id'];
                }
                break;
            }
        }
    })

    socket.on('makingStep', (data) => {
        // let server = servers[servers.findIndex((server) => server.id == data['game_id'])];
        // console.log(server);
        for(let element of servers){
            if (element[0] === parseInt(data['id'])){
                for(var i = 1; i < element.length; i++){
                    if(!(element[i]['color'] === data['color'])){
                        io.to(element[i]['socket_id']).emit('makingStep', {indexFirst: data['indexFirst'], indexSecond: data['indexSecond']});
                    }
                }
                break;
            }
        }
    })

    socket.on('signUp', async function(data){
        
        async function check(sql){
            let promise = new Promise(function(resolve, reject) {
                let value = true;
                conn.query(sql, (err, result, field) =>{
                    if(result.length != 0) value = false;
                })
                setTimeout(() => resolve(value), 100);
            });
            return await promise;
        }
        
        let query = `SELECT * FROM users WHERE login = \'${data['login']}\';`;
        let result = await check(query);
        if(!result){
            io.to(data['socket_id']).emit('signUp', {status: false, error: 'login'})
            return
        }

        query = `SELECT * FROM users WHERE email = \'${data['email']}\';`;
        result = await check(query);
        if(!result){
            io.to(data['socket_id']).emit('signUp', {status: false, error: 'email'})
            return
        }     
        
        query = `INSERT INTO users(login, email, password, rating, games, wins) 
                 VALUES (\'${data['login']}\',\'${data['email']}\',\'${data['password']}\',\'1000\', \'0\', \'0\');`;
        conn.query(query, (err, result, field) =>{
            io.to(data['socket_id']).emit('signUp', {status: true})
        })

    })

    socket.on('signIn', async function(data){
        let query = `SELECT * FROM users WHERE login = \'${data['login']}\' AND password = \'${data['password']}\';`;
        let promise = new Promise(function(resolve, reject) {
            let value = true;
            conn.query(query, (err, result, field) =>{
                if(result.length == 0) value = false;
            })
            setTimeout(() => resolve(value), 100);
        });
        let result = await promise;
        io.to(data['socket_id']).emit('signIn', {status: result});
    })

    socket.on('disconnect', function () {
        let index = usersInMain.indexOf(socket.id);
        if(index != -1) usersInMain.splice(index, 1);
    })

})

http.listen(3000, () => {
    console.log('listening on *:3000');
});


