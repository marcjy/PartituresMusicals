//Class XMLManager
function XMLManager() {
  this.parser = new DOMParser();
  this.xml = null;

  this.fetchXML = async () => {
    let response = await fetch('/xml');
    let xml = await response.text();
    return xml;
  }
  this.loadParser = async () => {
    let xml = await this.fetchXML();
    let parser = await this.parser.parseFromString(xml, "application/xml");
    return parser;
  }
  this.buildParser = () => {
    this.xml = this.loadParser();
  }
  this.getXML = () => this.xml;
  this.getParts = () => {
    this.xml.then( (res) => {
      let parts = res.getElementsByTagName('part');
    });

  }
}

var xml = new XMLManager();
xml.buildParser();

//Seting up VexFlow
var vf = new Vex.Flow.Factory({renderer: {elementId: 'partitura'}});
var score = vf.EasyScore();
var system = vf.System();
