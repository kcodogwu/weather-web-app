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
  create24HoursBreakdown: function create24HoursBreakdown(el, data, tu) {
    var str = '';
    
    str += '<h2 class="weather-breakdown-title">24 Hour Weather Breakdown</h2>';
    str += '<div class="weather-breakdown">';

    data.map(function createBreakdown(obj) {
      if (obj) {
        str += '<div class="detail">';
        str += '  <div class="day">' + obj.day + '</div>';
        str += '  <div class="description">' + obj.weatherDescription + '</div>';
        str += '  <img alt="' + obj.weatherDescription + '" src="' + LIB.imageLink + obj.weatherIcon + '" />';
        str += '  <div class="temp"><span class="max-temp">' + obj.maxTemp + '<sup>o</sup>' + tu + '</span>&nbsp;&nbsp;&nbsp;<span class="min-temp">' + obj.minTemp + '<sup>o</sup>' + tu + '</span></div>';
        str += '  <div class="hour">' + obj.hours + '</div>';
        str += '</div>';
      }
    });

    str += '</div>';

    el.innerHTML = str;
  },
  tempUnit: 'C',
  convertTemperature: function convertTemperature(selectedTempUnit, value) {
    if (selectedTempUnit !== this.tempUnit) {
      if (selectedTempUnit === 'F')
        value = ((value / 5) * 9) + 32
      ; else
        value = ((value - 32) / 9) * 5
      ;
    }

    return value;
  },
  xmlData: null,
  jsonData: null,
  tempValue: null,
  maxTemp: null,
  minTemp: null,
  _24hrsData: [],
  maxTemps: [],
  minTemps: []
};

window.onload = function onload() {
  var searchField = LIB._$('.search-field');
  var searchButton = LIB._$('.search-button');
  var c = LIB._$('.celsius-temp');
  var f = LIB._$('.fahrenheit-temp');
  var tempUnits = document.forms['temp-units'];
  var tu = tempUnits.tempUnit;
  
  // Handle top display area
  var topDisplay = function topDisplay(xd) {
    var cityName = xd.getElementsByTagName('city')[0].getAttribute('name');
    var temperature = xd.getElementsByTagName('temperature')[0];
    var weather = xd.getElementsByTagName('weather')[0];
    var weatherDescription = weather.getAttribute('value');
    var weatherIcon = weather.getAttribute('icon') + '.png';
    var divTop = LIB._$('div.top');
    var h2 = document.createElement('h2');
    var divMainTemp = document.createElement('div');
    var div = document.createElement('div');
    var div1 = document.createElement('div');
    var sup = document.createElement('sup');
    var sup1 = document.createElement('sup');
    var sup2 = document.createElement('sup');
    var img = document.createElement('img');
    var br = document.createElement('br');
    var maxSpan = document.createElement('span');
    var minSpan = document.createElement('span');
    var top = LIB._$('div.top');

    LIB.tempValue = LIB.tempValue === null ? LIB.formatDecimals(temperature.getAttribute('value'), 0) : LIB.tempValue;
    LIB.minTemp = LIB.minTemp === null ? LIB.formatDecimals(temperature.getAttribute('min'), 0) : LIB.minTemp;
    LIB.maxTemp = LIB.maxTemp === null ? LIB.formatDecimals(temperature.getAttribute('max'), 0) : LIB.maxTemp;

    if (top.hasChildNodes()) {
      while (top.hasChildNodes()) {
        top.removeChild(top.childNodes[0]);
      }
    }
    
    LIB.addClass(divMainTemp, 'main-temp');
    LIB.addClass(maxSpan, 'max-temp');
    LIB.addClass(minSpan, 'min-temp');
    h2.appendChild(document.createTextNode(cityName));
    div.appendChild(document.createTextNode(LIB.capitaliseFirstChar(weatherDescription)));
    img.alt = weatherDescription;
    img.src = LIB.imageLink + weatherIcon;
    LIB.addClass(img, 'weather-icon-margin-right');
    divMainTemp.appendChild(img);
    LIB.tempValue = LIB.formatDecimals(LIB.convertTemperature(tu.value, LIB.tempValue), 0);
    divMainTemp.appendChild(document.createTextNode(LIB.tempValue));
    sup.appendChild(document.createTextNode('o'));
    sup1.appendChild(document.createTextNode('o'));
    sup2.appendChild(document.createTextNode('o'));
    divMainTemp.appendChild(sup);
    divMainTemp.appendChild(document.createTextNode(tu.value));
    LIB.maxTemp = LIB.formatDecimals(LIB.convertTemperature(tu.value, LIB.maxTemp), 0);
    maxSpan.appendChild(document.createTextNode('Max. temperature: ' + LIB.maxTemp));
    maxSpan.appendChild(sup1);
    maxSpan.appendChild(document.createTextNode(tu.value));
    LIB.minTemp = LIB.formatDecimals(LIB.convertTemperature(tu.value, LIB.minTemp), 0);
    minSpan.appendChild(document.createTextNode('Min. temperature: ' + LIB.minTemp));
    minSpan.appendChild(sup2);
    minSpan.appendChild(document.createTextNode(tu.value));
    div1.appendChild(maxSpan);
    div1.appendChild(br);
    div1.appendChild(minSpan);
    divTop.appendChild(h2);
    divTop.appendChild(div);
    divTop.appendChild(divMainTemp);
    divTop.appendChild(div1);
  };

  var bottomDisplay = function bottomDisplay(jd) {
    var divBottom = LIB._$('div.bottom');
    var chartTitle = LIB._$('.chart-title');
    var wcCanvas = LIB._$('.weather-chart');
    var context = wcCanvas.getContext('2d');
    var rawDataForChart = {};
    var rawDataForChartKeys = [];
    var weatherChart = {};
    var i = 0;

    var filterData = function filterData(el, index) {
      var obj = {};
      var milliseconds = 0;
      var dObj = {};

      // get entries for 24 hours
      if (index < 8) {
        milliseconds = Number(el.dt + '000');
        dObj = new Date(milliseconds);
        obj.day = dObj.toDateString().substring(0, dObj.toDateString().length - 5);
        obj.minTemp = LIB.formatDecimals(LIB.convertTemperature(tu.value, el.main.temp_min), 0);
        obj.maxTemp = LIB.formatDecimals(LIB.convertTemperature(tu.value, el.main.temp_max), 0);
        obj.hours = dObj.getHours() < 12 ? dObj.getHours() + 'a.m.' : (dObj.getHours() === 12 ? dObj.getHours() + 'p.m.' : (dObj.getHours() - 12) + 'p.m.');
        obj.weatherDescription = LIB.capitaliseFirstChar(el.weather[0].description);
        obj.weatherIcon = el.weather[0].icon + '.png';
        return obj;
      }
    };

    var filterData1 = function filterData1(el) {
      if (el) {
        el.minTemp = LIB.formatDecimals(LIB.convertTemperature(tu.value, el.minTemp), 0);
        el.maxTemp = LIB.formatDecimals(LIB.convertTemperature(tu.value, el.maxTemp), 0);

        return el;
      }
    };

    if (divBottom.hasChildNodes()) {
      while (divBottom.hasChildNodes()) {
        divBottom.removeChild(divBottom.childNodes[0]);
      }
    }

    // I found out that whenever the width and height attributes are set or reset the bitmap and any associated contexts must be cleared back to their initial state
    wcCanvas.width = wcCanvas.width; 
    // check if value already exists
    LIB._24hrsData = LIB._24hrsData.length === 0 ? jd.map(filterData) : LIB._24hrsData.map(filterData1);
    LIB.create24HoursBreakdown(divBottom, LIB._24hrsData, tu.value);

    if (LIB.maxTemps.length === 0 && LIB.minTemps.length === 0) {
      jd.map(function filterChatData(el) {
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

      LIB.days = rawDataForChartKeys.map(function m(el) {
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
      LIB.maxTemps = rawDataForChartKeys.map(function m3(key) {
        var l = rawDataForChart[key].maxTemp.length;
        
        return LIB.formatDecimals(LIB.convertTemperature(tu.value, rawDataForChart[key].maxTemp[l - 1]), 0);
      });

      // get the minimum temp for each day
      LIB.minTemps = rawDataForChartKeys.map(function m3(key) {
        return LIB.formatDecimals(LIB.convertTemperature(tu.value, rawDataForChart[key].minTemp[0]), 0);
      });
    } else {
      LIB.maxTemps = LIB.maxTemps.map(function m4(el) {
        return LIB.formatDecimals(LIB.convertTemperature(tu.value, el), 0);
      });
      
      LIB.minTemps = LIB.minTemps.map(function m5(el) {
        return LIB.formatDecimals(LIB.convertTemperature(tu.value, el), 0);
      });
    }

    chartTitle.innerHTML = 'Maximum Temp. against Minimum Temp. for ' 
      + LIB.days[0] + ' to ' + LIB.days[LIB.days.length - 1] + ', in degree ' 
      + (tu.value === 'C' ? 'Celsius' : 'Fahrenheit')
    ;
    
    weatherChart = new Chart(context, {
      type: 'line',
      data: {
        labels: LIB.days,
        datasets: [
          {
            label: 'Min. Temp.',
            data: LIB.minTemps,
            borderColor: 'rgb(128, 128, 128)',
            backgroundColor: 'rgb(128, 128, 128, 0.5)'
          }, {
            label: 'Max. Temp.',
            data: LIB.maxTemps,
            borderColor: 'rgb(255, 255, 255)',
            backgroundColor: 'rgb(255, 255, 255, 0.5)'
          }
        ]
      },
      options: {
        // title: {
        //   display: true,
        //   text: 'Maximum Temp. against Minimum Temp. for ' + days[0] + ' to ' + days[days.length - 1] + ', in degree Celsius',
        //   fontColor: 'rgb(255, 255, 255)',
        //   fontSize: 22
        // },
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
  };

  var search = function search(text) {
    LIB.getAjax(
      'http://api.openweathermap.org/data/2.5/weather?q=' + text + '&units=metric&mode=xml&type=like&appid=fa868a7f62f1ab1e638c07217f015307',
      function success(data) {
        LIB.xmlData = data.responseXML;
        // reset
        LIB.tempValue = null;
        LIB.maxTemp = null;
        LIB.minTemp = null;
        topDisplay(LIB.xmlData);

        LIB.getAjax(
          'http://api.openweathermap.org/data/2.5/forecast?q=' + text + '&units=metric&type=like&appid=fa868a7f62f1ab1e638c07217f015307',
          function success(data1) {
            LIB.jsonData = (JSON.parse(data1.responseText)).list;
            LIB._24hrsData = [];
            LIB.maxTemps = [];
            LIB.minTemps = [];
            bottomDisplay(LIB.jsonData);
            LIB.tempUnit = tu.value;
          }
        );
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

  var tempUnitChangeHandler = function tempUnitChangeHandler(e) {
    var el = e.target;

    if (LIB.xmlData !== null && LIB.jsonData !== null) {
      topDisplay(LIB.xmlData);
      bottomDisplay(LIB.jsonData);
      LIB.tempUnit = el.value;
    }    
  };

  LIB.addEvent(c, 'change', tempUnitChangeHandler);
  LIB.addEvent(f, 'change', tempUnitChangeHandler);
  LIB.addEvent(searchButton, 'click', searchHandler);
};