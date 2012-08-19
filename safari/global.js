safari.application.addEventListener('message',function(evt){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
	  evt.target.page.dispatchMessage('Response', JSON.parse(xhr.responseText));
    }
  };
  
  var url = "http://nicotools.com/nicosearch/mysqli.php?inp=";
  xhr.open("GET", url + encodeURI(evt.message), true);
  xhr.send();
},false);