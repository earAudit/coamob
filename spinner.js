

function showloading(message) {
	if(message== null || message == "") {
		message = "Loading ...";
	}
	
	if ($("#overlay").length <= 0){
		var overlay = jQuery('<div id="overlay"> </div>');
		overlay.appendTo(document.body);
	}
	
	
	if (navigator.userAgent.match(/(Android)/)) {
		window.plugins.spinnerDialog.hide();
		window.plugins.spinnerDialog.show("COA",message);
		return;
	}
	var interval = setInterval(function(){
		//console.log("showloading", message);
        $.mobile.loading('show', {
            text: message,
            textVisible: true,
            textonly: false,
		});
        clearInterval(interval);
    },1); 
	
}

function   hideloading() {
	if ($("#overlay").length > 0){
		$('#overlay').remove();
	}
	
	if (navigator.userAgent.match(/(Android)/)) {
		window.plugins.spinnerDialog.hide();
		return;
	}
	
	var interval = setInterval(function(){
			//console.log("hideloading");
			$.mobile.loading('hide');
			clearInterval(interval);
		},1); 
}


