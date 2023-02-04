<template>
  <div>
    <Navbar></Navbar>
    <div id="mainDiv">
        <div style="background-color: white; border-top-left-radius: 5px; border-top-right-radius: 5px; margin-top: 70px;">
          <h5 style="text-align: center">Профиль пользователя</h5>
          <h4 style="text-align: center">{{login}}</h4>
        </div>
        <div style="margin-top: 5px; background-color: white; display: flex; flex-direction: column; flex-wrap: wrap;">
          <strong style="margin-left: 20px; margin-top: 5px;">Статистика</strong>
          <label style="margin-left: 20px;">Количество игр: {{games}}</label>
          <label style="margin-left: 20px;">Побед: {{wins}}</label>
          <label style="margin-left: 20px; margin-bottom: 5px;">Рейтинг: {{rating}}</label>
        </div>
        <div style="margin-top: 5px; background-color: white; display: flex; flex-direction: column; flex-wrap: wrap;">
          <strong style="margin-left: 20px; margin-top: 5px;">Изменить пароль</strong>
          <div style="margin-left: 20px; margin-top: 5px;">
            <label>Новый пароль:</label>
            <input style="margin-left: 21px;" v-bind:value="password" @input="password = $event.target.value">
          </div>
          <div style="margin-left: 20px; margin-top: 5px;">
            <label>Подтверждение:</label>
            <input style="margin-left: 10px;" v-bind:value="confirmPassword" @input="confirmPassword = $event.target.value">
          </div>
          <button type="button" class="btn btn-success" style="width:25%; margin-left: 20px; margin-top: 5px; margin-bottom: 5px;" @click="changePassword">Изменить</button>
        </div>
    </div>
  </div>
</template>

<script>
import Navbar from './Navbar.vue';
import { io } from 'socket.io-client';
export default {
    components: {Navbar},
    data(){
      return{
        login: localStorage.login,
        games: 0,
        wins: 0,
        rating: 0,
        password: "",
        confirmPassword: "",
      }
    },
    created(){
      this.socket = io("http://localhost:3000");
      this.socket.on('connect', () =>{
        this.socket.emit('getStatistic', {login: this.login});
      })
      this.socket.on('getStatistic', (data)=>{
        this.$data.games = data.games;
        this.$data.wins = data.wins;
        this.$data.rating = data.rating;
      })
    },
    methods: {
      changePassword: function(){
        this.socket.emit('changePassword', {login: this.login, password: this.password})
      },
    }
}
</script>

<style>
  #mainDiv{
        position: relative;
        margin-top: 70px;
        left: 37%;
        width: 50%;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
  }
</style>