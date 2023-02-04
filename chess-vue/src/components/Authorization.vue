<template>
  <div>
    <Navbar></Navbar>
    <div v-if="isLoggining" class="divLog">
        <label>Логин</label>
        <input @input="login_enter = $event.target.value" v-bind:value="this.login_enter">
        <label>Пароль</label>
        <input @input="password_enter = $event.target.value" v-bind:value="this.password_enter">
        <div class="divButtons">
            <button style="width:50%" @click="changeStage">У вас ещё нет аккаунта?</button>
            <button type="button" @click="signIn" class="btn btn-success" style="width:50%">Войти</button>
        </div>
    </div>
    <div v-if="!isLoggining" class="divLog">
        <label>Логин</label>
        <input id="loginReg" @input="login_reg = $event.target.value" v-bind:value="this.login_reg">
        <label>Почта</label>
        <input @input="email = $event.target.value" v-bind:value="this.email">
        <label>Пароль</label>
        <input @input="password_reg = $event.target.value" v-bind:value="this.password_reg">
        <label>Подтверждение пароля</label>
        <input @input="confirmPassord_reg = $event.target.value" v-bind:value="this.confirmPassord_reg">
        <div class="divButtons">
            <button style="width:50%" @click="changeStage">У вас есть аккаунт?</button>
            <button type="button" class="btn btn-success" style="width:50%" @click="signUp">Зарегистрироваться</button>
        </div>
    </div>
  </div>
</template>

<script>
import Navbar from './Navbar.vue';
import { io } from 'socket.io-client';
export default {
    components: { Navbar },
    name: "athorization_page",
    data(){
        return{
            isLoggining: true,
            login_enter: "",
            password_enter: "",
            login_reg: "",
            password_reg: "",
            confirmPassord_reg: "",
            email: "",
        }
    },
    created(){
        this.socket = io("http://localhost:3000");
        this.socket.on('signUp', (data) => {
            if(data['status']){
                localStorage.login = this.login_reg;
                window.location.href = "/";
            }
            else{
                console.log('error');
            }
        })
        this.socket.on('signIn', (data) => {
            if(data['status']){
                localStorage.login = this.login_enter;
                window.location.href = "/";
            }
            else{
                console.log('error');
            }
        })
    },
    methods: {
        changeStage: function(){
            this.isLoggining = !this.isLoggining;
        },
        signUp: function(){
            // if(this.password_reg !== "" && this.email !== "" && this.login_reg !== "") return;
            // if(this.password_reg !== this.confirmPassord_reg) return;
            this.socket.emit('signUp', {login: this.login_reg, password: this.password_reg, email: this.email});
        },
        signIn: function(){
            this.socket.emit('signIn', {login: this.login_enter, password: this.password_enter});
        }
    }
}
</script>

<style>
    .divLog{
        position: absolute;
        top: 40%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
        width: 20%;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
    }
    .divButtons{
        padding-top: 15px;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }
</style>