
new Vue({
    el: "#measureNavigator",
    data: {
        indexMeasures: 0,
    },
    methods: {
        loadPreviousGroup: function() {
            this.indexMeasures -= N_MEASURES;
            loadInfoForVexFlow(this.indexMeasures, true);
        },
        loadNextGroup: function() {
            this.indexMeasures += N_MEASURES;
            loadInfoForVexFlow(this.indexMeasures, true);           
        }
    },
    template:
    `<div>
        <div id="buttonsNavigator">
            <button id="buttonPrevious" v-on:click="loadPreviousGroup()"><span> PREVIOUS </span></button>
            <button id="buttonNext" v-on:click="loadNextGroup()"><span> NEXT </span></button>
        </div>
    </div>`
});