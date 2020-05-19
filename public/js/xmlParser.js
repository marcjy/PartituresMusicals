const ONE_SECOND = 1000;
const TAG_NOT_FOUND = "T404";
const N_MEASURES = 7   //TODO
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
  this.duration = null;
  this.voice = null;
  this.type = null;
  this.accidental = null;
  this.pitch = {
    step: null,
    octave: null,
  };
  this.notations = {
    slur: null
  };

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
    this.duration = (getTagFromChildren("duration", noteChildren)).innerHTML;
    this.voice = (getTagFromChildren("voice", noteChildren)).innerHTML;
    this.type = (getTagFromChildren("type", noteChildren)).innerHTML;

    if(getTagFromChildren("accidental", noteChildren) != TAG_NOT_FOUND) {   //Accidental tag is optional
      this.accidental = (getTagFromChildren("accidental", noteChildren)).innerHTML; 
    }
    if(getTagFromChildren("notations", noteChildren) != TAG_NOT_FOUND) {   //Notations tag is optional
      this.notations.slur = (getTagFromChildren("slur", getTagFromChildren("notations", noteChildren).children)).innerHTML;
    }
    if(this.isRest == false) {     //If isRest == true  -> There is no pitch tag
      this.pitch.step = (getTagFromChildren("step", getTagFromChildren("pitch", noteChildren).children)).innerHTML;
      this.pitch.octave = (getTagFromChildren("octave", getTagFromChildren("pitch", noteChildren).children)).innerHTML;
    }       
    
  }

  this.getData = () => this.data;
  this.getIsRest = () => this.isRest;
  this.getDuration = () => this.duration;
  this.getVoice = () => this.voice;
  this.getType = () => this.type;
  this.getAccidental = () => this.accidental;
  this.getStep = () => this.pitch.step;
  this.getOctave = () => this.pitch.octave;
  this.getSlur = () => this.notations.slur;
}
//Class Attributes
function Attributes(data) {
  this.data = data;

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
    
    this.divisions = (getTagFromChildren("divisions", attrChildren)).innerHTML;
    this.key.fifths = (getTagFromChildren("fifths", (getTagFromChildren("key", attrChildren)).children)).innerHTML;
    this.key.mode = (getTagFromChildren("mode", (getTagFromChildren("key", attrChildren)).children)).innerHTML;
    this.time.beats = (getTagFromChildren("beats", (getTagFromChildren("time", attrChildren)).children)).innerHTML;
    this.time.beatType = (getTagFromChildren("beat-type", (getTagFromChildren("time", attrChildren)).children)).innerHTML;
    this.clef.sign = (getTagFromChildren("sign", (getTagFromChildren("clef", attrChildren)).children)).innerHTML;
    this.clef.line = (getTagFromChildren("line", (getTagFromChildren("clef", attrChildren)).children)).innerHTML;
  }


  this.getData = () => this.data;
  this.getDivisions = () => this.divisions;
  this.getFifths = () => this.key.fifths;
  this.getMode = () => this.key.mode;
  this.getBeats = () => this.time.beats;
  this.getBeatType = () => this.time.beatType;
  this.getSign = () => this.clef.sign;
  this.getLine = () => this.clef.line;
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
        console.log("Error in translateType. Unknown TYPE: " + type); 
    }
    return duration;
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


function loadAttributes(children) {
   var attributes = null;

   attributes = new Attributes(getTagFromChildren("attributes", children));
   attributes.loadData();

   return attributes;

}
function loadNotes(children) {
  let notes = [];
  let arrayNotes = getTagFromChildren("note", children);

  for(let i = 0; i < arrayNotes.length; i++) {
    notes[i] = new Note(arrayNotes[i]);
    notes[i].loadData();
  }

  return notes;
}
function showNMeasures(measures, previous) {
  var children = null;
  var attributes = null;
  var clefVF = null;
  var timeSignatureVF = null;
  var oldMeasureVF = null;
  var measureVF = null;
  
  for(let i = previous; i < N_MEASURES; i++) {    //for each measure
    var notes = null;
    var notesVF = [];
    children = measures[i].children;

    if(attributes == null) {
      attributes = loadAttributes(children);
    }
    if(clefVF == null) {
      clefVF = xml2vf.translateClef(attributes.getSign(), attributes.getLine());
    }

    timeSignatureVF = xml2vf.translateTimeSignature(attributes.getBeats(), attributes.getBeatType());

    if(measureVF == null) {     //Add CLEF and TIMESIGNATURE
      measureVF = new VF.Stave(10, 0, 300);
      oldMeasureVF = measureVF;

      measureVF
        .addClef(clefVF)
        .addTimeSignature(timeSignatureVF)
        .setContext(contextVF)
        .draw();
    } else {
      measureVF = new VF.Stave(oldMeasureVF.width + oldMeasureVF.x, 0, 200);
      oldMeasureVF = measureVF;

      measureVF
        .setContext(contextVF)
        .draw();
    }
    notes = loadNotes(children);
    for(let i = 0; i < notes.length; i ++) {    //for each note
      let keyVF = [];
      let durationVF = null;
      let accidentalVF = null;
      let hasAccidental = false;

      if(notes[i].getAccidental() != null) {
        accidentalVF = xml2vf.translateAccidental(notes[i].getAccidental());
        hasAccidental = true;
      }

      durationVF = xml2vf.translateType(notes[i].getType());
      
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
      notesVF.push(staveNote);
    }

    //Draw notes
    VF.Formatter.FormatAndDraw(contextVF, measureVF, notesVF);
  }

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
function loadInfoForVexFlow (previous) {
  measures
  .then(measures => {

    //Avanzar -> Sumar nMeasures;  Retroceder -> Restar nMeasures x 2
    showNMeasures(measures, previous);
  });
}

var xml2vf = new MusicXMLToVexFlow();

//Initializing VexFlow
VF = Vex.Flow;
var div = document.getElementById("partitura");
var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
renderer.resize(2000,200);
var contextVF = renderer.getContext();

//Load XML
var xml = new XMLManager();
xml.fetchXML();
var measures = xml.getMeasures();

loadInfoForVexFlow(0);

//Load info for VexFlow


