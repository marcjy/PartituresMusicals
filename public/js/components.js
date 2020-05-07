//img paths
var imgNotas = [
  "../img/editor/redonda.png",
  "../img/editor/blanca.png",
  "../img/editor/negra.png",
  "../img/editor/corchea.png",
  "../img/editor/semicorchea.png",
  "../img/editor/fusa.png",
  "../img/editor/semifusa.png",
];
var imgSilencios = [
    "../img/editor/sRedonda.png",
    "../img/editor/sBlanca.png",
    "../img/editor/sNegra.png",
    "../img/editor/sCorchea.png",
    "../img/editor/sSemicorchea.png",
    "../img/editor/sFusa.png",
    "../img/editor/sSemifusa.png",
];
var imgProlongaciones = [
    "../img/editor/calderon.png",
    "../img/editor/puntillo.png",
    "../img/editor/ligadura.png",

];

//Copmponents
Vue.component("notas", {
    data: function() {
      return {
        notas: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"],
      }
    },
    props:["pImgDuracion", "pImgSilencio"],
    template:
    `<div>

      <div class=container id= notas>
        <div v-for="nota in notas">{{nota}}</div>
      </div>

      <div class=container id= duracion>
        <div v-for="duracion in pImgDuracion">
          <img v-bind:src=duracion>
        </div>
      </div>

      <div class=container id= silencios>
        <div v-for="silencio in pImgSilencio">
          <img v-bind:src=silencio>
        </div>
      </div>

    </div>`
});
Vue.component("selectores", {
  data: function() {
    return {
      llave: null,
      armadura: null,
      tiempo: null,
    }
  },
  watch: {
    llave: function() {
      this.$emit("llave", this.llave);
    },
    armadura: function() {
      this.$emit("armadura", this.armadura);
    },
    tiempo: function() {
      this.$emit("tiempo", this.tiempo);
    }
  },
  template:
  `<div class = selectores>

      <div>
        <label for="llave">Llave: </label>
        <select id=llave v-model="llave">
        <option value="Sol">Sol</option>
        <option value="Fa">Fa</option>
        <option value="Do">Do</option>
        </select>
      </div>
        <br>

    <div>
      <label for="armadura">Armadura: </label>
      <select id=llave v-model="armadura">
        <option disabled>MAYOR</option>
        <option disabled>──────────</option>

        <option>Do Mayor</option>
        <option>Sol Mayor</option>
        <option>Re Mayor</option>
        <option>La Mayor</option>
        <option>Mi Mayor</option>
        <option>Si Mayor</option>
        <option>Fa# Mayor</option>
        <option>Do# Mayor</option>
        <option>Fa Mayor</option>
        <option>Sib Mayor</option>
        <option>Mib Mayor</option>
        <option>Lab Mayor</option>
        <option>Reb Mayor</option>
        <option>Solb Mayor</option>
        <option>Dob Mayor</option>
        <option>Sol Mayor</option>

        <option disabled>MENOR</option>
        <option disabled>──────────</option>

        <option>La Menor</option>
        <option>Mi Menor</option>
        <option>Si Menor</option>
        <option>Fa# Menor</option>
        <option>Do# Menor</option>
        <option>Sol# Menor</option>
        <option>Re# Menor</option>
        <option>La# Menor</option>
        <option>Re Menor</option>
        <option>Sol Menor</option>
        <option>Do Menor</option>
        <option>Fa Menor</option>
        <option>Sib Menor</option>
        <option>Mib Menor</option>
        <option>Lab Menor</option>
      </select>
    </div>
    <br>

    <div>
      <label for="tiempo">Tiempo: </label>
      <select id=llave v-model="tiempo">
        <option value="2/4">2/4</option>
        <option value="3/4">3/4</option>
        <option value="4/4">4/4</option>
      </select>
    </div>

  </div>`
});
Vue.component("prolongaciones", {
  data: function() {
    return {
    }
  },
  props: ["pImgProlongaciones"],
  template:
  `<div id=prolongaciones>

    <h5>Prolongaciones</h5>
    <div class=containerProlongaciones>
      <div v-for="(prolongacion, index) in pImgProlongaciones">
        <img v-bind:src=prolongacion>
      </div>
    </div>

  </div>`
});


//Veu instance
new Vue({
  el: "#app",
  data: {
    imgDuracion: imgNotas,
    imgSilencio: imgSilencios,
    imgProlongaciones: imgProlongaciones,
  },
  methods: {

  },
  watch: {

  },
  template:
  `<div>
    <div id="editor">
    <section>
      <notas v-bind:pImgDuracion=imgDuracion v-bind:pImgSilencio= imgSilencio></notas>
      <div class = containerInf>
        <selectores></selectores>
        <prolongaciones v-bind:pImgProlongaciones=imgProlongaciones></prolongaciones>
      </div>
    </section>

      </div>
    </div>
  </div>`
});
