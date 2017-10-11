const encodeShortLetters = (dataString) => {
    const commonLetters = '-+$etaoinshrdlcumwfgypbvkjxqz1234567809TAOISWCBPHFMDRELNGUVYJKQXZ';
    const shortestLetters = 'ijltfrI-sJzacebdghnopq1uvxky023456789$FPS+LZTERBCDGHwKNOQAUVXYmMW';

    return dataString.split('')
      .map(x => shortestLetters[commonLetters.indexOf(x)])
      .join('');
};

const decodeShortLetters = (dataString) => {
    const commonLetters = '-+$etaoinshrdlcumwfgypbvkjxqz1234567809TAOISWCBPHFMDRELNGUVYJKQXZ';
    const shortestLetters = 'ijltfrI-sJzacebdghnopq1uvxky023456789$FPS+LZTERBCDGHwKNOQAUVXYmMW';

    return dataString.split('')
      .map(x => commonLetters[shortestLetters.indexOf(x)])
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

const addBtn = document.getElementById('addBtn');
addBtn.onclick = () => inputNewElement(document.getElementById('myInput').value);

const writeCode = (code) => {
  const listMaybe = decodeShortLetters(code)
    .split('-').join(' ')
    .replace(/\$/g,".$").split(/\+|\$/)
    .splice(-1,1); //Remove blank element
    
  listMaybe.forEach(item => inputNewElement(item));
};

const initCode = (code) => {
    if (code === '' || code == null){
        newElement('Hit the gym');
        newElement('Pay bills.');
        newElement('Meet George');
        newElement('Buy eggs');
        newElement('Read a book');
        newElement('Organize Office.');
    } else {
        writeCode(code);
    }
};

// copy to clipboard function
function copy(e) {
  // find target element
  const t = e.target;
  const c = t.dataset.copytarget;
  const inp = (c ? document.querySelector(c) : null);
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

document.body.addEventListener('click', copy, true);
// event handler


const url = window.location.href;
const array = url.split('?');
window.onload = initCode(array[1]);