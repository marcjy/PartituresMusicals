const ONE_SECOND = 1000;

const TAG_NOT_FOUND = "T404";
const TYPE_TAG_UNKNOWN = "DT404";

const N_MEASURES = 5
const NEXT_GROUP_MEASURES = "next";
const PREVIOUS_GROUP_MEASURES = "previous";

const SVG_WITDH = getBrowserWidth() - 75;      //For adapting svg size to the client
const SVG_HEIGHT = 100;
const SVG_MARGIN_LEFT = 50;
const MEASURE_WIDTH = SVG_WITDH/6 - 15;

function getBrowserWidth() {      
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
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
  this.tie = null;

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
      let notationsChildren = getTagFromChildren("notations", noteChildren).children;
      
      if(getTagFromChildren("slur", notationsChildren) != TAG_NOT_FOUND) { 

        let notationsAttributes = getTagFromChildren("slur", notationsChildren).attributes;
        
        for(let i = 0; i < notationsAttributes.length; i++) {          
          if(notationsAttributes[i].name == "type") {
            this.tie = notationsAttributes[i].value;
          }
        }
      } else if(getTagFromChildren("tied", notationsChildren) != TAG_NOT_FOUND) {
        let notationsAttributes = getTagFromChildren("tied", notationsChildren).attributes;
        for(let i = 0; i < notationsAttributes.length; i++) {
          if(notationsAttributes[i].name == "type") {
            this.tie = notationsAttributes[i].value;
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
  this.getTie = () => this.tie;
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
      this.key.fifths = (getTagFromChildren("fifths", (getTagFromChildren("key", attrChildren)).children)).innerHTML;
      this.key.mode =  (getTagFromChildren("mode", (getTagFromChildren("key", attrChildren)).children)).innerHTML;
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
  this.finished = false;

  this.createTie = () => {    
    let tie = new VF.StaveTie({
      first_note: this.start,
      last_note: this.end,
      first_indices: [0],
      last_indices: [0]
    });    

    this.start = null;
    this.end = null;
    this.finished = true;

    return tie;
  }
  this.setStart = start => { this.start = start; this.finished = false; }
  this.setEnd = end => this.end = end;
  this.getFinished = () => this.finished;
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
  this.translateKeySignature = (fifths, mode) => {
    let keySignature = "";
    
    switch(fifths) {
        case "-7":
          if(mode == "major") { keySignature = "Cb"}
          else {keySignature = "Abm"}
          break;
        case "-6":
          if(mode == "major") { keySignature = "Gb"}
          else { keySignature = "Ebm"}
          break;
        case "-5":
          if(mode == "major") { keySignature = "Db"}
          else { keySignature = "Bbm"}
          break;
        case "-4":
          if(mode == "major") { keySignature = "Ab"}
          else { keySignature = "Fm"}
          break;
        case "-3":
          if(mode == "major") { keySignature = "Eb"}
          else { keySignature = "Cm"}
          break;
        case "-2":
          if(mode == "major") { keySignature = "Bb"}
          else { keySignature = "Gm"}
          break;
        case "-1":
          if(mode == "major") { keySignature = "F"}
          else { keySignature = "Dm"}
          break;
        case "0":
          if(mode == "major") { keySignature = "C"}
          else { keySignature = "Am"}
          break;
        case "1":
          if(mode == "major") { keySignature = "G"}
          else { keySignature = "Em"}
          break;
        case "2":
          if(mode == "major") { keySignature = "D"}
          else { keySignature = "Bm"}
          break;
        case "3":
          if(mode == "major") { keySignature = "A"}
          else { keySignature = "F#m"}
          break;
        case "4":
          if(mode == "major") { keySignature = "E"}
          else { keySignature = "C#m"}
          break;
        case "5":
          if(mode == "major") { keySignature = "B"}
          else { keySignature = "G#m"}
          break;
        case "6":
          if(mode == "major") { keySignature = "F#"}
          else { keySignature = "D#m"}
          break;
        case "7":
          if(mode == "major") { keySignature = "C#"}
          else { keySignature = "A#m"}
          break;
        default:
          console.log("Error in translateKeySignature. Unknown keySignature.\n Fifths: " + fifths + "\n Mode: " + mode);
          break;       
    }

    return keySignature;
  }
}

//Class XMLParser
function XMLParser() {
  //Initializing VexFlow
    VF = Vex.Flow;
    var div = document.getElementById("partitura");
    var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    renderer.resize(SVG_WITDH, SVG_HEIGHT);
    this.contextVF = renderer.getContext();
    this.groupMeasures = this.contextVF.openGroup();
  
    this.xml = new XMLManager();
    this.xml2vf = new MusicXMLToVexFlow();
    this.attributes = new Attributes();
    this.tieGenerator = new TieGenerator();
    this.measures = null;
    this.infoElementClicked = null;
  
    this.loadXML = () => {
      this.xml.fetchXML();
      this.measures = this.xml.getMeasures();
    }
  
    this.getAttributes = (children) => {
      this.attributes.setData(getTagFromChildren("attributes", children));
      this.attributes.loadData();
    }
    this.getNotes = (children) => {
    
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
    this.loadNotesToVF = (notes, divisions, clefVF) => {
      let notesVF = [];
      let tiesVF = [];
    
      for(let i = 0; i < notes.length; i ++) {    //for each note
        let keyVF = [];
        let durationVF = null;
        let accidentalVF = null;
        let hasAccidental = false;      
    
        if(notes[i].getAccidental() != null) {
          accidentalVF = this.xml2vf.translateAccidental(notes[i].getAccidental());
          hasAccidental = true;
        }
        
        if(this.xml2vf.translateType(notes[i].getType()) != TYPE_TAG_UNKNOWN) {    //In case note has a duration  modifier (dot for example)
          durationVF = this.xml2vf.translateType(notes[i].getType());
        } else {
          durationVF = this.xml2vf.translateDuration(divisions, notes[i].getDuration());
        }
        
        if(notes[i].getIsRest()) {
          keyVF.push("b/4");        //specifies the vertical position of the rest
          durationVF += "r";   //specifies that the element it's a rest, and not a note
        } else {
          keyVF.push(this.xml2vf.translateKey(notes[i].getStep(), notes[i].getOctave(), accidentalVF));
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
    
        if(notes[i].getTie() == "start") {
          this.tieGenerator.setStart(staveNote);
        }
        if(notes[i].getTie() == "stop") {      
          this.tieGenerator.setEnd(staveNote);
          tiesVF.push(this.tieGenerator.createTie());
        }    
        notesVF.push(staveNote);
      }
    
      return {
        notesVF: notesVF,
        tiesVF: tiesVF,
      }
    }
    this.showMeasures = (measures, indexMeasure) => {
      var children = null;
      var clefVF = null;
      var timeSignatureVF = null;
      var keySignatureVF = null;
      var oldMeasureVF = null;
      var measureVF = null;
      var tiesVF = null;
      var oneMoreTime = 0;
      
      for(let i = indexMeasure; i < indexMeasure + N_MEASURES + oneMoreTime; i++) {    //for each measure
        var notesVF = [];
        var beamsVF = null;             
        
        if(measures[i] != undefined) {    
          children = measures[i].children;
    
          if(getTagFromChildren("attributes", measures[i].children) != TAG_NOT_FOUND) {
            this.getAttributes(measures[i].children);       //Loads attributes or updates them if they are already initialized
          }
        
          if(clefVF == null) {
            clefVF = this.xml2vf.translateClef(this.attributes.getSign(), this.attributes.getLine());
          }
          timeSignatureVF = this.xml2vf.translateTimeSignature(this.attributes.getBeats(), this.attributes.getBeatType());
          keySignatureVF = this.xml2vf.translateKeySignature(this.attributes.getFifths(), this.attributes.getMode());    
          
          infoVF = this.loadNotesToVF(this.getNotes(children), this.attributes.getDivisions(), clefVF); /////////////////////////*
          notesVF = infoVF.notesVF;
          tiesVF = infoVF.tiesVF;   
          beamsVF = VF.Beam.generateBeams(notesVF);
        }
    
        
        if(measureVF == null) {     //Add CLEF and TIMESIGNATURE
          measureVF = new VF.Stave(SVG_MARGIN_LEFT, 0, MEASURE_WIDTH);
          oldMeasureVF = measureVF;
    
          if(clefVF != null && timeSignatureVF != null && keySignatureVF != null)  {        
            measureVF
            .addClef(clefVF)
            .addTimeSignature(timeSignatureVF)
            .addModifier(new Vex.Flow.KeySignature(keySignatureVF));
          }
    
        } else {
          measureVF = new VF.Stave(oldMeasureVF.width + oldMeasureVF.x, 0, MEASURE_WIDTH);
          oldMeasureVF = measureVF;
        }
    
        
        measureVF
        .setContext(this.contextVF)
        .draw();
    
        if(notesVF.length != 0) {
          //Draw
          VF.Formatter.FormatAndDraw(this.contextVF, measureVF, notesVF);
          beamsVF.forEach(beam => { beam.setContext(this.contextVF).draw() });
          tiesVF.forEach(tie => { tie.setContext(this.contextVF).draw() });
    
    
          for( let j = 0; j < notesVF.length; j++) {
            elementInMeasure = notesVF[j].attrs.el;
            elementInMeasure.setAttribute("measure", i);
            elementInMeasure.setAttribute("note", j);
            elementInMeasure.addEventListener("click", (elementClicked) => {
              let element = elementClicked.path[3];
              let attrElement = element.attributes;
              let info = "";
    
              for(let i = 0; i < attrElement.length; i++) {
                if(attrElement[i].name == "measure") { info += attrElement[i].nodeValue + ", "; }
                if(attrElement[i].name == "note") { info += attrElement[i].nodeValue; }
              }  
              console.log("HOLA");    
              this.infoElementClicked = info;      
              document.getElementById("nav-bar").setAttribute("infoElementClicked", info);
            });
          }
        }
        if(i == (indexMeasure + N_MEASURES) - 1){   //Last iteration      
          if(!this.tieGenerator.getFinished()) {
            oneMoreTime = 1;
          }
        }
      }
    
      this.contextVF.closeGroup();
    }

    this.loadInfoForVexFlow = (indexMeasure, deleteContext) => {
      this.measures
      .then(measures => {
    
        if(deleteContext) {
          this.contextVF.svg.removeChild(this.groupMeasures);
          this.groupMeasures = this.contextVF.openGroup();
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
    
        this.showMeasures(measures, indexMeasure);
      });
    }
}


// function getAttributes(children) {       
//    attributes.setData(getTagFromChildren("attributes", children));
//    attributes.loadData();

//    return attributes;
// }
// function getNotes(children) {
  
//   let notes = [];
//   let arrayNotes = getTagFromChildren("note", children); 
  
//   if( !(Array.isArray(arrayNotes)) ) {
//     notes[0] = new Note(arrayNotes);
//     notes[0].loadData(); 
//   } else {
//     for(let i = 0; i < arrayNotes.length; i++) {    
//       notes[i] = new Note(arrayNotes[i]);                
//       notes[i].loadData();    
//     }
//   }

//   return notes;
// }
// function loadNotesToVF(notes, divisions, clefVF) {
//   let notesVF = [];
//   let tiesVF = [];

//   for(let i = 0; i < notes.length; i ++) {    //for each note
//     let keyVF = [];
//     let durationVF = null;
//     let accidentalVF = null;
//     let hasAccidental = false;      

//     if(notes[i].getAccidental() != null) {
//       accidentalVF = xml2vf.translateAccidental(notes[i].getAccidental());
//       hasAccidental = true;
//     }
    
//     if(xml2vf.translateType(notes[i].getType()) != TYPE_TAG_UNKNOWN) {    //In case note has a duration  modifier (dot for example)
//       durationVF = xml2vf.translateType(notes[i].getType());
//     } else {
//       durationVF = xml2vf.translateDuration(divisions, notes[i].getDuration());
//     }
    
//     if(notes[i].getIsRest()) {
//       keyVF.push("b/4");        //specifies the vertical position of the rest
//       durationVF += "r";   //specifies that the element it's a rest, and not a note
//     } else {
//       keyVF.push(xml2vf.translateKey(notes[i].getStep(), notes[i].getOctave(), accidentalVF));
//     } 

//     let staveNote = new VF.StaveNote({
//       clef: clefVF,
//       keys: keyVF,
//       duration: durationVF
//     });

//     if(hasAccidental) {
//       staveNote.addAccidental(0, new VF.Accidental(accidentalVF));
//     }
//     if(notes[i].getHasDot()) {
//       staveNote.addDot(0);
//     }

//     if(notes[i].getTie() == "start") {
//       tieGenerator.setStart(staveNote);
//     }
//     if(notes[i].getTie() == "stop") {      
//       tieGenerator.setEnd(staveNote);
//       tiesVF.push(tieGenerator.createTie());
//     }    
//     notesVF.push(staveNote);
//   }

//   return {
//     notesVF: notesVF,
//     tiesVF: tiesVF,
//   }
// }
// function showMeasures(contextVF, measures, indexMeasure) {
//   var children = null;
//   var clefVF = null;
//   var timeSignatureVF = null;
//   var keySignatureVF = null;
//   var oldMeasureVF = null;
//   var measureVF = null;
//   var tiesVF = null;
//   var oneMoreTime = 0;
  
//   for(let i = indexMeasure; i < indexMeasure + N_MEASURES + oneMoreTime; i++) {    //for each measure
//     var notesVF = [];
//     var beamsVF = null;             
    
//     if(measures[i] != undefined) {    
//       children = measures[i].children;

//       if(getTagFromChildren("attributes", measures[i].children) != TAG_NOT_FOUND) {
//         attributes = getAttributes(measures[i].children);       //Loads attributes or updates them if they are already initialized
//       }
    
//       if(clefVF == null) {
//         clefVF = xml2vf.translateClef(attributes.getSign(), attributes.getLine());
//       }
//       timeSignatureVF = xml2vf.translateTimeSignature(attributes.getBeats(), attributes.getBeatType());
//       keySignatureVF = xml2vf.translateKeySignature(attributes.getFifths(), attributes.getMode());    
      
//       infoVF = loadNotesToVF(getNotes(children), attributes.getDivisions(), clefVF); /////////////////////////*
//       notesVF = infoVF.notesVF;
//       tiesVF = infoVF.tiesVF;   
//       beamsVF = VF.Beam.generateBeams(notesVF);
//     }

    
//     if(measureVF == null) {     //Add CLEF and TIMESIGNATURE
//       measureVF = new VF.Stave(SVG_MARGIN_LEFT, 0, MEASURE_WIDTH);
//       oldMeasureVF = measureVF;

//       if(clefVF != null && timeSignatureVF != null && keySignatureVF != null)  {        
//         measureVF
//         .addClef(clefVF)
//         .addTimeSignature(timeSignatureVF)
//         .addModifier(new Vex.Flow.KeySignature(keySignatureVF));
//       }

//     } else {
//       measureVF = new VF.Stave(oldMeasureVF.width + oldMeasureVF.x, 0, MEASURE_WIDTH);
//       oldMeasureVF = measureVF;
//     }

    
//     measureVF
//     .setContext(contextVF)
//     .draw();

//     if(notesVF.length != 0) {
//       //Draw
//       VF.Formatter.FormatAndDraw(contextVF, measureVF, notesVF);
//       beamsVF.forEach(beam => { beam.setContext(contextVF).draw() });
//       tiesVF.forEach(tie => { tie.setContext(contextVF).draw() });


//       for( let j = 0; j < notesVF.length; j++) {
//         elementInMeasure = notesVF[j].attrs.el;
//         elementInMeasure.setAttribute("measure", i);
//         elementInMeasure.setAttribute("note", j);
//         elementInMeasure.addEventListener("click", (elementClicked) => {
//           let element = elementClicked.path[3];
//           let attrElement = element.attributes;
//           let info = "";

//           for(let i = 0; i < attrElement.length; i++) {
//             if(attrElement[i].name == "measure") { info += attrElement[i].nodeValue + ", "; }
//             if(attrElement[i].name == "note") { info += attrElement[i].nodeValue; }
//           }  
//           console.log("HOLA");    
//           infoElementClicked = info;      
//           document.getElementById("nav-bar").setAttribute("infoElementClicked", info);
//         });
//       }
//     }
//     if(i == (indexMeasure + N_MEASURES) - 1){   //Last iteration      
//       if(!tieGenerator.getFinished()) {
//         oneMoreTime = 1;
//       }
//     }
//   }

//   contextVF.closeGroup();
// }
// function getTagFromChildren(tag, children) {
//   let elements = [];

//   for(let i = 0; i < children.length; i++) {

//     if(children[i].nodeName == tag) {      
//       elements.push(children[i]);
//     }
//   }
//   if(elements.length == 0) {  //Tag not found
//     elements = TAG_NOT_FOUND;
//   }

//   if(elements.length == 1) {    //Array to single element
//     elements = elements[0];
//   }
//   return elements;
// }
// function loadInfoForVexFlow (indexMeasure, deleteContext) {
//   measures
//   .then(measures => {

//     if(deleteContext) {
//       contextVF.svg.removeChild(groupMeasures);
//       groupMeasures = contextVF.openGroup();
//     }

//     if(indexMeasure < 0) {
//       indexMeasure = 0;
//     }


//     if( (indexMeasure + 1) > measures.length) {
//         alert("There are no more measures");
//         document.getElementById("buttonNext").disabled= true;
//     } else {
//       document.getElementById("buttonNext").disabled= false;
//     }

//     if(indexMeasure == 0) {
//       document.getElementById("buttonPrevious").disabled= true;
//     } else {
//       document.getElementById("buttonPrevious").disabled= false;
//     }

//     showMeasures(contextVF, measures, indexMeasure);
//   });
// }

// //Initializing VexFlow
// VF = Vex.Flow;
// var div = document.getElementById("partitura");
// var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
// renderer.resize(SVG_WITDH, SVG_HEIGHT);
// var contextVF = renderer.getContext();
// var groupMeasures = contextVF.openGroup();

// //Load XML
// var xml = new XMLManager();
// xml.fetchXML();
// var measures = xml.getMeasures();

// //Initializations
// var xml2vf = new MusicXMLToVexFlow();
// var attributes = new Attributes();
// var tieGenerator = new TieGenerator();
// var infoElementClicked = null;

// //loadXML FUNCTION MISSIG
// loadInfoForVexFlow(0, false);




var xmlParser = new XMLParser();
xmlParser.loadXML();
xmlParser.loadInfoForVexFlow(0, false);



