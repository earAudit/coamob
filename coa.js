//config
var webBase = "https://www.ear-audit.net"
var webserive_url = webBase + "/coaWS/WebService.asmx/";
var earAuditDLL = webBase + "/EarAudit.dll/";


//var earAuditDLL = "/EarAudit.dll/";
var g_dynamicDropDowns = true;	//to enable dynamic dropdowns list update from DB or not

// register AJAX prefilter : options, original options
$.ajaxPrefilter(function( options, originalOptions, jqXHR ) {

   // retry not set or less than 2 : retry not requested
   if( !originalOptions.retryMax || !originalOptions.retryMax >=2 ) return;
   // no timeout was setup
   if( !originalOptions.timeout >0 ) return;

   if( originalOptions.retryCount ) {
      // increment retry count each time
      originalOptions.retryCount++;
   }else{
      // init the retry count if not set
      originalOptions.retryCount = 1;
      // copy original error callback on first time
      originalOptions._error = originalOptions.error;
   };

   // overwrite error handler for current request
   options.error = function( _jqXHR, _textStatus, _errorThrown ){
      // retry max was exhausted or it is not a timeout error
      if( originalOptions.retryCount >= originalOptions.retryMax /*|| _textStatus!='timeout' */){
         // call original error handler if any
         if( originalOptions._error ) {
			originalOptions._error( _jqXHR, _textStatus, _errorThrown );
		 }
         return;
      };
      // Call AJAX again with original options
      $.ajax( originalOptions);
   };
});

// interface to communicate with server. To call webservice. It will auto retry 5 times and timeout at 8000ms
//_async = whether it is async or sync call
//_url = webservice URL
//_data = data to pass
//_successHandle = function to handle success case
//_errorHandle = function to handle fail case, i.e. no return, json.Error exists

var coaOfflineMode = false;
var getJsonFromWS = function(_async, _url, _data, successHandle, errorHandle) { 
	//console.log("Send ajax:");
	//console.log("_url = " + _url);
	//console.log("_data = " + JSON.stringify(_data));
	//console.log("offline"+coaOfflineMode);
	var service = _url.replace(webserive_url, "");
//<!-- JS coaOffline -->		
	if(coaOfflineMode && coaOffline[service] != null) {
		
		//console.log("Offline Mode: "+ service);
		////$.mobile.loading('show');

		coaOffline[service](_data, function(json) {

			//console.log("Offline Mode: " + service+ json);
			
			if(!json || json==="null" || json===null || json==="" || typeof json === "undefined"){
				if(errorHandle) {
					errorHandle(json);
					return false;
				}
			}
			
			if(json.Error) {
				if(errorHandle) {
					errorHandle(json);
					return false;
				}
				
			}
		
		//console.log(JSON.stringify(json));
			successHandle(json);
			//$.mobile.loading('hide');
		});
		return false;
	}
//<!-- JS coaOffline end-->	
	
	if(navigator.userAgent.match('CriOS')) {
		_async = true;
	}
	$.ajax({
		type: 'POST',
		url: _url,
		dataType: 'xml',
		data: _data,
		async: _async,
		beforeSend: function() {
			//$.mobile.loading('show');

		},
		complete: function() {
			//$.mobile.loading('hide');
		},
		success: function (oXml) {
			//$.mobile.loading('hide');
			var data = $('string', oXml).text();
			data = data.replace("\n", "\\n");
			//console.log(data);
			var json = $.parseJSON(data);
			if(!json || json==="null" || json===null || json==="" || typeof json === "undefined"){
				if(errorHandle) {
					errorHandle(json);
					return false;
				}
				
			}

			
			if(json.Error) {
				if(errorHandle) {
					errorHandle(json);
					return false;
				}
				
			}
						
			//console.log("ajax", JSON.stringify(json));
			successHandle(json);
			
		},
		error: function (xhr, ajaxOptions, thrownError) {
			//$.mobile.loading('hide');
			//console.log('Error: Status="' + xhr.status +'", ajaxOptions="'+ajaxOptions+'", thrownError="'+thrownError+'"');
			
			if(xhr.status == "400") {
				window.location.href = "index.htm";
			//	notifyUser(thrownError +"\n["+_url+"]");
			}				
		}
		//,timeout:8000
		//,retryMax: 5		
	});
	
};

// set picker list option to target select list
// WS: getDropdowns()
var setDropDowns = function(_field, target) {
	if(!g_dynamicDropDowns) {
		return false;
	}

	getJsonFromWS(true, webserive_url + 'getDropdowns', 
		{"field" : _field}, function(json) {
		
		if(!json.Rows || !json.Rows.length) {
		return false;
		}
		
		target.empty();
		var row;
		for (var i=0;i<json.Rows.length; i++) {
			row = json.Rows[i];
			var html = '<option value="'+ row.DDOption +'">'+ row.DDOption+'</option>';
			target.append(html);
		}
		target.val(json.Rows[0].DDOption);
		
		target.selectmenu('refresh');					
	});
};

// show Aims to About userAgent
// WS: getAims_List()
var setupAims_List = function() {
	getJsonFromWS(true, webserive_url + 'getAims_List', null ,function(json) {
		var target = $('#aimsList');
		target.empty();
		
		var row;
		for (var i=0;i<json.Rows.length; i++) {
			row = json.Rows[i];
			target.append('<li>'+ row.Text+'</li>');
		}  
	});
};

// get hospital list for specified Area
// WS: getHospitals()
var setLoginSelect_hospitals = function(area) {
	if(area == '') {
		notifyUser("Required field(s) is/are missing");
		return false;
	}
	
	getJsonFromWS(false, webserive_url + 'getHospitals', {"area": area}, function(json) {
	
		var target = $('#loginHospital');
		if(target.is('[disabled]')) {
			target.selectmenu('enable');
		}
		target.empty();
		var row;
		for (var i=0; i<json.Rows.length; i++) {
			row = json.Rows[i];
			target.append('<option value="'+ row.hospital_name +'">'+ row.hospital_name+'</option>');
		}  
	

		target.val(json.Rows[0].hospital_no);
		
		target.selectmenu('refresh');
	});
};

// login coa site
// WS: login()
var coaLogin = function(hospital, username, pass, area) {
	if(hospital == '' || username == '' || pass == '' || area == '') {
		notifyUser("Required field(s) is/are missing");
		return false;
	}
	
	////console.log("Login("+hospital+","+username+","+pass+","+area);
	getJsonFromWS(true, webserive_url + 'login', 
	{"hospitalName": hospital, "userName": username, "password": pass, "area" : area}, function(json) {
		if(json.Error) {
			notifyUser("Login Failed - " + json.Reason);
			return false;
		}
		
		if(json.Rows.length != 1) {
			notifyUser("Login Failed");
			return false;
		}		

		if(json.Rows[0].user_level == '2a' || json.Rows[0].user_level == '2b' ) {
			if(json.Rows[0].hospital_no == '999' ) {
				notifyUser('Go Admin page');
				return false;
			}
		}
		
		var param ="?hospital_no=" + json.Rows[0].hospital_no;
			param +="&hospital_name=" + hospital;
			param += "&area=" + area;
			param += "&level=" + json.Rows[0].user_level;

		window.location.replace('loggedIn.htm' +param);
	});
};

//logoff COA
// WS: logoff()
var coaLogoff = function() {
	if(confirm("Are you sure you want to log off?")){
		$.ajax({
		type: 'POST',
		url: webserive_url + 'logoff',
		success: function() {
			////console.log("logoff success");
			window.location="index.htm";
		},
		error: function() {
			////console.log("logoff fail");
			window.location="index.htm";
		}
		});
		
	}
};

//login COA Test Drive
// WS: testDriveLogin()
var coaTestDrive = function(level, username, pass) {
	if(level == '' || username == '' || pass == '') {
		notifyUser("Required field(s) is/are missing");
		return false;
	}
	
	////console.log("coaTestDrive("+level+","+username+","+pass+")");
	getJsonFromWS(false, webserive_url + 'testDriveLogin', 
	{"level": level, "user_name": username, "password": pass}, function(json) {
		if(json.Error) {
			notifyUser("Failed - " + json.Reason +"\nPlease change your password or try another username.");
			return false;
		}
		
		if(json.Rows.length != 1) {
			notifyUser("Login Failed.\n(This username already exists in the test drive.)");
			return false;
		}		
		
		var param ="?hospital_no=" + json.Rows[0].hospital_no;
			param +="&hospital_name=" + json.Rows[0].hospital_name;
			param += "&area=" + json.Rows[0].Area;
			param += "&level=" + json.Rows[0].user_level;

		window.location.replace('loggedIn.htm' +param);
	});
};

// update user profile
//WS: setUserProfile
var updateMyProfile = function(hospital_no, Title, Forename, Surname, name_of_hospital, hospital_address, email_address, email_address2, other_contact, cm_mast, cm_tymp, cm_stap, additional_info) {
	////console.log("updateMyProfile")
	var checkInvalid = function(field) {
		if (field == null) return false;
		
		return true;
	};
	
	if(checkInvalid(Title) &&  checkInvalid(Forename) && checkInvalid( Surname) && checkInvalid( name_of_hospital) && checkInvalid( hospital_address) && checkInvalid( email_address) && checkInvalid( email_address2) && checkInvalid( other_contact) && checkInvalid( cm_mast) && checkInvalid( cm_tymp) && checkInvalid( cm_stap) && checkInvalid( additional_info)) {
		
		getJsonFromWS(false, webserive_url + 'setUserProfile', 
					{"hospital_no" : hospital_no, "Title" : Title, "Forename" :Forename, "Surname" :Surname, "name_of_hospital" :name_of_hospital, "hospital_address" :hospital_address, 
					"email_address" :email_address, "email_address2" :email_address2, "other_contact" :other_contact, 
					"cm_mast" :cm_mast, "cm_tymp" :cm_tymp, "cm_stap" :cm_stap, "additional_info" :additional_info},
					function(json) {
							notifyUser("Profile is updated.");
						
					}, function(json) {
							notifyUser("Failed to update.");
					});
	}
};

// change user password in user profile
// WS: changePassword
var changePassword = function(oldPassword, newPassword) {

	getJsonFromWS(false, webserive_url + 'changePassword', 
					{"oldPassword" : oldPassword, "newPassword" : newPassword},
					function(json) {
							notifyUser("Password is updated.");
						
					}, function(json) {
							notifyUser("Failed to update. Please check current password.");
					});
};

// create PreOp (Case)
//WS: createPreOp()
var createPreOp = function(HospCode,PatCode,Sex,DoB,CaseCode,DateListed,OpSide,Stage,Sym_Deafness,Sym_Tinnitus,Sym_Dizziness,Sym_IntDischarge,Sym_PersDischarge,Sym_Earache,Sym_FacialPalsy
,Sym_None,Aim_DryEar,Aim_improve,Aim_restore,Aim_water,Aim_pathology,Comments,Risk_diabetes,Risk_cleftpalate,Risk_downes,Risk_others,Risk_none,Smoking,CME,For_MA) {
	//console.log("createPreOp");
	
	getJsonFromWS(false, webserive_url + 'createPreOp', 
					{"HospCode" : HospCode, "PatCode" : PatCode, "CaseCode" : CaseCode,  "Sex" : Sex, "DoB" : DoB, "DateListed" : DateListed
					, "OpSide" : OpSide, "Stage" : Stage, "Sym_Deafness" : Sym_Deafness, "Sym_Tinnitus" : Sym_Tinnitus, "Sym_Dizziness" : Sym_Dizziness
					,"Sym_IntDischarge" : Sym_IntDischarge, "Sym_PersDischarge" : Sym_PersDischarge
					, "Sym_Earache" : Sym_Earache, "Sym_FacialPalsy" : Sym_FacialPalsy, "Sym_None" : Sym_None, "Aim_DryEar" : Aim_DryEar, "Aim_improve" : Aim_improve, "Aim_restore" : Aim_restore
					, "Aim_water" : Aim_water, "Aim_pathology" : Aim_pathology, "Comments" : Comments, "Risk_diabetes" : Risk_diabetes, "Risk_cleftpalate" : Risk_cleftpalate, "Risk_downes" : Risk_downes
					, "Risk_others" : Risk_others, "Risk_none" : Risk_none, "Smoking" : Smoking, "CME" : CME, "For_MA" : For_MA},
					function(json) {
							notifyUser("PreOp case for ["+CaseCode+"] is created.");

							$('#NewCaseForm')[0].reset();
							//redirect to review page
							url ="loggedIn.htm?hospital_no="+HospCode+"&area="+getURLParameter("area")+"&level="+getURLParameter("level")+"&CaseCode="+CaseCode+"&PatCode="+PatCode+"#tab-Review-2";
							if (getInternetExplorerVersion() <= -1 && !navigator.userAgent.match('CriOS')) {
								$.mobile.navigate(url);
							} 
							else
							{
								window.location.href=url;
							}
							scrollToTop();
	
					}, function(json) {
						if(json.Error == "4") {
							notifyUser("Data already exists in database.");
						} else {
							notifyUser("Error: [" + json.Error +"] - " +json.Reason);
						}
							
					});
};

// create Op (i.e. review)
// WS: createOperation
var createOperation = function(CaseCode,HospCode,OpDate,SurgGrd,Supervised,Cholest_Attic,Cholest_Sinus,Cholest_Other
,Cholest_NA,Retraction_Post,Retraction_Attic,Retraction_NonAerME,Retraction_Other
,Retraction_NA,PerfSize,PerfSite_Ant,PerfSite_Post,PerfSite_Inf,PerfSite_Flaccida
,PerfSite_Total,PerfSite_SubTotal,PerfSite_NA,Ossic_Mobile,Ossic_Fixed,Ossic_Eroded
,Ossic_NotAssessed,Mucosa_Gran,Mucosa_Oedem,Mucosa_Fibro,Mucosa_Tympano,Mucosa_Normal
,Discharge,Proc_Myringo,Proc_Ossiculo,Proc_Attico,Proc_AtticoAntro,Proc_ModRad,Proc_Cortical
,Proc_Combined,Proc_Stapedo,Proc_Tympano,Proc_WBC,Proc_Other
,MostRecentAud,OpEar500BC,OpEar1000BC,OpEar2000BC,OpEar3000BC,OpEar4000BC
,OpEar500AC,OpEar1000AC,OpEar2000AC,OpEar3000AC,OpEar4000AC,OpEar8000AC
,NonOpEar500BC,NonOpEar1000BC,NonOpEar2000BC,NonOpEar3000BC,NonOpEar4000BC
,NonOpEar500AC,NonOpEar1000AC,NonOpEar2000AC,NonOpEar3000AC,NonOpEar4000AC,NonOpEar8000AC
,ChordaTymp,GraftMeth,GMat_Fasc,GMat_Perichond,GMat_PerichCart,GMat_Cart,GMat_PeriOst
,GMat_Homograft,GMat_Fat,GMat_Xeno,GMat_Other,GMat_NA,Comments,audiogramNotPossible
,Anaesthetic, FacNerve, Fistula_Canal, Fistula_Footplate, Fistula_NotChecked, Fistula_Nil, Retract_Mobility, 
OssEroded_Malleus, OssEroded_Incus, OssEroded_StapesSupra, OssEroded_Footplate, OssEroded_NotChecked, OssEroded_Nil, 
OssFixed_Footplate, OssFixed_MIJoint, OssFixed_ISJoint, OssFixed_Nil, Cholest_Antrum, Cholest_MastCells, Cholest_ME, 
Cholest_UnderTM, Retraction_Ant) {
	////console.log("createOperation");

	getJsonFromWS(false, webserive_url + 'createOperation', 
		{"CaseCode" : CaseCode, "HospCode" : HospCode, "OpDate" : OpDate, "SurgGrd" : SurgGrd, "Supervised" : Supervised,
		"Cholest_Attic" : Cholest_Attic, "Cholest_Sinus" : Cholest_Sinus, "Cholest_Other" : Cholest_Other,
		"Cholest_NA" : Cholest_NA, "Retraction_Post" : Retraction_Post, "Retraction_Attic" : Retraction_Attic,
		"Retraction_NonAerME" : Retraction_NonAerME, "Retraction_Other" : Retraction_Other, "Retraction_NA" : Retraction_NA,
		"PerfSize" : PerfSize, "PerfSite_Ant" : PerfSite_Ant, "PerfSite_Post" : PerfSite_Post, "PerfSite_Inf" : PerfSite_Inf,
		"PerfSite_Flaccida" : PerfSite_Flaccida, "PerfSite_Total" : PerfSite_Total, "PerfSite_SubTotal" : PerfSite_SubTotal,
		"PerfSite_NA" : PerfSite_NA, "Ossic_Mobile" : Ossic_Mobile, "Ossic_Fixed" : Ossic_Fixed, "Ossic_Eroded" : Ossic_Eroded,
		"Ossic_NotAssessed" : Ossic_NotAssessed, "Mucosa_Gran" : Mucosa_Gran, "Mucosa_Oedem" : Mucosa_Oedem,
		"Mucosa_Fibro" : Mucosa_Fibro, "Mucosa_Tympano" : Mucosa_Tympano, "Mucosa_Normal" : Mucosa_Normal,
		"Discharge" : Discharge, "Proc_Myringo" : Proc_Myringo, "Proc_Ossiculo" : Proc_Ossiculo, "Proc_Attico" : Proc_Attico,
		"Proc_AtticoAntro" : Proc_AtticoAntro, "Proc_ModRad" : Proc_ModRad, "Proc_Cortical" : Proc_Cortical, 
		"Proc_Combined" : Proc_Combined, "Proc_Stapedo" : Proc_Stapedo, "Proc_Tympano" : Proc_Tympano, "Proc_WBC" : Proc_WBC, 
		"Proc_Other" : Proc_Other, "MostRecentAud" : MostRecentAud, "OpEar500BC" : OpEar500BC, "OpEar1000BC" : OpEar1000BC, 
		"OpEar2000BC" : OpEar2000BC, "OpEar3000BC" : OpEar3000BC, "OpEar4000BC" : OpEar4000BC, "OpEar500AC" : OpEar500AC, 
		"OpEar1000AC" : OpEar1000AC, "OpEar2000AC" : OpEar2000AC, "OpEar3000AC" : OpEar3000AC, "OpEar4000AC" : OpEar4000AC, 
		"OpEar8000AC" : OpEar8000AC, "NonOpEar500BC" : NonOpEar500BC, "NonOpEar1000BC" : NonOpEar1000BC, 
		"NonOpEar2000BC" : NonOpEar2000BC, "NonOpEar3000BC" : NonOpEar3000BC, "NonOpEar4000BC" : NonOpEar4000BC, 
		"NonOpEar500AC" : NonOpEar500AC, "NonOpEar1000AC" : NonOpEar1000AC, "NonOpEar2000AC" : NonOpEar2000AC, 
		"NonOpEar3000AC" : NonOpEar3000AC, "NonOpEar4000AC" : NonOpEar4000AC, "NonOpEar8000AC" : NonOpEar8000AC, 
		"ChordaTymp" : ChordaTymp, "GraftMeth" : GraftMeth, "GMat_Fasc" : GMat_Fasc, "GMat_Perichond" : GMat_Perichond,
		"GMat_PerichCart" : GMat_PerichCart, "GMat_Cart" : GMat_Cart, "GMat_PeriOst" : GMat_PeriOst,
		"GMat_Homograft" : GMat_Homograft, "GMat_Fat" : GMat_Fat, "GMat_Xeno" : GMat_Xeno, "GMat_Other" : GMat_Other,
		"GMat_NA" : GMat_NA, "Comments" : Comments, "audiogramNotPossible" : audiogramNotPossible, "Anaesthetic" : Anaesthetic,
		"FacNerve" : FacNerve, "Fistula_Canal" : Fistula_Canal, "Fistula_Footplate" : Fistula_Footplate, "Fistula_NotChecked" : Fistula_NotChecked,
		"Fistula_Nil" : Fistula_Nil,"Retract_Mobility" : Retract_Mobility,"OssEroded_Malleus" : OssEroded_Malleus,"OssEroded_Incus" : OssEroded_Incus,
		"OssEroded_StapesSupra" : OssEroded_StapesSupra,"OssEroded_Footplate" : OssEroded_Footplate,"OssEroded_NotChecked" : OssEroded_NotChecked,
		"OssEroded_Nil" : OssEroded_Nil,"OssFixed_Footplate" : OssFixed_Footplate,"OssFixed_MIJoint" : OssFixed_MIJoint,"OssFixed_ISJoint" : OssFixed_ISJoint,
		"OssFixed_Nil" : OssFixed_Nil,"Cholest_Antrum" : Cholest_Antrum,"Cholest_MastCells" : Cholest_MastCells,"Cholest_ME" : Cholest_ME,
		"Cholest_UnderTM" : Cholest_UnderTM,"Retraction_Ant" : Retraction_Ant},
		function(json) {
			notifyUser("Operation for ["+CaseCode+"] is created.");
				
			//redirect to review page
			setupOperation(CaseCode, HospCode);
			scrollToTop();

		}, function(json) {
			if(json.Error == "4") {
				notifyUser("Data already exists in database.");
			} else {
				notifyUser("Error: [" + json.Error +"] - " +json.Reason);
			}
	});				
};

// create postOp (i.e. followup)
// WS: createPostOp
var createPostOp = function(CaseCode, HospCode, AssInterval, AssDate, Discharge, Complics_Palsy, Complics_Tinnitus, Complics_Vertigo, Complics_Hearing, Complics_WInfection, Complics_Taste, Complics_Other, Complics_None, Cholest_Recur, Cholest_Resid, Cholest_NA, OpEar500BC, OpEar1000BC, OpEar2000BC, OpEar3000BC, OpEar4000BC, OpEar500AC, OpEar1000AC, OpEar2000AC, OpEar3000AC, OpEar4000AC, OpEar8000AC, OA_Intact, OA_NotIntact, OA_Myringitis, OA_AntBlunt, OA_Atelectasis, OA_Retraction, OA_Lateralization, OA_MeatalStenosis, OA_CompleteCollapse, OA_OME, OA_NotAssessed, OA_Normal, Comments, Ossic_Pros, Cholest_None, audiogramNotPossible) {
	////console.log("createPostOp");
	
	getJsonFromWS(false, webserive_url + 'createPostOp', 
		{"CaseCode" : CaseCode,"HospCode" : HospCode,"AssInterval" : AssInterval,"AssDate" : AssDate,"Discharge" : Discharge,"Complics_Palsy" : Complics_Palsy,"Complics_Tinnitus" : Complics_Tinnitus,"Complics_Vertigo" : Complics_Vertigo,"Complics_Hearing" : Complics_Hearing,"Complics_WInfection" : Complics_WInfection,"Complics_Taste" : Complics_Taste,"Complics_Other" : Complics_Other,"Complics_None" : Complics_None,"Cholest_Recur" : Cholest_Recur,"Cholest_Resid" : Cholest_Resid,"Cholest_NA" : Cholest_NA,"OpEar500BC" : OpEar500BC,"OpEar1000BC" : OpEar1000BC,"OpEar2000BC" : OpEar2000BC,"OpEar3000BC" : OpEar3000BC,"OpEar4000BC" : OpEar4000BC,"OpEar500AC" : OpEar500AC,"OpEar1000AC" : OpEar1000AC,"OpEar2000AC" : OpEar2000AC,"OpEar3000AC" : OpEar3000AC,"OpEar4000AC" : OpEar4000AC,"OpEar8000AC" : OpEar8000AC,"OA_Intact" : OA_Intact,"OA_NotIntact" : OA_NotIntact,"OA_Myringitis" : OA_Myringitis,"OA_AntBlunt" : OA_AntBlunt,"OA_Atelectasis" : OA_Atelectasis,"OA_Retraction" : OA_Retraction,"OA_Lateralization" : OA_Lateralization,"OA_MeatalStenosis" : OA_MeatalStenosis,"OA_CompleteCollapse" : OA_CompleteCollapse,"OA_OME" : OA_OME,"OA_NotAssessed" : OA_NotAssessed,"OA_Normal" : OA_Normal,"Comments" : Comments, "Ossic_Pros" : Ossic_Pros, "Cholest_None" : Cholest_None, "audiogramNotPossible" : audiogramNotPossible},
		function(json) {
			notifyUser("Followup after "+AssInterval+" months for ["+CaseCode+"] is created.");
				
			//redirect to review page

			setupPostOp(CaseCode, HospCode, AssInterval);
			scrollToTop();

		}, function(json) {
			if(json.Error == "4") {
				notifyUser("Data already exists in database.");
			} else {
				notifyUser("Error: [" + json.Error +"] - " +json.Reason);
			}
	});		
};

// create procedure (i.e. procedure) L2 Only
// WS: createProcedure
var createProcedure = function(CaseCode, HospCode, Nature, Approach, MatME_GelFilm, MatME_GelFoam, MatME_Cartilage, MatME_Silastic, MatME_Nil, Meato_Bony, Meato_Cartilaginous, Meato_Nil, Myringo_Mat, GraftMeth, OssicDefect_Malleus, OssicDefect_Incus, OssicDefect_StapesSupra, OssicDefect_Footplate, OssicDefect_Nil, Ossic_Mat, Ossic_Pros, Ossic_Recon, Mastoidectomy, OblitFlap_Palva, OblitFlap_Muscle, OblitFlap_Fascial, OblitFlap_MidTemporal, OblitFlap_TempParietal, OblitFlap_NA, OblitMat_BonePaste, OblitMat_BoneChips, OblitMat_Cartilage, OblitMat_HAGranules, OblitMat_SerenoCem, OblitMat_FatBlind, OblitMat_NA, CW_Recon, Stapes_Op, Stapes_Chorda, Stapes_Fensize, Stapes_ProsType, Stapes_ProsSize, Stapes_Attach, Stapes_IntTissue, Fen_Pick, Fen_Drill, Fen_Laser, Fen_NA, Laser, WinSeal_Fat, WinSeal_BloodClot, WinSeal_Other, WinSeal_GelFoam, WinSeal_Nil, Comments, OblitMat_Bioglass, OtoEndosopicMethod, OtoEndosopicSize, OtoEndosopicLength, OtoEndosopicAngle) {
	////console.log("createProcedure");
	
	getJsonFromWS(false, webserive_url + 'createProcedure', 
		{"CaseCode" :   CaseCode, "HospCode" : HospCode, "Nature" : Nature, "Approach" : Approach, "MatME_GelFilm" : MatME_GelFilm, "MatME_GelFoam" : MatME_GelFoam, "MatME_Cartilage" : MatME_Cartilage, "MatME_Silastic" : MatME_Silastic, "MatME_Nil" : MatME_Nil, "Meato_Bony" : Meato_Bony, "Meato_Cartilaginous" : Meato_Cartilaginous, "Meato_Nil" : Meato_Nil, "Myringo_Mat" : Myringo_Mat, "GraftMeth" : GraftMeth, "OssicDefect_Malleus" : OssicDefect_Malleus, "OssicDefect_Incus" : OssicDefect_Incus, "OssicDefect_StapesSupra" : OssicDefect_StapesSupra, "OssicDefect_Footplate" : OssicDefect_Footplate, "OssicDefect_Nil" : OssicDefect_Nil, "Ossic_Mat" : Ossic_Mat, "Ossic_Pros" : Ossic_Pros, "Ossic_Recon" : Ossic_Recon, "Mastoidectomy" : Mastoidectomy, "OblitFlap_Palva" : OblitFlap_Palva, "OblitFlap_Muscle" : OblitFlap_Muscle, "OblitFlap_Fascial" : OblitFlap_Fascial, "OblitFlap_MidTemporal" : OblitFlap_MidTemporal, "OblitFlap_TempParietal" : OblitFlap_TempParietal, "OblitFlap_NA" : OblitFlap_NA, "OblitMat_BonePaste" : OblitMat_BonePaste, "OblitMat_BoneChips" : OblitMat_BoneChips, "OblitMat_Cartilage" : OblitMat_Cartilage, "OblitMat_HAGranules" : OblitMat_HAGranules, "OblitMat_SerenoCem" : OblitMat_SerenoCem, "OblitMat_FatBlind" : OblitMat_FatBlind, "OblitMat_NA" : OblitMat_NA, "CW_Recon" : CW_Recon, "Stapes_Op" : Stapes_Op, "Stapes_Chorda" : Stapes_Chorda, "Stapes_Fensize" : Stapes_Fensize, "Stapes_ProsType" : Stapes_ProsType, "Stapes_ProsSize" : Stapes_ProsSize, "Stapes_Attach" : Stapes_Attach, "Stapes_IntTissue" : Stapes_IntTissue, "Fen_Pick" : Fen_Pick, "Fen_Drill" : Fen_Drill, "Fen_Laser" : Fen_Laser, "Fen_NA" : Fen_NA, "Laser" : Laser, "WinSeal_Fat" : WinSeal_Fat, "WinSeal_BloodClot" : WinSeal_BloodClot, "WinSeal_Other" : WinSeal_Other, "WinSeal_GelFoam" : WinSeal_GelFoam, "WinSeal_Nil" : WinSeal_Nil, "Comments" : Comments, "OblitMat_Bioglass" : OblitMat_Bioglass, "OtoEndosopicMethod" : OtoEndosopicMethod, "OtoEndosopicSize" : OtoEndosopicSize, "OtoEndosopicLength" : OtoEndosopicLength, "OtoEndosopicAngle" : OtoEndosopicAngle},
		function(json) {
			notifyUser("Procedure for ["+CaseCode+"] is created.");

			setupProcedure(CaseCode, HospCode);
			scrollToTop();

		}, function(json) {
			if(json.Error == "4") {
				notifyUser("Data already exists in database.");
			} else {
				notifyUser("Error: [" + json.Error +"] - " +json.Reason);
			}
	});		



};

// search case by patcode and generate a list
// WS: searchCase
var searchCase = function(HospCode, PatCode) {
	////console.log("createPreOp");
	
	getJsonFromWS(true, webserive_url + 'searchCase', 
					{"HospCode" : HospCode, "PatCode" : PatCode},
					function(json) {
						$('#review-CaseList').empty();
						if(json.Rows.length <=0) {
							////console.log("No data : " + json.Rows.length);
							$('#review-CaseList-dataNotFind').show();
							$('label[for=review-CaseList]').hide();
							return false;
						}
						$('#review-CaseList-dataNotFind').hide();
						$('label[for=review-CaseList]').show();
						var target = $('#review-CaseList');

						target.empty();
						var row;
						for (var i=0;i<json.Rows.length; i++) {
							row = json.Rows[i];
							
							var caseItem = $('<li><a href="#" data-value="'+row.CaseCode+'">'+row.CaseCode+'</a></li>');
							target.append(caseItem);
							caseItem.on('click',function(event){
									//console.log("select case list = " + $(this).text());
									
									event.preventDefault ? event.preventDefault() : event.returnValue = false;
									var CaseCode =  $(this).find('a').attr('data-value');
									//console.log("select case list = " + row.CaseCode);
									//console.log("select case list = " + CaseCode);
									var url = "loggedIn.htm?hospital_no="+HospCode+"&area="+getURLParameter("area")+"&level="+getURLParameter("level")+"&CaseCode="+CaseCode+"&PatCode="+PatCode+"#tab-Review-2";
									
									if (getInternetExplorerVersion() <= -1 && !navigator.userAgent.match('CriOS')) {
										$.mobile.navigate(url);
									} 
									else
									{
										window.location.href=url;
									}

									
									
									scrollToTop();
							});
							
							
						}
						
						target.listview("refresh");			
	
					}, function(json) {
							////console.log("Fail to get Case");
							$('#review-CaseList').empty();
							$('review-CaseList-dataNotFind').show();
							$('label[for=review-CaseList]').hide();
							return false;
					});
};


// get PreOp details and render
// WS: getPreOpDetails
var setupPreOp = function(CaseCode, HospCode, PatCode) {
	////console.log("setupPreOp, CaseCode = [" + CaseCode +"], HospCode = [" + HospCode +"], PatCode = [" + PatCode +"]");
	
	
	getJsonFromWS(true, webserive_url + 'getPreOpDetails', 
		{"HospCode" : HospCode, "CaseCode" : CaseCode, "PatCode" :  PatCode},
		function(json) {
				if(json.Rows.length <=0) {
					notifyUser("Data not found.");
					return false;
				}
		
		
				$('#input-SurgCode','#review-PreOpForm').val(json.Rows[0].HospCode);
				$('#input-PatientHospitalNo','#review-PreOpForm').val(json.Rows[0].PatCode);
				
				$('#input-CaseCode','#review-PreOpForm').val(json.Rows[0].CaseCode);
				if (json.Rows[0].Sex == "F" || json.Rows[0].Sex == "f" ) {
					$('#input-Sex-F','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				}
				if (json.Rows[0].Sex == "M" || json.Rows[0].Sex == "m" ) {
					$('#input-Sex-M','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				}
				
				var d = json.Rows[0].DoB;
				$('#input-DoB','#review-PreOpForm').val(genDateString(d));
				d = json.Rows[0].DateListed;
				$('#input-DateListed','#review-PreOpForm').val(genDateString(d));
							
				if (json.Rows[0].OpSide == "Right" ) {
					$('#input-SideOfOperation-R','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				}
				if (json.Rows[0].OpSide == "Left" ) {
					$('#input-SideOfOperation-L','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				}
				if (json.Rows[0].Stage == "Primary" ) {
					$('#input-Stage-Primary','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				}
				if (json.Rows[0].Stage == "Revision" ) {
					$('#input-Stage-Revision','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				}
				if (json.Rows[0].Sym_Deafness == "Y" ) {
					$('#input-Symptoms-Deafness','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				}
				if (json.Rows[0].Sym_Tinnitus == "Y" ) {
					$('#input-Symptoms-Tinnitus','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				}
				if (json.Rows[0].Sym_Dizziness == "Y" ) {
					$('#input-Symptoms-Dizziness','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				}
				if (json.Rows[0].Sym_IntDischarge == "Y" ) {
					$('#input-Symptoms-IntermittentDischarge','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				}
				if (json.Rows[0].Sym_PersDischarge == "Y" ) {
					$('#input-Symptoms-PersistentDischarge','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				}
				if (json.Rows[0].Sym_Earache == "Y" ) {
					$('#input-Symptoms-Earache','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				}
				if (json.Rows[0].Sym_FacialPalsy == "Y" ) {
					$('#input-Symptoms-FacialPalsy','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				}
				
				$('#input-Symptoms-None','#review-PreOpForm').prop('checked', (json.Rows[0].Sym_None == "Y" )).checkboxradio('refresh');
				
				if (json.Rows[0].Aim_DryEar == "Y" ) {
					$('#input-AimOfSurgery-DryEar','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				}
				if (json.Rows[0].Aim_improve == "Y" ) {
					$('#input-AimOfSurgery-HearingGain','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				}
				if (json.Rows[0].Aim_restore == "Y" ) {
					$('#input-AimOfSurgery-RestorationOfNormalAnatomy','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				}
				if (json.Rows[0].Aim_water == "Y" ) {
					$('#input-AimOfSurgery-Waterproofing','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				}
				
				$('#input-AimOfSurgery-RemovalOfPathology','#review-PreOpForm').prop('checked', (json.Rows[0].Aim_pathology == "Y" || json.Rows[0].Aim_Pathology == "Y" )).checkboxradio('refresh');
				
				$('#input-Comments','#review-PreOpForm').val(unescape(json.Rows[0].Comments));
				if (json.Rows[0].Risk_diabetes == "Y" ) {
					$('#input-RiskFactors-Diabetes','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				}
				if (json.Rows[0].Risk_cleftpalate == "Y" ) {
					$('#input-RiskFactors-CleftPalate','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				}
				if (json.Rows[0].Risk_downes == "Y" ) {
					$('#input-RiskFactors-DownsSyndrome','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				}
				if (json.Rows[0].Risk_others == "Y" ) {
					$('#input-RiskFactors-Other','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				}
				
				$('#input-RiskFactors-None','#review-PreOpForm').prop('checked', (json.Rows[0].Risk_none == "Y" )).checkboxradio('refresh');
				
				$('#input-Smoking','#review-PreOpForm').val(json.Rows[0].Smoking).selectmenu('refresh');
				$('#input-ContralateralEar','#review-PreOpForm').val(json.Rows[0].CME).selectmenu('refresh');
				if (json.Rows[0].For_MA == "Y" ) {
					$('#input-isForMA-Y','#review-PreOpForm').prop('checked', true).checkboxradio('refresh');
				} 

				
				$('#input-isForMA-N','#review-PreOpForm').prop('checked', (json.Rows[0].For_MA == "N" )).checkboxradio('refresh');
				
				
				$('#input-EntryDate','#review-PreOpForm').val(json.Rows[0].Entry_Date);

			});
};

// get Op details and render
// WS: getOperationDetails
var setupOperation = function(CaseCode, HospCode) {
	
	$('#review-OperationForm')[0].reset();
	$('#input-CaseCode', '#review-OperationForm').val(CaseCode);
	$('#AudiogramInputsDiv','#review-OperationForm').show();
	
	$('select', '#review-OperationForm').each(function() {
            $(this).prop('selectedIndex',0);
        });
	
	getJsonFromWS(true, webserive_url + 'getOperationDetails', 
		{"HospCode" : HospCode, "CaseCode" : CaseCode},
		function(json) {
				if(json.Rows.length <=0) {
					// create new operation
					$('.displayInResult', '#review-OperationForm').hide();
					$('.notDisplayInResult', '#review-OperationForm').show();
					$('input[type=text]', '#review-OperationForm').prop("readonly", false);
					$('input[type=text]', '#review-OperationForm').parent().removeClass('ui-disabled');
					$('textarea', '#review-OperationForm').prop("readonly", false);
					$('textarea', '#review-OperationForm').removeClass('ui-disabled');
					$('input[type=checkbox]', '#review-OperationForm').prop("disabled", false).checkboxradio('refresh');
					$('select', '#review-OperationForm').prop("disabled", false).selectmenu('refresh');
					$('select', '#review-OperationForm').parent().removeClass('ui-disabled');
					$('.datepicker', '#review-OperationForm').datepicker({
						changeMonth: true,
						changeYear: true,
						yearRange: '-100:+20',
						dateFormat: 'dd/mm/yy'
					});	
					//$('.datepicker', '#review-OperationForm').prop("readonly", true);
					
					$('#input-CaseCode', '#review-OperationForm').prop("readonly", true);
					
					return false;
				}
		
				//data already exists
				$('.notDisplayInResult', '#review-OperationForm').hide();
				
				$('input[type=text]', '#review-OperationForm').prop("readonly", true);
				$('input[type=text]', '#review-OperationForm').parent().addClass('ui-disabled');
				$('textarea', '#review-OperationForm').prop("readonly", true);
				$('textarea', '#review-OperationForm').addClass('ui-disabled');
				$('input[type=checkbox]', '#review-OperationForm').prop("disabled", true).checkboxradio('refresh');
				$('select', '#review-OperationForm').prop("disabled", true).selectmenu('refresh');
				$('select', '#review-OperationForm').parent().addClass('ui-disabled');
				$('.datepicker', '#review-OperationForm').datepicker("destroy");
				$('.displayInResult', '#review-OperationForm').show();
				
				var user_level = getURLParameter("level");
				if (user_level = '1') {
					$('#btnViewOpNote', '#review-OperationForm').attr('href', earAuditDLL +'OpNotesL1?CCode='+CaseCode+'&HNumber='+HospCode);
				}
				else {
					$('#btnViewOpNote', '#review-OperationForm').attr('href', earAuditDLL +'OpNotes?CCode='+CaseCode+'&HNumber='+HospCode);
				}
				
				//$('#btnViewOpNote', '#review-OperationForm').attr('href', earAuditDLL +'OpNotes?CCode='+CaseCode+'&HNumber='+HospCode);

				
			var d = json.Rows[0].OpDate;
			$('#input-OpDate', '#review-OperationForm').val(genDateString(d));	
			$('#input-SurgeonGrade', '#review-OperationForm').val(json.Rows[0].SurgGrd).selectmenu('refresh');
			$('#input-Supervised').val(json.Rows[0].Supervised).selectmenu('refresh');
			if(json.Rows[0].Cholest_Attic == 'Y')  $('#input-Cholesteatoma-Attic', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Cholest_Sinus == 'Y' || json.Rows[0].Cholest_SinusTymp == 'Y')  $('#input-Cholesteatoma-Sinus', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Cholest_Other == 'Y')  $('#input-Cholesteatoma-Other', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			$('#input-Cholesteatoma-NA', '#review-OperationForm').prop('checked', (json.Rows[0].Cholest_NA == 'Y')).checkboxradio('refresh');
			if(json.Rows[0].Retraction_Post == 'Y')  $('#input-EardrumCollapse-Posterior', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Retraction_Attic == 'Y')  $('#input-EardrumCollapse-Flaccida', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Retraction_NonAerME == 'Y')  $('#input-EardrumCollapse-NonAeratedME', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Retraction_Other == 'Y' || json.Rows[0].Retraction_other == 'Y')  $('#input-EardrumCollapse-Other', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			$('#input-EardrumCollapse-NA', '#review-OperationForm').prop('checked', (json.Rows[0].Retraction_NA == 'Y')).checkboxradio('refresh');
			$('#input-PerforationSize', '#review-OperationForm').val(json.Rows[0].PerfSize).selectmenu('refresh');
			if(json.Rows[0].PerfSite_Ant == 'Y' || json.Rows[0].PerfSite_TensaAnt == 'Y')  $('#input-PerforationSite-Anterior', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].PerfSite_Post == 'Y' || json.Rows[0].PerfSite_TensaPost == 'Y')  $('#input-PerforationSite-Posterior', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].PerfSite_Inf == 'Y' || json.Rows[0].PerfSite_TensaInf == 'Y')  $('#input-PerforationSite-Inferior', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].PerfSite_Flaccida == 'Y')  $('#input-PerforationSite-Flaccida', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].PerfSite_Total == 'Y')  $('#input-PerforationSite-SubTotal', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].PerfSite_SubTotal == 'Y')  $('#input-PerforationSite-Total', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			$('#input-PerforationSite-NA', '#review-OperationForm').prop('checked', (json.Rows[0].PerfSite_NA == 'Y')).checkboxradio('refresh');
			if(json.Rows[0].Ossic_Mobile == 'Y')  $('#input-OssicularChain-Mobile', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Ossic_Fixed  == 'Y')  $('#input-OssicularChain-Fixed', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Ossic_Eroded == 'Y')  $('#input-OssicularChain-Eroded', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			$('#input-OssicularChain-NotAssessed', '#review-OperationForm').prop('checked', (json.Rows[0].Ossic_NotAssessed == 'Y')).checkboxradio('refresh');
			if(json.Rows[0].Mucosa_Gran == 'Y')  $('#input-MEMucosa-Granulation', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Mucosa_Oedem == 'Y')  $('#input-MEMucosa-Oedematous', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Mucosa_Fibro == 'Y')  $('#input-MEMucosa-FibroAdhesive', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Mucosa_Tympano == 'Y')  $('#input-MEMucosa-TympanosclerosisInME', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			$('#input-MEMucosa-Normal', '#review-OperationForm').prop('checked', (json.Rows[0].Mucosa_Normal == 'Y')).checkboxradio('refresh');
			$('#input-Discharge', '#review-OperationForm').val(json.Rows[0].Discharge).selectmenu('refresh');
			$('#input-Procedure-Myringoplasty', '#review-OperationForm').prop('checked', (json.Rows[0].Proc_Myringo == 'Y')).checkboxradio('refresh');
			if(json.Rows[0].Proc_Ossiculo == 'Y')  $('#input-Procedure-Ossiculoplasty', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Proc_Attico == 'Y')  $('#input-Procedure-Atticotomy', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Proc_AtticoAntro == 'Y')  $('#input-Procedure-AtticoAntrostomy', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Proc_ModRad == 'Y')  $('#input-Procedure-ModRad', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Proc_Cortical == 'Y')  $('#input-Procedure-Cortical', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Proc_Combined == 'Y')  $('#input-Procedure-CombinedApproach', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Proc_Stapedo == 'Y')  $('#input-Procedure-Stapedotomy', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Proc_Tympano == 'Y')  $('#input-Procedure-Tympanotomy', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Proc_WBC == 'Y')  $('#input-Procedure-WideningBonyCanal', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Proc_Other == 'Y')  $('#input-Procedure-Other', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');

			$('#input-ChordaTympani', '#review-OperationForm').val(json.Rows[0].ChordaTymp).selectmenu('refresh');
			$('#input-GraftMethod', '#review-OperationForm').val(json.Rows[0].GraftMeth).selectmenu('refresh');
			if(json.Rows[0].GMat_Fasc == 'Y')  $('#input-GraftMaterial-Fascia', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].GMat_Perichond == 'Y')  $('#input-GraftMaterial-Perichondrium', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].GMat_PerichCart == 'Y')  $('#input-GraftMaterial-PericondCart', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].GMat_Cart == 'Y')  $('#input-GraftMaterial-Cartilage', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].GMat_PeriOst == 'Y')  $('#input-GraftMaterial-Periostium', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].GMat_Homograft == 'Y')  $('#input-GraftMaterial-Homograft', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].GMat_Fat == 'Y')  $('#input-GraftMaterial-Fat', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].GMat_Xeno == 'Y')  $('#input-GraftMaterial-Xenograft', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].GMat_Other == 'Y')  $('#input-GraftMaterial-Other', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			$('#input-GraftMaterial-NA', '#review-OperationForm').prop('checked', (json.Rows[0].GMat_NA == 'Y')).checkboxradio('refresh');
			$('#input-Comments', '#review-OperationForm').val(unescape(json.Rows[0].Comments));
				  
				  //for Level2
			 $('#input-Anaesthetic', '#review-OperationForm').val(json.Rows[0].Anaesthetic).selectmenu('refresh');
				  
			$('#input-FacialNerve', '#review-OperationForm').val(json.Rows[0].FacNerve).selectmenu('refresh');
			if(json.Rows[0].Fistula_Canal == 'Y')  $('#input-Fistula-SemicircularCanal', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Fistula_Footplate  == 'Y')  $('#input-Fistula-Footplate', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Fistula_NotChecked == 'Y')  $('#input-Fistula-NotChecked', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			$('#input-Fistula-Nil', '#review-OperationForm').prop('checked', (json.Rows[0].Fistula_Nil == 'Y')).checkboxradio('refresh');

			$('#input-MobilityOfCollapsedEardrum', '#review-OperationForm').val(json.Rows[0].Retract_Mobility).selectmenu('refresh');

			if(json.Rows[0].OssEroded_Malleus == 'Y')  $('#input-OssiclesEroded-Malleus', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].OssEroded_Incus== 'Y')  $('#input-OssiclesEroded-Incus', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].OssEroded_StapesSupra== 'Y')  $('#input-OssiclesEroded-StapesSupra', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].OssEroded_Footplate== 'Y')  $('#input-OssiclesEroded-Footplate', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].OssEroded_NotChecked== 'Y')  $('#input-OssiclesEroded-NotChecked', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			$('#input-OssiclesEroded-Nil', '#review-OperationForm').prop('checked', (json.Rows[0].OssEroded_Nil== 'Y')).checkboxradio('refresh');

			if(json.Rows[0].OssFixed_Footplate== 'Y')  $('#input-OssicularFixed-Footplate', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].OssFixed_MIJoint== 'Y')  $('#input-OssicularFixed-MIJoint', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].OssFixed_ISJoint== 'Y')  $('#input-OssicularFixed-ISJoint', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			$('#input-OssicularFixed-Nil', '#review-OperationForm').prop('checked', (json.Rows[0].OssFixed_Nil== 'Y')).checkboxradio('refresh');

			if(json.Rows[0].Cholest_Antrum == 'Y')  $('#input-Cholesteatoma-Antrum', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Cholest_MastCells == 'Y')  $('#input-Cholesteatoma-MastoidCells', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Cholest_ME == 'Y')  $('#input-Cholesteatoma-ME', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');
			if(json.Rows[0].Cholest_UnderTM == 'Y')  $('#input-Cholesteatoma-UndersurfaceTM', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');

			if(json.Rows[0].Retraction_Ant == 'Y')  $('#input-EardrumCollapse-Anterior', '#review-OperationForm').prop('checked', true).checkboxradio('refresh');;

			var d;
			if(getURLParameter("area") == "MA") {
				d = json.Rows[0].PreInterval;
			}
			else
			{
				d = json.Rows[0].MostRecentAud;
			}
			$('#input-DateOfMostRecentAudiogram', '#review-OperationForm').val(genDateString(d));	

			var convertAudiogram = function(value, elem) {
				if(value == "" || isNaN(parseInt(value))) {
					elem.val("N/A").selectmenu('refresh');
					return false;
				}

				elem.val(parseInt(value).toString()).selectmenu('refresh');
				return false;	
			};
			convertAudiogram(json.Rows[0].OpEar500BC, $('#OpEarBC500', '#review-OperationForm'));
			convertAudiogram(json.Rows[0].OpEar1000BC, $('#OpEarBC1000', '#review-OperationForm'));
			convertAudiogram(json.Rows[0].OpEar2000BC, $('#OpEarBC2000', '#review-OperationForm'));
			convertAudiogram(json.Rows[0].OpEar3000BC, $('#OpEarBC3000', '#review-OperationForm'));
			convertAudiogram(json.Rows[0].OpEar4000BC, $('#OpEarBC4000', '#review-OperationForm'));
			
			convertAudiogram(json.Rows[0].OpEar500AC, $('#OpEarAC500', '#review-OperationForm'));
			convertAudiogram(json.Rows[0].OpEar1000AC, $('#OpEarAC1000', '#review-OperationForm'));
			convertAudiogram(json.Rows[0].OpEar2000AC, $('#OpEarAC2000', '#review-OperationForm'));
			convertAudiogram(json.Rows[0].OpEar3000AC, $('#OpEarAC3000', '#review-OperationForm'));
			convertAudiogram(json.Rows[0].OpEar4000AC, $('#OpEarAC4000', '#review-OperationForm'));
			convertAudiogram(json.Rows[0].OpEar8000AC, $('#OpEarAC8000', '#review-OperationForm'));
			
			convertAudiogram(json.Rows[0].NonOpEar500BC, $('#NonOpEarBC500', '#review-OperationForm'));
			convertAudiogram(json.Rows[0].NonOpEar1000BC, $('#NonOpEarBC1000', '#review-OperationForm'));
			convertAudiogram(json.Rows[0].NonOpEar2000BC, $('#NonOpEarBC2000', '#review-OperationForm'));
			convertAudiogram(json.Rows[0].NonOpEar3000BC, $('#NonOpEarBC3000', '#review-OperationForm'));
			convertAudiogram(json.Rows[0].NonOpEar4000BC, $('#NonOpEarBC4000', '#review-OperationForm'));
			
			convertAudiogram(json.Rows[0].NonOpEar500AC, $('#NonOpEarAC500', '#review-OperationForm'));
			convertAudiogram(json.Rows[0].NonOpEar1000AC, $('#NonOpEarAC1000', '#review-OperationForm'));
			convertAudiogram(json.Rows[0].NonOpEar2000AC, $('#NonOpEarAC2000', '#review-OperationForm'));
			convertAudiogram(json.Rows[0].NonOpEar3000AC, $('#NonOpEarAC3000', '#review-OperationForm'));
			convertAudiogram(json.Rows[0].NonOpEar4000AC, $('#NonOpEarAC4000', '#review-OperationForm'));
			convertAudiogram(json.Rows[0].NonOpEar8000AC, $('#NonOpEarAC8000', '#review-OperationForm'));				

			if(json.Rows[0].OpEarBC_Mean != "") {
				$('#OpEarBC_Mean', '#review-OperationForm').html(json.Rows[0].OpEarBC_Mean);
			} else {
				$('#OpEarBC_Mean', '#review-OperationForm').html("N/A");
			}
			if(json.Rows[0].OpEarAC_Mean != "") {
			$('#OpEarAC_Mean', '#review-OperationForm').html(json.Rows[0].OpEarAC_Mean);
			} else {
				$('#OpEarAC_Mean', '#review-OperationForm').html("N/A");
			}
			if(json.Rows[0].OpEar_AirBoneGap != "") {
			$('#OpEar_AirBoneGap', '#review-OperationForm').html(json.Rows[0].OpEar_AirBoneGap);
			} else {
				$('#OpEar_AirBoneGap', '#review-OperationForm').html("N/A");
			}
			if(json.Rows[0].NonOpEarBC_Mean != "") {
			$('#NonOpEarBC_Mean', '#review-OperationForm').html(json.Rows[0].NonOpEarBC_Mean);
			} else {
				$('#NonOpEarBC_Mean', '#review-OperationForm').html("N/A");
			}
			if(json.Rows[0].NonOpEarAC_Mean != "") {
			$('#NonOpEarAC_Mean', '#review-OperationForm').html(json.Rows[0].NonOpEarAC_Mean)
			} else {
				$('#NonOpEarAC_Mean', '#review-OperationForm').html("N/A");
			}
			if(json.Rows[0].NonOpEar_AirBoneGap != "") {
			$('#NonOpEar_AirBoneGap', '#review-OperationForm').html(json.Rows[0].NonOpEar_AirBoneGap)
			} else {
				$('#NonOpEar_AirBoneGap', '#review-OperationForm').html("N/A");
			}
			
			$('#input-EntryDate','#review-OperationForm').val(json.Rows[0].Entry_Date);
		});
			
};

// get postOp details and render.
// WS: getPostOpDetails
var setupPostOp = function(CaseCode, HospCode) {
	//console.log("setupPostOp");
	var AssInterval = $('#input-FollowupPeriod', '#review-FollowupForm').val();
	$('#review-FollowupForm')[0].reset();
	
	$('input[type=checkbox]', '#review-FollowupForm').prop('checked', false).checkboxradio('refresh');
	$('#AudiogramInputsDiv','#review-FollowupForm').show();
	
	$('#input-CaseCode', '#review-FollowupForm').val(CaseCode);
	$('select', '#review-FollowupForm').each(function() {
            //$(this).find('option:first').attr('selected',true);
            $(this).prop('selectedIndex',0);
        })
	
	$('#input-FollowupPeriod', '#review-FollowupForm').val(AssInterval).selectmenu('refresh');
/*	$('#input-OssicularProsthesis', '#review-FollowupForm').val("N/A").selectmenu('refresh');
	$('#input-Discharge', '#review-FollowupForm').val("Nil").selectmenu('refresh');*/
	
	var setToNewForm = function() {
		$('.displayInResult', '#review-FollowupForm').hide();
		$('.notDisplayInResult', '#review-FollowupForm').show();
		$('input[type=text]', '#review-FollowupForm').prop("readonly", false);
		$('input[type=text]', '#review-FollowupForm').parent().removeClass('ui-disabled');
		$('textarea', '#review-FollowupForm').prop("readonly", false);
		$('textarea', '#review-FollowupForm').parent().removeClass('ui-disabled');
		$('input[type=checkbox]', '#review-FollowupForm').prop("disabled", false).checkboxradio('refresh');
		$('select', '#review-FollowupForm').prop("disabled", false).selectmenu('refresh');
		$('select', '#review-FollowupForm').parent().removeClass('ui-disabled');
		$('.datepicker', '#review-FollowupForm').datepicker({
			changeMonth: true,
			changeYear: true,
			yearRange: '-100:+20',
			dateFormat: 'dd/mm/yy'
		});	
		//$('.datepicker', '#review-FollowupForm').prop("readonly", true);
		$('#input-CaseCode', '#review-FollowupForm').prop("readonly", true);
		$('#input-OpDate', '#review-FollowupForm').prop("readonly", true);
		
		

		$('#input-Complications-None', '#review-FollowupForm').prop("checked", (!$('#input-Complications-None', '#review-FollowupForm').prop('checked'))).checkboxradio('refresh');
		

		$('#input-OtoscopicAppearance-Normal', '#review-FollowupForm').prop("checked", (!$('#input-OtoscopicAppearance-Normal', '#review-FollowupForm').prop('checked'))).checkboxradio('refresh');
		
		
		$('#input-Cholesteatoma-NA', '#review-FollowupForm').prop("checked", (!$('#input-Cholesteatoma-NA', '#review-FollowupForm').prop('checked'))).checkboxradio('refresh');
		
		
	};
	
	getJsonFromWS(true, webserive_url + 'getPostOpDetails', 
		{"HospCode" : HospCode, "CaseCode" : CaseCode, "AssInterval" : AssInterval},
		function(json) {
				if(json.Rows.length <=0) {
					// create new operation	
					setToNewForm();
					return false;
				}
				
				var d = json.Rows[0].OpDate;
				$('#input-OpDate', '#review-FollowupForm').val(genDateString(d));	
				
				if(!json.Rows[0].HospCode) {	
					//console.log("no data");
					setToNewForm();
					return false;
				}
		
				//data already exists
				$('.notDisplayInResult', '#review-FollowupForm').hide();
				
				$('input[type=text]', '#review-FollowupForm').prop("readonly", true);
				$('input[type=text]', '#review-FollowupForm').parent().addClass('ui-disabled');
				$('textarea', '#review-FollowupForm').prop("readonly", true);
				$('textarea', '#review-FollowupForm').parent().addClass('ui-disabled');
				$('input[type=checkbox]', '#review-FollowupForm').prop("disabled", true).checkboxradio('refresh');
				$('select', '#review-FollowupForm').prop("disabled", true).selectmenu('refresh');
				$('select', '#review-FollowupForm').parent().addClass('ui-disabled');
				$('.datepicker', '#review-FollowupForm').datepicker("destroy");
				$('.displayInResult', '#review-FollowupForm').show();
				
				$('#input-FollowupPeriod', '#review-FollowupForm').prop("disabled", false).selectmenu('refresh');
				$('#input-FollowupPeriod', '#review-FollowupForm').parent().removeClass('ui-disabled');
				

				d = json.Rows[0].AssDate;
				$('#input-AssessmentDate', '#review-FollowupForm').val(genDateString(d));
				var Discharge  =json.Rows[0].Discharge;
				
				$('#input-Discharge', '#review-FollowupForm').val(json.Rows[0].Discharge).selectmenu('refresh');
						
				if(json.Rows[0].Cholest_Attic == 'Y')  $('#input-Cholesteatoma-Attic', '#review-FollowupForm').prop('checked', true).checkboxradio('refresh');

				if(json.Rows[0].Complics_Palsy == 'Y') $('#input-Complications-FacialPalsy', '#review-FollowupForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].Complics_Tinnitus == 'Y') $('#input-Complications-Tinnitus', '#review-FollowupForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].Complics_Vertigo == 'Y') $('#input-Complications-Vertigo', '#review-FollowupForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].Complics_Hearing == 'Y') $('#input-Complications-HearingLoss', '#review-FollowupForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].Complics_WInfection == 'Y') $('#input-Complications-WoundInfection', '#review-FollowupForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].Complics_Taste == 'Y') $('#input-Complications-AlterationOfTaste', '#review-FollowupForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].Complics_Other == 'Y') $('#input-Complications-Other', '#review-FollowupForm').prop('checked', true).checkboxradio('refresh');
				$('#input-Complications-NA', '#review-FollowupForm').prop('checked', (json.Rows[0].Complics_None == 'Y')).checkboxradio('refresh');
				if(json.Rows[0].Cholest_Recur == 'Y') $('#input-Cholesteatoma-Recurrence', '#review-FollowupForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].Cholest_Resid == 'Y') $('#input-Cholesteatoma-Residual', '#review-FollowupForm').prop('checked', true).checkboxradio('refresh');
				$('#input-Cholesteatoma-NA', '#review-FollowupForm').prop('checked', (json.Rows[0].Cholest_NA == 'Y')).checkboxradio('refresh');
				if(json.Rows[0].OA_Intact == 'Y') $('#input-OtoscopicAppearance-Intact', '#review-FollowupForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OA_NotIntact == 'Y') $('#input-OtoscopicAppearance-NotIntact', '#review-FollowupForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OA_Myringitis == 'Y') $('#input-OtoscopicAppearance-Myringitis', '#review-FollowupForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OA_AntBlunt == 'Y') $('#input-OtoscopicAppearance-AnteriorBlunting', '#review-FollowupForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OA_Atelectasis == 'Y') $('#input-OtoscopicAppearance-Atelectasis', '#review-FollowupForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OA_Retraction == 'Y') $('#input-OtoscopicAppearance-RetractionPocket', '#review-FollowupForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OA_Lateralization == 'Y') $('#input-OtoscopicAppearance-Lateralization', '#review-FollowupForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OA_MeatalStenosis == 'Y') $('#input-OtoscopicAppearance-MeatalStenosis', '#review-FollowupForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OA_CompleteCollapse == 'Y') $('#input-OtoscopicAppearance-Completecollapse', '#review-FollowupForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OA_OME == 'Y') $('#input-OtoscopicAppearance-OME', '#review-FollowupForm').prop('checked', true).checkboxradio('refresh');
				$('#input-OtoscopicAppearance-NotAssessed', '#review-FollowupForm').prop('checked', (json.Rows[0].OA_NotAssessed == 'Y')).checkboxradio('refresh');
				$('#input-OtoscopicAppearance-Normal', '#review-FollowupForm').prop('checked', (json.Rows[0].OA_Normal == 'Y')).checkboxradio('refresh');
				$('#input-Comments', '#review-FollowupForm').val(unescape(json.Rows[0].Comments));

				//level2
				$('#input-OssicularProsthesis', '#review-FollowupForm').val(json.Rows[0].Ossic_Pros).selectmenu('refresh');
				$('#input-Cholesteatoma-None', '#review-FollowupForm').prop('checked', (json.Rows[0].Cholest_None == 'Y')).checkboxradio('refresh');
			
			var convertAudiogram = function(value, elem) {
				if(value == "" || isNaN(parseInt(value))) {
					elem.val("N/A").selectmenu('refresh');
					return false;
				}

				elem.val(parseInt(value).toString()).selectmenu('refresh');
				return true;	
			};
			
			convertAudiogram(json.Rows[0].OpEar500BC, $('#OpEarBC500', '#review-FollowupForm'));
			convertAudiogram(json.Rows[0].OpEar1000BC, $('#OpEarBC1000', '#review-FollowupForm'));
			convertAudiogram(json.Rows[0].OpEar2000BC, $('#OpEarBC2000', '#review-FollowupForm'));
			convertAudiogram(json.Rows[0].OpEar3000BC, $('#OpEarBC3000', '#review-FollowupForm'));
			convertAudiogram(json.Rows[0].OpEar4000BC, $('#OpEarBC4000', '#review-FollowupForm'));
			
			convertAudiogram(json.Rows[0].OpEar500AC, $('#OpEarAC500', '#review-FollowupForm'));
			convertAudiogram(json.Rows[0].OpEar1000AC, $('#OpEarAC1000', '#review-FollowupForm'));
			convertAudiogram(json.Rows[0].OpEar2000AC, $('#OpEarAC2000', '#review-FollowupForm'));
			convertAudiogram(json.Rows[0].OpEar3000AC, $('#OpEarAC3000', '#review-FollowupForm'));
			convertAudiogram(json.Rows[0].OpEar4000AC, $('#OpEarAC4000', '#review-FollowupForm'));
			convertAudiogram(json.Rows[0].OpEar8000AC, $('#OpEarAC8000', '#review-FollowupForm'));
	
			if(json.Rows[0].OpEarBC_Mean != "") {
				$('#OpEarBC_Mean', '#review-FollowupForm').html(json.Rows[0].OpEarBC_Mean);
			} else {
				$('#OpEarBC_Mean', '#review-FollowupForm').html("N/A");
			}
			if(json.Rows[0].OpEarAC_Mean != "") {
			$('#OpEarAC_Mean', '#review-FollowupForm').html(json.Rows[0].OpEarAC_Mean);
			} else {
				$('#OpEarAC_Mean', '#review-FollowupForm').html("N/A");
			}
			if(json.Rows[0].OpEar_AirBoneGap != "") {
			$('#OpEar_AirBoneGap', '#review-FollowupForm').html(json.Rows[0].OpEar_AirBoneGap);
			} else {
				$('#OpEar_AirBoneGap', '#review-FollowupForm').html("N/A");
			}
			
			$('#input-EntryDate','#review-FollowupForm').val(json.Rows[0].Entry_Date);
		});
			
};

// get procedure details and render.
// WS: getProcedureDetails
var setupProcedure = function(CaseCode, HospCode) {
	//console.log("setupProcedure");
	var user_level = getURLParameter("level");
	if (user_level != '2a' && user_level != '2b') {
		return false;
	}
	
	$('#review-OpProcedureForm')[0].reset();
	$('input[type=checkbox]', '#review-OpProcedureForm').prop('checked', false).checkboxradio('refresh');

	$('#input-CaseCode', '#review-OpProcedureForm').val(CaseCode);
	
	  $('select', '#review-OpProcedureForm').each(function() {
            $(this).prop('selectedIndex',0);
        });
	
	var setToNewForm = function() {
		$('.displayInResult', '#review-OpProcedureForm').hide();
		$('.notDisplayInResult', '#review-OpProcedureForm').show();
		$('input[type=text]', '#review-OpProcedureForm').prop("readonly", false);
		$('input[type=text]', '#review-OpProcedureForm').parent().removeClass('ui-disabled');
		$('textarea', '#review-OpProcedureForm').prop("readonly", false);
		$('textarea', '#review-OpProcedureForm').parent().removeClass('ui-disabled');
		$('input[type=checkbox]', '#review-OpProcedureForm').prop("disabled", false).checkboxradio('refresh');
		$('select', '#review-OpProcedureForm').prop("disabled", false).selectmenu('refresh');
		$('select', '#review-OpProcedureForm').parent().removeClass('ui-disabled');
		$('#input-CaseCode', '#review-OpProcedureForm').prop("readonly", true);
		
		var ele;
		ele = $('#input-MaterialInME-Nil', '#review-OpProcedureForm');
		ele.prop("checked", (!ele.prop('checked'))).checkboxradio('refresh');
		
		
		ele = $('#input-Meatoplasty-Nil', '#review-OpProcedureForm');
		ele.prop("checked", (!ele.prop('checked'))).checkboxradio('refresh');
		
		
		ele = $('#input-Defect-Nil', '#review-OpProcedureForm');
		ele.prop("checked", (!ele.prop('checked'))).checkboxradio('refresh');
		
		
		ele = $('#input-OblitFlap-NA', '#review-OpProcedureForm');
		ele.prop("checked", (!ele.prop('checked'))).checkboxradio('refresh');
		
		
		ele = $('#input-OblitMaterial-NA', '#review-OpProcedureForm');
		ele.prop("checked", (!ele.prop('checked'))).checkboxradio('refresh');
		
		
		ele = $('#input-OvalWindowSeal-Nil', '#review-OpProcedureForm');
		ele.prop("checked", (!ele.prop('checked'))).checkboxradio('refresh');
		
		ele = $('#input-FenestrationMethod-NA', '#review-OpProcedureForm');
		ele.prop("checked", (!ele.prop('checked'))).checkboxradio('refresh');
	};
	
	getJsonFromWS(true, webserive_url + 'getProcedureDetails', 
		{"HospCode" : HospCode, "CaseCode" : CaseCode},
		function(json) {
				if(json.Rows.length <=0) {
					// create new operation	
					setToNewForm();
					return false;
				}
				
				$('.notDisplayInResult', '#review-OpProcedureForm').hide();
				
				$('input[type=text]', '#review-OpProcedureForm').prop("readonly", true);
				$('input[type=text]', '#review-OpProcedureForm').parent().addClass('ui-disabled');
				$('textarea', '#review-OpProcedureForm').prop("readonly", true);
				$('textarea', '#review-OpProcedureForm').parent().addClass('ui-disabled');
				$('input[type=checkbox]', '#review-OpProcedureForm').prop("disabled", true).checkboxradio('refresh');
				$('select', '#review-OpProcedureForm').prop("disabled", true).selectmenu('refresh');
				$('select', '#review-OpProcedureForm').parent().addClass('ui-disabled');
				$('.datepicker', '#review-OpProcedureForm').datepicker("destroy");
				$('.displayInResult', '#review-OpProcedureForm').show();
				
				var user_level = getURLParameter("level");
				if (user_level = '1') {
					$('#btnViewOpNote', '#review-OpProcedureForm').attr('href', earAuditDLL +'OpNotesL1?CCode='+CaseCode+'&HNumber='+HospCode);
				}
				else {
					$('#btnViewOpNote', '#review-OpProcedureForm').attr('href', earAuditDLL +'OpNotes?CCode='+CaseCode+'&HNumber='+HospCode);
				}

				//$('#btnViewOpNote', '#review-OpProcedureForm').attr('href', earAuditDLL + 'OpNotes?CCode='+CaseCode+'&HNumber='+HospCode);

				
				$('#input-Nature','#review-OpProcedureForm').val(json.Rows[0].Nature).selectmenu('refresh');
				$('#input-Approach','#review-OpProcedureForm').val(json.Rows[0].Approach).selectmenu('refresh');;
				if(json.Rows[0].MatME_GelFilm == "Y") $('#input-MaterialInME-GelFilm', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].MatME_GelFoam == "Y") $('#input-MaterialInME-GelFoam', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].MatME_Cartilage == "Y") $('#input-MaterialInME-Cartilage', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].MatME_Silastic == "Y") $('#input-MaterialInME-Silastic', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				$('#input-MaterialInME-Nil', '#review-OpProcedureForm').prop('checked', (json.Rows[0].MatME_Nil == "Y")).checkboxradio('refresh');
				if(json.Rows[0].Meato_Bony == "Y")$('#input-Meatoplasty-Bony', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].Meato_Cartilaginous == "Y") $('#input-Meatoplasty-Cartilaginous', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				$('#input-Meatoplasty-Nil', '#review-OpProcedureForm').prop('checked', (json.Rows[0].Meato_Nil == "Y")).checkboxradio('refresh');
				$('#input-MyringoplastyMaterial','#review-OpProcedureForm').val(json.Rows[0].Myringo_Mat).selectmenu('refresh');;
				$('#input-GraftMethod','#review-OpProcedureForm').val(json.Rows[0].GraftMeth).selectmenu('refresh');;
				if(json.Rows[0].OssicDefect_Malleus == "Y")$('#input-Defect-Malleus', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OssicDefect_Incus == "Y") $('#input-Defect-Incus', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OssicDefect_StapesSupra == "Y") $('#input-Defect-StapesSupra', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OssicDefect_Footplate == "Y") $('#input-Defect-Footplate', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				$('#input-Defect-Nil', '#review-OpProcedureForm').prop('checked', (json.Rows[0].OssicDefect_Nil == "Y")).checkboxradio('refresh');
				$('#input-Material','#review-OpProcedureForm').val(json.Rows[0].Ossic_Mat).selectmenu('refresh');;
				$('#input-Prosthesis','#review-OpProcedureForm').val(json.Rows[0].Ossic_Pros).selectmenu('refresh');;
				$('#input-Reconstruction','#review-OpProcedureForm').val(json.Rows[0].Ossic_Recon).selectmenu('refresh');;
				$('#input-Mastoidectomy','#review-OpProcedureForm').val(json.Rows[0].Mastoidectomy).selectmenu('refresh');;
				if(json.Rows[0].OblitFlap_Palva == "Y") $('#input-OblitFlap-Palva', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OblitFlap_Muscle == "Y") $('#input-OblitFlap-Muscle', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OblitFlap_Fascial == "Y") $('#input-OblitFlap-FascialPeriosteal', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OblitFlap_MidTemporal == "Y") $('#input-OblitFlap-MidTemporal', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OblitFlap_TempParietal == "Y") $('#input-OblitFlap-TemporoParietalFascial', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				$('#input-OblitFlap-NA', '#review-OpProcedureForm').prop('checked', (json.Rows[0].OblitFlap_NA == "Y")).checkboxradio('refresh');
				if(json.Rows[0].OblitMat_Bioglass == "Y") $('#input-OblitMaterial-Bioglass', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OblitMat_BonePaste == "Y") $('#input-OblitMaterial-BonePaste', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OblitMat_BoneChips == "Y") $('#input-OblitMaterial-BoneChips', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OblitMat_Cartilage == "Y") $('#input-OblitMaterial-CartilageSlices', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OblitMat_HAGranules == "Y") $('#input-OblitMaterial-HAGranules', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OblitMat_SerenoCem == "Y") $('#input-OblitMaterial-SerenoCem', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].OblitMat_FatBlind == "Y") $('#input-OblitMaterial-FatAndBlindPit', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				$('#input-OblitMaterial-NA', '#review-OpProcedureForm').prop('checked', (json.Rows[0].OblitMat_NA == "Y")).checkboxradio('refresh');
				$('#input-CanalWallReconstruction','#review-OpProcedureForm').val(json.Rows[0].CW_Recon).selectmenu('refresh');;
				$('#input-Operation','#review-OpProcedureForm').val(json.Rows[0].Stapes_Op).selectmenu('refresh');;
				$('#input-ChordaTympani','#review-OpProcedureForm').val(json.Rows[0].Stapes_Chorda).selectmenu('refresh');;
				$('#input-FenestrationSize','#review-OpProcedureForm').val(json.Rows[0].Stapes_Fensize).selectmenu('refresh');;
				$('#input-ProthesisType','#review-OpProcedureForm').val(json.Rows[0].Stapes_ProsType).selectmenu('refresh');;
				$('#input-ProsthesisSize','#review-OpProcedureForm').val(json.Rows[0].Stapes_ProsSize).selectmenu('refresh');;
				$('#input-Attachment','#review-OpProcedureForm').val(json.Rows[0].Stapes_Attach).selectmenu('refresh');;
				$('#input-InterpositionTissue','#review-OpProcedureForm').val(json.Rows[0].Stapes_IntTissue).selectmenu('refresh');;
				if(json.Rows[0].Fen_Pick == "Y") $('#input-FenestrationMethod-Pick', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].Fen_Drill == "Y") $('#input-FenestrationMethod-Drill', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].Fen_Laser == "Y") $('#input-FenestrationMethod-Laser', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				$('#input-FenestrationMethod-NA', '#review-OpProcedureForm').prop('checked', (json.Rows[0].Fen_NA == "Y")).checkboxradio('refresh');
				$('#input-LaserType','#review-OpProcedureForm').val(json.Rows[0].Laser).selectmenu('refresh'); 
				if(json.Rows[0].WinSeal_Fat == "Y") $('#input-OvalWindowSeal-Fat', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				if(json.Rows[0].WinSeal_BloodClot == "Y") $('#input-OvalWindowSeal-BloodClot', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				$('#input-OvalWindowSeal-OtherConnectiveTissue', '#review-OpProcedureForm').prop('checked', (json.Rows[0].WinSeal_Other == "Y")).checkboxradio('refresh');
				if(json.Rows[0].WinSeal_GelFoam == "Y")$('#input-OvalWindowSeal-GelFoam', '#review-OpProcedureForm').prop('checked', true).checkboxradio('refresh');
				$('#input-OvalWindowSeal-Nil', '#review-OpProcedureForm').prop('checked', (json.Rows[0].WinSeal_Nil == "Y")).checkboxradio('refresh');
				$('#input-Comments','#review-OpProcedureForm').val(unescape(json.Rows[0].Comments));
				
				$('#input-OtoEndosopicMethod','#review-OpProcedureForm').val(json.Rows[0].OtoEndosopicMethod).selectmenu('refresh');
				$('#input-OtoEndosopicSize','#review-OpProcedureForm').val(json.Rows[0].OtoEndosopicSize).selectmenu('refresh');
				$('#input-OtoEndosopicLength','#review-OpProcedureForm').val(json.Rows[0].OtoEndosopicLength).selectmenu('refresh');
				$('#input-OtoEndosopicAngle','#review-OpProcedureForm').val(json.Rows[0].OtoEndosopicAngle).selectmenu('refresh');
				
				$('#input-EntryDate','#review-OpProcedureForm').val(json.Rows[0].Entry_Date);
		});
			
};


////////////////////////////////////////////////////////////////////////
// Below is do init page in UI.
////////////////////////////////////////////////////////////////////////


//to init review page, do init for the 4 pages
var initReviewPages = function(CaseCode, HospCode, PatCode) {
	////console.log("initReviewPages, CaseCode = [" + CaseCode +"], HospCode = [" + HospCode +"], PatCode = [" + PatCode +"]");
	
	setupPreOp(CaseCode, HospCode, PatCode);
	setupOperation(CaseCode, HospCode);
	setupPostOp(CaseCode, HospCode);
	setupProcedure(CaseCode, HospCode);
};


// to init login UI, show user name, level
// WS: getUserName
var initLoggedInPage = function(hospital_no, area) {

	if(hospital_no == null || area == null) {
			////console.log("Login Invalid input");
			window.location.replace('index.htm');
			return false;
	}
	
	//console.log("initLoggedInPage (" + hospital_no+ "," +area +")");
	
	getJsonFromWS(true, webserive_url + 'getUserName', {"hospital_no": hospital_no}, function(json) {

		if(json.Error != null) {
			notifyUser("Login Failed - " + json.Reason);
			window.location.replace('index.htm');
			return false;
		}		

		//console.log(json.Rows[0].Forename + ' ' + json.Rows[0].Surname);
		$('span#username').text(json.Rows[0].Forename + ' ' + json.Rows[0].Surname);
		//console.log($('span#username').text());
		
		var user_level = json.Rows[0].user_level;
		if (user_level != getURLParameter("level")) {
			window.location.replace('index.htm');
			return false;
		}
		
		
		if(user_level == '1') {
				$('span.platformName').text("Level 1");
				$('.level1Only').show();
				$('.level2Only').hide();
				
				//special handle for isForMA in UKL1
				if(hospital_no == '9400') {
					$('#input-isForMA').hide();
				}
		} else if(user_level == '2a' || user_level == '2b') {
			$('span.platformName').text("Level 2");
			$('.level1Only').hide();
			$('.level2Only').show();
			
			//special handle for isForMA 
				if(area.substring(0,2) == "In" && hospital_no != "100") {
					$('#input-isForMA').hide();
				}
		}
		
		if(area == "MA") {
			
			$('span.platformName').each(function() {
				$(this).text($(this).text() + " (MA)");
			});
			$('.forMA').show();
			$('.notForMA').hide();
		}
	});
	
	
};

// to init Data Analysis page
// The link use the old site link for data generation
var initDataAnalysis = function() {
	////console.log("initDataAnalysis");

	var base = earAuditDLL;
	var url = base;
	var hospital_no = getURLParameter("hospital_no");
	
	var user_level = getURLParameter("level");

	var hospital = getURLParameter("hospital_name");
	
	if(getURLParameter("area") == "MA") {
		url = base + "Excel_M?HNumber=" + hospital_no +"&HName="+hospital+"&Level=M";
		$('a#dataAna-AllData', '#tab-DataAnalysis').attr('href', url +"&Data=All");
		$('a#dataAna-PreOpData', '#tab-DataAnalysis').attr('href', url +"&Data=PreOp");
		$('a#dataAna-OpData', '#tab-DataAnalysis').attr('href', url +"&Data=Op");
		$('a#dataAna-PostOpData', '#tab-DataAnalysis').attr('href', url +"&Data=PostOp");
		
		url = base + "Comparative_M?Security=OtologyAuditData_Europa&HNumber="+hospital_no+"&HName="+hospital+"&Level=M";
		$('a#dataAna-ComparativeData', '#tab-DataAnalysis').attr('href', url);
		
		$('li#dataAna-CustomQuery_li', '#tab-DataAnalysis').hide();
	
	}
	else if(user_level == "1") {
		url = base + "L1Excel?HNumber=" + hospital_no +"&HName="+hospital+"&Level="+user_level;
		$('a#dataAna-AllData', '#tab-DataAnalysis').attr('href', url +"&Data=All");
		$('a#dataAna-PreOpData', '#tab-DataAnalysis').attr('href', url +"&Data=PreOp");
		$('a#dataAna-OpData', '#tab-DataAnalysis').attr('href', url +"&Data=Op");
		$('a#dataAna-PostOpData', '#tab-DataAnalysis').attr('href', url +"&Data=PostOp");
		
		$('li#dataAna-CustomQuery_li', '#tab-DataAnalysis').show();
		url = base + "CustomQuery?HNumber=" + hospital_no +"&HName="+hospital+"&Level="+user_level;
		$('a#dataAna-CustomQuery', '#tab-DataAnalysis').attr('href', url);
		
		
		url = base + "Comparative2?Security=OtologyAuditData_Europa&HNumber="+hospital_no+"&HName="+hospital+"&Level="+user_level;
		$('a#dataAna-ComparativeData', '#tab-DataAnalysis').attr('href', url);
	} else {
		url = base + "Excel?HNumber=" + hospital_no +"&HName="+hospital+"&Level="+user_level;
		$('a#dataAna-AllData', '#tab-DataAnalysis').attr('href', url +"&Data=All");
		$('a#dataAna-PreOpData', '#tab-DataAnalysis').attr('href', url +"&Data=PreOp");
		$('a#dataAna-OpData', '#tab-DataAnalysis').attr('href', url +"&Data=Op");
		$('a#dataAna-PostOpData', '#tab-DataAnalysis').attr('href', url +"&Data=PostOp");
		
		$('li#dataAna-CustomQuery_li', '#tab-DataAnalysis').show();
		url = base + "CustomQuery?HNumber=" + hospital_no +"&HName="+hospital+"&Level="+user_level;
		$('a#dataAna-CustomQuery', '#tab-DataAnalysis').attr('href', url);
		
		url = base + "Comparative2?Security=OtologyAuditData_Europa&HNumber="+hospital_no+"&HName="+hospital+"&Level="+user_level;
		$('a#dataAna-ComparativeData', '#tab-DataAnalysis').attr('href', url);
	}

};

// init COA index page for each tab, e.g. getDropdown list, show user profile
var initPageCoa = function(hash) {
	////console.log("initPageCoa, hash = " +hash);
	switch(hash) {
		case '#tab-MyProfile': {
				var hospital_no = getURLParameter("hospital_no");
				if(hospital_no == null) {
						notifyUser("URL invalid");
						window.location.replace('index.htm');
						return false;
				}
				getJsonFromWS(true, webserive_url + 'getUserProfile', 
					{"hospital_no": hospital_no}, 
					function(json) {
					
	
						$('#tab-MyProfile #input-Title').val(json.Rows[0].Title == null ? '' : unescape(json.Rows[0].Title));
						$('#tab-MyProfile #input-Forename').val(json.Rows[0].Forename == null ? '': unescape(json.Rows[0].Forename));
						$('#tab-MyProfile #input-Surname').val(json.Rows[0].Surname == null ? '': unescape(json.Rows[0].Surname));
						$('#tab-MyProfile #input-HospitalName').val(json.Rows[0].name_of_hospital == null ? '': unescape(json.Rows[0].name_of_hospital));
						$('#tab-MyProfile #input-HospitalAddress').val(json.Rows[0].hospital_address == null ? '': unescape(json.Rows[0].hospital_address));
						$('#tab-MyProfile #input-EmailWork').val(json.Rows[0].email_address == null ? '': unescape(json.Rows[0].email_address));
						$('#tab-MyProfile #input-EmailHome').val(json.Rows[0].email_address2 == null ? '': unescape(json.Rows[0].email_address2));
						$('#tab-MyProfile #input-OtherContact').val(json.Rows[0].other_contact == null ? '': unescape(json.Rows[0].other_contact));
						
						if(json.Rows[0].cm_mast == 'Y') { $('#tab-MyProfile #input-CaseMix-Mastoidectomy').prop('checked', "checked").checkboxradio("refresh"); }
						if(json.Rows[0].cm_tymp == 'Y') { $('#tab-MyProfile #input-CaseMix-Tympanoplasty').prop('checked', "checked").checkboxradio("refresh"); }
						if(json.Rows[0].cm_stap == 'Y') { $('#tab-MyProfile #input-CaseMix-Stapedectomy').prop('checked', "checked").checkboxradio("refresh"); }
						
						$('#tab-MyProfile #input-AdditionalInformation').val(json.Rows[0].additional_info == null ? '': unescape(json.Rows[0].additional_info));
	
	
					});
		
			break;
		}
		case '#tab-NewCase': {
			var hospital_no = getURLParameter("hospital_no");
			if(hospital_no == null) {
					notifyUser("URL invalid");
					window.location.replace('index.htm');
					return false;
			}
			////console.log(hospital_no);
					$('#input-SurgCode', '#NewCaseForm').val(hospital_no);
					setDropDowns("Smoking", $('#input-Smoking', '#NewCaseForm'));
					setDropDowns("CME", $('#input-ContralateralEar', '#NewCaseForm'));					
			break;
		}
		case '#tab-Review-2': {
			////console.log("#tab-Review-2");
			var hospital_no = getURLParameter("hospital_no");
			var CaseCode = getURLParameter("CaseCode");
			var PatCode = getURLParameter("PatCode");
			if(!hospital_no || !CaseCode || !PatCode) {
					notifyUser("URL invalid");
					$.mobile.natvigate('#tab-Review');
					return false;
			}
			
			setDropDowns("Anaesthetic", $('#input-Anaesthetic', '#review-OperationForm'));
			setDropDowns("Discharge", $('#input-Discharge', '#review-OpProcedureForm'));
			setDropDowns("FacNerve", $('#input-FacialNerve', '#review-OperationForm'));
			setDropDowns("Retract_Mobility", $('#input-MobilityOfCollapsedEardrum', '#review-OperationForm'));
			setDropDowns("Supervised", $('#input-Supervised', '#review-OperationForm'));
			setDropDowns("Surg_Grade", $('#input-SurgeonGrade', '#review-OperationForm'));
			
			setDropDowns("Approach", $('#input-Approach', '#review-OpProcedureForm'));
			setDropDowns("CW_Recon", $('#input-CanalWallReconstruction', '#review-OpProcedureForm'));
			setDropDowns("Graft_Method", $('#input-GraftMethod', '#review-OpProcedureForm'));
			setDropDowns("Laser", $('#input-LaserType','#review-OpProcedureForm'));
			setDropDowns("Mastoidectomy", $('#input-Mastoidectomy','#review-OpProcedureForm'));
			setDropDowns("Myringo_Mat", $('#input-MyringoplastyMaterial','#review-OpProcedureForm'));
			setDropDowns("Nature", $('#input-Nature','#review-OpProcedureForm'));
			setDropDowns("Ossic_Mat", $('#input-Material','#review-OpProcedureForm'));
			setDropDowns("Ossic_Pros", $('#input-Prosthesis','#review-OpProcedureForm'));
			setDropDowns("Ossic_Recon", $('#input-Reconstruction','#review-OpProcedureForm'));
			setDropDowns("Stapes_Attach", $('#input-Attachment','#review-OpProcedureForm'));
			setDropDowns("Stapes_Chorda", $('#input-ChordaTympani','#review-OpProcedureForm'));
			setDropDowns("Stapes_Fensize", $('#input-FenestrationSize','#review-OpProcedureForm'));
			setDropDowns("Stapes_IntTissue", $('#input-InterpositionTissue','#review-OpProcedureForm'));
			setDropDowns("Stapes_Op", $('#input-Operation','#review-OpProcedureForm'));
			setDropDowns("Stapes_Prossize", $('#input-ProsthesisSize','#review-OpProcedureForm'));
			setDropDowns("Stapes_ProsType", $('#input-ProthesisType','#review-OpProcedureForm'));
			
			setDropDowns("OtoEndosopicMethod", $('#input-OtoEndosopicMethod','#review-OpProcedureForm'));
			setDropDowns("OtoEndosopicSize", $('#input-OtoEndosopicSize','#review-OpProcedureForm'));
			setDropDowns("OtoEndosopicLength", $('#input-OtoEndosopicLength','#review-OpProcedureForm'));
			setDropDowns("OtoEndosopicAngle", $('#input-OtoEndosopicAngle','#review-OpProcedureForm'));
		
			initReviewPages(CaseCode, hospital_no, PatCode);
			break;
		}
		case "#tab-DataAnalysis":
		{
			initDataAnalysis();
			
			
			break;
		}
		default:
			break;
	}
};

if(!window.plugins) {
  window.plugins = {};
}


