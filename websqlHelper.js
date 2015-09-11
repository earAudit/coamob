/// WebSQL helper
var myWebSQL = {};
myWebSQL.webdb = {};
myWebSQL.webdb.db = null;


myWebSQL.webdb.onError = function(tx, e) {
	//console.error("[webdb]: There has been an error: " + e.message, tx);
};

myWebSQL.webdb.onSuccess = function(tx, r) {
	// re-render the data.
	//myWebSQL.webdb.getAllTodoItems(loadTodoItems);
	//console.debug("success", tx, r);
};

myWebSQL.webdb.open = function() {

  if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
	var my_dm=new datamanager('userinfo');

	var mykey= my_dm.getData('pin')
	if(mykey)
		myWebSQL.webdb.db = window.sqlitePlugin.openDatabase({name: "offline_db", key: mykey.value});
	else
		myWebSQL.webdb.db = window.sqlitePlugin.openDatabase({name: "offline_db", key: 'pin'});
 }
 else
 {
	var dbSize = 10 * 1024 * 1024;
	// 50MB
	myWebSQL.webdb.db = openDatabase('dbo', '1.0', 'COA offline database', dbSize);

 }

};



myWebSQL.webdb.executeSql = function(cmd, param, successHandle, errorHandle) {

		if (!successHandle) {
			successHandle = myWebSQL.webdb.onSuccess;
		}
		if (!errorHandle) {
			errorHandle = myWebSQL.webdb.onError;
		}
		var db = myWebSQL.webdb.db;
		db.transaction(function(tx) {
				//console.log(cmd);
				tx.executeSql(cmd, param, successHandle, errorHandle);
			}
		);
};

myWebSQL.webdb.createTable = function(table, columns, successHandle, errorHandle) {

	/*if(typeof(table) != 'string' || table == '' || typeof(columns) != 'string' || columns == '') {
	 return myWebSQL.webdb.onError;
	 }*/

	if (!successHandle) {
		successHandle = myWebSQL.webdb.onSuccess;
	}
	if (!errorHandle) {
		errorHandle = myWebSQL.webdb.onError;
	}

	var db = myWebSQL.webdb.db;
	db.transaction(function(tx) {
		cmd = 'DROP TABLE IF EXISTS ' + table;
		tx.executeSql(cmd, [], successHandle, errorHandle);
		cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
		tx.executeSql(cmd, [], successHandle, errorHandle);
	});
};

myWebSQL.webdb.insert = function(table, keys, values, successHandle, errorHandle) {
	/*if(typeof(table) != 'string' || table == '' || typeof(keys) != 'string' || keys == '' || typeof(values) != 'string' || values == '') {

	 }*/

	var db = myWebSQL.webdb.db;
	cmd = 'INSERT INTO ' + table + ' (' + keys + ') VALUES (' + values + ')';
	myWebSQL.webdb.executeSql(cmd, [], successHandle, errorHandle);

};

myWebSQL.webdb.select = function(table, keys, where, successHandle, errorHandle) {
	if ( typeof (table) != 'string' || table == '' || typeof (keys) != 'string' || keys == '') {
		return myWebSQL.webdb.onError;
	}
	var cmd = 'SELECT ' + keys + ' FROM ' + table;
	if ( typeof (where) === 'string' && where != '') {
		cmd += ' WHERE ' + where;
	}
	myWebSQL.webdb.executeSql(cmd, [], successHandle, errorHandle);
};

myWebSQL.webdb.Delete = function(table, where, successHandle, errorHandle) {
	if ( typeof (table) != 'string' || table == '' || typeof (where) != 'string' || where == '') {
		return myWebSQL.webdb.onError;
	}
	var db = myWebSQL.webdb.db;
	cmd = 'DELETE FROM ' + table + ' WHERE ' + where;
	myWebSQL.webdb.executeSql(cmd, [], successHandle, errorHandle);
};

myWebSQL.webdb.createTableFromJSON = function(json, successCallback, errorCallback, progressCallBack) {
	if(typeof successCallback !== 'function' ) successCallback = function() {};
	if(typeof errorCallBack !== 'function' ) errorCallBack = function() {};
	if(typeof progressCallBack !== 'function' ) progressCallBack = function() {};
	
	//create Table
	var sqlCmdArray = new Array();
	var sqlCmdArray_createTB = new Array();
	var columns = '';
	var cmd = '';
	columns = '"id" INTEGER PRIMARY KEY AUTOINCREMENT, "HospCode", "area", "username", "func", "data", "RefKey", "captureTime"';
	var table = "ActionLog";
	//myWebSQL.webdb.createTable("ActionLog", columns);
	var db = myWebSQL.webdb.db;
	
	/*db.transaction(function(tx) {
		cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
		//console.debug(cmd);
		tx.executeSql(cmd, []);
	});*/
	cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
	sqlCmdArray_createTB.push(cmd);
	
	
	$.each(json, function(table, value) {		
		columns = '';
		cmd = 'DROP TABLE IF EXISTS ' + table;
		sqlCmdArray_createTB.push(cmd);
		if (json[table].length > 0) {
			$.each(json[table][0], function(key, value) {
				columns += '"' + key + '" "' + typeof (value) + '", ';
			});
			if (columns != '') {
				columns = columns.substring(0, columns.length - 2);
			}
			
			cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
			sqlCmdArray_createTB.push(cmd);
		/*	myWebSQL.webdb.createTable(table, columns, function(tx, result) {
				//console.debug("createTableFromJSON", result, table, columns);
			});*/
			/*db.transaction(function(tx) {
				cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
				//console.debug(cmd);
				tx.executeSql(cmd, []);
			});*/
			
			//M2: faster
			//myWebSQL.webdb.db.transaction(function(tx) {
				for (var i = 0; i < json[table].length; ++i) {
					var t1 = '', t2 = '';
					$.each(json[table][i], function(key, value) {
						t1 += '"' + key + '",';
						////console.debug(typeof(value));
						if ( typeof (value) === 'string' || typeof (value) === 'boolean') {
							t2 += '"' + value + '",';
						} else {
							t2 += value + ',';
						}
					});
					t1 = t1.substring(0, t1.length - 1);
					t2 = t2.substring(0, t2.length - 1);
					cmd = 'INSERT INTO ' + table + ' (' + t1 + ') VALUES (' + t2 + ')';
					//tx.executeSql(cmd, [], myWebSQL.webdb.onSuccess, myWebSQL.webdb.onError);
					sqlCmdArray.push(cmd);
				}
			//});

		} else {
			//console.info("No Data in [" + table + "]. Create hard-code");
			var columns;
			switch (table) {
				case "Patient": {
					if (coaOffline.user.area = "MA") {
						columns = '"Hospcode", "Patcode", "Sex", "DoB", "Entry_Date"';
						//myWebSQL.webdb.createTable("Patient", columns);
						cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
						sqlCmdArray_createTB.push(cmd);
						break;
					}

					if (coaOffline.user.level.match("^1")) {//
						columns = '"HospCode", "Patcode", "Sex", "DoB", "Entry_Date"';
						//myWebSQL.webdb.createTable("Patient", columns);
						cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
						sqlCmdArray_createTB.push(cmd);
					} else if (coaOffline.user.level.match("^2")) {//
						columns = '"Hospcode", "Patcode", "Sex", "DoB", "Entry_Date"';
						//myWebSQL.webdb.createTable("Patient", columns);
						cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
						sqlCmdArray_createTB.push(cmd);
					}
					break;
				}
				case "PreOp": {
					if (coaOffline.user.area = "MA") {
						columns = '"HospCode", "PatCode", "CaseCode", "DateListed", "OpSide", "Stage", "Sym_Deafness", "Sym_IntDischarge", "Sym_PersDischarge", "Sym_Earache", "Sym_None", "Aim_DryEar", "Aim_improve", "Aim_Pathology", "Aim_water", "Smoking", "CME", "Risk_none", "Risk_diabetes", "Risk_cleftpalate", "Risk_others", "Comments", "Entry_Date"';
						//myWebSQL.webdb.createTable("PreOp", columns);
						cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
						sqlCmdArray_createTB.push(cmd);
						break;
					}

					if (coaOffline.user.level.match("^1")) {//
						columns = '"HospCode", "PatCode", "CaseCode", "Age", "ProposedOpDate", "DateListed", "OpSide", "Stage", "PreInterval", "OpEar500BC", "OpEar1000BC", "OpEar2000BC", "OpEar3000BC", "OpEar4000BC", "OpEarBC_Mean", "OpEar500AC", "OpEar1000AC", "OpEar2000AC", "OpEar3000AC", "OpEar4000AC", "OpEar8000AC", "OpEarAC_Mean", "OpEar_AirBoneGap", "NonOpEar500BC", "NonOpEar1000BC", "NonOpEar2000BC", "NonOpEar3000BC", "NonOpEar4000BC", "NonOpEarBC_Mean", "NonOpEar500AC", "NonOpEar1000AC", "NonOpEar2000AC", "NonOpEar3000AC", "NonOpEar4000AC", "NonOpEar8000AC", "NonOpEarAC_Mean", "NonOpEar_AirBoneGap", "Sym_Deafness", "Sym_IntDischarge", "Sym_PersDischarge", "Sym_Earache", "Sym_FacialPalsy", "Sym_None", "Aim_DryEar", "Aim_improve", "Aim_restore", "Aim_water", "Aim_pathology", "Comments", "Risk_diabetes", "Risk_cleftpalate", "Risk_downes", "Risk_others", "Risk_none", "Smoking", "CME", "For_MA", "Entry_Date"';
						//myWebSQL.webdb.createTable("PreOp", columns);
						cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
						sqlCmdArray_createTB.push(cmd);
					} else if (coaOffline.user.level.match("^2")) {//
						columns = '"PatCode", "CaseCode", "HospCode", "Age", "ProposedOpDate", "DateListed", "PreInterval", "OpSide", "Stage", "DischFrequency", "OpEar500BC", "OpEar1000BC", "OpEar2000BC", "OpEar3000BC", "OpEar4000BC", "OpEarBC_Mean", "OpEar500AC", "OpEar1000AC", "OpEar2000AC", "OpEar3000AC", "OpEar4000AC", "OpEar8000AC", "OpEarAC_Mean", "OpEar_AirBoneGap", "NonOpEar500BC", "NonOpEar1000BC", "NonOpEar2000BC", "NonOpEar3000BC", "NonOpEar4000BC", "NonOpEarBC_Mean", "NonOpEar500AC", "NonOpEar1000AC", "NonOpEar2000AC", "NonOpEar3000AC", "NonOpEar4000AC", "NonOpEar8000AC", "NonOpEarAC_Mean", "NonOpEar_AirBoneGap", "Sym_Deafness", "Sym_Tinnitus", "Sym_Dizziness", "Sym_IntDischarge", "Sym_PersDischarge", "Sym_Earache", "Sym_FacialPalsy", "Sym_None", "Aim_DryEar", "Aim_improve", "Aim_restore", "Aim_water", "Aim_Hearing", "Aim_Pathology", "Risk_diabetes", "Risk_cleftpalate", "Risk_downes", "Risk_others", "Risk_none", "Smoking", "CME", "Comments", "Entry_Date", "For_MA"';
						//myWebSQL.webdb.createTable("PreOp", columns);
						cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
						sqlCmdArray_createTB.push(cmd);
					}
					break;
				}
				case "Op": {
					if (coaOffline.user.area = "MA") {
						columns = '"CaseCode", "HospCode", "OpDate", "SurgGrd", "Supervised", "PreInterval", "OpEar500BC", "OpEar1000BC", "OpEar2000BC", "OpEar3000BC", "OpEar4000BC", "OpEarBC_Mean", "OpEar500AC", "OpEar1000AC", "OpEar2000AC", "OpEar3000AC", "OpEar4000AC", "OpEar8000AC", "OpEarAC_Mean", "OpEar_AirBoneGap", "NonOpEar500BC", "NonOpEar1000BC", "NonOpEar2000BC", "NonOpEar3000BC", "NonOpEar4000BC", "NonOpEarBC_Mean", "NonOpEar500AC", "NonOpEar1000AC", "NonOpEar2000AC", "NonOpEar3000AC", "NonOpEar4000AC", "NonOpEar8000AC", "NonOpEarAC_Mean", "NonOpEar_AirBoneGap", "Cholest_Attic", "Cholest_Sinus", "Cholest_Other", "Cholest_NA", "Retraction_Post", "Retraction_Attic", "Retraction_NonAerME", "Retraction_Other", "Retraction_NA", "PerfSize", "PerfSite_Ant", "PerfSite_Post", "PerfSite_Inf", "PerfSite_Flaccida", "PerfSite_Total", "PerfSite_SubTotal", "PerfSite_NA", "Ossic_Mobile", "Ossic_Fixed", "Ossic_Eroded", "Ossic_NotAssessed", "Mucosa_Gran", "Mucosa_Oedem", "Mucosa_Fibro", "Mucosa_Tympano", "Mucosa_Normal", "Discharge", "Proc_Myringo", "Proc_Ossiculo", "Proc_Attico", "Proc_AtticoAntro", "Proc_ModRad", "Proc_Cortical", "Proc_Combined", "Proc_Stapedo", "Proc_Tympano", "Proc_WBC", "Proc_Other", "ChordaTymp", "GraftMeth", "GMat_Fasc", "GMat_Perichond", "GMat_PerichCart", "GMat_Cart", "GMat_PeriOst", "GMat_Homograft", "GMat_Fat", "GMat_Xeno", "GMat_Other", "GMat_NA", "Comments", "Entry_Date"';
						//myWebSQL.webdb.createTable("Op", columns);
						cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
						sqlCmdArray_createTB.push(cmd);
						break;
					}

					if (coaOffline.user.level.match("^1")) {//
						columns = '"CaseCode", "HospCode", "OpDate", "SurgGrd", "Supervised", "Cholest_Attic", "Cholest_Sinus", "Cholest_Other", "Cholest_NA", "Retraction_Post", "Retraction_Attic", "Retraction_NonAerME", "Retraction_Other", "Retraction_NA", "PerfSize", "PerfSite_Ant", "PerfSite_Post", "PerfSite_Inf", "PerfSite_Flaccida", "PerfSite_Total", "PerfSite_SubTotal", "PerfSite_NA", "Ossic_Mobile", "Ossic_Fixed", "Ossic_Eroded", "Ossic_NotAssessed", "Mucosa_Gran", "Mucosa_Oedem", "Mucosa_Fibro", "Mucosa_Tympano", "Mucosa_Normal", "Discharge", "Proc_Myringo", "Proc_Ossiculo", "Proc_Attico", "Proc_AtticoAntro", "Proc_ModRad", "Proc_Cortical", "Proc_Combined", "Proc_Stapedo", "Proc_Tympano", "Proc_WBC", "Proc_Other", "PreInterval", "MostRecentAud", "OpEar500BC", "OpEar1000BC", "OpEar2000BC", "OpEar3000BC", "OpEar4000BC", "OpEarBC_Mean", "OpEar500AC", "OpEar1000AC", "OpEar2000AC", "OpEar3000AC", "OpEar4000AC", "OpEar8000AC", "OpEarAC_Mean", "OpEar_AirBoneGap", "NonOpEar500BC", "NonOpEar1000BC", "NonOpEar2000BC", "NonOpEar3000BC", "NonOpEar4000BC", "NonOpEarBC_Mean", "NonOpEar500AC", "NonOpEar1000AC", "NonOpEar2000AC", "NonOpEar3000AC", "NonOpEar4000AC", "NonOpEar8000AC", "NonOpEarAC_Mean", "NonOpEar_AirBoneGap", "ChordaTymp", "GraftMeth", "GMat_Fasc", "GMat_Perichond", "GMat_PerichCart", "GMat_Cart", "GMat_PeriOst", "GMat_Homograft", "GMat_Fat", "GMat_Xeno", "GMat_Other", "GMat_NA", "Comments", "Entry_Date"';
						//myWebSQL.webdb.createTable("Op", columns);
						cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
						sqlCmdArray_createTB.push(cmd);
					} else if (coaOffline.user.level.match("^2")) {//
						columns = '"CaseCode", "HospCode", "OpDate", "Anaesthetic", "Surgeon", "SurgGrd", "Supervised", "FacNerve", "Fistula_Canal", "Fistula_Footplate", "Fistula_NotChecked", "Fistula_Nil", "PerfSize", "PerfSite_TensaAnt", "PerfSite_TensaPost", "PerfSite_TensaInf", "PerfSite_Flaccida", "PerfSite_SubTotal", "PerfSite_Total", "PerfSite_NA", "Retract_Mobility", "Retraction_Ant", "Retraction_Post", "Retraction_Attic", "Retraction_NonAerME", "Retraction_other", "Retraction_NA", "Cholest_UnderTM", "Cholest_SinusTymp", "Cholest_Antrum", "Cholest_ME", "Cholest_Attic", "Cholest_MastCells", "Cholest_NA", "OssEroded_Malleus", "OssEroded_Incus", "OssEroded_StapesSupra", "OssEroded_Footplate", "OssEroded_NotChecked", "OssEroded_Nil", "OssFixed_Footplate", "OssFixed_MIJoint", "OssFixed_ISJoint", "OssFixed_Nil", "Mucosa_Gran", "Mucosa_Oedem", "Mucosa_Fibro", "Mucosa_Tympano", "Mucosa_Normal", "Discharge", "MostRecentAud", "OpEar500BC", "OpEar1000BC", "OpEar2000BC", "OpEar3000BC", "OpEar4000BC", "OpEarBC_Mean", "OpEar500AC", "OpEar1000AC", "OpEar2000AC", "OpEar3000AC", "OpEar4000AC", "OpEar8000AC", "OpEarAC_Mean", "OpEar_AirBoneGap", "NonOpEar500BC", "NonOpEar1000BC", "NonOpEar2000BC", "NonOpEar3000BC", "NonOpEar4000BC", "NonOpEarBC_Mean", "NonOpEar500AC", "NonOpEar1000AC", "NonOpEar2000AC", "NonOpEar3000AC", "NonOpEar4000AC", "NonOpEar8000AC", "NonOpEarAC_Mean", "NonOpEar_AirBoneGap", "Comments", "Entry_Date"';
						//myWebSQL.webdb.createTable("Op", columns);
						cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
						sqlCmdArray_createTB.push(cmd);
					}
					break;
				}
				case "PostOp": {
					if (coaOffline.user.area = "MA") {
						columns = '"CaseCode", "HospCode", "AssInterval", "AssDate", "Discharge", "Complics_Palsy", "Complics_Tinnitus", "Complics_Vertigo", "Complics_Hearing", "Complics_WInfection", "Complics_Taste", "Complics_Other", "Complics_None", "OA_Intact", "OA_NotIntact", "OA_Myringitis", "OA_AntBlunt", "OA_Atelectasis", "OA_Retraction", "OA_Lateralization", "OA_MeatalStenosis", "OA_CompleteCollapse", "OA_OME", "OA_NotAssessed", "OA_Normal", "Cholest_Recur", "Cholest_Resid", "Cholest_Nil", "Cholest_NA", "OpEar500BC", "OpEar1000BC", "OpEar2000BC", "OpEar3000BC", "OpEar4000BC", "OpEarBC_Mean", "OpEar500AC", "OpEar1000AC", "OpEar2000AC", "OpEar3000AC", "OpEar4000AC", "OpEar8000AC", "OpEarAC_Mean", "OpEar_AirBoneGap", "Comments", "Entry_Date"';
						//myWebSQL.webdb.createTable("PostOp", columns);
						cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
						sqlCmdArray_createTB.push(cmd);
						break;
					}

					if (coaOffline.user.level.match("^1")) {//
						columns = '"CaseCode", "HospCode", "AssInterval", "AssDate", "Discharge", "Complics_Palsy", "Complics_Tinnitus", "Complics_Vertigo", "Complics_Hearing", "Complics_WInfection", "Complics_Taste", "Complics_Other", "Complics_None", "Tymp_Mem", "Cholest_Recur", "Cholest_Resid", "Cholest_Nil", "Cholest_NA", "OpEar500BC", "OpEar1000BC", "OpEar2000BC", "OpEar3000BC", "OpEar4000BC", "OpEarBC_Mean", "OpEar500AC", "OpEar1000AC", "OpEar2000AC", "OpEar3000AC", "OpEar4000AC", "OpEar8000AC", "OpEarAC_Mean", "OpEar_AirBoneGap", "OA_Intact", "OA_NotIntact", "OA_Myringitis", "OA_AntBlunt", "OA_Atelectasis", "OA_Retraction", "OA_Lateralization", "OA_MeatalStenosis", "OA_CompleteCollapse", "OA_OME", "OA_NotAssessed", "OA_Normal", "Comments", "Entry_Date"';
						//myWebSQL.webdb.createTable("PostOp", columns);
						cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
						sqlCmdArray_createTB.push(cmd);
					} else if (coaOffline.user.level.match("^2")) {//
						columns = '"CaseCode", "HospCode", "AssDate", "AssInterval", "Actual_Interval", "Taste", "Discharge", "DischFreq", "Ossic_Pros", "OpEar500BC", "OpEar1000BC", "OpEar2000BC", "OpEar3000BC", "OpEar4000BC", "OpEarBC_Mean", "OpEar500AC", "OpEar1000AC", "OpEar2000AC", "OpEar3000AC", "OpEar4000AC", "OpEar8000AC", "OpEarAC_Mean", "OpEar_AirBoneGap", "Complics_Palsy", "Complics_Tinnitus", "Complics_Vertigo", "Complics_Hearing", "Complics_Taste", "Complics_WInfection", "Complics_Other", "Complics_None", "OA_Intact", "OA_NotIntact", "OA_Myringitis", "OA_AntBlunt", "OA_Atelectasis", "OA_Retraction", "OA_Lateralization", "OA_MeatalStenosis", "OA_CompleteCollapse", "OA_OME", "OA_NotAssessed", "OA_Normal", "Cholest_Recur", "Cholest_Resid", "Cholest_None", "Cholest_NA", "ME_RecurCholest", "ME_ResidCholest", "ME_OME", "ME_NotAssessed", "ME_Other", "ME_None", "Comments", "Entry_Date"';
						//myWebSQL.webdb.createTable("PostOp", columns);
						cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
						sqlCmdArray_createTB.push(cmd);
					}
					break;
				}
				case "Procedure": {
					columns = '"CaseCode", "HospCode", "Nature", "Approach", "MatME_GelFilm", "MatME_GelFoam", "MatME_Cartilage", "MatME_Silastic", "MatME_Nil", "Meato_Bony", "Meato_Cartilaginous", "Meato_Nil", "Myringo_Mat", "GraftMeth", "OssicDefect_Malleus", "OssicDefect_Incus", "OssicDefect_StapesSupra", "OssicDefect_Footplate", "OssicDefect_Nil", "Ossic_Mat", "Ossic_Pros", "Ossic_Recon", "Mastoidectomy", "OblitFlap_Palva", "OblitFlap_Muscle", "OblitFlap_Fascial", "OblitFlap_MidTemporal", "OblitFlap_TempParietal", "OblitFlap_NA", "OblitMat_BonePaste", "OblitMat_BoneChips", "OblitMat_Cartilage", "OblitMat_HAGranules", "OblitMat_SerenoCem", "OblitMat_FatBlind", "OblitMat_NA", "CW_Recon", "Stapes_Op", "Stapes_Chorda", "Stapes_Fensize", "Stapes_ProsType", "Stapes_ProsSize", "Stapes_Attach", "Stapes_IntTissue", "Fen_Pick", "Fen_Drill", "Fen_Laser", "Fen_NA", "Laser", "WinSeal_Fat", "WinSeal_BloodClot", "WinSeal_Other", "WinSeal_GelFoam", "WinSeal_Nil", "Comments", "Entry_Date", "OblitMat_Bioglass", "OtoEndosopicMethod", "OtoEndosopicSize", "OtoEndosopicLength", "OtoEndosopicAngle"';
					//myWebSQL.webdb.createTable("Procedure", columns);
					cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
						sqlCmdArray_createTB.push(cmd);
					break;
				}
				case "Questionnaires": {
					columns = '"name", "header", "footer", "id"';
					//myWebSQL.webdb.createTable("Questionnaires", columns);
					cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
						sqlCmdArray_createTB.push(cmd);
					break;
				}
				case "Que_Sections": {
					columns = '"questionnaire_id", "header", "footer", "id"';
					//myWebSQL.webdb.createTable("Questionnaires", columns);
					cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
						sqlCmdArray_createTB.push(cmd);
					break;
				}
				case "Questions": {
					columns = '"questionnaire_id", "section_id", "text", "type", "index", "id"';
					//myWebSQL.webdb.createTable("Questionnaires", columns);
					cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
						sqlCmdArray_createTB.push(cmd);
					break;
				}
				case "Que_Answers": {
					columns = '"question_id", "display", "value", "id"';
					//myWebSQL.webdb.createTable("Questionnaires", columns);
					cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
						sqlCmdArray_createTB.push(cmd);
					break;
				}
				case "Que_Results": {
					columns = '"id", "hospital_no", "user_name", "Patcode", "createdAt", "resultCode", "question_id", "answer_id", "answer", "confirmed", "opStatus", "followUpPeriod"';
					//myWebSQL.webdb.createTable("Questionnaires", columns);
					cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
						sqlCmdArray_createTB.push(cmd);
					break;
				}
			}
		}		
	});

	
	function runSQLscript(cmd) {
		var deferred = $.Deferred();
		myWebSQL.webdb.db.transaction(function(tx) {
				tx.executeSql(cmd, [], 
				function(tx, r) {
					myWebSQL.webdb.onSuccess(tx,r)
					deferred.resolve(cmd);
				},
				function(tx,r) {
					myWebSQL.webdb.onError(tx,r);
					deferred.reject(cmd);
				});
		});
		
		return deferred.promise();
	}
	

	
	function longWaitingcreateTable() {
		var deferred_array =[];
		var deferred_longWaitingcreateTable =  $.Deferred();
		var promise;
		var count = 0;
		for(var i = 0; i < sqlCmdArray_createTB.length; i++) {
			cmd = sqlCmdArray_createTB[i];
			promise = runSQLscript(cmd);
			deferred_array.push(promise);
			promise.done(function() {
				count++;
				//console.log("longWaitingcreateTable done"+count);
				
				if(count % 10 == 0) {
					//console.log("deferred_longWaitingcreateTable.notify");
					//deferred_longWaitingcreateTable.notify((count / sqlCmdArray_createTB.length).toFixed(4));
					progressCallBack((count / sqlCmdArray_createTB.length).toFixed(4), "Initializing");
				}
				
			});
			
		}
				
		$.when.apply($, deferred_array).done(function() {
			//console.info("deferred_longWaitingcreateTable done");
			deferred_longWaitingcreateTable.resolve();
		}).fail(function() {
			//console.info("deferred_longWaitingcreateTable fail");
			deferred_longWaitingcreateTable.reject();
		});
		
		return deferred_longWaitingcreateTable.promise();
	}

	
	//
	function longWaitingTasks() {
		var deferred_array =[];
		var count = 0;
		var deferred_longWaitingTasks =  $.Deferred();;
		var promise;
		for(var i = 0; i < sqlCmdArray.length; i++) {
			cmd = sqlCmdArray[i];
			promise = runSQLscript(cmd);
			deferred_array.push(promise);
			promise.done(function() {
				count++;
				//console.log("longWaitingTasks done"+count);
				if(count %100 == 0) {
					//console.log("deferred_longWaitingTasks.notify");
					//deferred_longWaitingTasks.notify((count / sqlCmdArray.length).toFixed(4));
					progressCallBack((count / sqlCmdArray.length).toFixed(4), "Syncing data");
				}
			});
		}
		
		
		
		$.when.apply($, deferred_array).done(function() {
			//console.info("deferred_longWaitingTasks done");
			deferred_longWaitingTasks.resolve();
		}).fail(function() {
			//console.info("deferred_longWaitingTasks fail");
			deferred_longWaitingTasks.reject();
		});
		
		return deferred_longWaitingTasks.promise();
	}
	
	var cTask = longWaitingcreateTable();
	
	cTask.done(function() {
		
		//console.log("done longWaitingcreateTable");

		var dTask = longWaitingTasks();	
		dTask.done(function() {
			//console.info("done createTableFromJSON");

			return successCallback(json);
		}).fail(function() { 
			//console.error("fail createTableFromJSON"); 
			return errorCallback;
		})/*.progress(function(progressStr) {
			//console.info("progress createTableFromJSON", progressStr);
			return progressCallBack(progressStr);
		})*/;
	}).fail(function() { 
		//console.error("fail createTableFromJSON"); 
		return errorCallback;
	})/*.progress(function(progressStr) {
			console.info("progress createTableFromJSON", progressStr);
			return progressCallBack(progressStr);
	})*/;
	
	
	
	
	/*myWebSQL.webdb.db.transaction(function(tx) {
			var cmd = "";
			var count = 0;
			for(var i = 0; i < sqlCmdArray.length; i++) {
				cmd = sqlCmdArray[i];
				//console.log(cmd);
				tx.executeSql(cmd, [], 
				function(tx, r) {
					
					count++;
					if(count%100 == 0) {
						//console.info("progressCallBack", (count/sqlCmdArray.length).toFixed(4));
						progressCallBack((count/sqlCmdArray.length).toFixed(4));
					}
				}
				, myWebSQL.webdb.onError
				);
			}
		}, 
		function(e) { //console.error(e); return errorCallback;},
		function() {
			//console.info("done createTableFromJSON");
			return successCallback(json);
		}
	); */
};
