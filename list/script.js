function getDataString(){

  const data = document.getElementsByTagName('li');

  const test = []
  for (var i = 0; i < data.length; i++) {
    item = data[i].innerHTML
      .replace(/<\/?span[^>]*>/g,'')
      .slice(0, -1)
      .split(' ').join('-');
    
    if (data[i].className == "checked"){
        item = item + "$";
    } else {
        item = item + "+";
    }

    test.push(item); //removes "x" and adds "zz" for return
  }
  
  for(var i = 0; i< test.length; i++){
    test[i] = reverseFirstLeter(test[i]);
  }

  var words = "" 
  for(var i = 0; i < data.length; i++){
      words = words + test[i];
  }
  
  return words;

}

function updateDataCode(){
  dataCode = getDataString();
  var post = document.getElementById("code");
  post.value = "pucula.com/list/?" + encodeShortLetters(dataCode);

}

function newElement(inputValue) {
  let inputString = inputValue;
  const li = document.createElement('li');

  if (inputString[inputString.length - 1] === '.') {
    li.setAttribute('class', 'checked');
    inputString = inputString.substr(0, inputString.length - 1);
  }

  li.onclick = () => {
    if (li.className === 'checked') {
      li.setAttribute('class', '');
    } else {
      li.setAttribute('class', 'checked');
    }
    updateDataCode();
  };

  li.appendChild(document.createTextNode(inputString));

  var close = document.createElement("span");
  close.className = "close";
  close.appendChild(document.createTextNode("\u00D7"));
  li.appendChild(close);

  close.onclick = function() {
    this.parentElement.remove();
    updateDataCode();
  }

  document.getElementById("myUL").appendChild(li);

  document.getElementById("myInput").value = "";

  updateDataCode();
}       

function inputNewElement(inputValue){
  if (inputValue === '') {
    alert('You must write something');
  } else {
    newElement(inputValue);
  }
}

// enterNewElement is called in the html
function enterNewElement() {
  if (event.keyCode === 13) {
    inputNewElement();   
  }
}

// Input by button
const addBtn = document.getElementById('addBtn');
addBtn.onclick = () => inputNewElement(document.getElementById('myInput').value);

// --------------------------------------------------



function reverseFirstLeter(str){
    if(str == ""){ return ""; }
    if(str.charAt(0) == str.charAt(0).toUpperCase()){
        return str.charAt(0).toLowerCase() + str.slice(1);
    }else{
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}



function encodeShortLetters(dataString){
    var commonLetters =   "-+$etaoinshrdlcumwfgypbvkjxqz1234567809TAOISWCBPHFMDRELNGUVYJKQXZ"
    var shortestLetters = "ijltfrI-sJzacebdghnopq1uvxky023456789$FPS+LZTERBCDGHwKNOQAUVXYmMW"

    var newWord = [];
    var letterIndex = 0;
    for(var i = 0; i < dataString.length;i++){
        letterIndex = commonLetters.indexOf(dataString[i]);
        newWord = newWord + shortestLetters[letterIndex];
    }

    return newWord
}

function decodeShortLetters(dataString){
    var commonLetters =   "-+$etaoinshrdlcumwfgypbvkjxqz1234567809TAOISWCBPHFMDRELNGUVYJKQXZ"
    var shortestLetters = "ijltfrI-sJzacebdghnopq1uvxky023456789$FPS+LZTERBCDGHwKNOQAUVXYmMW"

    var newWord = [];
    var letterIndex = 0;
    for(var i = 0; i < dataString.length;i++){
        letterIndex = shortestLetters.indexOf(dataString[i]);
        newWord = newWord + commonLetters[letterIndex];
    }

    return newWord
}

function writeCode(code){

    code = decodeShortLetters(code);

    code = code.split('-').join(' ');
    console.log(code);
    var listMaybe = code.replace(/\$/g,".$").split(/\+|\$/);
    console.log(listMaybe);
    listMaybe.splice(-1,1); //Remove blank element
    
    for(var i = 0; i< listMaybe.length; i++){
        listMaybe[i] = reverseFirstLeter(listMaybe[i]);
    }

    for(var i = 0; i < listMaybe.length; i++){
        inputNewElement(listMaybe[i]);
    }

}

function initCode(code){
    
    if (code == '' || code == null){
        newElement("Hit the gym");
        newElement("Pay bills.");
        newElement("Meet George");
        newElement("Buy eggs");
        newElement("Read a book");
        newElement("Organize Office.");
    } else {
        writeCode(code);
    }

}


//copy to clipboard function
document.body.addEventListener('click', copy, true);
// event handler
function copy(e) {
  // find target element
  var
    t = e.target,
    c = t.dataset.copytarget,
    inp = (c ? document.querySelector(c) : null);
  // is element selectable?
  if (inp && inp.select) {
    // select text
    inp.select();
    try {
      // copy text
      document.execCommand('copy');
      inp.blur();
      alert('Link copied')
    }
    catch (err) {
      alert('please press Ctrl/Cmd+C to copy');
    }
  }
}


var url = window.location.href;
var array = url.split("?");
var code = array[1];
window.onload = initCode(code);