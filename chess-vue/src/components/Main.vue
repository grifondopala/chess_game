<template>
    <div>
        <Navbar></Navbar>
        <div id="gamesList">
            <div id="titleList">
                <strong style="position: absolute; left: 10px; top: 8px;">Ожидают игру</strong>
                <button id="createButton" class="btn btn-success" @click="createGame()">Создать</button>
            </div>
            <div>
                <div v-if="gamesList.length == 0" class="game" style="text-align:  center; height: 36px;">
                    <label style="margin-top: 4px;">Список игр пуст, создайте свою игру!</label>
                </div>
                <div v-for="game in gamesList" v-bind:key="game.id" class="game">
                    <span style="position: absolute; top: 2px; left: 10px;">Противник: {{game.name}}</span>
                    <span style="position: absolute; top: 26px; left: 10px; bottom: 2px;">Ваш цвет: {{game.color === 'White' ? 'Белый' : 'Чёрный'}} </span>
                    <button class="enterButton btn btn-primary" @click="enterGame(game.id)">Присоединиться</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { io } from 'socket.io-client';
import Navbar from './Navbar.vue';

export default {
    components: { Navbar },
    name: "main_page",
    data(){
        return{
            gamesList: [],
        }
    },
    created(){
        this.socket = io("http://localhost:3000");
        this.socket.on('connect', () => {
            this.socket.emit('getGamesList');    
        })
        this.socket.on('createGame', (data) => {
            this.$router.push({ name: 'game', 
                                params: {id: data['id']}
                            });
            localStorage.nicknameWhite = data['color'] === 'White' ? localStorage.login : 'Ждём игрока';
            localStorage.nicknameBlack = data['color'] === 'Black' ? localStorage.login : 'Ждём игрока';
            localStorage.myColor = data['color'];
            localStorage.isStarted = false;
        })
        this.socket.on('getGamesList', (data) => {
            this.$data.gamesList = data;
        })
    },
    methods: {
        createGame: function(){
            let data = {name: localStorage.login};
            this.socket.emit("createGame", data);
        },
        enterGame: function(id){
            let data = {name: localStorage.login, id_game: id};
            this.socket.emit("enterGame", data);
            let server = this.gamesList[this.gamesList.findIndex((server) => server.id == id)];
            this.$router.push({ name: 'game', 
                    params: {id: id}, });
            localStorage.nicknameWhite = server.color == "White" ? localStorage.login : server.name;
            localStorage.nicknameBlack = server.color == "Black" ? localStorage.login : server.name;
            localStorage.myColor = server.color;
            localStorage.isStarted = true;
        },
        nameInput: function(event){
            this.name = event.target.value;
        }
    },
}
</script>

<style scoped>
    #gamesList{
        position: relative;
        margin-top: 50px;
        left: 35%;
        width: 30%;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
    }
    #titleList{
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        height: 40px;
        background-color: white;
    }
    #createButton{
        position: absolute; 
        right: 10px; 
        top: 5px; 
        height: 30px; 
        display: flex; 
        align-items: center; 
        justify-content: center;
    }
    .game{
        position: relative;
        background-color: white;
        margin-top: 1px;
        height: 54px;
    }
    .enterButton{
        position: absolute;
        font-size: 12px; 
        right: 10px; 
        top: 12px; 
        height: 30px; 
        display: flex; 
        align-items: center; 
        justify-content: center;
    }
</style>