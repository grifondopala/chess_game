<template>
  <div>
    <Navbar></Navbar>
    <div id="mainDiv">
      <div id='letters' v-if="this.myColor === 'Black'">
        <div v-for="letter in 'abcdefgh'" v-bind:key="letter" class="letter">
          {{letter}}
        </div>
      </div>

      <div id='letters' v-if="this.myColor === 'White'">
        <div v-for="letter in 'hgfedcba'" v-bind:key="letter" class="letter">
          {{letter}}
        </div>
      </div>

      <div id='numbers'>
        <div v-for="number in '12345678'" v-bind:key="number" class="letter">
          {{this.myColor === "Black" ? number : 9 - parseInt(number)}}
        </div>
      </div>

      <div id="chessBoard">
          <div v-for="place in placesArr" v-bind:key="place.index()">
            <div class="place" v-bind:style="[(place.row + place.column) % 2 == 0 ? {'background': 'brown', 'position': 'relative'} : {'background': 'white', 'position': 'relative'}]" @click="Walk (place)">
              <img v-if = " !(place.getImageSrc() === 'EmptyPlace') " :src = "place.getImageSrc()" class="figureImage"/>
              <div class="circle" v-if="place.isSelected"></div>
            </div>
          </div>
      </div>
    </div>
    <div id="information">
      <div class="player">
        <p style="margin-top: 10px;" v-text="this.myColor === 'Black' ? this.nicknameWhite : this.nicknameBlack"></p>
        <p v-text="this.myColor === 'Black' ? this.timeWhite : this.timeBlack"></p>
      </div>
      <div class="player">
        <p style="margin-top: 205px;" v-text="this.myColor === 'Black' ? this.timeBlack : this.timeWhite"></p>
        <strong style="margin-top: 15px;" v-text="this.myColor === 'Black' ? this.nicknameBlack + ' (Вы)' : this.nicknameWhite + ' (Вы)' "></strong>
      </div>
    </div>
  </div>
</template> 

<script>
import * as figures from "../scripts/figures"
import { io } from 'socket.io-client';
import Navbar from './Navbar.vue';
import _ from 'lodash'

export default {
  name: "game_chess",
  components: { Navbar },
  data() {
    return {
      placesArr: figures.CreatePlacesArray(),
      isMyStep: true,
      myColor: localStorage.myColor,
      selectedFigure: null,
      nicknameWhite: localStorage.nicknameWhite,
      nicknameBlack: localStorage.nicknameBlack,
      timeWhite: "0:4:00",
      timeBlack: "0:4:00",
    }
  },
  created(){

     if(this.myColor === "Black") this.isMyStep = false;
     else this.placesArr.reverse(); 
     this.isStarted = (localStorage.isStarted === 'true');

     this.socket = io("http://localhost:3000");
     this.socket.on('SecondPlayerConnected', (data) => {
        if(this.myColor === "White") this.nicknameBlack = data['nickname'];
        else this.nicknameWhite = data['nickname'];
        this.isStarted = true;
     })
     this.socket.on('connect', () => {
        this.socket.emit('connectionGame', {id_game: this.$route.params.id , color: this.myColor, socket_id: this.socket.id})
     });
     this.socket.on('makingStep', (data) => {
        var indexFirst = 63 - data['indexFirst'];
        var indexSecond = 63 - data['indexSecond'];
        let positionFirst = [this.placesArr[indexFirst].row, this.placesArr[indexFirst].column];
        let positionSecond = [this.placesArr[indexSecond].row, this.placesArr[indexSecond].column];
        this.placesArr[indexFirst] = this.placesArr[indexSecond];
        this.placesArr[indexFirst].changePosition(positionFirst[0], positionFirst[1])
        this.placesArr[indexSecond] = new figures.EmptyPlace(positionSecond[0], positionSecond[1]);
        this.isMyStep = true;

        let eAttackedPlaces = figures.FindEnemyPlaces(this.placesArr, this.myColor);
        let myKing = this.placesArr.find((element) => element.constructor.name === 'King' && element.color === this.myColor);
        if(_.findIndex(eAttackedPlaces, myKing) !== -1){
          this.isCheck = true;
          //фукнция, проверяющая есть ли возможности спастись от шаха
        }
       })

     let timeWhite = 240;
     let timeBlack = 240;
     this.timer = setInterval(() => {
      if(this.isStarted){
        if(timeWhite < 0 || timeBlack < 0) clearInterval(this.timer);
        if((this.myColor === 'White' && this.isMyStep) || (this.myColor === "Black" && !this.isMyStep)){
          this.timeWhite = `${Math.trunc(timeWhite/60/60%60)}:${Math.trunc(timeWhite/60%60)}:${timeWhite%60 < 10 ? '0' + timeWhite%60 : timeWhite%60}`;
          --timeWhite;
        }else{
          this.timeBlack = `${Math.trunc(timeBlack/60/60%60)}:${Math.trunc(timeBlack/60%60)}:${timeBlack%60 < 10 ? '0' + timeBlack%60 : timeBlack%60}`;
          --timeBlack;
        }
      }
     }, 1000);
  },
  methods: {
    Walk: function (figure){


      function swapPlaces(self){
        let array = Array.from(self.placesArr)
        var indexFirst = figure.index(self.myColor);
        var indexSecond = self.selectedFigure.index(self.myColor);
        let positionFirst = [array[indexFirst].row, array[indexFirst].column];
        let positionSecond = [array[indexSecond].row, array[indexSecond].column];
        array[indexFirst] = array[indexSecond];
        array[indexFirst].changePosition(positionFirst[0], positionFirst[1])
        array[indexSecond] = new figures.EmptyPlace(positionSecond[0], positionSecond[1]);
        array[indexFirst].isMoved = true;
        return array;
      }


      if((this.selectedFigure === null || this.selectedFigure.color === this.myColor) && !(figure.constructor.name === "EmptyPlace") && figure.color === this.myColor && this.isMyStep && this.isStarted){
        for(let element of this.placesArr) element.isSelected = false;
        this.placesArr = figure.findPlaces(this.placesArr);
        this.selectedFigure = figure;
      }else if(figure.isSelected){
        let array = swapPlaces(this);
        if(this.isCheck){
          let eAttackedPlaces = figures.FindEnemyPlaces(array, this.myColor);
          let myKing = array.find((element) => element.constructor.name === 'King' && element.color === this.myColor);
          if(_.findIndex(eAttackedPlaces, myKing) === -1){
            this.isCheck = false;
          }
          else return;
        }
        var indexFirst = figure.index(this.myColor);
        var indexSecond = this.selectedFigure.index(this.myColor);
        // let positionFirst = [this.placesArr[indexFirst].row, this.placesArr[indexFirst].column];
        // let positionSecond = [this.placesArr[indexSecond].row, this.placesArr[indexSecond].column];
        // this.placesArr[indexFirst] = this.placesArr[indexSecond];
        // this.placesArr[indexFirst].changePosition(positionFirst[0], positionFirst[1])
        // this.placesArr[indexSecond] = new figures.EmptyPlace(positionSecond[0], positionSecond[1]);
        // this.placesArr[indexFirst].isMoved = true;
        this.placesArr = array;
        this.selectedFigure = null;
        this.isMyStep = false;
        for(let element of this.placesArr) element.isSelected = false;
        this.socket.emit('makingStep', {id_game: this.$route.params.id, color: this.myColor, indexFirst: indexFirst, indexSecond: indexSecond});
      }
    },

  }
}
</script>

<style>
  body{
    background-color: #F4F4F5;
    margin: 0;
    padding: 0;
  }
  #letters
  {
    position: absolute;
    width:320px;
    height: 40px;
    margin-left: 40px;
  }
  #numbers
  {
    position: absolute;
    width:40px;
    height: 320px;
    margin-top: 40px;
  }
  #chessBoard
  {
    position: absolute;
    width:320px;
    height:320px;
    border:1px solid black;
    margin-left: 40px;
    margin-top: 40px;
  }
  .place
  {
    width:39.7px;
    height:40px;
    float:left;
  }
  .letter
  {
    width: 40px;
    height: 40px;
    text-align: center;
    font-size: 24px;
    float: left;
  }
  .figureImage
  {
    width: 40px;
    height: 40px;
  }
  #mainDiv{
    position: absolute;
    top: 20%;
    left: 35%;
    margin-right: -75%;
    transform: translate(-25%, -25%);
    -moz-user-select: none;
    -khtml-user-select: none;
    user-select: none;   
  }
  #information{
    position: absolute;
    width: 10%;
    height: 60%;
    top: 40%;
    left: 65%;
    margin-right: -75%;
    transform: translate(-25%, -25%);
    -moz-user-select: none;
    -khtml-user-select: none;
    user-select: none;
  }
  .circle {
      position: absolute;
      top: 50%;
      left: 50%;
      margin-right: -50%;
      transform: translate(-50%, -50%);
      width: 25px;
      height: 25px;
      -webkit-border-radius: 25px;
      -moz-border-radius: 25px;
      border-radius: 25px;
      background: rgb(0, 255, 0);
      opacity: 0.7;
    }
    .player{
      background-color: white;
      border-radius: 5px;
      text-align: center;
    }
</style>
