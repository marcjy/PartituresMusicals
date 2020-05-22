new Vue({
    el:"#imgPartitura",
    data: {
        images: [],
        indexImages: 0,
        actualImage: null,

        deactivatePrevious: true,
        deactivateNext: false,
    },
    created: function() {        
        fetch('/images')
            .then(response => response.text())
            .then(text => {
                let fileNames = text.split(',');
                fileNames.forEach(fileName => this.images.push(fileName));
            });         
    },
    methods: {
        incrementIndex: function() {            
            if(this.indexImages < this.images.length) {
                this.indexImages++;
            } else {
                this.indexImages = 0;
            }
        },
        decrementIndex: function() {
            if(this.indexImages > 0) {
                this.indexImages--;
            } else {
                this.indexImages = this.images.length - 1 ;                
            }
        },

    },
    watch:{
        indexImages: function() {
            this.actualImage = this.images[this.indexImages];

            if(this.indexImages == 0) {
                this.deactivatePrevious = true;
            } else {
                this.deactivatePrevious = false;
            }

            if(this.indexImages == this.images.length - 1) {
                this.deactivateNext = true;
            } else {
                this.deactivateNext = false;
            }
        },
        images: function() {
            this.actualImage = this.images[0];
        }
    },
    template:
    `<div id="imgPartitura">
        <button class="back" v-on:click="decrementIndex()" v-bind:disabled="deactivatePrevious">&#8249;</button>
        <input type="checkbox" id="zoomCheck">
        <label for="zoomCheck">
        <img v-bind:src="actualImage">
        </label>
        <button class="next" v-on:click="incrementIndex()" v-bind:disabled="deactivateNext">&#8250;</button>
    </div>`
});