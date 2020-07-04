var imgLogo = "../img/logo.png";

//Components
Vue.component("login", {

    methods: {
      signIn: function() {
        this.$emit("sign-in");
      }
    },
    props: ["imgLogo"],
    template:
    `<div class="form">
      <img v-bind:src="imgLogo"> 
      <br>
      <form action="/login" method="post">
        <label for='user'><b>Usuario</b></label> 
        <br>
        <input type='text' placeholder='Introduce tu nombre de usuario' name='userName' required>
        <br>
        <br>
  
        <label for='password'><b>Contraseña</b></label>
        <br>
        <input type='password' placeholder='Introduce tu contraseña' name='password' required>
        <br>
        <br>
  
        <button type='submit'>Iniciar Sesión</button>   
        <br>
        <br>
          | <br>
          O <br>
          | <br>
          <br>
        <button v-on:click="signIn()">Regístrate</button>
  
  
      </form>
  
    </div>`
  
  });
Vue.component("signin", {
    data: function() {
      return {
        password: null,
        passwordAgain: null,
        disableSignIn: false,
      }
    },
    watch: {
      passwordAgain: function() {
        if(this.password != this.passwordAgain) { this.disableSignIn = true; }
        else { this.disableSignIn = false;}
      },
      password: function() {
        if(this.password != this.passwordAgain) { this.disableSignIn = true; }
        else { this.disableSignIn = false;}
      },
    },
    methods: {
      logIn: function() {
        this.$emit("log-in");
      }
    },
    props: ["imgLogo"],
    template:
    `<div class="form">
      <img v-bind:src="imgLogo"> 
      <br>
      <form action="/signin" method="post">
        <label for='user'><b>Usuario</b></label> 
        <br>
        <input type='text' placeholder='Introduce tu nombre de usuario' name='userName' required>
        <br>
        <br>
  
        <label for='password'><b>Contraseña</b></label>
        <br>
        <input v-model="password" type='password' placeholder='Introduce tu contraseña' name='password' required>
        <br>
        <br>
        <label for='password'><b>Repite la contraseña</b></label>
        <br>
        <input v-model="passwordAgain" type='password' placeholder='Vuelve a introducir tu contraseña' name='passwordAgain' required>
        <br>
        <br>
        <p v-if="disableSignIn">Las contraseñas no coinciden</p>
  
        <button v-bind:disabled="disableSignIn" type='submit'>Regístrate</button>   
        <br>
        <br>
          | <br>
          O <br>
          | <br>
          <br>
        <button v-on:click="logIn()">Inicia Sesión</button>
  
  
      </form>
  
    </div>`
  
  });

  //Vue instance
new Vue({
    el: "#logIn",
    data: {
      imgLogo: imgLogo,
  
      showLogIn: true,
      showSignIn: false,
      showFileManager: false,
  
      showNavBar: false,
      showImgScore: false,
      showScore: false,
      showMeasureNavigator: false
    },
    methods: {
      resetShowComponents: function() {
        this.showLogIn = false;
        this.showSignIn = false;
        this.showFileManager = false;
  
        this.showNavBar = false;
        this.showImgScore = false;
        this.showScore = false;
        this.showMeasureNavigator = false;
      },
      displayLogIn: function() {      
        this.resetShowComponents();      
        this.showLogIn = true;
      },
      displaySignIn: function() {
        this.resetShowComponents();
        this.showSignIn = true;
      },  
    },
    template:
    `<div id="logIn">
      <login v-if="showLogIn"
        v-bind:imgLogo="imgLogo"
        v-on:sign-in="displaySignIn()">
      </login>
  
      <signin v-if="showSignIn"
        v-bind:imgLogo="imgLogo"
        v-on:log-in="displayLogIn()">
      </signin>
    </div>`
  });
  
  