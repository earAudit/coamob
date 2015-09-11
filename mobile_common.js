var dm=new datamanager('userinfo');
var g_privatekey;
var g_idleTimer;
var isDoctorLogin = false;
var failcount=0;
var doctor_failcount = 0;
var isShow=false; //isdialog is showing
var isDoctorPINshow = false;
//private key

function setisDoctorLogin(b) {
	isDoctorLogin = b;
	dm.saveData({key:"isDoctorLogin", value:b});		
		
}

function checkKeyConfirm(todo)
{
    if (hasKey())
        if (!isShow)
        {
            $("#tab-Questionaire").hide();

            if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
                navigator.notification.prompt(
                    'Please enter your security key.\n( '+(5-failcount)+' chance(s) left)',  // message
                function(results) {

                    if (  results.input1!=g_privatekey)
                    {
                        failcount++;
                        if (failcount==5) {
                            isShow=false;
                            backToHome();
                        }
                        else {
                            isShow=false;
                            checkKeyConfirm(todo);
                        }
                    }
                    else
                        todo();

                },                  // callback to invoke
                'Security key',            // title
                ['OK'],             // buttonLabels
                new String()                 // defaultText
                );

            } else {
				var results = {}; 
				results.input1 = prompt('Please enter your security key.\n( '+(5-failcount)+' chance(s) left)');
				   if (  results.input1!=g_privatekey)
					{
						failcount++;
						if (failcount==5) {
							isShow=false;
							backToHome();
						}
						else {
							isShow=false;
							checkKeyConfirm(todo);
						}
					}
					else
						todo();
			  }
            isShow=true;
        }
}
function checkKeyDialog() {
	//console.log("checkKeyDialog");
    if (hasKey()) {
        if (!isShow)
        {
			isShow=true;
			if(isNaN(failcount)) {
				failcount = 0;
			}
            if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
                navigator.notification.prompt(
                    'Please enter your security key.\n( '+(5-failcount)+' chance(s) left)',  // message
                    checkKey,                  // callback to invoke
                    'Security key',            // title
                    ['OK'],             // buttonLabels
                    new String()                 // defaultText
                );

            } 
			else {
                var results = {};
				results.input1 = prompt('Please enter your security key.\n( '+(5-failcount)+' chance(s) left)');
                checkKey(results);
            }
            

        }
	}
}

function checkDoctorKeyDialog() {
	//console.log("checkKeyDialog");
    if (isDoctorLogin) {
        if (!isDoctorPINshow)
        {
			isDoctorPINshow=true;
			if(isNaN(doctor_failcount)) {
				doctor_failcount = 0;
			}
            if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
                navigator.notification.prompt(
                    'Please enter Doctor security PIN (this device).\n( '+(5-doctor_failcount)+' chance(s) left)',  // message
                    checkDoctorKey,                  // callback to invoke
                    'Security PIN',            // title
                    ['OK'],             // buttonLabels
                    new String()                 // defaultText
                );

            } 
			else {
                var results = {};
				results.input1 = prompt('Please enter Doctor security PIN (this device).\n( '+(5-doctor_failcount)+' chance(s) left)');
                checkDoctorKey(results);
            }
            

        }
	}
}

function checkDoctorKey(results) {

	if ( dm.getData('pin').value!=$.md5(results.input1) ) //check doctor
	{
		doctor_failcount++;
		if (doctor_failcount==5) {
			isDoctorPINshow=false;
			if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
				navigator.notification.alert('Permission Denied. Redirect to home page.',
				function() {
					backToHome();
				},' ','OK');
			}
			else {
				alert('Permission of Doctor section is denied. Redirect to home page.');
				backToHome();
			}

		}
		else {
			isDoctorPINshow=false;
			checkDoctorKeyDialog();
		}
	}
	else {
		isDoctorPINshow=false;	
		doctor_failcount=0;
	}
}

    function initKeyDialog() {
        /*navigator.notification.prompt(
         'You are now in Offline Mode.\nPlease initialize your security key',  // message
         assignKey,                  // callback to invoke
         'Initialize security key',            // title
         ['Ok'],             // buttonLabels
         new String()                 // defaultText
         );*/
    }
    function dialogShow() {

$.mobile.changePage( "#myDialog", { role: "dialog" ,closeBtn: "none"} );
        $("#myDialog").show();
        $("#tab-Questionaire").hide();

    }

    function dialogClose() {
        $.mobile.changePage("#LoginPage");

        $("#tab-Questionaire").show();
        $( ".ui-dialog" ).dialog( "close" );
        resetTimer();
        startTimer();
    }
    function resetTimer()
    {
        clearTimeout(g_idleTimer);
		//console.log('resetTimer', g_idleTimer);
    }

    function startTimer()
    {
		if(g_idleTimer) {clearTimeout(g_idleTimer);}
        g_idleTimer = setTimeout(checkKeyDialog, 10*60*60*1000); 
		//console.log('startTimer', g_idleTimer);
    }
    function setEmpty(element) {
        element.val('');
        var fieldName = element.attr('name');
        $('label[for='+fieldName+']').find('.errorText').remove();

    }
    function checkKey(results) {

        if (  results.input1!=g_privatekey)
        {
            failcount++;
            if (failcount==5) {
                isShow=false;
				if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
					navigator.notification.alert('Please inform the receiption that you forgot your Security Pin. You will need to answer all the question again.',
					function() {
						backToHome();
					},' ','OK');
				}
				else {
					alert('Please inform the receiption that you forgot your Security Pin. You will need to answer all the question again.');
					backToHome();
				}

            }
            else {
                isShow=false;
                checkKeyDialog();
            }
        }
        else {
			isShow=false;
            resetTimer();
            startTimer();
            
            failcount=0;
        }
    }

    function removeKey()
    {
		setisDoctorLogin(false);
		failcount=0;
		doctor_failcount = 0;
		isShow=false;
		isDoctorPINshow = false;
        g_privatekey="";
    }
    function hasKey()
    {
        if (isEmpty(g_privatekey))
            return false;
        else
            return true;
    }
    function assignKey(results) {
        g_privatekey=results;  // input valid : assign key and start the idle timer
    }

    function isEmpty(str) {
        return ( !str|| !str.length );
    }

    function backToHome() {
        backToMenu();
    }
	
	function backToMenu(){
			//$.mobile.changePage("#MenuPage");
		      // $("#tab-Questionaire").empty();
		      // for(var id=0;id<4;id++)
		      // $("#tab-"+id).empty();
			setisDoctorLogin(false);
	      	var hospital_no=getURLParameter("hospital_no");
	        var hospital_name=getURLParameter("hospital_name");
	        var area=getURLParameter("area");
	        var username=getURLParameter("username");
	        var level=getURLParameter("level");
		    removeKey();    
		    window.location.replace('questionnaire.htm'+'?username='+username+'&hospital_no='+hospital_no+'&hospital_name='+hospital_name+'&area='+area+'&level='+level);
		   
	}
	
	function backToDoctorMenu(){
	
			if(isDoctorLogin) {
				var hospital_no=getURLParameter("hospital_no");
				var hospital_name=getURLParameter("hospital_name");
				var area=getURLParameter("area");
				var username=getURLParameter("username");
				var level=getURLParameter("level");

				window.location.replace('questionnaire.htm'+'?username='+username+'&hospital_no='+hospital_no+'&hospital_name='+hospital_name+'&area='+area+'&level='+level+'#DocPage');
			} else {
				backToMenu();
			}
		   
	}

    function onOnline() {
        /*if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/))
        navigator.notification.alert(
             'Network connection detected. now switch to online',  // message
             function(){
             },         // callback
             'Online Mode',            // title
             'OK'                  // buttonName
         );*/

    }

    function onOffline() {
        if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
            navigator.notification.alert(
                'Network connection is required for the first run',  // message
                function()
			{
				navigator.app.exitApp();
			},         // callback
			'No Network',            // title
			'OK'                  // buttonName
			);
		}
		else {
			alert('Network connection is required for the first run');
		}

    }

    function checkConnection() {

        if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
            var networkState = navigator.connection.type;

            var states = {};
            states[Connection.UNKNOWN]  = 'Unknown connection';
            states[Connection.ETHERNET] = 'Ethernet connection';
            states[Connection.WIFI]     = 'WiFi connection';
            states[Connection.CELL_2G]  = 'Cell 2G connection';
            states[Connection.CELL_3G]  = 'Cell 3G connection';
            states[Connection.CELL_4G]  = 'Cell 4G connection';
            states[Connection.CELL]     = 'Cell generic connection';
            states[Connection.NONE]     = 'No network connection';

            //alert('Connection type: ' + states[networkState]);

            return states[networkState];
        } else
            return "desktop";
    }

