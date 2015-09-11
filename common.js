
var alertFallback = false;
//console = {}; //turn off console
//console.log = function() {};
//console.debug = function() {};
//console.info = function() {};
//console.warn = function() {};
////console.error = function() {};
 




//jQuery.fx.off = true;

function getInternetExplorerVersion()
// Returns the version of Internet Explorer or a -1
// (indicating the use of another browser).
{
  var rv = -1; // Return value assumes failure.
  if (navigator.appName == 'Microsoft Internet Explorer')
  {
    var ua = navigator.userAgent;
    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null)
      rv = parseFloat( RegExp.$1 );
  }
  return rv;
}

function checkDateFormat(_date) {
	// regular expression to match required date format
    var re = /^\d{1,2}\/\d{1,2}\/\d{4}$/;

    if(_date != '' && !_date.match(re)) {
      return false;
    }
	return true;
}



var scrollToTop = function() {
jQuery('html,body').animate({scrollTop:0},0);
};

//by default ignore all form submit
$(document).ready(function(e) {	
	$('form').on('submit',function(e) {		
	
		//console.log("form submit ignored");
		if (e &&e.preventDefault) e.preventDefault();
		else if (window.event && window.event.returnValue)
		window.eventReturnValue = false;
		return false;
	});
	
	if(getInternetExplorerVersion() >-1) {
		var disabledControls = $("input:disabled, textarea:disabled");
		disabledControls.removeAttr('disabled');
		disabledControls.addClass("is-disabled");
		disabledControls.focus(function() {
			this.blur();
		});
	}
});




<!-- Menu Click function -->	
var activeMenuBtn = function($btn) { 
	 if($btn.length == 0) {
		 //console.log("activeMenuBtn btn null");
			return false;
		}

	var _activeThemeH = 'e', 
		_inactiveThemeH = '',
		_activeThemeV = 'e',
		_inactiveThemeV = 'a',
		_href = $btn.attr('href');
		
		
	
	var  $selfMenuBtn, $otherMenuBtn, _activeThemeSelf, _inactiveThemeSelf,
			_activeThemeOther, _inactiveThemeOther;

	if($('#menuBarH').has($btn).length > 0) {
		
			$selfMenuBtn = $btn;
		$otherMenuBtn = $('#menuBarV a[href="'+_href+'"]').parents('li');
			_activeThemeSelf = _activeThemeH;
			_inactiveThemeSelf = _inactiveThemeH;
			_activeThemeOther = _activeThemeV;
			_inactiveThemeOther = _inactiveThemeV;

	} else if($('#menuBarV').has($btn).length > 0) {
			$selfMenuBtn = $btn.parents('li');
		$otherMenuBtn = $('#menuBarH a[href="'+_href+'"]');
			_activeThemeSelf = _activeThemeV;
			_inactiveThemeSelf = _inactiveThemeV;
			_activeThemeOther = _activeThemeH;
			_inactiveThemeOther = _inactiveThemeH;

	} else {
			return $btn;
	}

	$('#menuBarV .active').removeClass('active').buttonMarkup({theme: _inactiveThemeV});
	$('#menuBarH .active').removeClass('active').buttonMarkup({theme: _inactiveThemeH});
	
	$selfMenuBtn.addClass('active').buttonMarkup({theme: _activeThemeSelf});
	$otherMenuBtn.addClass('active').buttonMarkup({theme: _activeThemeOther});
	


	return $btn;
};


var menuClickEvent = function (btn) {
	if(btn.length == 0) {
		 //console.log("menuClickEvent btn null");
		return false;
	}

	var _clickTab = btn.attr('href');
	activeMenuBtn(btn);		
	$(_clickTab).siblings().hide();
	$(_clickTab).show();
	
	return false;
};



$(document).ready(function(e) {	 
$('#menuBarH a').click(function(event) {
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
	$.mobile.navigate($(this).attr('href'));
	
}).focus(function(){
this.blur();
});

$('#menuBarV a').click(function(event) {
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
	
	
	$.mobile.navigate($(this).attr('href'));

	
}).focus(function(){
this.blur();
});
});
<!-- end Menu Click function -->		





if (typeof console === "undefined" || typeof console.log === "undefined") {
	console = {};
	if (alertFallback) {
		console.log = function(msg) {
		alert(msg);
	};
	} else {
		console.log = function() {};
	}
}
<!-- end  Console Log function -->

<!-- validate error --> 
var errorPlacement =function(errorText, element) {
	 var errorSpan = $('<span class="errorText">' + errorText + '</span>');
	 var fieldName = element.attr('name');
	 var targetLabel = $('label[for='+fieldName+']');

	 targetLabel.find('.errorText').remove();
	 errorSpan.appendTo(targetLabel);

};

var getValueWithCheckBlank = function(element) {
	var value = element.val();
	
	var fieldName = element.attr('name');
	$('label[for='+fieldName+']').find('.errorText').remove();
	if(value == "" ) {
		errorPlacement("This field is required.", element);
	} 	
	return value;
};


var getURLParameter = function(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
};

var notifyUser = function(msg, cb) {
    //return alert(msg);
    //  //console.log("notifyUser");
	if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {

        navigator.notification.alert(msg,cb, 'COA Mobile','OK');
	}
	else {
		alert(msg);
		if(cb) {
			cb();
		}
	}
}


var setupNoneBtn = function(checkListId, noneButtonId) {
	////console.log(checkListId + " setup None btn = " +noneButtonId);
	
	checkListId.find('input[type="checkbox"]').each(function() {
		if($(this).attr("id") != noneButtonId) {
		
			$(this).click(function() {
				if($(this).is(':checked')) {
					////console.log("uncheck " + noneButtonId);
					checkListId.find('#' + noneButtonId).attr("checked", false).checkboxradio("refresh");
				}
			});
		}
		
		if($(this).attr("id") == noneButtonId) {
			$(this).click(function() {
				if($(this).is(':checked')) {
					////console.log("uncheck all other");
					checkListId.find('input[type="checkbox"]').each(function() {
						 if($(this).attr("id") != noneButtonId) {
							// //console.log("uncheck " + noneButtonId);
								$(this).attr("checked", false).checkboxradio("refresh");
						 }
					});

				}
			});
		}
	});
}

var genDateString = function(_d) {

	try {
	var d = $.datepicker.parseDate("yy-mm-dd", _d.substring(0, _d.length - 9)); //14/12/1958 0:00:00
	//console.debug(d), _d;

	var yyyy = d.getFullYear();
	var MM = ('0' + (d.getMonth() + 1)).slice(-2);

	var dd = ('0' + d.getDate()).slice(-2);

	var string = dd + "/" + MM + "/" + yyyy;
	return string;
	} catch(err) {
		//console.warn(err);
		return d;
		
	}
};

   function include(filename)
	{
	    var head = document.getElementsByTagName('head')[0];
	   
	    script = document.createElement('script');
	    script.src = filename;
	    script.type = 'text/javascript';
	   
	    head.appendChild(script)
	}
function appendYear()
{
	//<span class="footer-year"></span>
	var d = new Date();
	var n = d.getFullYear();
	$('.footer-year').append(n);
}