'use strict';

var LIB = {
  _$: function _$(selector, context) {
    var result = (context || document).querySelectorAll(selector);

    if (result.length > 1)
      return [].slice.call(result, 0)
    ; else
      return result[0]
    ;
  },
  getAjax: function getAjax(url, success) {
    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : (new ActiveXObject('Msxml2.XMLHTTP') || new ActiveXObject('Microsoft.XMLHTTP'));

    xhr.open('GET', url);

    xhr.onreadystatechange = function() {
      if (xhr.readyState>3 && xhr.status==200) {
        success(xhr);
      }
    };
    
    xhr.send();
    return xhr;
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
  LIB.getAjax(
    'http://api.openweathermap.org/data/2.5/weather?q=Athlone,ie&units=metric&mode=xml&type=like&appid=fa868a7f62f1ab1e638c07217f015307',
    function success(data) {
      var xmlData = data.responseXML;
      var cityName = xmlData.getElementsByTagName('city')[0].getAttribute('name');
      var temperature = xmlData.getElementsByTagName('temperature')[0];
      var tempValue = temperature.getAttribute('value');
      var tempMin = temperature.getAttribute('min');
      var tempMax = temperature.getAttribute('max');
      var clouds = xmlData.getElementsByTagName('clouds')[0].getAttribute('name');
      var divTop = LIB._$('div.top');
      var h3 = document.createElement('h3');
      var h2 = document.createElement('h1');
      var p = document.createElement('p');
      var p1 = document.createElement('p');
      var sup = document.createElement('sup');
      
      h3.appendChild(document.createTextNode(cityName));
      p.appendChild(document.createTextNode(clouds));
      h2.appendChild(document.createTextNode(tempValue));
      sup.appendChild(document.createTextNode('o'));
      h2.appendChild(sup);
      h2.appendChild(document.createTextNode('C'));
      p1.appendChild(document.createTextNode('Min: ' + tempMin + ' Max: ' + tempMax));
      divTop.appendChild(h3);
      divTop.appendChild(p);
      divTop.appendChild(h2);
      divTop.appendChild(p1);

      // console.log(cityName);
      // console.log(tempValue);
      // console.log(tempMin);
      // console.log(tempMax);
      // console.log(clouds);
    }
  );

  LIB.getAjax(
    'http://api.openweathermap.org/data/2.5/forecast?q=Athlone,ie&units=metric&type=like&appid=fa868a7f62f1ab1e638c07217f015307',
    function success(data) {
      console.log(JSON.parse(data.responseText));
    }
  );

  // LIB.getAjax(
  //   'http://api.openweathermap.org/data/2.5/forecast?q=Athlone,ie&units=metric&type=like&appid=fa868a7f62f1ab1e638c07217f015307',
  //   function success(data) {
      
  //     console.log(JSON.parse(data));
  //   }
  // );
};