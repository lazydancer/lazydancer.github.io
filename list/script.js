const encodeShortLetters = (dataString) => {
    const commonLetters = '-+$etaoinshrdlcumwfgypbvkjxqz1234567809TAOISWCBPHFMDRELNGUVYJKQXZ';
    const shortestLetters = 'ijltfrI-sJzacebdghnopq1uvxky023456789$FPS+LZTERBCDGHwKNOQAUVXYmMW';

    return dataString.split('')
      .map(x => shortestLetters[commonLetters.indexOf(x)])
      .join('');
};

const getDataString = () => {
  const myUL = document.getElementById('myUL');
  const htmlCollection = myUL.getElementsByTagName('li');
  const data = [].slice.call(htmlCollection);
  const test = data.map(item => item.innerText
    .slice(0, -1)
    .split(' ').join('-')
    .concat(item.className === 'checked' ? '$' : '+'));

  return encodeShortLetters(test.reduce((prev, next) => prev + next, ''));
};

const updateDataCode = (str) => {
  const post = document.getElementById('code');
  post.value = `pucula.com/list/?${str}`;
};

const newElement = (inputValue) => {
  const li = document.createElement('li');

  if (inputValue[inputValue.length - 1] === '.') {
    li.setAttribute('class', 'checked');
    inputValue = inputValue.slice(0, -1);
  }
  li.appendChild(document.createTextNode(inputValue));

  const close = document.createElement('span');
  close.className = 'close';
  close.appendChild(document.createTextNode("\u00D7"));
  li.appendChild(close);

  document.getElementById('myUL').appendChild(li);
  
  li.onclick = () => {
    li.setAttribute('class', (li.className === 'checked' ? '' : 'checked'));
    updateDataCode(getDataString());
  }

  close.onclick = () => {
    close.parentElement.remove();
    updateDataCode(getDataString());
  };

  document.getElementById('myInput').value = '';
  updateDataCode(getDataString());
};       

const inputNewElement = (inputValue) => {
  if (inputValue !== '') {
    console.log(inputValue);
    newElement(inputValue);
  }
};

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
    var listMaybe = code.replace(/\$/g,".$").split(/\+|\$/);
    listMaybe.splice(-1,1); //Remove blank element
    
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