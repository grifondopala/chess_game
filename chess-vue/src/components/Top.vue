<template>
  <div>
    <Navbar></Navbar>
    <div id="topUsers">
      <div id="titleList">
        <strong>Топ пользователей по рейтингу</strong>
      </div>
      <table border="0" style="background-color: white;">
        <tr>
          <th>Логин</th>
          <th>Рейтинг</th>
          <th>Игр</th>
          <th>Побед</th>
        </tr>        
        <tr v-for="user in topUsers" v-bind:key="user.login">
          <td>{{user.login}}</td>
          <td>{{user.rating}}</td>
          <td>{{user.games}}</td>
          <td>{{user.wins}}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import Navbar from './Navbar.vue';
import { io } from 'socket.io-client';
export default {
    components: {Navbar},
    name: 'top_page',
    data(){
      return{
        // eslint-disable-next-line
        topUsers: [],
      }
    },
    created(){
      this.socket = io("http://localhost:3000");
      this.socket.on('connect', () => {
        this.socket.emit('getTop');
      })
      this.socket.on('getTop', (data) =>{
        this.$data.topUsers = data;
      })
    },
}
</script>

<style>
  #topUsers{
        position: relative;
        margin-top: 70px;
        left: 30%;
        width: 35%;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
  }
  #titleList{
        text-align: center;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        height: 40px;
        background-color: white;
  }
  th{
    text-align: center;
    margin-top: 15px;
  }
  td{
    text-align: center;
  }
</style>