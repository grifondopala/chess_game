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

    socket.on('getGamesList', () =>{
        usersInMain.push(socket.id);
        io.to(socket.id).emit('getGamesList', visibleServers);
    })
    
    socket.on('createGame', (data) =>{
        var color = Math.floor(Math.random() * 2) == 0 ? 'White' : 'Black'; 
        if(color === 'White') servers.push({id: servers.length + 1, white: data});
        else servers.push({id: servers.length + 1, black: data});
        if(visibleServers.length < 10) visibleServers.push({id: servers.length, name: data['name'], color: color == "White" ? "Black" : "White"});
        io.to(socket.id).emit('createGame', {id: servers.length, color: color});
        sendGames();
    })

    socket.on('enterGame', (data) => {
        let index = servers.findIndex((server) => server.id == data['id_game']);
        let value = {name: data['name'], socket_id: socket.id};
        if(servers[index].white != undefined) {
            servers[index].black = value;
            io.to(servers[index]['white'].socket_id).emit('SecondPlayerConnected', {nickname: data['name']});
        }
        else{ 
            servers[index].white = value;
            io.to(servers[index]['black'].socket_id).emit('SecondPlayerConnected', {nickname: data['name']});
        }
        visibleServers.splice(visibleServers.findIndex((server) => server.id == data['id_game']), 1);
        sendGames();
    })

    socket.on('connectionGame', (data) => {
        let index = servers.findIndex((server) => server.id == data['id_game']);
        servers[index][data['color'].toLowerCase()].socket_id = socket.id;
    })

    socket.on('makingStep', (data) => {
        let server = servers[servers.findIndex((server) => server.id == data['id_game'])];
        if(data['color'] === 'White') 
            io.to(server['black'].socket_id).emit('makingStep', {indexFirst: data['indexFirst'], indexSecond: data['indexSecond']});
        else 
            io.to(server['white'].socket_id).emit('makingStep', {indexFirst: data['indexFirst'], indexSecond: data['indexSecond']});
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
            io.to(socket.id).emit('signUp', {status: false, error: 'login'})
            return
        }

        query = `SELECT * FROM users WHERE email = \'${data['email']}\';`;
        result = await check(query);
        if(!result){
            io.to(socket.id).emit('signUp', {status: false, error: 'email'})
            return
        }     
        
        query = `INSERT INTO users(login, email, password, rating, games, wins) 
                 VALUES (\'${data['login']}\',\'${data['email']}\',\'${data['password']}\',\'1000\', \'0\', \'0\');`;
        conn.query(query, (err, result, field) =>{
            io.to(socket.id).emit('signUp', {status: true})
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
        io.to(socket.id).emit('signIn', {status: result});
    })

    socket.on('disconnect', function () {
        let index = usersInMain.indexOf(socket.id);
        if(index != -1) usersInMain.splice(index, 1);
    })

    socket.on('getStatistic', async function(data){
        let query = `SELECT * FROM users WHERE login = \'${data['login']}\';`;
        let promise = new Promise(function(resolve, reject) {
            let user;
            conn.query(query, (err, result, field) =>{
                user = result[0];
            })
            setTimeout(() => resolve(user), 100);
        });
        let user = await promise;
        io.to(socket.id).emit('getStatistic', {rating: user.rating, games: user.games, wins: user.wins});
    })

    socket.on('changePassword', (data) => {
        let query = `UPDATE \`users\` SET \`password\`=\'${data.password}\' WHERE \`login\`=\'${data.login}\';`;
        conn.query(query, (err, result, field) =>{ })
    })

    socket.on('getTop', async function(){
        let query = `SELECT * FROM \`users\` ORDER BY \`rating\` DESC LIMIT 10;`;
        let promise = new Promise(function(resolve, reject) {
            let array = [];
            conn.query(query, (err, result, field) =>{
                for(let user of result) array.push({login: user.login, rating: user.rating, games: user.games, wins: user.wins})
            })
            setTimeout(() => resolve(array), 100);
        });
        let array = await promise;
        io.to(socket.id).emit('getTop', array);
    })

})

http.listen(3000, () => {
    console.log('listening on *:3000');
});


