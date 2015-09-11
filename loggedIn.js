			var showMyProfile = function() {
					$('#menuBarV a[href="#tab-MyProfile"]').click();
				};						
	function init(){

					coaOfflineMode=true;

					//offline = true;
			 		
						myWebSQL.webdb.open();
						coaOffline.user.HospCode = getURLParameter("hospital_no");
						coaOffline.user.area = getURLParameter("area");
						coaOffline.user.name = getURLParameter("username");
						if(getURLParameter("level"))
						coaOffline.user.level = getURLParameter("level");
						coaOffline.DBReady = true;
	
				var hospital_no = getURLParameter("hospital_no");
				var area = getURLParameter("area");
				if(!hospital_no || !area)
				{
					notifyUser("URL invalid");;
					window.location.replace("index.htm");
				}

				initLoggedInPage(hospital_no,area);
	
	
		
				$('.tab').easyResponsiveTabs();
				$('.datepicker').datepicker({
					changeMonth: true,
					changeYear: true,
					yearRange: '-100:+20',
					dateFormat: 'dd/mm/yy'
				});
		
				
				
				
				var _showTab = "#tab-Home";
				var $defaultBtn = $('#menuBarH a[href="' + _showTab + '"]');
				activeMenuBtn($defaultBtn);
				$($defaultBtn.attr('href')).siblings().hide();
					
				$('#btn-createNewCase').on('click', function() {
					$('#menuBarH a[href="#tab-NewCase"]').click();
				});
				

				
						
				$( window ).hashchange(function() {
					var hash = location.hash;
					
					if(hash == "#Logoff") {
						coaLogoff();
						return false;

					}

					if(hash == ""){
						hash = "#tab-Home";
					}
					if(hash == "#tab-Review-2") {
						activeMenuBtn($('#menuBarH a[href=#tab-Review]'));
					}
					$(hash).show().siblings().hide();
					initPageCoa(hash);
					

					var btn = $('#menuBarH a[href=' + hash +']');
					if(btn.length !== 0) {
						activeMenuBtn(btn);
					}
						return false;
			 });
			 
			// Since the event is only triggered when the hash changes, we need to trigger
			// the event now, to handle the hash the page may have loaded with.
			$( window ).hashchange();
		
			//automated action //
				$('#input-RiskFactors-Other').on('click',function() {
					
					if($(this).prop('checked')) {
						alert('Please include brief details of the "Other" risk factors in the Comments field');
						$('#input-Comments','#NewCaseForm').focus();
					}
					return false;
				});
				
				$('#input-ContralateralEar').on('change', function() {
					
					if($(this).val() == "Other") {
						alert('Please include brief details of the "Other" CME value in the Comments field');
						$('#input-Comments','#NewCaseForm').focus();
					}
					return false;
				});
				
				setupNoneBtn($('#input-RiskFactors', '#NewCaseForm'), 'input-RiskFactors-None');
				setupNoneBtn($('#input-Symptoms', '#NewCaseForm'), 'input-Symptoms-None');
				
				//review-Operation
				setupNoneBtn($('#input-Cholesteatoma', '#review-OperationForm'), 'input-Cholesteatoma-NA');
				setupNoneBtn($('#input-PerforationSite', '#review-OperationForm'), 'input-PerforationSite-NA');
				setupNoneBtn($('#input-EardrumCollapse', '#review-OperationForm'), 'input-EardrumCollapse-NA');
				setupNoneBtn($('#input-OssicularChain', '#review-OperationForm'), 'input-OssicularChain-NotAssessed');
				setupNoneBtn($('#input-MEMucosa', '#review-OperationForm'), 'input-MEMucosa-Normal');
				
				
				setupNoneBtn($('#input-OssiclesEroded', '#review-OperationForm'), 'input-OssiclesEroded-NotChecked')
				setupNoneBtn($('#input-OssiclesEroded', '#review-OperationForm'), 'input-OssiclesEroded-Nil');
				setupNoneBtn($('#input-Fistula', '#review-OperationForm'), 'input-Fistula-Nil');
				setupNoneBtn($('#input-Fistula', '#review-OperationForm'), 'input-Fistula-NotChecked');
				
				setupNoneBtn($('#input-GraftMaterial', '#review-OperationForm'), 'input-GraftMaterial-NA');
				setupNoneBtn($('#input-OssicularFixed', '#review-OperationForm'),'input-OssicularFixed-Nil');
				
				//review-Followup
				setupNoneBtn($('#input-Complications', '#review-FollowupForm'),'input-Complications-None');
				setupNoneBtn($('#input-OtoscopicAppearance', '#review-FollowupForm'),'input-OtoscopicAppearance-NotAssessed');
				setupNoneBtn($('#input-OtoscopicAppearance', '#review-FollowupForm'),'input-OtoscopicAppearance-Normal');
				setupNoneBtn($('#input-Cholesteatoma', '#review-FollowupForm'),'input-Cholesteatoma-NA');
				setupNoneBtn($('#input-Cholesteatoma', '#review-FollowupForm'),'input-Cholesteatoma-None');
				
				$('#input-OtoscopicAppearance-Intact', '#review-FollowupForm').on('click',function() {
					if($(this).is(':checked')) {
						//////console.log("uncheck " + noneButtonId);
						$('#input-OtoscopicAppearance-NotIntact', '#review-FollowupForm').attr("checked", false).checkboxradio("refresh");
					}
				});
				
				$('#input-OtoscopicAppearance-NotIntact', '#review-FollowupForm').on('click',function() {
					if($(this).is(':checked')) {
						//////console.log("uncheck " + noneButtonId);
						$('#input-OtoscopicAppearance-Intact', '#review-FollowupForm').attr("checked", false).checkboxradio("refresh");
					}
				});
				
				
				//procedure
				setupNoneBtn($('#input-MaterialInME', '#review-OpProcedureForm'),'input-MaterialInME-Nil');
				setupNoneBtn($('#input-Meatoplasty', '#review-OpProcedureForm'),'input-Meatoplasty-Nil');
				setupNoneBtn($('#input-Defect', '#review-OpProcedureForm'),'input-Defect-Nil');
				setupNoneBtn($('#input-OblitFlap', '#review-OpProcedureForm'),'input-OblitFlap-NA');
				setupNoneBtn($('#input-OblitMaterial', '#review-OpProcedureForm'),'input-OblitMaterial-NA');
				setupNoneBtn($('#input-OvalWindowSeal', '#review-OpProcedureForm'),'input-OvalWindowSeal-Nil');
				setupNoneBtn($('#input-FenestrationMethod', '#review-OpProcedureForm'),'input-FenestrationMethod-NA');
				
				
				
				
			// User Action //
			$('#reviewBackBtnSmall').on('click',function() {
				if(location.hash == "#tab-Review-2") {
					var url ="loggedIn.htm?hospital_no="+getURLParameter("hospital_no")+"&area="+getURLParameter("area")+"&level="+getURLParameter("level")+"#tab-Review";
					if (getInternetExplorerVersion() <= -1 && !navigator.userAgent.match('CriOS')) {
						$.mobile.navigate(url);
					} 
					else
					{
						window.location.href=url;
					}
					
				}
				else {
					history.go(-1);
				}
				scrollToTop();
			});
			
			$('#reviewBackBtn a').on('click',function() {
				var url ="loggedIn.htm?hospital_no="+getURLParameter("hospital_no")+"&area="+getURLParameter("area")+"&level="+getURLParameter("level")+"#tab-Review";
					if (getInternetExplorerVersion() <= -1 && !navigator.userAgent.match('CriOS')) {
						$.mobile.navigate(url);
					} 
					else
					{
						window.location.href=url;
					}
				scrollToTop();
			});

			
			
			$('#submit-myProfile').on('click',function(event) {

					event.preventDefault();
					var Title = escape($('#input-Title', '#tab-MyProfile').val()),
					Forename = escape($('#input-Forename', '#tab-MyProfile').val()),
					Surname = escape($('#input-Surname', '#tab-MyProfile').val()),
					name_of_hospital = escape($('#input-HospitalName', '#tab-MyProfile').val()),
					hospital_address = escape($('#input-HospitalAddress', '#tab-MyProfile').val()),
					email_address = escape($('#input-EmailWork', '#tab-MyProfile').val()),
					email_address2 = escape($('#input-EmailHome', '#tab-MyProfile').val()),
					other_contact = escape($('#input-OtherContact', '#tab-MyProfile').val()),
					additional_info = escape($('#input-AdditionalInformation', '#tab-MyProfile').val());
					
					var cm_mast =	$('#input-CaseMix-Mastoidectomy', '#tab-MyProfile', '#review-OperationForm').prop('checked')? "Y" : "";
					var cm_tymp =	$('#input-CaseMix-Tympanoplasty', '#tab-MyProfile', '#review-OperationForm').prop('checked')? "Y" : "";
					var cm_stap =	$('#input-CaseMix-Stapedectomy', '#tab-MyProfile', '#review-OperationForm').prop('checked')? "Y" : "";

					updateMyProfile(getURLParameter("hospital_no"), Title, Forename, Surname, name_of_hospital, hospital_address, email_address, email_address2, other_contact, cm_mast, cm_tymp, cm_stap, additional_info);
	
					return false;
			}).focus(function() {this.blur();});
			
			$('#submit-changePassword').on('click',function() {

					var newPassword = getValueWithCheckBlank($('#input-NewPassword', '#tab-MyProfile')),
					confirmPassword = getValueWithCheckBlank($('#input-NewPasswordConfirm', '#tab-MyProfile')),
					oldPassword = getValueWithCheckBlank($('#input-CurrentPassword', '#tab-MyProfile'));
					
					if(newPassword == '' || confirmPassword == '' || oldPassword == '') {
						notifyUser("Invalid Input.");
						return false;
					}
								
					if(newPassword != confirmPassword) {
						notifyUser("New Password input unmatched");
						return false;
					}
					
					if(newPassword.contain) {
						notifyUser("Invalid Input.");
						return false;
					}
					
					changePassword(oldPassword, newPassword);
					
					return false;
					
			}).focus(function() {this.blur();});
			
			var autoAssignCaseCode = function() {
				var s = "";
				var PatCode = $('#input-PatientHospitalNo','#NewCaseForm').val();
				var DateListed = $('#input-DateListed','#NewCaseForm').val();
				
				if(PatCode == "" || DateListed == ""){
					$('#input-CaseCode','#NewCaseForm').val("");
					return false;
				}
				
				s += PatCode;
				
				var arr_DateListed = DateListed.split('/');
				
				s += arr_DateListed[0]+arr_DateListed[1]+ arr_DateListed[2].substring(2);
				
				s += $('#input-SideOfOperation-L','#NewCaseForm', '#review-OperationForm').prop('checked')? "L" : "R"
				
				$('#input-CaseCode','#NewCaseForm').val(s);
			};
			
			$('#input-PatientHospitalNo','#NewCaseForm').on('change',autoAssignCaseCode);
			$('#input-DateListed','#NewCaseForm').on('change',autoAssignCaseCode);
			$('#input-SideOfOperation','#NewCaseForm').on('change',autoAssignCaseCode);
			

/// New Case			
		
			$('#NewCaseForm').on('submit', function(e) {
				////console.log('NewCaseForm submit');
						
					var HospCode = $('#input-SurgCode','#NewCaseForm').val()
					,PatCode = getValueWithCheckBlank($('#input-PatientHospitalNo','#NewCaseForm'))
					,confirmPatCode = getValueWithCheckBlank($('#input-ConfirmHospitalNo','#NewCaseForm'))
					,CaseCode = $('#input-CaseCode','#NewCaseForm').val()
					,Sex = $('#input-Sex-M','#NewCaseForm').prop('checked')? "M" : "F"
					,DoB = getValueWithCheckBlank($('#input-DoB','#NewCaseForm')) 
					,DateListed = getValueWithCheckBlank($('#input-DateListed','#NewCaseForm'))
					,OpSide = $('#input-SideOfOperation-L','#NewCaseForm').prop('checked')? "Left" : "Right"
					,Stage = $('#input-Stage-Primary','#NewCaseForm').prop('checked')? "Primary" : "Revision"
					,Sym_Deafness = $('#input-Symptoms-Deafness','#NewCaseForm').prop('checked')? "Y" : "N"
					,Sym_Tinnitus = $('#input-Symptoms-Tinnitus','#NewCaseForm').prop('checked')? "Y" : "N"
					,Sym_Dizziness = $('#input-Symptoms-Dizziness','#NewCaseForm').prop('checked')? "Y" : "N"
					,Sym_IntDischarge = $('#input-Symptoms-IntermittentDischarge','#NewCaseForm').prop('checked')? "Y" : "N"
					,Sym_PersDischarge = $('#input-Symptoms-PersistentDischarge','#NewCaseForm').prop('checked')? "Y" : "N"
					,Sym_Earache = $('#input-Symptoms-Earache','#NewCaseForm').prop('checked')? "Y" : "N"
					,Sym_FacialPalsy = $('#input-Symptoms-FacialPalsy','#NewCaseForm').prop('checked')? "Y" : "N"
					,Sym_None = $('#input-Symptoms-None','#NewCaseForm').prop('checked')? "Y" : "N"
					,Aim_DryEar = $('#input-AimOfSurgery-DryEar','#NewCaseForm').prop('checked')? "Y" : "N"
					,Aim_improve = $('#input-AimOfSurgery-HearingGain','#NewCaseForm').prop('checked')? "Y" : "N"
					,Aim_restore = $('#input-AimOfSurgery-RestorationOfNormalAnatomy','#NewCaseForm').prop('checked')? "Y" : "N"
					,Aim_water = $('#input-AimOfSurgery-Waterproofing','#NewCaseForm').prop('checked')? "Y" : "N"
					,Aim_pathology = $('#input-AimOfSurgery-RemovalOfPathology','#NewCaseForm').prop('checked')? "Y" : "N"
					,Comments = escape($('#input-Comments','#NewCaseForm').val())
					,Risk_diabetes = $('#input-RiskFactors-Diabetes','#NewCaseForm').prop('checked')? "Y" : "N"
					,Risk_cleftpalate = $('#input-RiskFactors-CleftPalate','#NewCaseForm').prop('checked')? "Y" : "N"
					,Risk_downes = $('#input-RiskFactors-DownsSyndrome','#NewCaseForm').prop('checked')? "Y" : "N"
					,Risk_others = $('#input-RiskFactors-Other','#NewCaseForm').prop('checked')? "Y" : "N"
					,Risk_none = $('#input-RiskFactors-None','#NewCaseForm').prop('checked')? "Y" : "N"
					,Smoking = $('#input-Smoking','#NewCaseForm').val()
					,CME = $('#input-ContralateralEar','#NewCaseForm').val()
					,For_MA = $('#input-isForMA-Y','#NewCaseForm').prop('checked')? "Y" : "N";
					
						////console.log('HospCode = ' + HospCode);
						////console.log('PatCode = ' + PatCode);
						////console.log('confirmPatCode = ' + confirmPatCode);
						////console.log('CaseCode = ' + CaseCode);
						////console.log('Sex = ' + Sex);
						////console.log('DoB = ' + DoB);
						////console.log('DateListed = ' + DateListed);
						////console.log('OpSide = ' + OpSide);
						////console.log('Stage = ' + Stage);
						////console.log('Sym_Deafness = ' + Sym_Deafness);
						////console.log('Sym_Tinnitus = ' + Sym_Tinnitus);
						////console.log('Sym_Dizziness = ' + Sym_Dizziness);
						////console.log('Sym_IntDischarge = ' + Sym_IntDischarge);
						////console.log('Sym_PersDischarge = ' + Sym_PersDischarge);
						////console.log('Sym_Earache = ' + Sym_Earache);
						////console.log('Sym_FacialPalsy = ' + Sym_FacialPalsy);
						////console.log('Sym_None = ' + Sym_None);
						////console.log('Aim_DryEar = ' + Aim_DryEar);
						////console.log('Aim_improve = ' + Aim_improve);
						////console.log('Aim_restore = ' + Aim_restore);
						////console.log('Aim_water = ' + Aim_water);
						////console.log('Comments = ' + Comments);
						////console.log('Risk_diabetes = ' + Risk_diabetes);
						////console.log('Risk_cleftpalate = ' + Risk_cleftpalate);
						////console.log('Risk_downes = ' + Risk_downes);
						////console.log('Risk_others = ' + Risk_others);
						////console.log('Risk_none = ' + Risk_none);
						////console.log('Smoking = ' + Smoking);
						////console.log('CME = ' + CME);
						////console.log('For_MA = ' + For_MA);

						
					
					if(PatCode == "" || confirmPatCode == "" || DateListed == "" || OpSide == "" || CaseCode == "") {
						notifyUser("Required field(s) is/are missing");
						return false;
					}
					
					if(PatCode != confirmPatCode) {
						notifyUser("Confirmed Hospital No. unmatched");
						return false;
					}
					
					if(!checkDateFormat(DoB)) {
						notifyUser("Invalid date format: " + DoB);
						return false;
					}
					
					var compare_dob = new Date( DoB.replace( /(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3") );
					if(compare_dob.getTime() > new Date().getTime()) {
						notifyUser("Date of Birth cannot be a future date");
						return false;
					}
					
					if(!checkDateFormat(DateListed)) {
						notifyUser("Invalid date format: " + DateListed);
						return false;
					}
					
					var compare_datelisted = new Date( DateListed.replace( /(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3") );
					if(compare_datelisted.getTime() > new Date().getTime()) {
						notifyUser("Date Listed cannot be a future date");
						return false;
					}
					
					
					if(compare_dob.getTime() > compare_datelisted.getTime()) {
						console.log(compare_dob.getTime(),compare_datelisted.getTime());
						notifyUser("Date Listed cannot be earlier than DoB.");
						return false;
					}
					
					
					
					
					if(CaseCode == "") {
						notifyUser("CaseCode is missing");
						return false;
					}
				
					
			createPreOp(HospCode,PatCode,Sex,DoB,CaseCode,DateListed,OpSide,Stage,Sym_Deafness,Sym_Tinnitus,Sym_Dizziness,Sym_IntDischarge,Sym_PersDischarge,Sym_Earache,Sym_FacialPalsy
			,Sym_None,Aim_DryEar,Aim_improve,Aim_restore,Aim_water,Aim_pathology,Comments,Risk_diabetes,Risk_cleftpalate,Risk_downes,Risk_others,Risk_none,Smoking,CME,For_MA);
				
				
				return false;
			});

/// Review Case				
			$('#welcome-searchPatient').on('submit', function() {
				var patCode = $('#welcome-searchPatient #input-patientCode').val();
				$('#SearchCaseForm #input-patientCode').val(patCode);
				
				$('#SearchCaseForm').submit();
				$.mobile.navigate('#tab-Review');
				return ;
			});
	
			$('#SearchCaseForm').on('submit', function() {
					////console.log("SearchCaseForm submit, " + $('#SearchCaseForm #input-patientCode').val());
					var patCode = $('#SearchCaseForm #input-patientCode').val();
					var hospital_no = getURLParameter("hospital_no");
					searchCase(hospital_no, patCode);
			});

/// Operation
			
			$('#input-AudiogramNotPossible','#review-OperationForm').on('change',function() {
				////console.log('AudiogramNotPossible change = ' + $(this).prop('checked'));
				if($(this).prop('checked')) {
					$('#AudiogramInputsDiv','#review-OperationForm').hide() 
				} else {
					$('#AudiogramInputsDiv','#review-OperationForm').show();
				}
				
			});
			
			$('#review-OperationForm').on('submit', function() {
				var CaseCode = $('#input-CaseCode', '#review-OperationForm').val()
				 ,HospCode = getURLParameter('hospital_no')
				 ,OpDate = getValueWithCheckBlank($('#input-OpDate', '#review-OperationForm'))
				 ,SurgGrd = $('#input-SurgeonGrade', '#review-OperationForm').val()
				 ,Supervised = $('#input-Supervised', '#review-OperationForm').val()
				 ,Cholest_Attic = $('#input-Cholesteatoma-Attic', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Cholest_Sinus = $('#input-Cholesteatoma-Sinus', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Cholest_Other = $('#input-Cholesteatoma-Other', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Cholest_NA = $('#input-Cholesteatoma-NA', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Retraction_Post = $('#input-EardrumCollapse-Posterior', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Retraction_Attic = $('#input-EardrumCollapse-Flaccida', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Retraction_NonAerME = $('#input-EardrumCollapse-NonAeratedME', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Retraction_Other = $('#input-EardrumCollapse-Other', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Retraction_NA = $('#input-EardrumCollapse-NA', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,PerfSize = $('#input-PerforationSize', '#review-OperationForm').val()
				 ,PerfSite_Ant = $('#input-PerforationSite-Anterior', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,PerfSite_Post = $('#input-PerforationSite-Posterior', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,PerfSite_Inf = $('#input-PerforationSite-Inferior', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,PerfSite_Flaccida = $('#input-PerforationSite-Flaccida', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,PerfSite_Total = $('#input-PerforationSite-SubTotal', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,PerfSite_SubTotal = $('#input-PerforationSite-Total', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,PerfSite_NA = $('#input-PerforationSite-NA', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Ossic_Mobile = $('#input-OssicularChain-Mobile', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Ossic_Fixed  = $('#input-OssicularChain-Fixed', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Ossic_Eroded = $('#input-OssicularChain-Eroded', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Ossic_NotAssessed = $('#input-OssicularChain-NotAssessed', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Mucosa_Gran = $('#input-MEMucosa-Granulation', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Mucosa_Oedem = $('#input-MEMucosa-Oedematous', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Mucosa_Fibro = $('#input-MEMucosa-FibroAdhesive', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Mucosa_Tympano = $('#input-MEMucosa-TympanosclerosisInME', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Mucosa_Normal = $('#input-MEMucosa-Normal', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Discharge = $('#input-Discharge', '#review-OperationForm').val()
				 ,Proc_Myringo = $('#input-Procedure-Myringoplasty', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Proc_Ossiculo = $('#input-Procedure-Ossiculoplasty', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Proc_Attico = $('#input-Procedure-Atticotomy', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Proc_AtticoAntro = $('#input-Procedure-AtticoAntrostomy', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Proc_ModRad = $('#input-Procedure-ModRad', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Proc_Cortical = $('#input-Procedure-Cortical', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Proc_Combined = $('#input-Procedure-CombinedApproach', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Proc_Stapedo = $('#input-Procedure-Stapedotomy', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Proc_Tympano = $('#input-Procedure-Tympanotomy', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Proc_WBC = $('#input-Procedure-WideningBonyCanal', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Proc_Other = $('#input-Procedure-Other', '#review-OperationForm').prop('checked')? "Y" : "N"

				 ,ChordaTymp = $('#input-ChordaTympani', '#review-OperationForm').val() 
				 ,GraftMeth = $('#input-GraftMethod', '#review-OperationForm').val() 
				 ,GMat_Fasc = $('#input-GraftMaterial-Fascia', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,GMat_Perichond = $('#input-GraftMaterial-Perichondrium', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,GMat_PerichCart = $('#input-GraftMaterial-PericondCart', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,GMat_Cart = $('#input-GraftMaterial-Cartilage', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,GMat_PeriOst = $('#input-GraftMaterial-Periostium', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,GMat_Homograft = $('#input-GraftMaterial-Homograft', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,GMat_Fat = $('#input-GraftMaterial-Fat', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,GMat_Xeno = $('#input-GraftMaterial-Xenograft', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,GMat_Other = $('#input-GraftMaterial-Other', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,GMat_NA = $('#input-GraftMaterial-NA', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Comments = escape($('#input-Comments', '#review-OperationForm').val());
				  
				  //for Level2
				  var Anaesthetic = $('#input-Anaesthetic', '#review-OperationForm').val() 
				  
				 ,FacNerve = $('#input-FacialNerve', '#review-OperationForm').val()
				 ,Fistula_Canal = $('#input-Fistula-SemicircularCanal', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Fistula_Footplate  = $('#input-Fistula-Footplate', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Fistula_NotChecked = $('#input-Fistula-NotChecked', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Fistula_Nil = $('#input-Fistula-Nil', '#review-OperationForm').prop('checked')? "Y" : "N"
				  
				 ,Retract_Mobility = $('#input-MobilityOfCollapsedEardrum', '#review-OperationForm').val()
				  
				 ,OssEroded_Malleus = $('#input-OssiclesEroded-Malleus', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,OssEroded_Incus= $('#input-OssiclesEroded-Incus', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,OssEroded_StapesSupra= $('#input-OssiclesEroded-StapesSupra', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,OssEroded_Footplate= $('#input-OssiclesEroded-Footplate', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,OssEroded_NotChecked= $('#input-OssiclesEroded-NotChecked', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,OssEroded_Nil= $('#input-OssiclesEroded-Nil', '#review-OperationForm').prop('checked')? "Y" : "N"
				  
				 ,OssFixed_Footplate= $('#input-OssicularFixed-Footplate', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,OssFixed_MIJoint= $('#input-OssicularFixed-MIJoint', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,OssFixed_ISJoint= $('#input-OssicularFixed-ISJoint', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,OssFixed_Nil= $('#input-OssicularFixed-Nil', '#review-OperationForm').prop('checked')? "Y" : "N"
				  
				 ,Cholest_Antrum = $('#input-Cholesteatoma-Antrum', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Cholest_MastCells = $('#input-Cholesteatoma-MastoidCells', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Cholest_ME = $('#input-Cholesteatoma-ME', '#review-OperationForm').prop('checked')? "Y" : "N"
				 ,Cholest_UnderTM = $('#input-Cholesteatoma-UndersurfaceTM', '#review-OperationForm').prop('checked')? "Y" : "N"
				  
				 ,Retraction_Ant = $('#input-EardrumCollapse-Anterior', '#review-OperationForm').prop('checked')? "Y" : "N";
				  
				  
				  var audiogramNotPossible =$('#input-AudiogramNotPossible ', '#review-OperationForm').prop('checked') ? "Y" : "N";
				  
				  var MostRecentAud = ""
				 ,OpEar500BC        = ""
				 ,OpEar1000BC       = ""
				 ,OpEar2000BC       = ""
				 ,OpEar3000BC       = ""
				 ,OpEar4000BC       = ""
				 ,OpEar500AC        = ""
				 ,OpEar1000AC       = ""
				 ,OpEar2000AC       = ""
				 ,OpEar3000AC       = ""
				 ,OpEar4000AC       = ""
				 ,OpEar8000AC       = ""
				 ,NonOpEar500BC     = ""
				 ,NonOpEar1000BC    = ""
				 ,NonOpEar2000BC    = ""
				 ,NonOpEar3000BC    = ""
				 ,NonOpEar4000BC    = ""
				 ,NonOpEar500AC     = ""
				 ,NonOpEar1000AC    = ""
				 ,NonOpEar2000AC    = ""
				 ,NonOpEar3000AC    = ""
				 ,NonOpEar4000AC    = ""
				 ,NonOpEar8000AC    = "";
				  
				  if (audiogramNotPossible !="Y") {
					  MostRecentAud = getValueWithCheckBlank($('#input-DateOfMostRecentAudiogram'))
					 ,OpEar500BC  = $('#OpEarBC500', '#review-OperationForm').val()
					 ,OpEar1000BC = $('#OpEarBC1000', '#review-OperationForm').val()
					 ,OpEar2000BC = $('#OpEarBC2000', '#review-OperationForm').val()
					 ,OpEar3000BC = $('#OpEarBC3000', '#review-OperationForm').val()
					 ,OpEar4000BC = $('#OpEarBC4000', '#review-OperationForm').val()

					 ,OpEar500AC  = $('#OpEarAC500', '#review-OperationForm').val()
					 ,OpEar1000AC = $('#OpEarAC1000', '#review-OperationForm').val()
					 ,OpEar2000AC = $('#OpEarAC2000', '#review-OperationForm').val()
					 ,OpEar3000AC = $('#OpEarAC3000', '#review-OperationForm').val() 
					 ,OpEar4000AC = $('#OpEarAC4000', '#review-OperationForm').val()
					 ,OpEar8000AC = $('#OpEarAC8000', '#review-OperationForm').val()

					 ,NonOpEar500BC   = $('#NonOpEarBC500', '#review-OperationForm').val()
					 ,NonOpEar1000BC  = $('#NonOpEarBC1000', '#review-OperationForm').val()
					 ,NonOpEar2000BC  = $('#NonOpEarBC2000', '#review-OperationForm').val()
					 ,NonOpEar3000BC  = $('#NonOpEarBC3000', '#review-OperationForm').val()
					 ,NonOpEar4000BC  = $('#NonOpEarBC4000', '#review-OperationForm').val()

					 ,NonOpEar500AC   = $('#NonOpEarAC500', '#review-OperationForm').val()
					 ,NonOpEar1000AC  = $('#NonOpEarAC1000', '#review-OperationForm').val()
					 ,NonOpEar2000AC  = $('#NonOpEarAC2000', '#review-OperationForm').val()
					 ,NonOpEar3000AC  = $('#NonOpEarAC3000', '#review-OperationForm').val() 
					 ,NonOpEar4000AC  = $('#NonOpEarAC4000', '#review-OperationForm').val()
					 ,NonOpEar8000AC  = $('#NonOpEarAC8000', '#review-OperationForm').val();
				}
				    //////console.log('CaseCode = ' + CaseCode);   
									  
					////console.log('HospCode = ' + HospCode);
					////console.log('OpDate = ' +              OpDate);
					////console.log('SurgGrd = ' +             SurgGrd);
					////console.log('Supervised = ' +          Supervised);
					////console.log('Cholest_Attic = ' +       Cholest_Attic);
					////console.log('Cholest_Sinus = ' +       Cholest_Sinus);
					////console.log('Cholest_Other = ' +       Cholest_Other);
					////console.log('Cholest_NA = ' +          Cholest_NA);
					////console.log('Retraction_Post = ' +     Retraction_Post);
					////console.log('Retraction_Attic = ' +    Retraction_Attic);
					////console.log('Retraction_NonAerME = ' + Retraction_NonAerME);
					////console.log('Retraction_Other = ' +    Retraction_Other);
					////console.log('Retraction_NA = ' +       Retraction_NA);
					////console.log('PerfSize = ' +            PerfSize);
					////console.log('PerfSite_Ant = ' +        PerfSite_Ant);
					////console.log('PerfSite_Post = ' +       PerfSite_Post);
					////console.log('PerfSite_Inf = ' +        PerfSite_Inf);
					////console.log('PerfSite_Flaccida = ' +   PerfSite_Flaccida);
					////console.log('PerfSite_Total = ' +      PerfSite_Total);
					////console.log('PerfSite_SubTotal = ' +   PerfSite_SubTotal);
					////console.log('PerfSite_NA = ' +         PerfSite_NA);
					////console.log('Ossic_Mobile = ' +        Ossic_Mobile);
					////console.log('Ossic_Fixed = ' +         Ossic_Fixed);
					////console.log('Ossic_Eroded = ' +        Ossic_Eroded);
					////console.log('Ossic_NotAssessed = ' +   Ossic_NotAssessed);
					////console.log('Mucosa_Gran = ' +         Mucosa_Gran);
					////console.log('Mucosa_Oedem = ' +        Mucosa_Oedem);
					////console.log('Mucosa_Fibro = ' +        Mucosa_Fibro);
					////console.log('Mucosa_Tympano = ' +      Mucosa_Tympano);
					////console.log('Mucosa_Normal = ' +       Mucosa_Normal);
					////console.log('Discharge = ' +           Discharge);
					////console.log('Proc_Myringo = ' +        Proc_Myringo);
					////console.log('Proc_Ossiculo = ' +       Proc_Ossiculo);
					////console.log('Proc_Attico = ' +         Proc_Attico);
					////console.log('Proc_AtticoAntro = ' +    Proc_AtticoAntro);
					////console.log('Proc_ModRad = ' +         Proc_ModRad);
					////console.log('Proc_Cortical = ' +       Proc_Cortical);
					////console.log('Proc_Combined = ' +       Proc_Combined);
					////console.log('Proc_Stapedo = ' +        Proc_Stapedo);
					////console.log('Proc_Tympano = ' +        Proc_Tympano);
					////console.log('Proc_WBC = ' +            Proc_WBC);
					////console.log('Proc_Other = ' +          Proc_Other);
					//////console.log('PreInterval = ' +         PreInterval);
					////console.log('MostRecentAud = ' +       MostRecentAud);
					////console.log('OpEar500BC = ' +          OpEar500BC);
					////console.log('OpEar1000BC = ' +         OpEar1000BC);
					////console.log('OpEar2000BC = ' +         OpEar2000BC);
					////console.log('OpEar3000BC = ' +         OpEar3000BC);
					////console.log('OpEar4000BC = ' +         OpEar4000BC);
					//////console.log('OpEarBC_Mean = ' +        OpEarBC_Mean);
					////console.log('OpEar500AC = ' +          OpEar500AC);
					////console.log('OpEar1000AC = ' +         OpEar1000AC);
					////console.log('OpEar2000AC = ' +         OpEar2000AC);
					////console.log('OpEar3000AC = ' +         OpEar3000AC);
					////console.log('OpEar4000AC = ' +         OpEar4000AC);
					////console.log('OpEar8000AC = ' +         OpEar8000AC);
					//////console.log('OpEarAC_Mean = ' +        OpEarAC_Mean);
					//////console.log('OpEar_AirBoneGap = ' +    OpEar_AirBoneGap);
					////console.log('NonOpEar500BC = ' +       NonOpEar500BC);
					////console.log('NonOpEar1000BC = ' +      NonOpEar1000BC);
					////console.log('NonOpEar2000BC = ' +      NonOpEar2000BC);
					////console.log('NonOpEar3000BC = ' +      NonOpEar3000BC);
					////console.log('NonOpEar4000BC = ' +      NonOpEar4000BC);
					//////console.log('NonOpEarBC_Mean = ' +     NonOpEarBC_Mean);
					////console.log('NonOpEar500AC = ' +       NonOpEar500AC);
					////console.log('NonOpEar1000AC = ' +      NonOpEar1000AC);
					////console.log('NonOpEar2000AC = ' +      NonOpEar2000AC);
					////console.log('NonOpEar3000AC = ' +      NonOpEar3000AC);
					////console.log('NonOpEar4000AC = ' +      NonOpEar4000AC);
					////console.log('NonOpEar8000AC = ' +      NonOpEar8000AC);
					//////console.log('NonOpEarAC_Mean = ' +     NonOpEarAC_Mean);
					//////console.log('NonOpEar_AirBoneGap = ' + NonOpEar_AirBoneGap);
					////console.log('ChordaTymp = ' +          ChordaTymp);
					////console.log('GraftMeth = ' +           GraftMeth);
					////console.log('GMat_Fasc = ' +           GMat_Fasc);
					////console.log('GMat_Perichond = ' +      GMat_Perichond);
					////console.log('GMat_PerichCart = ' +     GMat_PerichCart);
					////console.log('GMat_Cart = ' +           GMat_Cart);
					////console.log('GMat_PeriOst = ' +        GMat_PeriOst);
					////console.log('GMat_Homograft = ' +      GMat_Homograft);
					////console.log('GMat_Fat = ' +            GMat_Fat);
					////console.log('GMat_Xeno = ' +           GMat_Xeno);
					////console.log('GMat_Other = ' +          GMat_Other);
					////console.log('GMat_NA = ' +             GMat_NA);
					////console.log('Comments = ' +            Comments);
					
					////console.log('Anaesthetic = ' +           Anaesthetic);
					////console.log('FacNerve = ' +              FacNerve);
					////console.log('Fistula_Canal= ' +          Fistula_Canal);
					////console.log('Fistula_Footplate  = ' +    Fistula_Footplate);
					////console.log('Fistula_NotChecked = ' +    Fistula_NotChecked);
					////console.log('Fistula_Nil= ' +            Fistula_Nil);
					////console.log('Retract_Mobility= ' +       Retract_Mobility);
					////console.log('OssEroded_Malleus= ' +      OssEroded_Malleus);
					////console.log('OssEroded_Incus= ' +        OssEroded_Incus);
					////console.log('OssEroded_StapesSupra= ' +  OssEroded_StapesSupra);
					////console.log('OssEroded_Footplate= ' +    OssEroded_Footplate);
					////console.log('OssEroded_NotChecked= ' +   OssEroded_NotChecked);
					////console.log('OssEroded_Nil= ' +          OssEroded_Nil);
					////console.log('OssFixed_Footplate= ' +     OssFixed_Footplate);
					////console.log('OssFixed_MIJoint= ' +       OssFixed_MIJoint);
					////console.log('OssFixed_ISJoint= ' +       OssFixed_ISJoint);
					////console.log('OssFixed_Nil= ' +           OssFixed_Nil);
					////console.log('Cholest_Antrum = ' +        Cholest_Antrum );
					////console.log('Cholest_MastCells = ' +     Cholest_MastCells );
					////console.log('Cholest_ME = ' +            Cholest_ME );
					////console.log('Cholest_UnderTM = ' +       Cholest_UnderTM );
					////console.log('Retraction_Ant = ' +        Retraction_Ant);
					
					////console.log('audiogramNotPossible = ' + audiogramNotPossible);
				
				if(OpDate == '') {
					notifyUser("Required field(s) is/are missing");
					return false;
				}
				
				if(!checkDateFormat(OpDate)) {
						notifyUser("Invalid date format: " + OpDate);
						return false;
				}
					
				var compare = new Date( OpDate.replace( /(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3") );
				if(compare.getTime() > new Date().getTime()) {
					notifyUser("Op Date cannot be a future date");
					return false;
				}
				
				if(audiogramNotPossible != 'Y') {
				
					if(MostRecentAud == '') {
						notifyUser("Required field(s) is/are missing");
						return false;
					}
				
					if(!checkDateFormat(MostRecentAud)) {
						notifyUser("Invalid date format: " + MostRecentAud);
						return false;
					}
				
				 if(OpEar500BC     == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(OpEar1000BC    == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(OpEar2000BC    == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(OpEar3000BC    == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(OpEar4000BC    == "") { notifyUser("Audiogram Data is missing"); return false; }
                                            
				 if(OpEar500AC     == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(OpEar1000AC    == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(OpEar2000AC    == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(OpEar3000AC    == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(OpEar4000AC    == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(OpEar8000AC    == "") { notifyUser("Audiogram Data is missing"); return false; }
                                            
				 if(NonOpEar500BC  == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(NonOpEar1000BC == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(NonOpEar2000BC == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(NonOpEar3000BC == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(NonOpEar4000BC == "") { notifyUser("Audiogram Data is missing"); return false; }
                                            
				 if(NonOpEar500AC  == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(NonOpEar1000AC == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(NonOpEar2000AC == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(NonOpEar3000AC == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(NonOpEar4000AC == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(NonOpEar8000AC == "") { notifyUser("Audiogram Data is missing"); return false; }
				}
							  
				 createOperation(CaseCode,HospCode,OpDate,SurgGrd,Supervised,Cholest_Attic,Cholest_Sinus,Cholest_Other
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
					,GMat_Homograft,GMat_Fat,GMat_Xeno,GMat_Other,GMat_NA,Comments, audiogramNotPossible
					,Anaesthetic, FacNerve, Fistula_Canal, Fistula_Footplate, Fistula_NotChecked, Fistula_Nil, Retract_Mobility, 
					OssEroded_Malleus, OssEroded_Incus, OssEroded_StapesSupra, OssEroded_Footplate, OssEroded_NotChecked, OssEroded_Nil, 
					OssFixed_Footplate, OssFixed_MIJoint, OssFixed_ISJoint, OssFixed_Nil, Cholest_Antrum, Cholest_MastCells, Cholest_ME, 
					Cholest_UnderTM, Retraction_Ant);
			});


/// Follow-up
		$('#input-AudiogramNotPossible','#review-FollowupForm').on('change',function() {
			////console.log('AudiogramNotPossible change = ' + $(this).prop('checked'));
			if($(this).prop('checked')) {
				$('#AudiogramInputsDiv','#review-FollowupForm').hide() 
			} else {
				$('#AudiogramInputsDiv','#review-FollowupForm').show();
			}
			
		});
			
			
		$('#review-FollowupForm').on('submit', function() {
				var CaseCode = $('#input-CaseCode', '#review-FollowupForm').val()
				,HospCode = getURLParameter('hospital_no')
				,AssInterval = $('#input-FollowupPeriod', '#review-FollowupForm').val()
				,AssDate = getValueWithCheckBlank($('#input-AssessmentDate'))
				,Discharge = $('#input-Discharge', '#review-FollowupForm').val()
				,Complics_Palsy = $('#input-Complications-FacialPalsy', '#review-FollowupForm').prop('checked')? "Y" : "N"
				,Complics_Tinnitus = $('#input-Complications-Tinnitus', '#review-FollowupForm').prop('checked')? "Y" : "N"
				,Complics_Vertigo = $('#input-Complications-Vertigo', '#review-FollowupForm').prop('checked')? "Y" : "N"
				,Complics_Hearing = $('#input-Complications-HearingLoss', '#review-FollowupForm').prop('checked')? "Y" : "N"
				,Complics_WInfection = $('#input-Complications-WoundInfection', '#review-FollowupForm').prop('checked')? "Y" : "N"
				,Complics_Taste = $('#input-Complications-AlterationOfTaste', '#review-FollowupForm').prop('checked')? "Y" : "N"
				,Complics_Other = $('#input-Complications-Other', '#review-FollowupForm').prop('checked')? "Y" : "N"
				,Complics_None = $('#input-Complications-None', '#review-FollowupForm').prop('checked')? "Y" : "N"
				//,Tymp_Mem =
				,Cholest_Recur = $('#input-Cholesteatoma-Recurrence', '#review-FollowupForm').prop('checked')? "Y" : "N"
				,Cholest_Resid = $('#input-Cholesteatoma-Residual', '#review-FollowupForm').prop('checked')? "Y" : "N"
				//,Cholest_Nil = 
				,Cholest_NA = $('#input-Cholesteatoma-NA', '#review-FollowupForm').prop('checked')? "Y" : "N"
				,OpEar500BC = $('#OpEarBC500', '#review-FollowupForm').val()
				,OpEar1000BC = $('#OpEarBC1000', '#review-FollowupForm').val()
				,OpEar2000BC = $('#OpEarBC2000', '#review-FollowupForm').val()
				,OpEar3000BC = $('#OpEarBC3000', '#review-FollowupForm').val()
				,OpEar4000BC = $('#OpEarBC4000', '#review-FollowupForm').val()
				//,OpEarBC_Mean = 
				,OpEar500AC = $('#OpEarAC500', '#review-FollowupForm').val()
				,OpEar1000AC = $('#OpEarAC1000', '#review-FollowupForm').val()
				,OpEar2000AC = $('#OpEarAC2000', '#review-FollowupForm').val()
				,OpEar3000AC = $('#OpEarAC3000', '#review-FollowupForm').val()
				,OpEar4000AC = $('#OpEarAC4000', '#review-FollowupForm').val()
				,OpEar8000AC = $('#OpEarAC8000', '#review-FollowupForm').val()
				//,OpEarAC_Mean = 
				//,OpEar_AirBoneGap =
				,OA_Intact = $('#input-OtoscopicAppearance-Intact', '#review-FollowupForm').prop('checked')? "Y" : "N"
				,OA_NotIntact = $('#input-OtoscopicAppearance-NotIntact', '#review-FollowupForm').prop('checked')? "Y" : "N"
				,OA_Myringitis = $('#input-OtoscopicAppearance-Myringitis', '#review-FollowupForm').prop('checked')? "Y" : "N"
				,OA_AntBlunt = $('#input-OtoscopicAppearance-AnteriorBlunting', '#review-FollowupForm').prop('checked')? "Y" : "N"
				,OA_Atelectasis = $('#input-OtoscopicAppearance-Atelectasis', '#review-FollowupForm').prop('checked')? "Y" : "N"
				,OA_Retraction = $('#input-OtoscopicAppearance-RetractionPocket', '#review-FollowupForm').prop('checked')? "Y" : "N"
				,OA_Lateralization = $('#input-OtoscopicAppearance-Lateralization', '#review-FollowupForm').prop('checked')? "Y" : "N"
				,OA_MeatalStenosis = $('#input-OtoscopicAppearance-MeatalStenosis', '#review-FollowupForm').prop('checked')? "Y" : "N"
				,OA_CompleteCollapse = $('#input-OtoscopicAppearance-Completecollapse', '#review-FollowupForm').prop('checked')? "Y" : "N"
				,OA_OME = $('#input-OtoscopicAppearance-OME', '#review-FollowupForm').prop('checked')? "Y" : "N"
				,OA_NotAssessed = $('#input-OtoscopicAppearance-NotAssessed', '#review-FollowupForm').prop('checked')? "Y" : "N"
				,OA_Normal = $('#input-OtoscopicAppearance-Normal', '#review-FollowupForm').prop('checked')? "Y" : "N"
				,Comments = escape($('#input-Comments', '#review-FollowupForm').val());
				
				//level2
				var Ossic_Pros =  $('#input-OssicularProsthesis', '#review-FollowupForm').val(),
				Cholest_None = $('#input-Cholesteatoma-None', '#review-FollowupForm').prop('checked')? "Y" : "N"
				
				////console.log('CaseCode = ' + CaseCode);
				////console.log('HospCode = ' + HospCode);
				////console.log('AssInterval = ' + AssInterval);
				////console.log('AssDate = ' + AssDate);
				////console.log('Discharge = ' + Discharge);
				////console.log('Complics_Palsy = ' + Complics_Palsy);
				////console.log('Complics_Tinnitus = ' + Complics_Tinnitus);
				////console.log('Complics_Vertigo = ' + Complics_Vertigo);
				////console.log('Complics_Hearing = ' + Complics_Hearing);
				////console.log('Complics_WInfection = ' + Complics_WInfection);
				////console.log('Complics_Taste = ' + Complics_Taste);
				////console.log('Complics_Other = ' + Complics_Other);
				////console.log('Complics_None = ' + Complics_None);
				////console.log('Cholest_Recur = ' + Cholest_Recur);
				////console.log('Cholest_Resid = ' + Cholest_Resid);
				////console.log('Cholest_NA = ' + Cholest_NA);
				////console.log('OpEar500BC = ' + OpEar500BC);
				////console.log('OpEar1000BC = ' + OpEar1000BC);
				////console.log('OpEar2000BC = ' + OpEar2000BC);
				////console.log('OpEar3000BC = ' + OpEar3000BC);
				////console.log('OpEar4000BC = ' + OpEar4000BC);
				////console.log('OpEar500AC = ' + OpEar500AC);
				////console.log('OpEar1000AC = ' + OpEar1000AC);
				////console.log('OpEar2000AC = ' + OpEar2000AC);
				////console.log('OpEar3000AC = ' + OpEar3000AC);
				////console.log('OpEar4000AC = ' + OpEar4000AC);
				////console.log('OpEar8000AC = ' + OpEar8000AC);
				////console.log('OA_Intact = ' + OA_Intact);
				////console.log('OA_NotIntact = ' + OA_NotIntact);
				////console.log('OA_Myringitis = ' + OA_Myringitis);
				////console.log('OA_AntBlunt = ' + OA_AntBlunt);
				////console.log('OA_Atelectasis = ' + OA_Atelectasis);
				////console.log('OA_Retraction = ' + OA_Retraction);
				////console.log('OA_Lateralization = ' + OA_Lateralization);
				////console.log('OA_MeatalStenosis = ' + OA_MeatalStenosis);
				////console.log('OA_CompleteCollapse = ' + OA_CompleteCollapse);
				////console.log('OA_OME = ' + OA_OME);
				////console.log('OA_NotAssessed = ' + OA_NotAssessed);
				////console.log('OA_Normal = ' + OA_Normal);
				////console.log('Comments = ' + Comments);
				
				////console.log('Ossic_Pros = ' + Ossic_Pros);
				////console.log('Cholest_None = ' + Cholest_None);
				
				var audiogramNotPossible =$('#input-AudiogramNotPossible ', '#review-FollowupForm').prop('checked') ? "Y" : "N";
				if(AssDate == "") { notifyUser("Required field(s) is/are missing"); return false; }
				
				if(!checkDateFormat(AssDate)) {
					notifyUser("Invalid date format: " + AssDate);
					return false;
				}
				
				var compare1 = new Date( AssDate.replace( /(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3") );
				var OpDate = $('#input-OpDate', '#review-FollowupForm').val();
				var compare2 = new Date( OpDate.replace( /(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3") );
				if(compare2.getTime() > compare1.getTime()) {
					notifyUser("Assessment Date cannot be later than Op Date: " + OpDate);
					return false;
				}	

				if(compare1.getTime() > new Date().getTime()) {
					notifyUser("Assessment Date cannot be a future date");
					return false;
				}	
				
				if(audiogramNotPossible != 'Y') {
				
				 if(OpEar500BC     == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(OpEar1000BC    == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(OpEar2000BC    == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(OpEar3000BC    == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(OpEar4000BC    == "") { notifyUser("Audiogram Data is missing"); return false; }
                                            
				 if(OpEar500AC     == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(OpEar1000AC    == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(OpEar2000AC    == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(OpEar3000AC    == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(OpEar4000AC    == "") { notifyUser("Audiogram Data is missing"); return false; }
				 if(OpEar8000AC    == "") { notifyUser("Audiogram Data is missing"); return false; }
				}
				
				 
				 


			createPostOp(CaseCode, HospCode, AssInterval, AssDate, Discharge, Complics_Palsy, Complics_Tinnitus, Complics_Vertigo, Complics_Hearing, Complics_WInfection, Complics_Taste, Complics_Other, Complics_None, Cholest_Recur, Cholest_Resid, Cholest_NA, OpEar500BC, OpEar1000BC, OpEar2000BC, OpEar3000BC, OpEar4000BC, OpEar500AC, OpEar1000AC, OpEar2000AC, OpEar3000AC, OpEar4000AC, OpEar8000AC, OA_Intact, OA_NotIntact, OA_Myringitis, OA_AntBlunt, OA_Atelectasis, OA_Retraction, OA_Lateralization, OA_MeatalStenosis, OA_CompleteCollapse, OA_OME, OA_NotAssessed, OA_Normal, Comments, Ossic_Pros, Cholest_None, audiogramNotPossible);
		});		


		$('#input-FollowupPeriod', '#review-FollowupForm').on('change',function() {
			var CaseCode = getURLParameter('CaseCode')
			,HospCode = getURLParameter('hospital_no');
			
			setupPostOp(CaseCode, HospCode);
		});	
		
		
/// Procedure
		
		$('#review-OpProcedureForm').on('submit', function(e) {
				////console.log('review-OpProcedureForm submit');
				
				var CaseCode = $('#input-CaseCode','#review-OpProcedureForm').val() 
				,HospCode = getURLParameter('hospital_no')
				,Nature = $('#input-Nature','#review-OpProcedureForm').val()
				,Approach = $('#input-Approach','#review-OpProcedureForm').val()
				,MatME_GelFilm = $('#input-MaterialInME-GelFilm', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,MatME_GelFoam = $('#input-MaterialInME-GelFoam', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,MatME_Cartilage = $('#input-MaterialInME-Cartilage', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,MatME_Silastic = $('#input-MaterialInME-Silastic', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,MatME_Nil = $('#input-MaterialInME-Nil', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,Meato_Bony =$('#input-Meatoplasty-Bony', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,Meato_Cartilaginous = $('#input-Meatoplasty-Cartilaginous', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,Meato_Nil = $('#input-Meatoplasty-Nil', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,Myringo_Mat =$('#input-MyringoplastyMaterial','#review-OpProcedureForm').val()
				,GraftMeth = $('#input-GraftMethod','#review-OpProcedureForm').val()
				,OssicDefect_Malleus =$('#input-Defect-Malleus', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,OssicDefect_Incus = $('#input-Defect-Incus', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,OssicDefect_StapesSupra = $('#input-Defect-StapesSupra', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,OssicDefect_Footplate = $('#input-Defect-Footplate', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,OssicDefect_Nil = $('#input-Defect-Nil', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,Ossic_Mat = $('#input-Material','#review-OpProcedureForm').val()
				,Ossic_Pros = $('#input-Prosthesis','#review-OpProcedureForm').val()
				,Ossic_Recon = $('#input-Reconstruction','#review-OpProcedureForm').val()
				,Mastoidectomy = $('#input-Mastoidectomy','#review-OpProcedureForm').val()
				,OblitFlap_Palva = $('#input-OblitFlap-Palva', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,OblitFlap_Muscle = $('#input-OblitFlap-Muscle', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,OblitFlap_Fascial = $('#input-OblitFlap-FascialPeriosteal', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,OblitFlap_MidTemporal = $('#input-OblitFlap-MidTemporal', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,OblitFlap_TempParietal = $('#input-OblitFlap-TemporoParietalFascial', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,OblitFlap_NA = $('#input-OblitFlap-NA', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,OblitMat_Bioglass = $('#input-OblitMaterial-Bioglass', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,OblitMat_BonePaste = $('#input-OblitMaterial-BonePaste', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,OblitMat_BoneChips = $('#input-OblitMaterial-BoneChips', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,OblitMat_Cartilage = $('#input-OblitMaterial-CartilageSlices', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,OblitMat_HAGranules = $('#input-OblitMaterial-HAGranules', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,OblitMat_SerenoCem = $('#input-OblitMaterial-SerenoCem', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,OblitMat_FatBlind = $('#input-OblitMaterial-FatAndBlindPit', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,OblitMat_NA = $('#input-OblitMaterial-NA', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,CW_Recon = $('#input-CanalWallReconstruction','#review-OpProcedureForm').val() 
				,Stapes_Op = $('#input-Operation','#review-OpProcedureForm').val() 
				,Stapes_Chorda = $('#input-ChordaTympani','#review-OpProcedureForm').val() 
				,Stapes_Fensize = $('#input-FenestrationSize','#review-OpProcedureForm').val() 
				,Stapes_ProsType = $('#input-ProthesisType','#review-OpProcedureForm').val() 
				,Stapes_ProsSize = $('#input-ProsthesisSize','#review-OpProcedureForm').val() 
				,Stapes_Attach = $('#input-Attachment','#review-OpProcedureForm').val() 
				,Stapes_IntTissue = $('#input-InterpositionTissue','#review-OpProcedureForm').val() 
				,Fen_Pick = $('#input-FenestrationMethod-Pick', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,Fen_Drill = $('#input-FenestrationMethod-Drill', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,Fen_Laser = $('#input-FenestrationMethod-Laser', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,Fen_NA = $('#input-FenestrationMethod-NA', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,Laser = $('#input-LaserType','#review-OpProcedureForm').val() 
				,WinSeal_Fat = $('#input-OvalWindowSeal-Fat', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,WinSeal_BloodClot = $('#input-OvalWindowSeal-BloodClot', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,WinSeal_Other =$('#input-OvalWindowSeal-OtherConnectiveTissue', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,WinSeal_GelFoam =$('#input-OvalWindowSeal-GelFoam', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,WinSeal_Nil =$('#input-OvalWindowSeal-Nil', '#review-OpProcedureForm').prop('checked')? "Y" : "N"
				,Comments = escape($('#input-Comments','#review-OpProcedureForm').val())
				,OtoEndosopicMethod = $('#input-OtoEndosopicMethod','#review-OpProcedureForm').val() 
				,OtoEndosopicSize = $('#input-OtoEndosopicSize','#review-OpProcedureForm').val() 
				,OtoEndosopicLength = $('#input-OtoEndosopicLength','#review-OpProcedureForm').val() 
				,OtoEndosopicAngle = $('#input-OtoEndosopicAngle','#review-OpProcedureForm').val() ;

					
				//console.log('CaseCode = ' + CaseCode);
				//console.log('HospCode = ' + HospCode);
				//console.log('Nature = ' + Nature);
				//console.log('Approach = ' + Approach);
				//console.log('MatME_GelFilm = ' + MatME_GelFilm);
				//console.log('MatME_GelFoam = ' + MatME_GelFoam);
				//console.log('MatME_Cartilage = ' + MatME_Cartilage);
				//console.log('MatME_Silastic = ' + MatME_Silastic);
				//console.log('MatME_Nil = ' + MatME_Nil);
				//console.log('Meato_Bony = ' + Meato_Bony);
				//console.log('Meato_Cartilaginous = ' + Meato_Cartilaginous);
				//console.log('Meato_Nil = ' + Meato_Nil);
				//console.log('Myringo_Mat = ' + Myringo_Mat);
				//console.log('GraftMeth = ' + GraftMeth);
				//console.log('OssicDefect_Malleus = ' + OssicDefect_Malleus);
				//console.log('OssicDefect_Incus = ' + OssicDefect_Incus);
				//console.log('OssicDefect_StapesSupra = ' + OssicDefect_StapesSupra);
				//console.log('OssicDefect_Footplate = ' + OssicDefect_Footplate);
				//console.log('OssicDefect_Nil = ' + OssicDefect_Nil);
				//console.log('Ossic_Mat = ' + Ossic_Mat);
				//console.log('Ossic_Pros = ' + Ossic_Pros);
				//console.log('Ossic_Recon = ' + Ossic_Recon);
				//console.log('Mastoidectomy = ' + Mastoidectomy);
				//console.log('OblitFlap_Palva = ' + OblitFlap_Palva);
				//console.log('OblitFlap_Muscle = ' + OblitFlap_Muscle);
				//console.log('OblitFlap_Fascial = ' + OblitFlap_Fascial);
				//console.log('OblitFlap_MidTemporal = ' + OblitFlap_MidTemporal);
				//console.log('OblitFlap_TempParietal = ' + OblitFlap_TempParietal);
				//console.log('OblitFlap_NA = ' + OblitFlap_NA);
				//console.log('OblitMat_Bioglass = ' + OblitMat_Bioglass);
				//console.log('OblitMat_BonePaste = ' + OblitMat_BonePaste);
				//console.log('OblitMat_BoneChips = ' + OblitMat_BoneChips);
				//console.log('OblitMat_Cartilage = ' + OblitMat_Cartilage);
				//console.log('OblitMat_HAGranules = ' + OblitMat_HAGranules);
				//console.log('OblitMat_SerenoCem = ' + OblitMat_SerenoCem);
				//console.log('OblitMat_FatBlind = ' + OblitMat_FatBlind);
				//console.log('OblitMat_NA = ' + OblitMat_NA);
				//console.log('CW_Recon = ' + CW_Recon);
				//console.log('Stapes_Op = ' + Stapes_Op);
				//console.log('Stapes_Chorda = ' + Stapes_Chorda);
				//console.log('Stapes_Fensize = ' + Stapes_Fensize);
				//console.log('Stapes_ProsType = ' + Stapes_ProsType);
				//console.log('Stapes_ProsSize = ' + Stapes_ProsSize);
				//console.log('Stapes_Attach = ' + Stapes_Attach);
				//console.log('Stapes_IntTissue = ' + Stapes_IntTissue);
				//console.log('Fen_Pick = ' + Fen_Pick);
				//console.log('Fen_Drill = ' + Fen_Drill);
				//console.log('Fen_Laser = ' + Fen_Laser);
				//console.log('Fen_NA = ' + Fen_NA);
				//console.log('Laser = ' + Laser);
				//console.log('WinSeal_Fat = ' + WinSeal_Fat);
				//console.log('WinSeal_BloodClot = ' + WinSeal_BloodClot);
				//console.log('WinSeal_Other = ' + WinSeal_Other);
				//console.log('WinSeal_GelFoam = ' + WinSeal_GelFoam);
				//console.log('WinSeal_Nil = ' + WinSeal_Nil);
				//console.log('Comments = ' + Comments);
				//console.log('OtoEndosopicMethod = ' + OtoEndosopicMethod);
				//console.log('OtoEndosopicSize = ' + OtoEndosopicSize);
				//console.log('OtoEndosopicLength = ' + OtoEndosopicLength);
				//console.log('OtoEndosopicAngle = ' + OtoEndosopicAngle);


				createProcedure(CaseCode, HospCode, Nature, Approach, MatME_GelFilm, MatME_GelFoam, MatME_Cartilage, MatME_Silastic, MatME_Nil, Meato_Bony, Meato_Cartilaginous, Meato_Nil, Myringo_Mat, GraftMeth, OssicDefect_Malleus, OssicDefect_Incus, OssicDefect_StapesSupra, OssicDefect_Footplate, OssicDefect_Nil, Ossic_Mat, Ossic_Pros, Ossic_Recon, Mastoidectomy, OblitFlap_Palva, OblitFlap_Muscle, OblitFlap_Fascial, OblitFlap_MidTemporal, OblitFlap_TempParietal, OblitFlap_NA, OblitMat_BonePaste, OblitMat_BoneChips, OblitMat_Cartilage, OblitMat_HAGranules, OblitMat_SerenoCem, OblitMat_FatBlind, OblitMat_NA, CW_Recon, Stapes_Op, Stapes_Chorda, Stapes_Fensize, Stapes_ProsType, Stapes_ProsSize, Stapes_Attach, Stapes_IntTissue, Fen_Pick, Fen_Drill, Fen_Laser, Fen_NA, Laser, WinSeal_Fat, WinSeal_BloodClot, WinSeal_Other, WinSeal_GelFoam, WinSeal_Nil, Comments, OblitMat_Bioglass, OtoEndosopicMethod, OtoEndosopicSize, OtoEndosopicLength, OtoEndosopicAngle);
				
				return false;
			});
		
		$('#Loading', 'body').hide();
		$('#loggedInPage', 'body').show();
	}

