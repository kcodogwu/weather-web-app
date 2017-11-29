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
  },
  formatDecimals: function formatDecimals(value, noOfDecimalPlaces) {
    return Number(Math.round(Number(value + 'e' + noOfDecimalPlaces)) + 'e-' + noOfDecimalPlaces).toFixed(noOfDecimalPlaces);
  },
  hasClass: function hasClass(el, className) {
    return el.classList ? el.classList.contains(className) : new RegExp('\\b'+ className+'\\b').test(el.className);
  },
  addClass: function addClass(el, className) {
    if (el.classList) el.classList.add(className);
    else if (!this.hasClass(el, className)) el.className += ' ' + className;
  },
  removeClass: function removeClass(el, className) {
    if (el.classList) el.classList.remove(className);
    else el.className = el.className.replace(new RegExp('\\b'+ className+'\\b', 'g'), '');
  },
  imageLink: 'http://openweathermap.org/img/w/',
  capitaliseFirstChar: function capitaliseFirstChar(text) {
    return text[0].toUpperCase() + text.substring(1);
  },
  create24HoursBreakdown: function create24HoursBreakdown(el, data) {
    var str = '';

    data.map(function createBreakdown(obj) {
      if (obj) {
        str += '<div class="weather-breakdown">';
        str += '  <div class="day">' + obj.day + '</div>';
        str += '  <div class="description">' + obj.weatherDescription + '</div>';
        str += '  <img alt="' + obj.weatherDescription + '" src="' + LIB.imageLink + obj.weatherIcon + '" />';
        str += '  <div class="temp"><span class="max-temp">' + obj.maxTemp + '</span>&nbsp;&nbsp;&nbsp;<span class="min-temp">' + obj.minTemp + '</span></div>';
        str += '  <div class="hour">' + obj.hours + '</div>';
        str += '</div>';
      }
    });

    el.innerHTML = str;
  }
};

window.onload = function onload() {
  var searchField = LIB._$('#search-field');
  var searchButton = LIB._$('#search-button');

  var search = function search(text) {
    LIB.getAjax(
      'http://api.openweathermap.org/data/2.5/weather?q=' + text + '&units=metric&mode=xml&type=like&appid=fa868a7f62f1ab1e638c07217f015307',
      function success(data) {
        var xmlData = data.responseXML;
        var cityName = xmlData.getElementsByTagName('city')[0].getAttribute('name');
        var temperature = xmlData.getElementsByTagName('temperature')[0];
        var tempValue = temperature.getAttribute('value');
        var minTemp = temperature.getAttribute('min');
        var maxTemp = temperature.getAttribute('max');
        var weather = xmlData.getElementsByTagName('weather')[0];
        var weatherDescription = weather.getAttribute('value');
        var weatherIcon = weather.getAttribute('icon') + '.png';
        var divTop = LIB._$('div.top');
        var h3 = document.createElement('h3');
        var h2 = document.createElement('h1');
        var div = document.createElement('div');
        var div1 = document.createElement('div');
        var sup = document.createElement('sup');
        var sup1 = document.createElement('sup');
        var sup2 = document.createElement('sup');
        var img = document.createElement('img');
        var br = document.createElement('br');
        
        h3.appendChild(document.createTextNode(cityName));
        div.appendChild(document.createTextNode(LIB.capitaliseFirstChar(weatherDescription)));
        img.alt = weatherDescription;
        img.src = LIB.imageLink + weatherIcon;
        LIB.addClass(img, 'weather-icon-margin-right');
        h2.appendChild(img);
        h2.appendChild(document.createTextNode(LIB.formatDecimals(tempValue, 0)));
        sup.appendChild(document.createTextNode('o'));
        sup1.appendChild(document.createTextNode('o'));
        sup2.appendChild(document.createTextNode('o'));
        h2.appendChild(sup);
        h2.appendChild(document.createTextNode('C'));
        div1.appendChild(document.createTextNode('Min. temperature: ' + LIB.formatDecimals(minTemp, 0)));
        div1.appendChild(sup1);
        div1.appendChild(document.createTextNode('C'));
        div1.appendChild(br);
        div1.appendChild(document.createTextNode('Max. temperature: ' + LIB.formatDecimals(maxTemp, 0)));
        div1.appendChild(sup2);
        div1.appendChild(document.createTextNode('C'));
        divTop.appendChild(h3);
        divTop.appendChild(div);
        divTop.appendChild(h2);
        divTop.appendChild(div1);
      }
    );

    LIB.getAjax(
      'http://api.openweathermap.org/data/2.5/forecast?q=' + text + '&units=metric&type=like&appid=fa868a7f62f1ab1e638c07217f015307',
      function success(data) {
        var divBottom = LIB._$('div.bottom');
        var context = LIB._$('.weather-chart').getContext('2d');
        var jsonData = JSON.parse(data.responseText);
        var theList = jsonData.list;
        var rawDataForChart = {};
        var rawDataForChartKeys = [];
        var days = [];
        var maxTemps = [];
        var minTemps = [];
        var weatherChart = {};
        var i = 0;

        var _24hrsData = theList.map(function filterData(el, index) {
          var obj = {};
          var milliseconds = 0;
          var dObj = {};

          // get entries for 24 hours
          if (index < 8) {
            milliseconds = Number(el.dt + '000');
            dObj = new Date(milliseconds);
            obj.day = dObj.toDateString().substring(0, dObj.toDateString().length - 5);
            obj.minTemp = LIB.formatDecimals(el.main.temp_min, 0);
            obj.maxTemp = LIB.formatDecimals(el.main.temp_max, 0);
            obj.hours = dObj.getHours() < 12 ? dObj.getHours() + 'am' : (dObj.getHours() - 12) + 'pm';
            obj.weatherDescription = LIB.capitaliseFirstChar(el.weather[0].description);
            obj.weatherIcon = el.weather[0].icon + '.png';
            return obj;
          }
        });
        
        LIB.create24HoursBreakdown(divBottom, _24hrsData);

        theList.map(function filterChatData(el) {
          var ms = Number(el.dt + '000');
          var aDate = new Date(ms);
          var day = aDate.toDateString().substring(0, aDate.toDateString().length - 5);

          if ((i + '.' + day) in rawDataForChart) {
            rawDataForChart[i + '.' + day].maxTemp.push(el.main.temp_max);
            rawDataForChart[i + '.' + day].minTemp.push(el.main.temp_min);
          } else {
            ++i;
            rawDataForChart[i + '.' + day] = { maxTemp: [], minTemp: [] };
            rawDataForChart[i + '.' + day].maxTemp.push(el.main.temp_max);
            rawDataForChart[i + '.' + day].minTemp.push(el.main.temp_min);
          }
        });

        rawDataForChartKeys = Object.keys(rawDataForChart);
        rawDataForChartKeys.sort();

        days = rawDataForChartKeys.map(function m(el) {
          return el.substring(el.indexOf('.') + 1);
        });

        // sort max temps for each day
        rawDataForChartKeys.map(function m1(key) {
          rawDataForChart[key].maxTemp.sort(function s(a, b) {
            return a - b;
          });
        });

        // sort min temps for each day
        rawDataForChartKeys.map(function m2(key) {
          rawDataForChart[key].minTemp.sort(function s(a, b) {
            return a - b;
          });
        });

        // get the maximum temp for each day
        maxTemps = rawDataForChartKeys.map(function m3(key) {
          var l = rawDataForChart[key].maxTemp.length;
          
          return rawDataForChart[key].maxTemp[l - 1];
        });

        // get the minimum temp for each day
        minTemps = rawDataForChartKeys.map(function m3(key) {
          return rawDataForChart[key].minTemp[0];
        });

        context.fillStyle = 'white';

        weatherChart = new Chart(context, {
          type: 'line',
          data: {
            labels: days,
            datasets: [
              {
                label: 'Min. Temp.',
                data: minTemps,
                borderColor: 'rgb(128, 128, 128)',
                backgroundColor: 'rgb(128, 128, 128, 0.3)'
              }, {
                label: 'Max. Temp.',
                data: maxTemps,
                borderColor: 'rgb(255, 255, 255)',
                backgroundColor: 'rgb(255, 255, 255, 0.3)'
              }
            ]
          },
          options: {
            title: {
              display: true,
              text: 'Maximum Temp. against Minimum Temp. for ' + days[0] + ' to ' + days[days.length - 1] + ', in degree Celsius',
              fontColor: 'rgb(255, 255, 255)',
              fontSize: 22
            },
            scales: {
              yAxes: [
                { 
                  gridLines: { color: 'rgb(159, 159, 159)' }, 
                  ticks: { fontColor: 'rgb(255, 255, 255)' } 
                } 
              ],
              xAxes: [
                { 
                  gridLines: { color: 'rgb(159, 159, 159)' }, 
                  ticks: { fontColor: 'rgb(255, 255, 255)' } 
                } 
              ]
            },
            legend: {
              labels: { fontColor: 'rgb(255, 255, 255)' }
            }
          }
        });
      }
    );
  };

  var searchHandler = function searchHandler(e) {
    e.preventDefault();

    var flag = false;

    search(searchField.value);
    flag = true;

    if (flag) {
      searchField.value = '';
    }
  };

  LIB.addEvent(searchButton, 'click', searchHandler);
};