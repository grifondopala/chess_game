<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light" style="background-color: white;">
        <div class="container-fluid">
            <a class="navbar-brand" href="/">Chess :)</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavDropdown">
            <ul class="navbar-nav">
                <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="/">На главную</a>
                </li>
                <li class="nav-item">
                <a class="nav-link" href="/top">Топ</a>
                </li>
                <li class="nav-item" v-if="!isLogined">
                    <a class="nav-link" href="/login">Войти</a>
                </li>
                <li class="nav-item" v-if="isLogined">
                    <a class="nav-link" href="/myProfile">Мой профиль</a>
                </li>
            </ul>
            </div>
        </div>
    </nav>
  </div>
</template>

<script>
export default {
    name: "navbar_com",
    data(){
        return {
            isLogined: false,
        }
    },
    created(){
        if(localStorage.login){
            this.isLogined = true;
        }    
    }
}
</script>

<style>

</style>