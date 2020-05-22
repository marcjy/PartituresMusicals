const ONE_SECOND = 1000;

const TAG_NOT_FOUND = "T404";
const TYPE_TAG_UNKNOWN = "DT404";

const N_MEASURES = 6   //TODO
const NEXT_GROUP_MEASURES = "next";
const PREVIOUS_GROUP_MEASURES = "previous";

const MEASURE_WIDTH = 300;
const SVG_WITDH = 1900;
const SVG_HEIGHT = 200;
//Class XMLManager
function XMLManager() {
  this.parser = new DOMParser();
  this.xml = null;

  /*TODO*/this.sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
  this.fetchXML = () => {
    fetch('/xml')
      .then(res => res.text())
      .then(text => { this.xml = this.parser.parseFromString(text, "application/xml"); });
  }
  this.getMeasures = async () => {
    await this.sleep(ONE_SECOND);    
    return this.xml.getElementsByTagName('measure');
  }
}
//Class Note
function Note(data) {
  this.data = data;

  this.isRest = false;
  this.hasDot = false;
  this.duration = null;
  this.voice = null;
  this.type = null;
  this.accidental = null;
  this.pitch = {
    step: null,
    octave: null,
  };
  this.slur = null;

/* TODO  this.setData = data => this.data = data;
  this.setIsRest = isRest => this.IsRest = isRest;
  this.setDuration = duration => this.duration = duration;
  this.setVoice = voice => this.voice = voice;
  this.setType = type => this.type = type;
  this.setAccidental = accidental => this.accidental = accidental;
  this.setPitch = pitch => this.pitch  =pitch;
  this.setNotations = notations => this.notations = notations; */

  this.loadData = () => {    
    let noteChildren = this.data.children;

    let tmp = getTagFromChildren("rest", noteChildren);

    if(getTagFromChildren("rest", noteChildren) != TAG_NOT_FOUND) {
      this.isRest = true;
    }
    if(getTagFromChildren("dot", noteChildren) != TAG_NOT_FOUND) {
      this.hasDot = true;
    }
    this.duration = (getTagFromChildren("duration", noteChildren)).innerHTML;
    this.voice = (getTagFromChildren("voice", noteChildren)).innerHTML;
    this.type = (getTagFromChildren("type", noteChildren)).innerHTML;

    if(getTagFromChildren("accidental", noteChildren) != TAG_NOT_FOUND) {   //Accidental tag is optional
      this.accidental = (getTagFromChildren("accidental", noteChildren)).innerHTML; 
    }
    if(getTagFromChildren("notations", noteChildren) != TAG_NOT_FOUND) {   //Notations tag is optional 
      let notationsChildren = getTagFromChildren("notations", noteChildren);

      if(getTagFromChildren("slur", notationsChildren) != TAG_NOT_FOUND) {
        let notationsAttributes = getTagFromChildren("slur", notationsChildren).attributes;
        for(let i = 0; i < notationsAttributes; i++) {
          if(notationsAttributes[i].name == "type") {
            this.slur = notationsAttributes[i].value;
          }
        }
      } else if(getTagFromChildren("tied", notationsChildren) != TAG_NOT_FOUND) {
        let notationsAttributes = getTagFromChildren("tied", notationsChildren).attributes;
        for(let i = 0; i < notationsAttributes; i++) {
          if(notationsAttributes[i].name == "type") {
            this.slur = notationsAttributes[i].value;
          }
        }
      }

    }
    if(this.isRest == false) {     //If isRest == true  -> There is no pitch tag
      this.pitch.step = (getTagFromChildren("step", getTagFromChildren("pitch", noteChildren).children)).innerHTML;
      this.pitch.octave = (getTagFromChildren("octave", getTagFromChildren("pitch", noteChildren).children)).innerHTML;
    }     
  }  

  this.getData = () => this.data;
  this.getIsRest = () => this.isRest;
  this.getHasDot = () => this.hasDot;
  this.getDuration = () => this.duration;
  this.getVoice = () => this.voice;
  this.getType = () => this.type;
  this.getAccidental = () => this.accidental;
  this.getStep = () => this.pitch.step;
  this.getOctave = () => this.pitch.octave;
  this.getSlur = () => this.slur;
}
//Class Attributes
function Attributes() {
  this.data = null;

  this.divisions = null;
  this.key = {
    fifths: null,
    mode: null,
  };
  this.time = {
    beats: null,
    beatType: null,
  };
  this.clef = {
    sign: null,
    line: null
  };

  this.loadData = () => {
    var attrChildren = this.data.children;          
    
    if(getTagFromChildren("divisions", attrChildren) != TAG_NOT_FOUND) { this.divisions = (getTagFromChildren("divisions", attrChildren)).innerHTML;}
    if(getTagFromChildren("key", attrChildren) != TAG_NOT_FOUND) { 
      this.key.fifths = (getTagFromChildren("fifths", (getTagFromChildren("key", attrChildren)).children)).innerHTMl;
      this.key.mode = (getTagFromChildren("mode", (getTagFromChildren("key", attrChildren)).children)).innerHTML;
    }
    if(getTagFromChildren("time", attrChildren) != TAG_NOT_FOUND) {
      this.time.beats = (getTagFromChildren("beats", (getTagFromChildren("time", attrChildren)).children)).innerHTML;
      this.time.beatType = (getTagFromChildren("beat-type", (getTagFromChildren("time", attrChildren)).children)).innerHTML; 
    }
    if(getTagFromChildren("clef", attrChildren) != TAG_NOT_FOUND) { 
      this.clef.sign = (getTagFromChildren("sign", (getTagFromChildren("clef", attrChildren)).children)).innerHTML; 
      this.clef.line = (getTagFromChildren("line", (getTagFromChildren("clef", attrChildren)).children)).innerHTML;
  }
}

  this.setData = data => this.data = data;

  this.getData = () => this.data;
  this.getDivisions = () => this.divisions;
  this.getFifths = () => this.key.fifths;
  this.getMode = () => this.key.mode;
  this.getBeats = () => this.time.beats;
  this.getBeatType = () => this.time.beatType;
  this.getSign = () => this.clef.sign;
  this.getLine = () => this.clef.line;
}
//Class TieGenerator
function TieGenerator() {
  this.start = null;
  this.end = null;
  this.tie = null;

  this.createTie = () => {
    
    this.tie = new VF.StaveTie({
      first_note: this.start,
      last_note: this.end,
      first_indices: [0],
      last_indices: [0]
    });    

    this.staveNoteStart = null;
    this.staveNoteEnd = null;

    return this.tie;
  }

  this.setStart = start => this.start = start;
  this.setEnd = end => this.end = end;
}
//Class MusicXMLToVexFlow
function MusicXMLToVexFlow() {
  this.translateClef = (sign, line) => {
    let clef = "";

    switch(sign) {
      case "F":
        if(line == "4") {
          clef = "bass";
        } else {
          if(line == "3") {
            clef = "baritone-f";
          } else {
            console.log("Error in translateClef. Unknown CLEF: "+ sign + "/" + line);
          }
        }
        break;
      case "G":
        if(line == "2") {
          clef = "treble";
        } else {
          console.log("Error in translateClef. Unknown CLEF: "+ sign + "/" + line);
        }
        break;
      case "C":
        if(line == "3") {
          clef = "alto";
        } else {
          if(line == "4") {
            clef = "tenor";
          } else {
            if( line == "1") {
              clef = "soprano";
            } else {
              if( line == "2") {
                clef = "mezzo-soprano";
              } else {
                if(line == "5") {
                  clef = "baritone-c"
                }
              }
            }
          }
        }
        break;
      case "percussion":
        clef = "percussion";
        break;
      default:
        console.log("Error in translateClef. Unknown SIGN: " + sign);
    }

    return clef;
  }
  this.translateTimeSignature = (beats, beatsType) => {
    return beats + "/" + beatsType;
  }
  this.translateAccidental = (acc) => {
    let accidental = "";

    switch(acc) {
      case "sharp":
        accidental = "#";
        break;
      case "flat":
        accidental = "b";
        break;
      case "natural":
        accidental = "n";
        break;
      case "double-sharp":
        accidental = "##";
        break;
      case "flat-flat":
        accidental = "bb";
        break;
      default:
        console.log("Error in translateAccidental. Unknown ACCIDENTAL: " + acc);
    }

    return accidental;
  }
  this.translateType = (type) => {
    let duration = "";

    switch(type) {
      case "whole":
        duration = "w";
        break;
      case "half":        
        duration =  "h";
        break;
      case "quarter":
        duration = "q";
        break;
      case "eighth":
        duration = "8";
        break;
      case "16th":
        duration = "16";
        break;
      case "32nd":
        duration = "32";
        break;
      case "64th":
        duration = "64";
        break;
      case "128th":
        duration = "128";
        break;
      default:
        duration = TYPE_TAG_UNKNOWN;
    }
    return duration;
  }
  this.translateDuration = (divisions, duration) => {
    let res = duration / divisions;    
    let realDuration = "";

    switch(res) {
      case 8:
        realDuration = "1/2";
      case 4:
        realDuration = "w";
        break;
      case 2:
        realDuration = "h";
        break;
      case 1:
        realDuration = "q";
        break;
      case 0,5:
        realDuration = "8";
        break;
      case 0,25:
        realDuration = "16";
        break;
      case 0,125:
        realDuration = "32";
        break;
      case 0,0625:
        realDuration = "64";
        break;
      case 0,03125:
        realDuration = "128";
        break;
      case 0,015625:
        realDuration = "b";
        break;
      default:
        console.log("Error in translateDuration. Unknown DURATION: " + res); 
    }

    return realDuration;
  }
  this.translateKey = (step, octave, accidental) => {
    
    let result = "";

    result += step.toLowerCase();
    if(accidental != null) {
      result += accidental;
    }
    result += "/" + octave;

    return result;
  }
}


function getAttributes(children) {     
   attributes.setData(getTagFromChildren("attributes", children));
   attributes.loadData();

   return attributes;
}
function getNotes(children) {
  
  let notes = [];
  let arrayNotes = getTagFromChildren("note", children); 
  
  if( !(Array.isArray(arrayNotes)) ) {
    notes[0] = new Note(arrayNotes);
    notes[0].loadData(); 
  } else {
    for(let i = 0; i < arrayNotes.length; i++) {    
      notes[i] = new Note(arrayNotes[i]);                
      notes[i].loadData();    
    }
  }

  return notes;
}
function loadNotesToVF(notes, divisions, clefVF) {
  let notesVF = [];
  let tiesVF = [];

  for(let i = 0; i < notes.length; i ++) {    //for each note
    let keyVF = [];
    let durationVF = null;
    let accidentalVF = null;
    let hasAccidental = false;    

    if(notes[i].getAccidental() != null) {
      accidentalVF = xml2vf.translateAccidental(notes[i].getAccidental());
      hasAccidental = true;
    }
    
    if(xml2vf.translateType(notes[i].getType()) != TYPE_TAG_UNKNOWN) {    //In case note has a duration  modifier (dot for example)
      durationVF = xml2vf.translateType(notes[i].getType());
    } else {
      durationVF = xml2vf.translateDuration(divisions, notes[i].getDuration());
    }
    
    if(notes[i].getIsRest()) {
      keyVF.push("b/4");        //specifies the vertical position of the rest
      durationVF += "r";   //specifies that the element it's a rest, and not a note
    } else {
      keyVF.push(xml2vf.translateKey(notes[i].getStep(), notes[i].getOctave(), accidentalVF));
    } 

    let staveNote = new VF.StaveNote({
      clef: clefVF,
      keys: keyVF,
      duration: durationVF
    });

    if(hasAccidental) {
      staveNote.addAccidental(0, new VF.Accidental(accidentalVF));
    }
    if(notes[i].getHasDot()) {
      staveNote.addDot(0);
    }

    if(notes[i].getSlur() == "start") {
      tieGenerator.setStart(staveNote);
    }
    if(notes[i].getSlur() == "stop") {      
      tieGenerator.setEnd(staveNote);
      tiesVF.push(tieGenerator.createTie());
    }

    notesVF.push(staveNote);
  }

  return {
    notesVF: notesVF,
    tiesVF: tiesVF,
  }
}
function showMeasures(contextVF, measures, indexMeasure) {
  
  var children = null;
  var clefVF = null;
  var timeSignatureVF = null;
  var oldMeasureVF = null;
  var measureVF = null;
  var tiesVF = null;
  
  for(let i = indexMeasure; i < indexMeasure + N_MEASURES; i++) {    //for each measure
    var notesVF = [];
    var beamsVF = null;          
    
    if(measures[i] != undefined) {
      
      children = measures[i].children;
      
      if(getTagFromChildren("attributes", measures[i].children) != TAG_NOT_FOUND) {
        attributes = getAttributes(measures[i].children);       //Loads attributes or updates them if they are already initialized
      }
    
      if(clefVF == null) {
        clefVF = xml2vf.translateClef(attributes.getSign(), attributes.getLine());
      }
      
      timeSignatureVF = xml2vf.translateTimeSignature(attributes.getBeats(), attributes.getBeatType());
      
      infoVF = loadNotesToVF(getNotes(children), attributes.getDivisions(), clefVF); /////////////////////////*
      notesVF = infoVF.notesVF;
      tiesVF = infoVF.tiesVF;   

      beamsVF = VF.Beam.generateBeams(notesVF);
    }

    
    if(measureVF == null) {     //Add CLEF and TIMESIGNATURE
      measureVF = new VF.Stave(75, 0, MEASURE_WIDTH);
      oldMeasureVF = measureVF;

      if(clefVF != null && timeSignatureVF != null) {
        measureVF
        .addClef(clefVF)
        .addTimeSignature(timeSignatureVF)
      }

    } else {
      measureVF = new VF.Stave(oldMeasureVF.width + oldMeasureVF.x, 0, MEASURE_WIDTH);
      oldMeasureVF = measureVF;
    }

    
    measureVF
    .setContext(contextVF)
    .draw();


    if(notesVF.length != 0) {
      //Draw
      VF.Formatter.FormatAndDraw(contextVF, measureVF, notesVF);
      beamsVF.forEach(beam => { beam.setContext(contextVF).draw() });
      tiesVF.forEach(tie => { tie.setContext(contextVF).draw() });
    } else {      
    }
  }

  contextVF.closeGroup();

}
function getTagFromChildren(tag, children) {
  let elements = [];
  for(let i = 0; i < children.length; i++) {

    if(children[i].nodeName == tag) {      
      elements.push(children[i]);
    }
  }
  if(elements.length == 0) {  //Tag not found
    elements = TAG_NOT_FOUND;
  }

  if(elements.length == 1) {    //Array to single element
    elements = elements[0];
  }
  return elements;
}
function loadInfoForVexFlow (indexMeasure, deleteContext) {
  measures
  .then(measures => {

    if(deleteContext) {
      contextVF.svg.removeChild(groupMeasures);
      groupMeasures = contextVF.openGroup();
    }

    if(indexMeasure < 0) {
      indexMeasure = 0;
    }


    if( (indexMeasure + 1) > measures.length) {
        alert("There are no more measures");
        document.getElementById("buttonNext").disabled= true;
    } else {
      document.getElementById("buttonNext").disabled= false;
    }

    if(indexMeasure == 0) {
      document.getElementById("buttonPrevious").disabled= true;
    } else {
      document.getElementById("buttonPrevious").disabled= false;
    }

    showMeasures(contextVF, measures, indexMeasure);
  });
}

//Initializing VexFlow
VF = Vex.Flow;
var div = document.getElementById("partitura");
var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
renderer.resize(SVG_WITDH, SVG_HEIGHT);
var contextVF = renderer.getContext();
var groupMeasures = contextVF.openGroup();

//Load XML
var xml = new XMLManager();
xml.fetchXML();
var measures = xml.getMeasures();

var xml2vf = new MusicXMLToVexFlow();
var attributes = new Attributes();
var tieGenerator = new TieGenerator();

loadInfoForVexFlow(0, false);
//Load info for VexFlow


