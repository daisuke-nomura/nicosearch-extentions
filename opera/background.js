// opera.extension.onconnect = function(event){
   // event.source.postMessage("");
   // opera.postError("");
// }
opera.extension.onmessage = function(event){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
	  event.source.postMessage(xhr.responseText);
    }
  };
  
  var url = "http://nicotools.com/nicosearch/mysqli.php?inp=";
  xhr.open("GET", url + encodeURI(event.data), true);
  xhr.send();
}