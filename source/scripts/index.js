'use strict';

var LIB = {
  _$: function _$(selector, context) {
    var result = (context || document).querySelectorAll(selector);

    if (result.length > 1)
      return [].slice.call(result, 0)
    ; else
      return result
    ;
  },
  getCORS: function getCORS(url, success) {
    var xhr = new XMLHttpRequest();

    if (xhr.withCredentials === undefined) xhr = new XDomainRequest();
    xhr.open('GET', url);

    xhr.onload = function xhr_onload(request) {
      var res = request.currentTarget || request.target;
    
      if (res.responseText !== undefined)
        success(res.responseText)
      ; else
        success(res.response)
      ;
    };

    xhr.send();
    return xhr;
  },
  parseXML: function parseXML(str) {
    var xmlDoc = str;

    if (window.DOMParser) 
      xmlDoc = (new DOMParser()).parseFromString(str, 'text/xml')
    ; else {
      xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
      xmlDoc.async = false;
      xmlDoc.loadXMl(str);
    }

    return xmlDoc;
  },
  addEvent: function addEvent(el, type, handler) {
    if (el.attachEvent)
      el.attachEvent('on' + type, handler)
    ; else
      el.addEventListener(type, handler)
    ;
  }
};

window.onload = function onload() {
  //var div = LIB._$('div');

  LIB.getCORS(
    'http://api.openweathermap.org/data/2.5/forecast?q=Athlone,ie&units=metric&mode=xml&type=like&appid=fa868a7f62f1ab1e638c07217f015307',
    function success(data) {
      console.log(data);
    }
  );

  LIB.getCORS(
    'http://api.openweathermap.org/data/2.5/forecast?q=Athlone,ie&units=metric&type=like&appid=fa868a7f62f1ab1e638c07217f015307',
    function success(data) {
      
      console.log(JSON.parse(data));
    }
  );
};