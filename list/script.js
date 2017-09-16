
    // Input by button
    addBtn = document.getElementById("addBtn");
    addBtn.onclick = function(){
      var inputValue = document.getElementById("myInput").value;
      inputNewElement(inputValue);
    }

    // Input by return
    function enterNewElement() {
        if(event.keyCode == 13) {
            inputNewElement();   
        }
    }
  
    function inputNewElement(inputValue){
      if(inputValue == ""){
        alert("You must write something");
      } else {
        newElement(inputValue);
      }
    }

    // --------------------------------------------------

    function newElement(inputValue) {

      var li = document.createElement("li");

      if(inputValue[inputValue.length-1] == "."){
        li.setAttribute("class","checked");
        inputValue = inputValue.substr(0, inputValue.length-1);
      }

      li.onclick = function() {
        if(li.className == "checked"){
          li.setAttribute("class","");
        }else{
          li.setAttribute("class","checked");
        }
        updateDataCode();
      }

      li.appendChild(document.createTextNode(inputValue));

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

    function getDataString(){

        var data = document.getElementsByTagName("li");

        var test = []
        for(var i = 0; i < data.length; i++){
            item = data[i].innerHTML;
            item = item.replace(/<\/?span[^>]*>/g,"");
            item = item.substr(0, item.length-1); // remove "x"
            item = item.split(' ').join('-'); // change spaces with "-"
            
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

    function reverseFirstLeter(str){
        if(str == ""){ return ""; }
        if(str.charAt(0) == str.charAt(0).toUpperCase()){
            return str.charAt(0).toLowerCase() + str.slice(1);
        }else{
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
    }

    function updateDataCode(){

        dataCode = getDataString();

        var post = document.getElementById("code");
        post.value = "pucula.com/list/?" + encodeShortLetters(dataCode);


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