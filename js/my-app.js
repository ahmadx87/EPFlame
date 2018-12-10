var $$ = Dom7;

var stopColors = JSON.parse(localStorage.getItem('stopColors'));
if (!stopColors) { 
	stopColors = [[0,0,0],[255,0,0],[255,127,0],[255,255,255]]; 
};


	document.getElementById("color-stop-1").style.backgroundColor=toRGBstring(stopColors[0]);
	document.getElementById("color-stop-2").style.backgroundColor=toRGBstring(stopColors[1]);
	document.getElementById("color-stop-3").style.backgroundColor=toRGBstring(stopColors[2]);
	document.getElementById("color-stop-4").style.backgroundColor=toRGBstring(stopColors[3]);

setGradient(stopColors);

function setGradient(stopColors){
	document.getElementById("fire-gradient").style.backgroundImage="linear-gradient(to top,"+toRGBstring(stopColors[3])+","+toRGBstring(stopColors[2])+","+toRGBstring(stopColors[1])+","+toRGBstring(stopColors[0])+")";
}

function toRGBstring(c){
	return "rgb("+c[0]+","+c[1]+","+c[2]+")";
}

var powerState = true;
var deviceIP = "http://192.168.4.1/";


// Init App
var app = new Framework7({
	id: 'electropeak.com.flame.controller',
	root: '#app',
	theme: 'md',
	statusbar: {
		materialBackgroundColor: '#303e8e',
	},
	view: {
		pushState: true,
	}
});


// Handle Cordova Device Ready Event
$$(document).on('deviceready', function () {
	document.addEventListener("backbutton", onBackKeyDown, false);
});

function onBackKeyDown(e) {
	if ($('html').hasClass('with-modal-popup') || $('html').hasClass('with-modal-dialog') || $('html').hasClass('with-modal-sheet')) {
		app.popup.close();
		app.dialog.close();
		app.sheet.close();
	} else {
		app.dialog.create({
			title: 'Exit',
			text: 'Are you sure?',
			buttons: [
				{
					text: 'No',
				},
				{
					text: 'Yes',
					color: 'red',
					onClick: function () {
						navigator.app.exitApp();
					},
				},
			],
			verticalButtons: false,
		}).open();
	}
};

document.addEventListener("DOMContentLoaded", function (event) {

	// Brightness slider

	$$('#brightnessSliderdiv').on("range:change", throttle(function (e, range) {
		sendChange("conf", {
			"brightness": Math.round(range.value * 2.55)
		});
	}, 200));

	$$('#FPSSlider').on("range:change", throttle(function (e, range) {
		sendChange("conf", {
			"fps": Math.round(range.value)
		});
	}, 200));

	$$('#SparkingSlider').on("range:change", throttle(function (e, range) {
		sendChange("conf", {
			"sparking": Math.round(range.value)
		});
	}, 200));

	$$('#CoolingSlider').on("range:change", throttle(function (e, range) {
		sendChange("conf", {
			"cooling": Math.round(range.value)
		});
	}, 200));


	//gradient stops event listener
	$$('.gradient-color-stops').on('click', function () {
		gradientStopEl=this;
		var stopId=this.getAttribute('id');
		var gradientStopIndex=parseInt(stopId.match(/\d+/g)[0])-1;
		var rgbString=window.getComputedStyle(this).backgroundColor;
		var gradientStopColor=rgbString.match(/\d+/g);
		var gardStopDialog=app.dialog.create({
			title: 'Set color',
			verticalButtons: false,
			cssClass: 'appdialog',
			buttons: [{
				text: 'Close',
				onClick: function () {
				},
			}
			],
			on: {
				open: function (d) {
					var els = d.$el.find('.range-slider');
					for (var i = 0; i < els.length; i++) {
						els[i].value = 200;
						app.range.create({
							el: els[i],
						});

					}

				},
				close: function(d){
					redColor=app.range.getValue('#redSlider');
					greenColor=app.range.getValue('#greenSlider');
					blueColor=app.range.getValue('#blueSlider');
					gradientStopEl.style.backgroundColor='rgb('+redColor+','+greenColor+','+blueColor+')';
					stopColors[gradientStopIndex]=[redColor,greenColor,blueColor];
					localStorage.setItem('stopColors',JSON.stringify(stopColors));
					sendChange("cs"+gradientStopIndex, {"R":stopColors[gradientStopIndex][0],"G":stopColors[gradientStopIndex][1],"B":stopColors[gradientStopIndex][2]});
					setGradient(stopColors);
					console.log('closed');
				}
			},
			content: '<div class="block">\
		 <div class="range-slider color-red" id="redSlider" data-label="true">\
		   <input type="range" min="0" max="255" step="1" value="0">\
		 </div>\
	   </div>\
	   <div class="block">\
		 <div class="range-slider color-green" id="greenSlider" data-label="true">\
		   <input type="range" min="0" max="255" step="1" value="0">\
		 </div>\
	   </div>\
	   <div class="block" >\
		 <div class="range-slider color-blue" id="blueSlider" data-label="true">\
		   <input  type="range" min="0" max="255" step="1" value="0">\
		 </div>\
	   </div>',
		}).open();

		app.range.setValue('#redSlider', gradientStopColor[0]);
		app.range.setValue('#greenSlider', gradientStopColor[1]);
		app.range.setValue('#blueSlider', gradientStopColor[2]);

	});



});



function sendChange(key ,dataToSend) {
	var xhttp = new XMLHttpRequest();
	var request=deviceIP+key+"?";
	var dataItems=Object.keys(dataToSend);
	for(var i=0; i<dataItems.length-1;i++){
		request+=dataItems[i]+"="+dataToSend[dataItems[i]]+"&";
	}
	request+=dataItems[dataItems.length-1]+"="+dataToSend[dataItems[dataItems.length-1]];
	xhttp.open("GET", request, true);
	xhttp.send();
}



// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
function throttle(func, wait, options) {
	var context, args, result;
	var timeout = null;
	var previous = 0;
	if (!options) options = {};
	var later = function () {
		previous = options.leading === false ? 0 : Date.now();
		timeout = null;
		result = func.apply(context, args);
		if (!timeout) context = args = null;
	};
	return function () {
		var now = Date.now();
		if (!previous && options.leading === false) previous = now;
		var remaining = wait - (now - previous);
		context = this;
		args = arguments;
		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
			previous = now;
			result = func.apply(context, args);
			if (!timeout) context = args = null;
		} else if (!timeout && options.trailing !== false) {
			timeout = setTimeout(later, remaining);
		}
		return result;
	};
};