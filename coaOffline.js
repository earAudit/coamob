var coaOffline = {};
coaOffline.user = {};
coaOffline.user.HospCode = '';
coaOffline.user.area = '';
coaOffline.user.name = '';
coaOffline.user.pass = ''; // only store in secure storge
coaOffline.user.level = '';
coaOffline.DBReady = false;
coaOffline.config = {};
coaOffline.config.UPDATE_SUCCESS_JSON = {
	"Update" : "Success"
};
coaOffline.config.ERROR_JSON = {
	"Error" : "1",
	"Reason" : "Server Error"
};
coaOffline.config.INVALID_TOKEN_JSON = {
	"Error" : "2",
	"Reason" : "Invalid Token"
};
coaOffline.config.UPDATE_FAIL_JSON = {
	"Error" : "3",
	"Reason" : "Update DB Fail"
};
coaOffline.config.DATA_EXIST_JSON = {
	"Error" : "4",
	"Reason" : "Data already exists"
};
coaOffline.config.INVALID_INPUT_JSON = {
	"Error" : "5",
	"Reason" : "Invalid input"
};
coaOffline.config.EMPTY_ROW_JSON = {
	"Rows" : []
};
var genDateTimeString = function(d) {
	if (!( d && d.getMonth && d.getMonth.call)) {
		d = new Date();
	}
	//console.debug(d);

	var yyyy = d.getFullYear();
	var MM = ('0' + (d.getMonth() + 1)).slice(-2);
	;
	var dd = ('0' + d.getDate()).slice(-2);
	;
	var hh = ('0' + d.getHours()).slice(-2);
	var mm = ('0' + d.getMinutes()).slice(-2);
	var ss = ('0' + d.getSeconds()).slice(-2);
	var string = yyyy + "-" + MM + "-" + dd + " " + hh + ":" + mm + ":" + ss;
	return string;
};

coaOffline.initDB = function(data, successCallBack, errorCallBack, progressCallBack) {
	//console.log("initDB");
	if(typeof successCallback !== 'function' ) successCallback = function() {};
	if(typeof errorCallBack !== 'function' ) errorCallBack = function() {};
	if(typeof progressCallBack !== 'function' ) progressCallBack = function() {};
	
	coaOffline.user.HospCode = data.HospCode;
	coaOffline.user.area = data.area;
	coaOffline.user.name = data.username;
	
	if(data.HospCode == null || data.area == null || data.username==null || data.password==null) {
		errorCallBack("Invalid Parameter(s)");
		return false;
	}
	
	data.sinceDateTime = "";
	data.startDateTime = "";
	data.isEncrypted = false;
	
	var tables = ["users", "hospitals", "Aims_List", "Dropdowns", "Patient", "PreOp", "Op", "PostOp", "Procedure", "Questionnaires", "Que_Sections", "Questions", "Que_Answers", "Que_Results"];
	var combined_json = {};
	combined_json.data = {};
	
	for(var i = 0; i < tables.length; i++) {
		data.table = tables[i];	
		getJsonFromWS(true, webserive_url + 'syncGetData', data, function(json) {
			if (!json.data) {
				//console.error("login failed");
				errorCallBack("login failed");
				return false;
			}
			$.extend(combined_json.data, json.data);
		//	console.log(i, combined_json.data, Object.keys(combined_json.data).length );
			progressCallBack((Object.keys(combined_json.data).length/tables.length).toFixed(4), "Downloading");
			
			if( Object.keys(combined_json.data).length  == tables.length) {
			//	console.info(JSON.stringify(combined_json));
				coaOffline.user.level = combined_json.data.users[0].user_level;
				try {
					myWebSQL.webdb.open();
					myWebSQL.webdb.createTableFromJSON(combined_json.data, function(json) {
						coaOffline.DBReady = true;
						successCallBack(json);
					}, errorCallBack, progressCallBack);
					
				} catch (e) {
					//console.error("[syncGetAllData]: There has been an error: " + e);
				}
			}
		});
	}
	
	
	
	/*getJsonFromWS(false, webserive_url + 'syncGetAllData', data, function(json) {
		
		if (!json.data) {
			//console.error("login failed");
			errorCallBack("login failed");
			return false;
		}
		coaOffline.user.level = json.data.users[0].user_level;
		try {
			myWebSQL.webdb.open();
			myWebSQL.webdb.createTableFromJSON(json.data, function(json) {
				coaOffline.DBReady = true;
				successCallBack(json);
			}, errorCallBack, progressCallBack);
			
		} catch (e) {
			//console.error("[syncGetAllData]: There has been an error: " + e);
		}
	});*/
	return false;
};

coaOffline.initDB_old = function(data, successCallBack, errorCallBack, progressCallBack) {
	//console.log("initDB");
	if(typeof successCallback !== 'function' ) successCallback = function() {};
	if(typeof errorCallBack !== 'function' ) errorCallBack = function() {};
	if(typeof progressCallBack !== 'function' ) progressCallBack = function() {};
	
	coaOffline.user.HospCode = data.HospCode;
	coaOffline.user.area = data.area;
	coaOffline.user.name = data.username;
	
	if(data.HospCode == null || data.area == null || data.username==null || data.password==null) {
		errorCallBack("Invalid Parameter(s)");
		return false;
	}
	
	data.sinceDateTime = "";
	data.startDateTime = "";
	data.isEncrypted = false;
	
	getJsonFromWS(false, webserive_url + 'syncGetAllData', data, function(json) {
		
		if (!json.data) {
			//console.error("login failed");
			errorCallBack("login failed");
			return false;
		}
		coaOffline.user.level = json.data.users[0].user_level;
		try {
			myWebSQL.webdb.open();
			myWebSQL.webdb.createTableFromJSON(json.data, function(json) {
				coaOffline.DBReady = true;
				successCallBack(json);
			}, errorCallBack, progressCallBack);
			
		} catch (e) {
			//console.error("[syncGetAllData]: There has been an error: " + e);
		}
	});
	return false;
};

coaOffline.clearAllAction = function() {
	//create Table
	var columns = '';
	columns = '"id" INTEGER PRIMARY KEY AUTOINCREMENT, "HospCode", "area", "username", "func", "data", "RefKey", "captureTime"';
	var table = "ActionLog";
	//myWebSQL.webdb.createTable("ActionLog", columns);
	var db = myWebSQL.webdb.db;
	db.transaction(function(tx) {
		cmd = 'DROP TABLE IF EXISTS ' + table;
		//console.debug(cmd);
		tx.executeSql(cmd, []);
		cmd = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columns + ')';
		//console.debug(cmd);
		tx.executeSql(cmd, []);
	});
	
};
coaOffline.getActionLog = function(callback) {
	var json = {
		"Rows" : []
	};

	myWebSQL.webdb.select("ActionLog", "*", "", function(tx, results) {
		for (var i = 0; i < results.rows.length; ++i) {
			var item = results.rows.item(i);
			json.Rows.push(item);
		};
		callback(json);
	});
	return false;
};

coaOffline.captureAction = function(func, data, callback) {
	var now = genDateTimeString();
	var RefKey = '';
	switch(func) {
		case "createPreOp":
		case "createOperation":
		case "createPostOp":
		case "createProcedure":
			RefKey = data.CaseCode;
			break;
		case "saveQuestionnaire":
			var paramString = JSON.parse(data.paramString);
			RefKey = paramString.questionnairesResult.resultCode;
			break;
		default:
			break;
	}

	//console.debug('captureAction', coaOffline.user.HospCode, coaOffline.user.area, coaOffline.user.name, func, JSON.stringify(data), now, RefKey);
	myWebSQL.webdb.db.transaction(function(tx) {
		var cmd = 'INSERT INTO ' + 'ActionLog' + ' (' + '"HospCode", "area", "username", "func", "data", "RefKey", "captureTime"' + ') VALUES (' + "'" + coaOffline.user.HospCode + "', '" + coaOffline.user.area + "', '" + coaOffline.user.name + "', '" + func + "', '" + JSON.stringify(data) + "', '" + RefKey + "', '" + now + "'" + ')';
		myWebSQL.webdb.executeSql(cmd, [], function() {
			myWebSQL.webdb.successHandle;
			callback();
		}, myWebSQL.webdb.errorHandle);
		
	});

	return false;
};

coaOffline.removeAction = function(func, RefKey) {
	myWebSQL.webdb.db.transaction(function(tx) {
		cmd = "DELETE FROM ActionLog where HospCode='" + coaOffline.user.HospCode + "' and area='" + coaOffline.user.area + "' and username='" + coaOffline.user.name + "' and func='" + func + "' and RefKey = '"+RefKey+"'";
		//console.debug(cmd);
		tx.executeSql(cmd, [], myWebSQL.webdb.onSuccess, myWebSQL.webdb.onError);
	});
};


/**
 * [coaOffline.syncUploadData]
 * password: For login
 * progressCallback: callback when start of each ActionLog
 * SuccessCallback: callback when a ActionLog sync is completed without error
 * FailCallback: callback when a ActionLog sync is completed with error. If the function return false, the syncData loop will be termiated and complete.
 * completeCallBack: callback when all ActionLog sync are completed
 */
coaOffline.syncUploadData = function(password, progressCallback, SuccessCallback, FailCallback, completeCallBack){
	//console.debug('syncUploadData', password);
	
	if(progressCallback == null) {progressCallback = function(json){};}
	if(SuccessCallback == null) {SuccessCallback = function(json){};}
	if(FailCallback == null) {FailCallback = function(json){};}
	if(completeCallBack == null) {completeCallBack = function(json){};}
	
	var progress = 0.0;
	var success = {"count":0, "actionLog": []};
	var fail = {"count":0, "actionLog": []};
	var total = 0;
	var data = {};
	var ret;
	var terminate = false;
	
	data.HospCode = coaOffline.user.HospCode;
	data.area = coaOffline.user.area;
	data.username = coaOffline.user.name;
	data.password = password; 

	
	myWebSQL.webdb.select("ActionLog", "*", "", function(tx, results) {
		total = results.rows.length;
		for (var i = 0; i < results.rows.length; ++i) {
			var item = results.rows.item(i);
			//console.debug('syncUploadData item', item);
			progress = i/results.rows.length;
			progressCallback({"current": i, "total": total, "success":success, "fail": fail, "item":item});
			data.HospCode = item.HospCode;
			data.area = item.area;
			data.username = item.username;
			var param = {"func": item.func, "data":item.data};
			data.inputs = JSON.stringify(param);
			//console.debug('syncUploadData data', data);
			getJsonFromWS(false, webserive_url + 'syncUploadData', data, function(json) {
				if(json.Error) {
					fail.count++;
					fail.actionLog.push(item);
					ret = FailCallback({"current": i, "total": total, "success":success, "fail": fail,"data": data, "result": json,"item":item});
					if (ret == false) {
						//terimate
						terminate = true;
					} 
				} else {
					success.count++;
					success.actionLog.push(item);
					ret = SuccessCallback({"current": i, "total": total, "success":success, "fail": fail, "data": data, "result": json,"item":item});
					
				}
				
			});
			if(terminate){
				break;
			}
			
			
		};
		//console.log("completeCallBack");
		completeCallBack({"total": total, "success":success, "fail": fail});
			
	},function()
	{
		notifyUser("Login Error");
	});
};


/*
 coaOffline.login = function (data, callBack){
 coaOffline.initDB({"HospCode": data.hospitalName, "userName": data.username, "password": data.password, "area" : data.area, "sinceDateTime": "", "isEncrypted": "false"}, callBack);
 return false;
 }

 coaOffline.logoff = function (data, callBack){
 return false;
 }*/

coaOffline.isPatientExists = function(data, callback) {
	var cmd = "SELECT * from [Patient] WHERE [HospCode] = '" + data.HospCode + "' and [PatCode] = '" + data.PatCode + "'";
	var json;
	myWebSQL.webdb.executeSql(cmd, [], function(tx, results) {
		if (results.rows.length <= 0) {
			json = {
				"result" : "false"
			};
		} else {
			json = {
				"result" : "true"
			};
		}
		callback(json);
	});
	return false;
};

coaOffline.saveQuestionnaire = function(data, callback) {
	var org_data = JSON.parse(JSON.stringify(data));
	var db = myWebSQL.webdb.db;
	var param = '';
	var cmd = '';
	var paramString = JSON.parse(data.paramString);
	var question_json = paramString.questionnairesResult.question;
	//console.log(paramString, question_json);
	var resultCode = '';
	var createdAt = "";
	var now = new Date();
	if (paramString.questionnairesResult.createdAt != null && paramString.questionnairesResult.createdAt !='')
	{
		createdAt = paramString.questionnairesResult.createdAt;
	}
	else {
		
		var yyyy = now.getFullYear();
		var MM = ('0' + (now.getMonth() + 1)).slice(-2);
		;
		var dd = ('0' + now.getDate()).slice(-2);
		;
		var hh = ('0' + now.getHours()).slice(-2);
		var mm = ('0' + now.getMinutes()).slice(-2);
		var ss = ('0' + now.getSeconds()).slice(-2);
		createdAt = genDateTimeString(now);
		resultCode = data.hospitalCode + '_' + data.PatCode + '_' + MM + dd + yyyy + '_' + hh + mm + ss;
	}
	 
	if(paramString.questionnairesResult.resultCode!= null && paramString.questionnairesResult.resultCode !='') {
		resultCode = paramString.questionnairesResult.resultCode;
		db.transaction(function(tx) {
			cmd = "DELETE FROM Que_Results where hospital_no='"+data.hospitalCode+"' and user_name='"+data.username+"' and PatCode='"+data.PatCode+"' and resultCode = '"+resultCode+"'";
			//console.debug(cmd);
            tx.executeSql(cmd, [], myWebSQL.webdb.onSuccess, myWebSQL.webdb.onError);
		});
		coaOffline.removeAction("saveQuestionnaire", resultCode);
	}
	
	
	var confirmed = paramString.questionnairesResult.confirmed;
	if(confirmed == null || confirmed == '') {
		confirmed = 0;
	}
	var opStatus = paramString.questionnairesResult.opStatus;
	if(opStatus == null || opStatus == '') {
		opStatus = 'NULL';
	}
	var followUpPeriod = paramString.questionnairesResult.followUpPeriod;
	if(followUpPeriod == null || followUpPeriod == '') {
		followUpPeriod = 'NULL';
	}
	
	db.transaction(function(tx) {
		for (var i = 0; i < question_json.length; i++) {
			var table = 'Que_Results';
			var keys = '[hospital_no], [user_name],[PatCode],[createdAt],[resultCode],[question_id],[answer_id],[answer],[confirmed], [opStatus], [followUpPeriod]';
			var answer_id = question_json[i].answer.id != null ? question_json[i].answer.id : 'NULL';
			var answer = question_json[i].answer.value != null ? question_json[i].answer.value : 'NULL';
			param = '"' + data.hospitalCode + '", "' + data.username + '", "' + data.PatCode + '", "' + createdAt + '", "' + resultCode + '", ' + question_json[i].id + ', ' + answer_id + ', ' + answer + ', ' + confirmed +  ', "' + opStatus + '", "' + followUpPeriod +'"';
			cmd = 'INSERT INTO ' + table + ' (' + keys + ') VALUES (' + param + ')';
			//console.debug(cmd);
			tx.executeSql(cmd, [], myWebSQL.webdb.onSuccess, myWebSQL.webdb.onError);
		}
	}, function() {
		callback(coaOffline.config.UPDATE_FAIL_JSON);
	}, function() {
		var org_paramString = JSON.parse(org_data.paramString);
		org_paramString.questionnairesResult.createdAt = createdAt;
		org_paramString.questionnairesResult.resultCode = resultCode;
		org_data.paramString = JSON.stringify(org_paramString);
		coaOffline.captureAction('saveQuestionnaire', org_data, function() {
			callback(coaOffline.config.UPDATE_SUCCESS_JSON);
		});
	});
	return false;
};
coaOffline.getQuestionnaireResultCodeList = function(data, callback) {
	var cmd = "SELECT distinct [resultCode], [createdAt], [confirmed], [opStatus], [followUpPeriod] FROM [Que_Results] where [hospital_no] = '" + data.HospCode + "' and [user_name]='" + data.username + "' and [PatCode]='" + data.PatCode + "' order by [createdAt]";
	var json = {
		"Rows" : []
	};
	myWebSQL.webdb.executeSql(cmd, [], function(tx, results) {
		for (var i = 0; i < results.rows.length; ++i) {
			var item = results.rows.item(i);
			json.Rows.push(item);
		}
		callback(json);
	});
	return false;
};
coaOffline.getQuestionnairesResultForm = function(data, callback) {
	//console.debug(data);
	var confirmed = false;
	var createdAt = '';
	var opStatus = '';
	var followUpPeriod = '';
	var cmd = '';
	var xmlDocument = $.parseXML("<questionnaires/>");
	var elem;
	var text;
	var db = myWebSQL.webdb.db;
	db.transaction(function(tx) {
		cmd = 'SELECT * FROM Questionnaires';
		//console.debug(cmd);
		tx.executeSql(cmd, [], function(tx, r) {
			for (var i = 0; i < r.rows.length; ++i) {
				var questionnaire = xmlDocument.createElement('questionnaire');
				xmlDocument.documentElement.appendChild(questionnaire);
				elem = xmlDocument.createElement('id');
				questionnaire.appendChild(elem);
				text = document.createTextNode(r.rows.item(i).id);
				elem.appendChild(text);
				if (r.rows.item(i).name) {
					elem = xmlDocument.createElement('name');
					questionnaire.appendChild(elem);
					text = document.createTextNode(r.rows.item(i).name);
					elem.appendChild(text);
				}
				if (r.rows.item(i).header) {
					elem = xmlDocument.createElement('header');
					questionnaire.appendChild(elem);
					text = document.createTextNode(r.rows.item(i).header);
					elem.appendChild(text);
				}
				if (r.rows.item(i).footer) {
					elem = xmlDocument.createElement('footer');
					questionnaire.appendChild(elem);
					text = document.createTextNode(r.rows.item(i).footer);
					elem.appendChild(text);
				}
				cmd = 'SELECT * FROM Que_Sections WHERE questionnaire_id = ' + r.rows.item(i).id;
				//console.debug(cmd);
				tx.executeSql(cmd, [], function(tx, Que_SectionsDs, questionnaire) {
					for (var i2 = 0; i2 < Que_SectionsDs.rows.length; ++i2) {
						var section = xmlDocument.createElement('section');
						$questionnaire = $(xmlDocument).find('questionnaire').filter(function() {
							return $(this).children('id').text() == Que_SectionsDs.rows.item(i2).questionnaire_id;
						});
						$questionnaire.append(section);
						elem = xmlDocument.createElement('id');
						section.appendChild(elem);
						text = document.createTextNode(Que_SectionsDs.rows.item(i2).id);
						elem.appendChild(text);
						if (Que_SectionsDs.rows.item(i2).header) {
							elem = xmlDocument.createElement('header');
							section.appendChild(elem);
							text = document.createTextNode(Que_SectionsDs.rows.item(i2).header);
							elem.appendChild(text);
						}
						if (Que_SectionsDs.rows.item(i2).footer) {
							elem = xmlDocument.createElement('footer');
							section.appendChild(elem);
							text = document.createTextNode(Que_SectionsDs.rows.item(i2).footer);
							elem.appendChild(text);
						}
						cmd = 'SELECT * FROM Questions WHERE section_id = ' + Que_SectionsDs.rows.item(i2).id;
						//console.debug(cmd);
						tx.executeSql(cmd, [], function(tx, QuestionsDs) {
							for (var i3 = 0; i3 < QuestionsDs.rows.length; ++i3) {
								var question = xmlDocument.createElement('question');
								$section = $(xmlDocument).find('section').filter(function() {
									return $(this).children('id').text() == QuestionsDs.rows.item(i3).section_id;
								});
								$section.append(question);
								elem = xmlDocument.createElement('id');
								question.appendChild(elem);
								text = document.createTextNode(QuestionsDs.rows.item(i3).id);
								elem.appendChild(text);
								if (QuestionsDs.rows.item(i3).index) {
									elem = xmlDocument.createElement('index');
									question.appendChild(elem);
									text = document.createTextNode(QuestionsDs.rows.item(i3).index);
									elem.appendChild(text);
								}
								if (QuestionsDs.rows.item(i3).text) {
									elem = xmlDocument.createElement('text');
									question.appendChild(elem);
									text = document.createTextNode(QuestionsDs.rows.item(i3).text);
									elem.appendChild(text);
								}
								if (QuestionsDs.rows.item(i3).type) {
									elem = xmlDocument.createElement('type');
									question.appendChild(elem);
									text = document.createTextNode(QuestionsDs.rows.item(i3).type);
									elem.appendChild(text);
								}
								cmd = "SELECT * FROM [Que_Answers] where question_id = " + QuestionsDs.rows.item(i3).id;
								//console.debug(cmd);
								tx.executeSql(cmd, [], function(tx, Que_AnswersDs) {
									for (var i4 = 0; i4 < Que_AnswersDs.rows.length; ++i4) {
										var answer = xmlDocument.createElement('answer');
										$question = $(xmlDocument).find('question').filter(function() {
											return $(this).children('id').text() == Que_AnswersDs.rows.item(i4).question_id;
										});
										$question.append(answer);
										elem = xmlDocument.createElement('id');
										answer.appendChild(elem);
										text = document.createTextNode(Que_AnswersDs.rows.item(i4).id);
										elem.appendChild(text);
										if (Que_AnswersDs.rows.item(i4).display) {
											elem = xmlDocument.createElement('display');
											answer.appendChild(elem);
											text = document.createTextNode(Que_AnswersDs.rows.item(i4).display);
											elem.appendChild(text);
										}
										if (Que_AnswersDs.rows.item(i4).value) {
											elem = xmlDocument.createElement('value');
											answer.appendChild(elem);
											text = document.createTextNode(Que_AnswersDs.rows.item(i4).value);
											elem.appendChild(text);
										}
									}
								});
								cmd = "select * FROM [Que_Results] where question_id= " + QuestionsDs.rows.item(i3).id + " and resultCode = '" + data.resultCode + "'";
								//console.debug(cmd);
								tx.executeSql(cmd, [], function(tx, Que_ResultDs) {
									for (var i5 = 0; i5 < Que_ResultDs.rows.length; ++i5) {
										var result = xmlDocument.createElement('result');
										$question = $(xmlDocument).find('question').filter(function() {
											return $(this).children('id').text() == Que_ResultDs.rows.item(i5).question_id;
										});
										$question.append(result);
										if (Que_ResultDs.rows.item(i5).answer_id) {
											elem = xmlDocument.createElement('answer_id');
											result.appendChild(elem);
											text = document.createTextNode(Que_ResultDs.rows.item(i5).answer_id);
											elem.appendChild(text);
										}
										if (Que_ResultDs.rows.item(i5).answer) {
											elem = xmlDocument.createElement('answer');
											result.appendChild(elem);
											text = document.createTextNode(Que_ResultDs.rows.item(i5).answer);
											elem.appendChild(text);
										}
										if (Que_ResultDs.rows.item(i5).confirmed) {
											
											if (Que_ResultDs.rows.item(i5).confirmed == 1)
											{
												confirmed |= true;
											}
											
										}
										if (Que_ResultDs.rows.item(i5).opStatus) {
											
											if (opStatus == '')
											{
												opStatus = Que_ResultDs.rows.item(i5).opStatus;
											}
											
										}
										
										if (Que_ResultDs.rows.item(i5).followUpPeriod) {
											
											if (followUpPeriod == '')
											{
												followUpPeriod = Que_ResultDs.rows.item(i5).followUpPeriod;
											}
											
										}
										
										if (Que_ResultDs.rows.item(i5).createdAt) {
											
											if (createdAt == '')
											{
												createdAt = Que_ResultDs.rows.item(i5).createdAt;
											}
											
										}
									}
								});
							}
						});
					}
				});
			}
		});
		
		
		
	}, function() {
		callback($.parseXML("<questionnaires/>"));
	}, function() {
		elem = xmlDocument.createElement('confirmed');
		xmlDocument.documentElement.appendChild(elem);
		if (confirmed) text = document.createTextNode("1");
        else text = document.createTextNode("0");
		elem.appendChild(text);
		
		elem = xmlDocument.createElement('opStatus');
		xmlDocument.documentElement.appendChild(elem);
		text = document.createTextNode(opStatus);
		elem.appendChild(text);
		
		elem = xmlDocument.createElement('followUpPeriod');
		xmlDocument.documentElement.appendChild(elem);
		text = document.createTextNode(followUpPeriod);
		elem.appendChild(text);
		
		elem = xmlDocument.createElement('createdAt');
		xmlDocument.documentElement.appendChild(elem);
		text = document.createTextNode(createdAt);
		elem.appendChild(text);
		
		callback(xmlDocument);
	});
	return false;
};

coaOffline.getQuestionnairesResultFormJSON = function(data, callback) {
	coaOffline.getQuestionnairesResultForm(data, function(xml) {
		var xmlDocument = "<xml>" + new XMLSerializer().serializeToString(xml) + "</xml>";
		var json = $.xml2json(xmlDocument);
		callback(json);
	});
	return false;
};
coaOffline.getQuestionnaires = function(data, callback) {
	var cmd = '';
	var xmlDocument = $.parseXML("<questionnaires/>");
	var elem;
	var text;
	var db = myWebSQL.webdb.db;
	db.transaction(function(tx) {
		cmd = 'SELECT * FROM Questionnaires';
		//console.debug(cmd);
		tx.executeSql(cmd, [], function(tx, r) {
			for (var i = 0; i < r.rows.length; ++i) {
				var questionnaire = xmlDocument.createElement('questionnaire');
				xmlDocument.documentElement.appendChild(questionnaire);
				elem = xmlDocument.createElement('id');
				questionnaire.appendChild(elem);
				text = document.createTextNode(r.rows.item(i).id);
				elem.appendChild(text);
				if (r.rows.item(i).name) {
					elem = xmlDocument.createElement('name');
					questionnaire.appendChild(elem);
					text = document.createTextNode(r.rows.item(i).name);
					elem.appendChild(text);
				}
				if (r.rows.item(i).header) {
					elem = xmlDocument.createElement('header');
					questionnaire.appendChild(elem);
					text = document.createTextNode(r.rows.item(i).header);
					elem.appendChild(text);
				}
				if (r.rows.item(i).footer) {
					elem = xmlDocument.createElement('footer');
					questionnaire.appendChild(elem);
					text = document.createTextNode(r.rows.item(i).footer);
					elem.appendChild(text);
				}
				cmd = 'SELECT * FROM Que_Sections WHERE questionnaire_id = ' + r.rows.item(i).id;
				//console.debug(cmd);
				tx.executeSql(cmd, [], function(tx, Que_SectionsDs, questionnaire) {
					for (var i2 = 0; i2 < Que_SectionsDs.rows.length; ++i2) {
						var section = xmlDocument.createElement('section');
						$questionnaire = $(xmlDocument).find('questionnaire').filter(function() {
							return $(this).children('id').text() == Que_SectionsDs.rows.item(i2).questionnaire_id;
						});
						$questionnaire.append(section);
						elem = xmlDocument.createElement('id');
						section.appendChild(elem);
						text = document.createTextNode(Que_SectionsDs.rows.item(i2).id);
						elem.appendChild(text);
						if (Que_SectionsDs.rows.item(i2).header) {
							elem = xmlDocument.createElement('header');
							section.appendChild(elem);
							text = document.createTextNode(Que_SectionsDs.rows.item(i2).header);
							elem.appendChild(text);
						}
						if (Que_SectionsDs.rows.item(i2).footer) {
							elem = xmlDocument.createElement('footer');
							section.appendChild(elem);
							text = document.createTextNode(Que_SectionsDs.rows.item(i2).footer);
							elem.appendChild(text);
						}
						cmd = 'SELECT * FROM Questions WHERE section_id = ' + Que_SectionsDs.rows.item(i2).id;
						//console.debug(cmd);
						tx.executeSql(cmd, [], function(tx, QuestionsDs) {
							for (var i3 = 0; i3 < QuestionsDs.rows.length; ++i3) {
								var question = xmlDocument.createElement('question');
								$section = $(xmlDocument).find('section').filter(function() {
									return $(this).children('id').text() == QuestionsDs.rows.item(i3).section_id;
								});
								$section.append(question);
								elem = xmlDocument.createElement('id');
								question.appendChild(elem);
								text = document.createTextNode(QuestionsDs.rows.item(i3).id);
								elem.appendChild(text);
								if (QuestionsDs.rows.item(i3).index) {
									elem = xmlDocument.createElement('index');
									question.appendChild(elem);
									text = document.createTextNode(QuestionsDs.rows.item(i3).index);
									elem.appendChild(text);
								}
								if (QuestionsDs.rows.item(i3).text) {
									elem = xmlDocument.createElement('text');
									question.appendChild(elem);
									text = document.createTextNode(QuestionsDs.rows.item(i3).text);
									elem.appendChild(text);
								}
								if (QuestionsDs.rows.item(i3).type) {
									elem = xmlDocument.createElement('type');
									question.appendChild(elem);
									text = document.createTextNode(QuestionsDs.rows.item(i3).type);
									elem.appendChild(text);
								}
								cmd = "SELECT * FROM [Que_Answers] where question_id = " + QuestionsDs.rows.item(i3).id;
								//console.debug(cmd);
								tx.executeSql(cmd, [], function(tx, Que_AnswersDs) {
									for (var i4 = 0; i4 < Que_AnswersDs.rows.length; ++i4) {
										var answer = xmlDocument.createElement('answer');
										$question = $(xmlDocument).find('question').filter(function() {
											return $(this).children('id').text() == Que_AnswersDs.rows.item(i4).question_id;
										});
										$question.append(answer);
										elem = xmlDocument.createElement('id');
										answer.appendChild(elem);
										text = document.createTextNode(Que_AnswersDs.rows.item(i4).id);
										elem.appendChild(text);
										if (Que_AnswersDs.rows.item(i4).display) {
											elem = xmlDocument.createElement('display');
											answer.appendChild(elem);
											text = document.createTextNode(Que_AnswersDs.rows.item(i4).display);
											elem.appendChild(text);
										}
										if (Que_AnswersDs.rows.item(i4).value) {
											elem = xmlDocument.createElement('value');
											answer.appendChild(elem);
											text = document.createTextNode(Que_AnswersDs.rows.item(i4).value);
											elem.appendChild(text);
										}
									}
								});
							}
						});
					}
				});
			}
		});
	}, function() {
		callback($.parseXML("<questionnaires/>"));
	}, function() {
		callback(xmlDocument);
	});
	return false;
};

coaOffline.getQuestionnairesJSON = function(data, callback) {
	coaOffline.getQuestionnaires(data, function(xml) {
		var xmlDocument = "<xml>" + new XMLSerializer().serializeToString(xml) + "</xml>";
		var json = $.xml2json(xmlDocument);
		callback(json);
	});
	return false;
};
coaOffline.getDropdowns = function(data, callback) {
	var cmd = "SELECT [DDOption] from [Dropdowns] where [DDField]='" + data.field + "' order by [DDOrder] asc";
	var json = {
		"Rows" : []
	};
	myWebSQL.webdb.executeSql(cmd, [], function(tx, results) {
		for (var i = 0; i < results.rows.length; ++i) {
			var item = results.rows.item(i);
			json.Rows.push(item);
		}
		callback(json);
	});
	return false;
};
coaOffline.getAims_List = function(data, callback) {
	var cmd = "SELECT [Text] from [Aims_List] order by [id]";
	var json = {
		"Rows" : []
	};
	myWebSQL.webdb.executeSql(cmd, [], function(tx, results) {
		for (var i = 0; i < results.rows.length; ++i) {
			var item = results.rows.item(i);
			json.Rows.push(item);
		}
		callback(json);
	});
	return false;
};
coaOffline.createPreOp = function(data, callback) {
	var org_data = JSON.parse(JSON.stringify(data));
	//console.info("[createPreOp] data ", JSON.stringify(data) );
	
	if(data.DoB) data.DoB = data.DoB.replace( /(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1 00:00:00");
	if(data.DateListed) data.DateListed = data.DateListed.replace( /(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1 00:00:00");
//	data.DoB = genDateTimeString(new Date(data.DoB));
//	data.DateListed = genDateTimeString(new Date(data.DateListed));
	
	console.info("2[createPreOp] data ", JSON.stringify(data) );

	var step1 = function(data, callback) {
		//console.info("step1");
		coaOffline.isPatientExists({
			"HospCode" : data.HospCode,
			"PatCode" : data.PatCode
		}, function(json) {
			if (json.result == "false") {
				var createdAt = genDateTimeString(new Date());
				var param = '"' + data.HospCode + '", "' + data.PatCode + '", "' + data.Sex + '", "' + data.DoB + '", "' + createdAt + '"';
				myWebSQL.webdb.insert("Patient", "HospCode, PatCode, Sex, DoB, Entry_Date", param, function(tx, r) {
					return step2(data, callback);
				}, function(tx, e) {
					return callback(coaOffline.config.UPDATE_FAIL_JSON);
				});
			} else {
				return step2(data, callback);
			}
		});
	};
	var step2 = function(data, callback) {
		//console.info("step2");
		var cmd = "SELECT CaseCode from [PreOp] where CaseCode = '" + data.CaseCode + "' and HospCode = '" + data.HospCode + "' and PatCode = '" + data.PatCode + "'";
		myWebSQL.webdb.executeSql(cmd, [], function(tx, results) {
			if (results.rows.length > 0) {
				return callback(coaOffline.config.DATA_EXIST_JSON);
			} else {
				return step3(data, callback);
			}
		});
	};
	var step3 = function(data, callback) {
		//console.info("step3");
		var createdAt = genDateTimeString(new Date());
		if (coaOffline.user.area == 'MA') {
			var cmd = "INSERT into [PreOp] (HospCode, PatCode, CaseCode, DateListed, OpSide, Stage, Sym_Deafness, Sym_IntDischarge, Sym_PersDischarge, Sym_Earache, Sym_None, Aim_DryEar, Aim_improve, Aim_Pathology, Aim_water, Smoking, CME, Risk_none, Risk_diabetes, Risk_cleftpalate, Risk_others, Comments, Entry_Date) VALUES('" + data.HospCode + "', '" + data.PatCode + "', '" + data.CaseCode + "', '" + data.DateListed + "', '" + data.OpSide + "', '" + data.Stage + "', '" + data.Sym_Deafness + "', '" + data.Sym_IntDischarge + "', '" + data.Sym_PersDischarge + "', '" + data.Sym_Earache + "', '" + data.Sym_None + "', '" + data.Aim_DryEar + "', '" + data.Aim_improve + "', '" + data.Aim_Pathology + "', '" + data.Aim_water + "', '" + data.Smoking + "', '" + data.CME + "', '" + data.Risk_none + "', '" + data.Risk_diabetes + "', '" + data.Risk_cleftpalate + "', '" + data.Risk_others + "', '" + data.Comments + "', '" + createdAt + "'" + ")";
			myWebSQL.webdb.executeSql(cmd, [], function(tx, results) {
				if (results.rowsAffected <= 0) {
					return callback(coaOffline.config.UPDATE_FAIL_JSON);
				} else {
					coaOffline.captureAction('createPreOp', org_data, function() {
						return callback(coaOffline.config.UPDATE_SUCCESS_JSON);
					});
				}
			});
			return;
		}
		if (coaOffline.user.level.match("^1")) {
			var cmd = "INSERT into [PreOp] VALUES('" + data.HospCode + "', '" + data.PatCode + "', '" + data.CaseCode + "', NULL, NULL, '" + data.DateListed + "', '" + data.OpSide + "', '" + data.Stage + "', NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, '" + data.Sym_Deafness + "', '" + data.Sym_IntDischarge + "', '" + data.Sym_PersDischarge + "', '" + data.Sym_Earache + "', '" + data.Sym_FacialPalsy + "', '" + data.Sym_None + "', '" + data.Aim_DryEar + "', '" + data.Aim_improve + "', '" + data.Aim_restore + "', '" + data.Aim_water + "', '" + data.Aim_pathology + "', '" + data.Comments + "', '" + data.Risk_diabetes + "', '" + data.Risk_cleftpalate + "', '" + data.Risk_downes + "', '" + data.Risk_others + "', '" + data.Risk_none + "', '" + data.Smoking + "', '" + data.CME + "', '" + data.For_MA + "', '" + createdAt + "'" + ")";
			myWebSQL.webdb.executeSql(cmd, [], function(tx, results) {
				if (results.rowsAffected <= 0) {
					return callback(coaOffline.config.UPDATE_FAIL_JSON);
				} else {
					coaOffline.captureAction('createPreOp', org_data, function() {
						return callback(coaOffline.config.UPDATE_SUCCESS_JSON);
					});
				}
			});
		} else if (coaOffline.user.level.match("^2")) {
			var cmd = "INSERT into [PreOp] VALUES('" + data.PatCode + "', '" + data.CaseCode + "', '" + data.HospCode + "', NULL, NULL, '" + data.DateListed + "', " + "NULL, '" + data.OpSide + "', '" + data.Stage + "', " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, " + "NULL, '" + data.Sym_Deafness + "', '" + data.Sym_Tinnitus + "', '" + data.Sym_Dizziness + "', '" + data.Sym_IntDischarge + "', '" + data.Sym_PersDischarge + "', '" + data.Sym_Earache + "', '" + data.Sym_FacialPalsy + "', '" + data.Sym_None + "', '" + data.Aim_DryEar + "', '" + data.Aim_improve + "', '" + data.Aim_restore + "', '" + data.Aim_water + "', " + "NULL, '" + data.Aim_pathology + "', '" + data.Risk_diabetes + "', '" + data.Risk_cleftpalate + "', '" + data.Risk_downes + "', '" + data.Risk_others + "', '" + data.Risk_none + "', '" + data.Smoking + "', '" + data.CME + "', '" + data.Comments + "', '" + createdAt + "', '" + data.For_MA + "'" + ")";
			myWebSQL.webdb.executeSql(cmd, [], function(tx, results) {
				if (results.rowsAffected <= 0) {
					return callback(coaOffline.config.UPDATE_FAIL_JSON);
				} else {
					coaOffline.captureAction('createPreOp', org_data, function() {
						return callback(coaOffline.config.UPDATE_SUCCESS_JSON);
					});
				}
			});
		}
	};
	step1(data, callback);
	return false;
};
coaOffline.createOperation = function(data, callback) {
	var org_data = JSON.parse(JSON.stringify(data));
	if(data.OpDate) {
		data.OpDate = data.OpDate.replace( /(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1 00:00:00");
	}
	if(data.PreInterval) {
		data.PreInterval = data.PreInterval.replace( /(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1 00:00:00");
	}
	if(data.MostRecentAud) {
		data.MostRecentAud = data.MostRecentAud.replace( /(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1 00:00:00");
	}
	
	//data.OpDate = genDateTimeString(new Date(data.OpDate));
	//data.PreInterval = genDateTimeString(new Date(data.PreInterval));
	//data.MostRecentAud = genDateTimeString(new Date(data.MostRecentAud));
	
	var step1 = function(data, callback) {// check existing
		//console.info("createOperation", "step1", data);
		var cmd = "SELECT CaseCode from [Op] where CaseCode = '" + data.CaseCode + "' and HospCode = '" + data.HospCode + "'";
		myWebSQL.webdb.executeSql(cmd, [], function(tx, results) {
			if (results.rows.length > 0) {
				return callback(coaOffline.config.DATA_EXIST_JSON);
			} else {
				return step2(data, callback);
			}
		});
	};
	var step2 = function(data, callback) {
		//console.info("createOperation", "step2", data);
		var createdAt = genDateTimeString(new Date());
		var cmd = '';
		if (data.audiogramNotPossible == 'Y') {
			if (coaOffline.user.area == 'MA') {
				cmd = "INSERT into [Op] (CaseCode, HospCode, OpDate, SurgGrd, Supervised, Cholest_Attic, Cholest_Sinus, Cholest_Other, Cholest_NA, Retraction_Post, Retraction_Attic, Retraction_NonAerME, Retraction_Other, Retraction_NA, PerfSize, PerfSite_Ant, PerfSite_Post, PerfSite_Inf, PerfSite_Flaccida, PerfSite_Total, PerfSite_SubTotal, PerfSite_NA, Ossic_Mobile, Ossic_Fixed, Ossic_Eroded, Ossic_NotAssessed, Mucosa_Gran, Mucosa_Oedem, Mucosa_Fibro, Mucosa_Tympano, Mucosa_Normal, Discharge, Proc_Myringo, Proc_Ossiculo, Proc_Attico, Proc_AtticoAntro, Proc_ModRad, Proc_Cortical, Proc_Combined, Proc_Stapedo, Proc_Tympano, Proc_WBC, Proc_Other, ChordaTymp, GraftMeth, GMat_Fasc, GMat_Perichond, GMat_PerichCart, GMat_Cart, GMat_PeriOst, GMat_Homograft, GMat_Fat, GMat_Xeno, GMat_Other, GMat_NA, Comments, Entry_Date, PreInterval) VALUES('" + data.CaseCode + "', '" + data.HospCode + "', '" + data.OpDate + "', '" + data.SurgGrd + "', '" + data.Supervised + "', '" + data.Cholest_Attic + "', '" + data.Cholest_Sinus + "', '" + data.Cholest_Other + "', '" + data.Cholest_NA + "', '" + data.Retraction_Post + "', '" + data.Retraction_Attic + "', '" + data.Retraction_NonAerME + "', '" + data.Retraction_Other + "', '" + data.Retraction_NA + "', '" + data.PerfSize + "', '" + data.PerfSite_Ant + "', '" + data.PerfSite_Post + "', '" + data.PerfSite_Inf + "', '" + data.PerfSite_Flaccida + "', '" + data.PerfSite_Total + "', '" + data.PerfSite_SubTotal + "', '" + data.PerfSite_NA + "', '" + data.Ossic_Mobile + "', '" + data.Ossic_Fixed + "', '" + data.Ossic_Eroded + "', '" + data.Ossic_NotAssessed + "', '" + data.Mucosa_Gran + "', '" + data.Mucosa_Oedem + "', '" + data.Mucosa_Fibro + "', '" + data.Mucosa_Tympano + "', '" + data.Mucosa_Normal + "', '" + data.Discharge + "', '" + data.Proc_Myringo + "', '" + data.Proc_Ossiculo + "', '" + data.Proc_Attico + "', '" + data.Proc_AtticoAntro + "', '" + data.Proc_ModRad + "', '" + data.Proc_Cortical + "', '" + data.Proc_Combined + "', '" + data.Proc_Stapedo + "', '" + data.Proc_Tympano + "', '" + data.Proc_WBC + "', '" + data.Proc_Other + "', '" + data.ChordaTymp + "', '" + data.GraftMeth + "', '" + data.GMat_Fasc + "', '" + data.GMat_Perichond + "', '" + data.GMat_PerichCart + "', '" + data.GMat_Cart + "', '" + data.GMat_PeriOst + "', '" + data.GMat_Homograft + "', '" + data.GMat_Fat + "', '" + data.GMat_Xeno + "', '" + data.GMat_Other + "', '" + data.GMat_NA + "', '" + data.Comments + "', '" + createdAt + "', '" + "1900-12-31T00:00:00" + "')";
				myWebSQL.webdb.executeSql(cmd, [], function(tx, results) {

					if (results.rowsAffected <= 0) {
						return callback(coaOffline.config.UPDATE_FAIL_JSON);
					} else {
						coaOffline.captureAction('createPreOp', org_data, function() {
							return callback(coaOffline.config.UPDATE_SUCCESS_JSON);
						});
					}
				});
				return;
			}

			if (coaOffline.user.level.match("^1")) {
				cmd = "INSERT into [Op] (CaseCode ,HospCode ,OpDate ,SurgGrd ,Supervised ,Cholest_Attic ,Cholest_Sinus ,Cholest_Other ,Cholest_NA ,Retraction_Post ,Retraction_Attic ,Retraction_NonAerME ,Retraction_Other ,Retraction_NA ,PerfSize ,PerfSite_Ant ,PerfSite_Post ,PerfSite_Inf ,PerfSite_Flaccida ,PerfSite_Total ,PerfSite_SubTotal ,PerfSite_NA ,Ossic_Mobile ,Ossic_Fixed ,Ossic_Eroded ,Ossic_NotAssessed ,Mucosa_Gran ,Mucosa_Oedem ,Mucosa_Fibro ,Mucosa_Tympano ,Mucosa_Normal ,Discharge ,Proc_Myringo ,Proc_Ossiculo ,Proc_Attico ,Proc_AtticoAntro ,Proc_ModRad ,Proc_Cortical ,Proc_Combined ,Proc_Stapedo ,Proc_Tympano ,Proc_WBC ,Proc_Other ,MostRecentAud,ChordaTymp ,GraftMeth ,GMat_Fasc ,GMat_Perichond ,GMat_PerichCart ,GMat_Cart ,GMat_PeriOst ,GMat_Homograft ,GMat_Fat ,GMat_Xeno ,GMat_Other ,GMat_NA ,Comments ,Entry_Date) VALUES('" + data.CaseCode + "', '" + data.HospCode + "', '" + data.OpDate + "', '" + data.SurgGrd + "', '" + data.Supervised + "', '" + data.Cholest_Attic + "', '" + data.Cholest_Sinus + "', '" + data.Cholest_Other + "', '" + data.Cholest_NA + "', '" + data.Retraction_Post + "', '" + data.Retraction_Attic + "', '" + data.Retraction_NonAerME + "', '" + data.Retraction_Other + "', '" + data.Retraction_NA + "', '" + data.PerfSize + "', '" + data.PerfSite_Ant + "', '" + data.PerfSite_Post + "', '" + data.PerfSite_Inf + "', '" + data.PerfSite_Flaccida + "', '" + data.PerfSite_Total + "', '" + data.PerfSite_SubTotal + "', '" + data.PerfSite_NA + "', '" + data.Ossic_Mobile + "', '" + data.Ossic_Fixed + "', '" + data.Ossic_Eroded + "', '" + data.Ossic_NotAssessed + "', '" + data.Mucosa_Gran + "', '" + data.Mucosa_Oedem + "', '" + data.Mucosa_Fibro + "', '" + data.Mucosa_Tympano + "', '" + data.Mucosa_Normal + "', '" + data.Discharge + "', '" + data.Proc_Myringo + "', '" + data.Proc_Ossiculo + "', '" + data.Proc_Attico + "', '" + data.Proc_AtticoAntro + "', '" + data.Proc_ModRad + "', '" + data.Proc_Cortical + "', '" + data.Proc_Combined + "', '" + data.Proc_Stapedo + "', '" + data.Proc_Tympano + "', '" + data.Proc_WBC + "', '" + data.Proc_Other + "'" + ", '1900-12-31T00:00:00', '" + data.ChordaTymp + "', '" + data.GraftMeth + "', '" + data.GMat_Fasc + "', '" + data.GMat_Perichond + "', '" + data.GMat_PerichCart + "', '" + data.GMat_Cart + "', '" + data.GMat_PeriOst + "', '" + data.GMat_Homograft + "', '" + data.GMat_Fat + "', '" + data.GMat_Xeno + "', '" + data.GMat_Other + "', '" + data.GMat_NA + "', '" + data.Comments + "', '" + createdAt + "'" + ")";
			} else if (coaOffline.user.level.match("^2")) {
				cmd = "INSERT into [Op]  (CaseCode,HospCode,OpDate,Anaesthetic,SurgGrd,Supervised,FacNerve,Fistula_Canal,Fistula_Footplate,Fistula_NotChecked,Fistula_Nil,PerfSize,PerfSite_TensaAnt,PerfSite_TensaPost,PerfSite_TensaInf,PerfSite_Flaccida,PerfSite_SubTotal,PerfSite_Total,PerfSite_NA,Retract_Mobility,Retraction_Ant,Retraction_Post,Retraction_Attic,Retraction_NonAerME,Retraction_other,Retraction_NA,Cholest_UnderTM,Cholest_SinusTymp,Cholest_Antrum,Cholest_ME,Cholest_Attic,Cholest_MastCells,Cholest_NA,OssEroded_Malleus,OssEroded_Incus,OssEroded_StapesSupra,OssEroded_Footplate,OssEroded_NotChecked,OssEroded_Nil,OssFixed_Footplate,OssFixed_MIJoint,OssFixed_ISJoint,OssFixed_Nil,Mucosa_Gran,Mucosa_Oedem,Mucosa_Fibro,Mucosa_Tympano,Mucosa_Normal,Discharge,Comments, Entry_Date, MostRecentAud) VALUES('" + data.CaseCode + "', '" + data.HospCode + "', '" + data.OpDate + "', '" + data.Anaesthetic + "', '" + data.SurgGrd + "', '" + data.Supervised + "', '" + data.FacNerve + "', '" + data.Fistula_Canal + "', '" + data.Fistula_Footplate + "', '" + data.Fistula_NotChecked + "', '" + data.Fistula_Nil + "', '" + data.PerfSize + "', '" + data.PerfSite_Ant + "', '" + data.PerfSite_Post + "', '" + data.PerfSite_Inf + "', '" + data.PerfSite_Flaccida + "', '" + data.PerfSite_SubTotal + "', '" + data.PerfSite_Total + "', '" + data.PerfSite_NA + "', '" + data.Retract_Mobility + "', '" + data.Retraction_Ant + "', '" + data.Retraction_Post + "', '" + data.Retraction_Attic + "', '" + data.Retraction_NonAerME + "', '" + data.Retraction_Other + "', '" + data.Retraction_NA + "', '" + data.Cholest_UnderTM + "', '" + data.Cholest_Sinus + "', '" + data.Cholest_Antrum + "', '" + data.Cholest_ME + "', '" + data.Cholest_Attic + "', '" + data.Cholest_MastCells + "', '" + data.Cholest_NA + "', '" + data.OssEroded_Malleus + "', '" + data.OssEroded_Incus + "', '" + data.OssEroded_StapesSupra + "', '" + data.OssEroded_Footplate + "', '" + data.OssEroded_NotChecked + "', '" + data.OssEroded_Nil + "', '" + data.OssFixed_Footplate + "', '" + data.OssFixed_MIJoint + "', '" + data.OssFixed_ISJoint + "', '" + data.OssFixed_Nil + "', '" + data.Mucosa_Gran + "', '" + data.Mucosa_Oedem + "', '" + data.Mucosa_Fibro + "', '" + data.Mucosa_Tympano + "', '" + data.Mucosa_Normal + "', '" + data.Discharge + "', '" + data.Comments + "', '" + createdAt + "', '" + "1900-12-31T00:00:00" + "')";
			}

			myWebSQL.webdb.executeSql(cmd, [], function(tx, results) {
				//console.info(tx, results);
				if (results.rowsAffected <= 0) {
					return callback(coaOffline.config.UPDATE_FAIL_JSON);
				} else {
					coaOffline.captureAction('createOperation', org_data, function() {
						return callback(coaOffline.config.UPDATE_SUCCESS_JSON);
					});
				}
			});
			return;
		} else {
			if (data.OpEar500BC == "N/A")
				data.OpEar500BC = "NULL";
			else
				data.OpEar500BC = "'" + data.OpEar500BC + "'";
			if (data.OpEar1000BC == "N/A")
				data.OpEar1000BC = "NULL";
			else
				data.OpEar1000BC = "'" + data.OpEar1000BC + "'";
			if (data.OpEar2000BC == "N/A")
				data.OpEar2000BC = "NULL";
			else
				data.OpEar2000BC = "'" + data.OpEar2000BC + "'";
			if (data.OpEar3000BC == "N/A")
				data.OpEar3000BC = "NULL";
			else
				data.OpEar3000BC = "'" + data.OpEar3000BC + "'";
			if (data.OpEar4000BC == "N/A")
				data.OpEar4000BC = "NULL";
			else
				data.OpEar4000BC = "'" + data.OpEar4000BC + "'";
			if (data.OpEar500AC == "N/A")
				data.OpEar500AC = "NULL";
			else
				data.OpEar500AC = "'" + data.OpEar500AC + "'";
			if (data.OpEar1000AC == "N/A")
				data.OpEar1000AC = "NULL";
			else
				data.OpEar1000AC = "'" + data.OpEar1000AC + "'";
			if (data.OpEar2000AC == "N/A")
				data.OpEar2000AC = "NULL";
			else
				data.OpEar2000AC = "'" + data.OpEar2000AC + "'";
			if (data.OpEar3000AC == "N/A")
				data.OpEar3000AC = "NULL";
			else
				data.OpEar3000AC = "'" + data.OpEar3000AC + "'";
			if (data.OpEar4000AC == "N/A")
				data.OpEar4000AC = "NULL";
			else
				data.OpEar4000AC = "'" + data.OpEar4000AC + "'";
			if (data.OpEar8000AC == "N/A")
				data.OpEar8000AC = "NULL";
			else
				data.OpEar8000AC = "'" + data.OpEar8000AC + "'";

			if (data.NonOpEar500BC == "N/A")
				data.NonOpEar500BC = "NULL";
			else
				data.NonOpEar500BC = "'" + data.NonOpEar500BC + "'";
			if (data.NonOpEar1000BC == "N/A")
				data.NonOpEar1000BC = "NULL";
			else
				data.NonOpEar1000BC = "'" + data.NonOpEar1000BC + "'";
			if (data.NonOpEar2000BC == "N/A")
				data.NonOpEar2000BC = "NULL";
			else
				data.NonOpEar2000BC = "'" + data.NonOpEar2000BC + "'";
			if (data.NonOpEar3000BC == "N/A")
				data.NonOpEar3000BC = "NULL";
			else
				data.NonOpEar3000BC = "'" + data.NonOpEar3000BC + "'";
			if (data.NonOpEar4000BC == "N/A")
				data.NonOpEar4000BC = "NULL";
			else
				data.NonOpEar4000BC = "'" + data.NonOpEar4000BC + "'";
			if (data.NonOpEar500AC == "N/A")
				data.NonOpEar500AC = "NULL";
			else
				data.NonOpEar500AC = "'" + data.NonOpEar500AC + "'";
			if (data.NonOpEar1000AC == "N/A")
				data.NonOpEar1000AC = "NULL";
			else
				data.NonOpEar1000AC = "'" + data.NonOpEar1000AC + "'";
			if (data.NonOpEar2000AC == "N/A")
				data.NonOpEar2000AC = "NULL";
			else
				data.NonOpEar2000AC = "'" + data.NonOpEar2000AC + "'";
			if (data.NonOpEar3000AC == "N/A")
				data.NonOpEar3000AC = "NULL";
			else
				data.NonOpEar3000AC = "'" + data.NonOpEar3000AC + "'";
			if (data.NonOpEar4000AC == "N/A")
				data.NonOpEar4000AC = "NULL";
			else
				data.NonOpEar4000AC = "'" + data.NonOpEar4000AC + "'";
			if (data.NonOpEar8000AC == "N/A")
				data.NonOpEar8000AC = "NULL";
			else
				data.NonOpEar8000AC = "'" + data.NonOpEar8000AC + "'";

			if (coaOffline.user.area == 'MA') {
				cmd = "INSERT into [Op] (CaseCode, HospCode, OpDate, SurgGrd, Supervised, Cholest_Attic, Cholest_Sinus, Cholest_Other, Cholest_NA, Retraction_Post, Retraction_Attic, Retraction_NonAerME, Retraction_Other, Retraction_NA, PerfSize, PerfSite_Ant, PerfSite_Post, PerfSite_Inf, PerfSite_Flaccida, PerfSite_Total, PerfSite_SubTotal, PerfSite_NA, Ossic_Mobile, Ossic_Fixed, Ossic_Eroded, Ossic_NotAssessed, Mucosa_Gran, Mucosa_Oedem, Mucosa_Fibro, Mucosa_Tympano, Mucosa_Normal, Discharge, Proc_Myringo, Proc_Ossiculo, Proc_Attico, Proc_AtticoAntro, Proc_ModRad, Proc_Cortical, Proc_Combined, Proc_Stapedo, Proc_Tympano, Proc_WBC, Proc_Other, PreInterval, OpEar500BC, OpEar1000BC, OpEar2000BC, OpEar3000BC, OpEar4000BC, OpEar500AC, OpEar1000AC, OpEar2000AC, OpEar3000AC, OpEar4000AC, OpEar8000AC, NonOpEar500BC, NonOpEar1000BC, NonOpEar2000BC, NonOpEar3000BC, NonOpEar4000BC, NonOpEar500AC, NonOpEar1000AC, NonOpEar2000AC, NonOpEar3000AC, NonOpEar4000AC, NonOpEar8000AC, ChordaTymp, GraftMeth, GMat_Fasc, GMat_Perichond, GMat_PerichCart, GMat_Cart, GMat_PeriOst, GMat_Homograft, GMat_Fat, GMat_Xeno, GMat_Other, GMat_NA, Comments, Entry_Date) VALUES('" + data.CaseCode + "', '" + data.HospCode + "', '" + data.OpDate + "', '" + data.SurgGrd + "', '" + data.Supervised + "', '" + data.Cholest_Attic + "', '" + data.Cholest_Sinus + "', '" + data.Cholest_Other + "', '" + data.Cholest_NA + "', '" + data.Retraction_Post + "', '" + data.Retraction_Attic + "', '" + data.Retraction_NonAerME + "', '" + data.Retraction_Other + "', '" + data.Retraction_NA + "', '" + data.PerfSize + "', '" + data.PerfSite_Ant + "', '" + data.PerfSite_Post + "', '" + data.PerfSite_Inf + "', '" + data.PerfSite_Flaccida + "', '" + data.PerfSite_Total + "', '" + data.PerfSite_SubTotal + "', '" + data.PerfSite_NA + "', '" + data.Ossic_Mobile + "', '" + data.Ossic_Fixed + "', '" + data.Ossic_Eroded + "', '" + data.Ossic_NotAssessed + "', '" + data.Mucosa_Gran + "', '" + data.Mucosa_Oedem + "', '" + data.Mucosa_Fibro + "', '" + data.Mucosa_Tympano + "', '" + data.Mucosa_Normal + "', '" + data.Discharge + "', '" + data.Proc_Myringo + "', '" + data.Proc_Ossiculo + "', '" + data.Proc_Attico + "', '" + data.Proc_AtticoAntro + "', '" + data.Proc_ModRad + "', '" + data.Proc_Cortical + "', '" + data.Proc_Combined + "', '" + data.Proc_Stapedo + "', '" + data.Proc_Tympano + "', '" + data.Proc_WBC + "', '" + data.Proc_Other + "', '" + data.PreInterval + "', " + data.OpEar500BC + ", " + data.OpEar1000BC + ", " + data.OpEar2000BC + ", " + data.OpEar3000BC + ", " + data.OpEar4000BC + ", " + data.OpEar500AC + ", " + data.OpEar1000AC + ", " + data.OpEar2000AC + ", " + data.OpEar3000AC + ", " + data.OpEar4000AC + ", " + data.OpEar8000AC + ", " + data.NonOpEar500BC + ", " + data.NonOpEar1000BC + ", " + data.NonOpEar2000BC + ", " + data.NonOpEar3000BC + ", " + data.NonOpEar4000BC + ", " + data.NonOpEar500AC + ", " + data.NonOpEar1000AC + ", " + data.NonOpEar2000AC + ", " + data.NonOpEar3000AC + ", " + data.NonOpEar4000AC + ", " + data.NonOpEar8000AC + ", '" + data.ChordaTymp + "', '" + data.GraftMeth + "', '" + data.GMat_Fasc + "', '" + data.GMat_Perichond + "', '" + data.GMat_PerichCart + "', '" + data.GMat_Cart + "', '" + data.GMat_PeriOst + "', '" + data.GMat_Homograft + "', '" + data.GMat_Fat + "', '" + data.GMat_Xeno + "', '" + data.GMat_Other + "', '" + data.GMat_NA + "', '" + data.Comments + "', '" + createdAt + "'" + ")";

				myWebSQL.webdb.executeSql(cmd, [], function(tx, results) {
					if (results.rowsAffected <= 0) {
						return callback(coaOffline.config.UPDATE_FAIL_JSON);
					} else {
						coaOffline.captureAction('createOperation', org_data, function() {
							return callback(coaOffline.config.UPDATE_SUCCESS_JSON);
						});
					}
				});
				return;
			}

			if (coaOffline.user.level.match("^1")) {
				cmd = "INSERT into [Op] ( CaseCode ,HospCode ,OpDate ,SurgGrd ,Supervised ,Cholest_Attic ,Cholest_Sinus ,Cholest_Other ,Cholest_NA ,Retraction_Post ,Retraction_Attic ,Retraction_NonAerME ,Retraction_Other ,Retraction_NA ,PerfSize ,PerfSite_Ant ,PerfSite_Post ,PerfSite_Inf ,PerfSite_Flaccida ,PerfSite_Total ,PerfSite_SubTotal ,PerfSite_NA ,Ossic_Mobile ,Ossic_Fixed ,Ossic_Eroded ,Ossic_NotAssessed ,Mucosa_Gran ,Mucosa_Oedem ,Mucosa_Fibro ,Mucosa_Tympano ,Mucosa_Normal ,Discharge ,Proc_Myringo ,Proc_Ossiculo ,Proc_Attico ,Proc_AtticoAntro ,Proc_ModRad ,Proc_Cortical ,Proc_Combined ,Proc_Stapedo ,Proc_Tympano ,Proc_WBC ,Proc_Other ,MostRecentAud ,OpEar500BC ,OpEar1000BC ,OpEar2000BC ,OpEar3000BC ,OpEar4000BC ,OpEar500AC ,OpEar1000AC ,OpEar2000AC ,OpEar3000AC ,OpEar4000AC ,OpEar8000AC ,NonOpEar500BC ,NonOpEar1000BC ,NonOpEar2000BC ,NonOpEar3000BC ,NonOpEar4000BC ,NonOpEar500AC ,NonOpEar1000AC ,NonOpEar2000AC ,NonOpEar3000AC ,NonOpEar4000AC ,NonOpEar8000AC ,ChordaTymp ,GraftMeth ,GMat_Fasc ,GMat_Perichond ,GMat_PerichCart ,GMat_Cart ,GMat_PeriOst ,GMat_Homograft ,GMat_Fat ,GMat_Xeno ,GMat_Other ,GMat_NA ,Comments ,Entry_Date) VALUES('" + data.CaseCode + "', '" + data.HospCode + "', '" + data.OpDate + "', '" + data.SurgGrd + "', '" + data.Supervised + "', '" + data.Cholest_Attic + "', '" + data.Cholest_Sinus + "', '" + data.Cholest_Other + "', '" + data.Cholest_NA + "', '" + data.Retraction_Post + "', '" + data.Retraction_Attic + "', '" + data.Retraction_NonAerME + "', '" + data.Retraction_Other + "', '" + data.Retraction_NA + "', '" + data.PerfSize + "', '" + data.PerfSite_Ant + "', '" + data.PerfSite_Post + "', '" + data.PerfSite_Inf + "', '" + data.PerfSite_Flaccida + "', '" + data.PerfSite_Total + "', '" + data.PerfSite_SubTotal + "', '" + data.PerfSite_NA + "', '" + data.Ossic_Mobile + "', '" + data.Ossic_Fixed + "', '" + data.Ossic_Eroded + "', '" + data.Ossic_NotAssessed + "', '" + data.Mucosa_Gran + "', '" + data.Mucosa_Oedem + "', '" + data.Mucosa_Fibro + "', '" + data.Mucosa_Tympano + "', '" + data.Mucosa_Normal + "', '" + data.Discharge + "', '" + data.Proc_Myringo + "', '" + data.Proc_Ossiculo + "', '" + data.Proc_Attico + "', '" + data.Proc_AtticoAntro + "', '" + data.Proc_ModRad + "', '" + data.Proc_Cortical + "', '" + data.Proc_Combined + "', '" + data.Proc_Stapedo + "', '" + data.Proc_Tympano + "', '" + data.Proc_WBC + "', '" + data.Proc_Other + "', '" + data.MostRecentAud + "', " + data.OpEar500BC + ", " + data.OpEar1000BC + ", " + data.OpEar2000BC + ", " + data.OpEar3000BC + ", " + data.OpEar4000BC + ", " + data.OpEar500AC + ", " + data.OpEar1000AC + ", " + data.OpEar2000AC + ", " + data.OpEar3000AC + ", " + data.OpEar4000AC + ", " + data.OpEar8000AC + ", " + data.NonOpEar500BC + ", " + data.NonOpEar1000BC + ", " + data.NonOpEar2000BC + ", " + data.NonOpEar3000BC + ", " + data.NonOpEar4000BC + ", " + data.NonOpEar500AC + ", " + data.NonOpEar1000AC + ", " + data.NonOpEar2000AC + ", " + data.NonOpEar3000AC + ", " + data.NonOpEar4000AC + ", " + data.NonOpEar8000AC + ", '" + data.ChordaTymp + "', '" + data.GraftMeth + "', '" + data.GMat_Fasc + "', '" + data.GMat_Perichond + "', '" + data.GMat_PerichCart + "', '" + data.GMat_Cart + "', '" + data.GMat_PeriOst + "', '" + data.GMat_Homograft + "', '" + data.GMat_Fat + "', '" + data.GMat_Xeno + "', '" + data.GMat_Other + "', '" + data.GMat_NA + "', '" + data.Comments + "', '" + createdAt + "'" + ")";
			} else if (coaOffline.user.level.match("^2")) {
				cmd = "INSERT into [Op]  (CaseCode,HospCode,OpDate,Anaesthetic,SurgGrd,Supervised,FacNerve,Fistula_Canal,Fistula_Footplate,Fistula_NotChecked,Fistula_Nil,PerfSize,PerfSite_TensaAnt,PerfSite_TensaPost,PerfSite_TensaInf,PerfSite_Flaccida,PerfSite_SubTotal,PerfSite_Total,PerfSite_NA,Retract_Mobility,Retraction_Ant,Retraction_Post,Retraction_Attic,Retraction_NonAerME,Retraction_other,Retraction_NA,Cholest_UnderTM,Cholest_SinusTymp,Cholest_Antrum,Cholest_ME,Cholest_Attic,Cholest_MastCells,Cholest_NA,OssEroded_Malleus,OssEroded_Incus,OssEroded_StapesSupra,OssEroded_Footplate,OssEroded_NotChecked,OssEroded_Nil,OssFixed_Footplate,OssFixed_MIJoint,OssFixed_ISJoint,OssFixed_Nil,Mucosa_Gran,Mucosa_Oedem,Mucosa_Fibro,Mucosa_Tympano,Mucosa_Normal,Discharge,MostRecentAud,OpEar500BC,OpEar1000BC,OpEar2000BC,OpEar3000BC,OpEar4000BC,OpEar500AC,OpEar1000AC,OpEar2000AC,OpEar3000AC,OpEar4000AC,OpEar8000AC,NonOpEar500BC,NonOpEar1000BC,NonOpEar2000BC,NonOpEar3000BC,NonOpEar4000BC,NonOpEar500AC,NonOpEar1000AC,NonOpEar2000AC,NonOpEar3000AC,NonOpEar4000AC,NonOpEar8000AC,Comments, Entry_Date) VALUES('" + data.CaseCode + "', '" + data.HospCode + "', '" + data.OpDate + "', '" + data.Anaesthetic + "', '" + data.SurgGrd + "', '" + data.Supervised + "', '" + data.FacNerve + "', '" + data.Fistula_Canal + "', '" + data.Fistula_Footplate + "', '" + data.Fistula_NotChecked + "', '" + data.Fistula_Nil + "', '" + data.PerfSize + "', '" + data.PerfSite_Ant + "', '" + data.PerfSite_Post + "', '" + data.PerfSite_Inf + "', '" + data.PerfSite_Flaccida + "', '" + data.PerfSite_SubTotal + "', '" + data.PerfSite_Total + "', '" + data.PerfSite_NA + "', '" + data.Retract_Mobility + "', '" + data.Retraction_Ant + "', '" + data.Retraction_Post + "', '" + data.Retraction_Attic + "', '" + data.Retraction_NonAerME + "', '" + data.Retraction_Other + "', '" + data.Retraction_NA + "', '" + data.Cholest_UnderTM + "', '" + data.Cholest_Sinus + "', '" + data.Cholest_Antrum + "', '" + data.Cholest_ME + "', '" + data.Cholest_Attic + "', '" + data.Cholest_MastCells + "', '" + data.Cholest_NA + "', '" + data.OssEroded_Malleus + "', '" + data.OssEroded_Incus + "', '" + data.OssEroded_StapesSupra + "', '" + data.OssEroded_Footplate + "', '" + data.OssEroded_NotChecked + "', '" + data.OssEroded_Nil + "', '" + data.OssFixed_Footplate + "', '" + data.OssFixed_MIJoint + "', '" + data.OssFixed_ISJoint + "', '" + data.OssFixed_Nil + "', '" + data.Mucosa_Gran + "', '" + data.Mucosa_Oedem + "', '" + data.Mucosa_Fibro + "', '" + data.Mucosa_Tympano + "', '" + data.Mucosa_Normal + "', '" + data.Discharge + "', '" + data.MostRecentAud + "', " + data.OpEar500BC + ", " + data.OpEar1000BC + ", " + data.OpEar2000BC + ", " + data.OpEar3000BC + ", " + data.OpEar4000BC + ", " + data.OpEar500AC + ", " + data.OpEar1000AC + ", " + data.OpEar2000AC + ", " + data.OpEar3000AC + ", " + data.OpEar4000AC + ", " + data.OpEar8000AC + ", " + data.NonOpEar500BC + ", " + data.NonOpEar1000BC + ", " + data.NonOpEar2000BC + ", " + data.NonOpEar3000BC + ", " + data.NonOpEar4000BC + ", " + data.NonOpEar500AC + ", " + data.NonOpEar1000AC + ", " + data.NonOpEar2000AC + ", " + data.NonOpEar3000AC + ", " + data.NonOpEar4000AC + ", " + data.NonOpEar8000AC + ", '" + data.Comments + "', '" + data.createdAt + "')";
			}

			myWebSQL.webdb.executeSql(cmd, [], function(tx, results) {
				if (results.rowsAffected <= 0) {
					return callback(coaOffline.config.UPDATE_FAIL_JSON);
				} else {
					coaOffline.captureAction('createOperation', org_data, function() {
						return callback(coaOffline.config.UPDATE_SUCCESS_JSON);
					});
				}
			});
			return;
		}

	};
	step1(data, callback);
	return false;
};
coaOffline.createPostOp = function(data, callback) {
	var org_data = JSON.parse(JSON.stringify(data));
	if(data.AssDate) data.AssDate = data.AssDate.replace( /(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1 00:00:00");
	//data.AssDate = genDateTimeString(new Date(data.AssDate));

	var step1 = function(data, callback) {// check existing
		//console.info("createPostOp", "step1", data);
		var cmd = "SELECT CaseCode from [PostOp] where CaseCode = '" + data.CaseCode + "' and HospCode = '" + data.HospCode + "' and AssInterval = '" + data.AssInterval + "'";
		myWebSQL.webdb.executeSql(cmd, [], function(tx, results) {
			if (results.rows.length > 0) {
				return callback(coaOffline.config.DATA_EXIST_JSON);
			} else {
				return step2(data, callback);
			}
		});
	};
	var step2 = function(data, callback) {
		//console.info("createPostOp", "step2", data);
		var createdAt = genDateTimeString(new Date());
		var cmd = '';
		if (data.audiogramNotPossible == 'Y') {
			if (coaOffline.user.area == 'MA') {
				cmd = "INSERT into [PostOp] (CaseCode, HospCode, AssInterval, AssDate, Discharge, Complics_Palsy, Complics_Tinnitus, Complics_Vertigo, Complics_Hearing, Complics_WInfection, Complics_Taste, Complics_Other, Complics_None, Cholest_Recur, Cholest_Resid, Cholest_NA, OA_Intact, OA_NotIntact, OA_Myringitis, OA_AntBlunt, OA_Atelectasis, OA_Retraction, OA_Lateralization, OA_MeatalStenosis, OA_CompleteCollapse, OA_OME, OA_NotAssessed, OA_Normal, Comments, Entry_Date) VALUES('" + data.CaseCode + "', '" + data.HospCode + "', '" + data.AssInterval + "', '" + data.AssDate + "', '" + data.Discharge + "', '" + data.Complics_Palsy + "', '" + data.Complics_Tinnitus + "', '" + data.Complics_Vertigo + "', '" + data.Complics_Hearing + "', '" + data.Complics_WInfection + "', '" + data.Complics_Taste + "', '" + data.Complics_Other + "', '" + data.Complics_None + "', '" + data.Cholest_Recur + "', '" + data.Cholest_Resid + "', '" + data.Cholest_NA + "', '" + data.OA_Intact + "', '" + data.OA_NotIntact + "', '" + data.OA_Myringitis + "', '" + data.OA_AntBlunt + "', '" + data.OA_Atelectasis + "', '" + data.OA_Retraction + "', '" + data.OA_Lateralization + "', '" + data.OA_MeatalStenosis + "', '" + data.OA_CompleteCollapse + "', '" + data.OA_OME + "', '" + data.OA_NotAssessed + "', '" + data.OA_Normal + "', '" + data.Comments + "', '" + createdAt + "')";
				myWebSQL.webdb.executeSql(cmd, [], function(tx, results) {
					if (results.rowsAffected <= 0) {
						return callback(coaOffline.config.UPDATE_FAIL_JSON);
					} else {
						coaOffline.captureAction('createPostOp', org_data, function() {
						return callback(coaOffline.config.UPDATE_SUCCESS_JSON);
					});
					}
				});
				return;
			}

			if (coaOffline.user.level.match("^1")) {
				cmd = "INSERT into [PostOp] (CaseCode, HospCode, AssInterval, AssDate, Discharge, Complics_Palsy, Complics_Tinnitus, Complics_Vertigo, Complics_Hearing, Complics_WInfection, Complics_Taste, Complics_Other, Complics_None, Cholest_Recur, Cholest_Resid, Cholest_NA, OA_Intact, OA_NotIntact, OA_Myringitis, OA_AntBlunt, OA_Atelectasis, OA_Retraction, OA_Lateralization, OA_MeatalStenosis, OA_CompleteCollapse, OA_OME, OA_NotAssessed, OA_Normal, Comments, Entry_Date) VALUES('" + data.CaseCode + "', '" + data.HospCode + "', '" + data.AssInterval + "', '" + data.AssDate + "', '" + data.Discharge + "', '" + data.Complics_Palsy + "', '" + data.Complics_Tinnitus + "', '" + data.Complics_Vertigo + "', '" + data.Complics_Hearing + "', '" + data.Complics_WInfection + "', '" + data.Complics_Taste + "', '" + data.Complics_Other + "', '" + data.Complics_None + "', '" + data.Cholest_Recur + "', '" + data.Cholest_Resid + "', '" + data.Cholest_NA + "', '" + data.OA_Intact + "', '" + data.OA_NotIntact + "', '" + data.OA_Myringitis + "', '" + data.OA_AntBlunt + "', '" + data.OA_Atelectasis + "', '" + data.OA_Retraction + "', '" + data.OA_Lateralization + "', '" + data.OA_MeatalStenosis + "', '" + data.OA_CompleteCollapse + "', '" + data.OA_OME + "', '" + data.OA_NotAssessed + "', '" + data.OA_Normal + "', '" + data.Comments + "', '" + createdAt + "')";
			} else if (coaOffline.user.level.match("^2")) {
				cmd = "INSERT into [PostOp] (CaseCode, HospCode, AssInterval, AssDate, Discharge, Complics_Palsy, Complics_Tinnitus, Complics_Vertigo, Complics_Hearing, Complics_WInfection, Complics_Taste, Complics_Other, Complics_None, Cholest_Recur, Cholest_Resid, Cholest_NA, OA_Intact, OA_NotIntact, OA_Myringitis, OA_AntBlunt, OA_Atelectasis, OA_Retraction, OA_Lateralization, OA_MeatalStenosis, OA_CompleteCollapse, OA_OME, OA_NotAssessed, OA_Normal, Comments, Ossic_Pros, Cholest_None, Entry_Date) VALUES('" + data.CaseCode + "', '" + data.HospCode + "', '" + data.AssInterval + "', '" + data.AssDate + "', '" + data.Discharge + "', '" + data.Complics_Palsy + "', '" + data.Complics_Tinnitus + "', '" + data.Complics_Vertigo + "', '" + data.Complics_Hearing + "', '" + data.Complics_WInfection + "', '" + data.Complics_Taste + "', '" + data.Complics_Other + "', '" + data.Complics_None + "', '" + data.Cholest_Recur + "', '" + data.Cholest_Resid + "', '" + data.Cholest_NA + "', '" + data.OA_Intact + "', '" + data.OA_NotIntact + "', '" + data.OA_Myringitis + "', '" + data.OA_AntBlunt + "', '" + data.OA_Atelectasis + "', '" + data.OA_Retraction + "', '" + data.OA_Lateralization + "', '" + data.OA_MeatalStenosis + "', '" + data.OA_CompleteCollapse + "', '" + data.OA_OME + "', '" + data.OA_NotAssessed + "', '" + data.OA_Normal + "', '" + data.Comments + "', '" + data.Ossic_Pros + "', '" + data.Cholest_None + "', '" + createdAt + "')";
			}

			myWebSQL.webdb.executeSql(cmd, [], function(tx, results) {
				if (results.rowsAffected <= 0) {
					return callback(coaOffline.config.UPDATE_FAIL_JSON);
				} else {
					coaOffline.captureAction('createPostOp', org_data, function() {
						return callback(coaOffline.config.UPDATE_SUCCESS_JSON);
					});
				}
			});
			return;
		} else {
			if (data.OpEar500BC == "N/A")
				data.OpEar500BC = "NULL";
			else
				data.OpEar500BC = "'" + data.OpEar500BC + "'";
			if (data.OpEar1000BC == "N/A")
				data.OpEar1000BC = "NULL";
			else
				data.OpEar1000BC = "'" + data.OpEar1000BC + "'";
			if (data.OpEar2000BC == "N/A")
				data.OpEar2000BC = "NULL";
			else
				data.OpEar2000BC = "'" + data.OpEar2000BC + "'";
			if (data.OpEar3000BC == "N/A")
				data.OpEar3000BC = "NULL";
			else
				data.OpEar3000BC = "'" + data.OpEar3000BC + "'";
			if (data.OpEar4000BC == "N/A")
				data.OpEar4000BC = "NULL";
			else
				data.OpEar4000BC = "'" + data.OpEar4000BC + "'";
			if (data.OpEar500AC == "N/A")
				data.OpEar500AC = "NULL";
			else
				data.OpEar500AC = "'" + data.OpEar500AC + "'";
			if (data.OpEar1000AC == "N/A")
				data.OpEar1000AC = "NULL";
			else
				data.OpEar1000AC = "'" + data.OpEar1000AC + "'";
			if (data.OpEar2000AC == "N/A")
				data.OpEar2000AC = "NULL";
			else
				data.OpEar2000AC = "'" + data.OpEar2000AC + "'";
			if (data.OpEar3000AC == "N/A")
				data.OpEar3000AC = "NULL";
			else
				data.OpEar3000AC = "'" + data.OpEar3000AC + "'";
			if (data.OpEar4000AC == "N/A")
				data.OpEar4000AC = "NULL";
			else
				data.OpEar4000AC = "'" + data.OpEar4000AC + "'";
			if (data.OpEar8000AC == "N/A")
				data.OpEar8000AC = "NULL";
			else
				data.OpEar8000AC = "'" + data.OpEar8000AC + "'";

			if (data.NonOpEar500BC == "N/A")
				data.NonOpEar500BC = "NULL";
			else
				data.NonOpEar500BC = "'" + data.NonOpEar500BC + "'";
			if (data.NonOpEar1000BC == "N/A")
				data.NonOpEar1000BC = "NULL";
			else
				data.NonOpEar1000BC = "'" + data.NonOpEar1000BC + "'";
			if (data.NonOpEar2000BC == "N/A")
				data.NonOpEar2000BC = "NULL";
			else
				data.NonOpEar2000BC = "'" + data.NonOpEar2000BC + "'";
			if (data.NonOpEar3000BC == "N/A")
				data.NonOpEar3000BC = "NULL";
			else
				data.NonOpEar3000BC = "'" + data.NonOpEar3000BC + "'";
			if (data.NonOpEar4000BC == "N/A")
				data.NonOpEar4000BC = "NULL";
			else
				data.NonOpEar4000BC = "'" + data.NonOpEar4000BC + "'";
			if (data.NonOpEar500AC == "N/A")
				data.NonOpEar500AC = "NULL";
			else
				data.NonOpEar500AC = "'" + data.NonOpEar500AC + "'";
			if (data.NonOpEar1000AC == "N/A")
				data.NonOpEar1000AC = "NULL";
			else
				data.NonOpEar1000AC = "'" + data.NonOpEar1000AC + "'";
			if (data.NonOpEar2000AC == "N/A")
				data.NonOpEar2000AC = "NULL";
			else
				data.NonOpEar2000AC = "'" + data.NonOpEar2000AC + "'";
			if (data.NonOpEar3000AC == "N/A")
				data.NonOpEar3000AC = "NULL";
			else
				data.NonOpEar3000AC = "'" + data.NonOpEar3000AC + "'";
			if (data.NonOpEar4000AC == "N/A")
				data.NonOpEar4000AC = "NULL";
			else
				data.NonOpEar4000AC = "'" + data.NonOpEar4000AC + "'";
			if (data.NonOpEar8000AC == "N/A")
				data.NonOpEar8000AC = "NULL";
			else
				data.NonOpEar8000AC = "'" + data.NonOpEar8000AC + "'";

			if (coaOffline.user.area == 'MA') {
				cmd = "INSERT into [PostOp] (CaseCode, HospCode, AssInterval, AssDate, Discharge, Complics_Palsy, Complics_Tinnitus, Complics_Vertigo, Complics_Hearing, Complics_WInfection, Complics_Taste, Complics_Other, Complics_None, Cholest_Recur, Cholest_Resid, Cholest_NA, OpEar500BC, OpEar1000BC, OpEar2000BC, OpEar3000BC, OpEar4000BC, OpEar500AC, OpEar1000AC, OpEar2000AC, OpEar3000AC, OpEar4000AC, OpEar8000AC, OA_Intact, OA_NotIntact, OA_Myringitis, OA_AntBlunt, OA_Atelectasis, OA_Retraction, OA_Lateralization, OA_MeatalStenosis, OA_CompleteCollapse, OA_OME, OA_NotAssessed, OA_Normal, Comments, Entry_Date) VALUES('" + data.CaseCode + "', '" + data.HospCode + "', '" + data.AssInterval + "', '" + data.AssDate + "', '" + data.Discharge + "', '" + data.Complics_Palsy + "', '" + data.Complics_Tinnitus + "', '" + data.Complics_Vertigo + "', '" + data.Complics_Hearing + "', '" + data.Complics_WInfection + "', '" + data.Complics_Taste + "', '" + data.Complics_Other + "', '" + data.Complics_None + "', '" + data.Cholest_Recur + "', '" + data.Cholest_Resid + "', '" + data.Cholest_NA + "', " + data.OpEar500BC + ", " + data.OpEar1000BC + ", " + data.OpEar2000BC + ", " + data.OpEar3000BC + ", " + data.OpEar4000BC + ", " + data.OpEar500AC + ", " + data.OpEar1000AC + ", " + data.OpEar2000AC + ", " + data.OpEar3000AC + ", " + data.OpEar4000AC + ", " + data.OpEar8000AC + ", '" + data.OA_Intact + "', '" + data.OA_NotIntact + "', '" + data.OA_Myringitis + "', '" + data.OA_AntBlunt + "', '" + data.OA_Atelectasis + "', '" + data.OA_Retraction + "', '" + data.OA_Lateralization + "', '" + data.OA_MeatalStenosis + "', '" + data.OA_CompleteCollapse + "', '" + data.OA_OME + "', '" + data.OA_NotAssessed + "', '" + data.OA_Normal + "', '" + data.Comments + "', '" + createdAt + "')";

				myWebSQL.webdb.executeSql(cmd, [], function(tx, results) {
					if (results.rowsAffected <= 0) {
						return callback(coaOffline.config.UPDATE_FAIL_JSON);
					} else {
						coaOffline.captureAction('createPostOp', org_data, function() {
							return callback(coaOffline.config.UPDATE_SUCCESS_JSON);
						});
					}
				});
				return;
			}

			if (coaOffline.user.level.match("^1")) {
				cmd = "INSERT into [PostOp] (CaseCode, HospCode, AssInterval, AssDate, Discharge, Complics_Palsy, Complics_Tinnitus, Complics_Vertigo, Complics_Hearing, Complics_WInfection, Complics_Taste, Complics_Other, Complics_None, Cholest_Recur, Cholest_Resid, Cholest_NA, OpEar500BC, OpEar1000BC, OpEar2000BC, OpEar3000BC, OpEar4000BC, OpEar500AC, OpEar1000AC, OpEar2000AC, OpEar3000AC, OpEar4000AC, OpEar8000AC, OA_Intact, OA_NotIntact, OA_Myringitis, OA_AntBlunt, OA_Atelectasis, OA_Retraction, OA_Lateralization, OA_MeatalStenosis, OA_CompleteCollapse, OA_OME, OA_NotAssessed, OA_Normal, Comments, Entry_Date) VALUES('" + data.CaseCode + "', '" + data.HospCode + "', '" + data.AssInterval + "', '" + data.AssDate + "', '" + data.Discharge + "', '" + data.Complics_Palsy + "', '" + data.Complics_Tinnitus + "', '" + data.Complics_Vertigo + "', '" + data.Complics_Hearing + "', '" + data.Complics_WInfection + "', '" + data.Complics_Taste + "', '" + data.Complics_Other + "', '" + data.Complics_None + "', '" + data.Cholest_Recur + "', '" + data.Cholest_Resid + "', '" + data.Cholest_NA + "', " + data.OpEar500BC + ", " + data.OpEar1000BC + ", " + data.OpEar2000BC + ", " + data.OpEar3000BC + ", " + data.OpEar4000BC + ", " + data.OpEar500AC + ", " + data.OpEar1000AC + ", " + data.OpEar2000AC + ", " + data.OpEar3000AC + ", " + data.OpEar4000AC + ", " + data.OpEar8000AC + ", '" + data.OA_Intact + "', '" + data.OA_NotIntact + "', '" + data.OA_Myringitis + "', '" + data.OA_AntBlunt + "', '" + data.OA_Atelectasis + "', '" + data.OA_Retraction + "', '" + data.OA_Lateralization + "', '" + data.OA_MeatalStenosis + "', '" + data.OA_CompleteCollapse + "', '" + data.OA_OME + "', '" + data.OA_NotAssessed + "', '" + data.OA_Normal + "', '" + data.Comments + "', '" + createdAt + "')";
			} else if (coaOffline.user.level.match("^2")) {
				cmd = "INSERT into [PostOp] (CaseCode, HospCode, AssInterval, AssDate, Discharge, Complics_Palsy, Complics_Tinnitus, Complics_Vertigo, Complics_Hearing, Complics_WInfection, Complics_Taste, Complics_Other, Complics_None, Cholest_Recur, Cholest_Resid, Cholest_NA, OpEar500BC, OpEar1000BC, OpEar2000BC, OpEar3000BC, OpEar4000BC, OpEar500AC, OpEar1000AC, OpEar2000AC, OpEar3000AC, OpEar4000AC, OpEar8000AC, OA_Intact, OA_NotIntact, OA_Myringitis, OA_AntBlunt, OA_Atelectasis, OA_Retraction, OA_Lateralization, OA_MeatalStenosis, OA_CompleteCollapse, OA_OME, OA_NotAssessed, OA_Normal, Comments, Ossic_Pros, Cholest_None, Entry_Date) VALUES('" + data.CaseCode + "', '" + data.HospCode + "', '" + data.AssInterval + "', '" + data.AssDate + "', '" + data.Discharge + "', '" + data.Complics_Palsy + "', '" + data.Complics_Tinnitus + "', '" + data.Complics_Vertigo + "', '" + data.Complics_Hearing + "', '" + data.Complics_WInfection + "', '" + data.Complics_Taste + "', '" + data.Complics_Other + "', '" + data.Complics_None + "', '" + data.Cholest_Recur + "', '" + data.Cholest_Resid + "', '" + data.Cholest_NA + "', " + data.OpEar500BC + ", " + data.OpEar1000BC + ", " + data.OpEar2000BC + ", " + data.OpEar3000BC + ", " + data.OpEar4000BC + ", " + data.OpEar500AC + ", " + data.OpEar1000AC + ", " + data.OpEar2000AC + ", " + data.OpEar3000AC + ", " + data.OpEar4000AC + ", " + data.OpEar8000AC + ", '" + data.OA_Intact + "', '" + data.OA_NotIntact + "', '" + data.OA_Myringitis + "', '" + data.OA_AntBlunt + "', '" + data.OA_Atelectasis + "', '" + data.OA_Retraction + "', '" + data.OA_Lateralization + "', '" + data.OA_MeatalStenosis + "', '" + data.OA_CompleteCollapse + "', '" + data.OA_OME + "', '" + data.OA_NotAssessed + "', '" + data.OA_Normal + "', '" + data.Comments + "', '" + data.Ossic_Pros + "', '" + data.Cholest_None + "', '" + createdAt + "')";
			}

			myWebSQL.webdb.executeSql(cmd, [], function(tx, results) {
				if (results.rowsAffected <= 0) {
					return callback(coaOffline.config.UPDATE_FAIL_JSON);
				} else {
					coaOffline.captureAction('createPostOp', org_data, function() {
						return callback(coaOffline.config.UPDATE_SUCCESS_JSON);
					});
				}
			});
			return;
		}

	};
	step1(data, callback);
	return false;
};
coaOffline.createProcedure = function(data, callback) {
	var org_data = JSON.parse(JSON.stringify(data));
	var step1 = function(data, callback) {// check existing
		//console.info("createProcedure", "step1", data);
		var cmd = "SELECT CaseCode from [Procedure] where CaseCode = '" + data.CaseCode + "' and HospCode = '" + data.HospCode + "'";
		myWebSQL.webdb.executeSql(cmd, [], function(tx, results) {
			if (results.rows.length > 0) {
				return callback(coaOffline.config.DATA_EXIST_JSON);
			} else {
				return step2(data, callback);
			}
		});
	};
	var step2 = function(data, callback) {
		//console.info("createProcedure", "step2", data);
		var createdAt = genDateTimeString(new Date());
		var cmd = '';
		cmd = "INSERT into [Procedure] (CaseCode, HospCode, Nature, Approach, MatME_GelFilm, MatME_GelFoam, MatME_Cartilage, MatME_Silastic, MatME_Nil, Meato_Bony, Meato_Cartilaginous, Meato_Nil, Myringo_Mat, GraftMeth, OssicDefect_Malleus, OssicDefect_Incus, OssicDefect_StapesSupra, OssicDefect_Footplate, OssicDefect_Nil, Ossic_Mat, Ossic_Pros, Ossic_Recon, Mastoidectomy, OblitFlap_Palva, OblitFlap_Muscle, OblitFlap_Fascial, OblitFlap_MidTemporal, OblitFlap_TempParietal, OblitFlap_NA, OblitMat_BonePaste, OblitMat_BoneChips, OblitMat_Cartilage, OblitMat_HAGranules, OblitMat_SerenoCem, OblitMat_FatBlind, OblitMat_NA, CW_Recon, Stapes_Op, Stapes_Chorda, Stapes_Fensize, Stapes_ProsType, Stapes_ProsSize, Stapes_Attach, Stapes_IntTissue, Fen_Pick, Fen_Drill, Fen_Laser, Fen_NA, Laser, WinSeal_Fat, WinSeal_BloodClot, WinSeal_Other, WinSeal_GelFoam, WinSeal_Nil, Comments, Entry_Date, OblitMat_Bioglass, OtoEndosopicMethod, OtoEndosopicSize, OtoEndosopicLength, OtoEndosopicAngle) VALUES('" + data.CaseCode + "', '" + data.HospCode + "', '" + data.Nature + "', '" + data.Approach + "', '" + data.MatME_GelFilm + "', '" + data.MatME_GelFoam + "', '" + data.MatME_Cartilage + "', '" + data.MatME_Silastic + "', '" + data.MatME_Nil + "', '" + data.Meato_Bony + "', '" + data.Meato_Cartilaginous + "', '" + data.Meato_Nil + "', '" + data.Myringo_Mat + "', '" + data.GraftMeth + "', '" + data.OssicDefect_Malleus + "', '" + data.OssicDefect_Incus + "', '" + data.OssicDefect_StapesSupra + "', '" + data.OssicDefect_Footplate + "', '" + data.OssicDefect_Nil + "', '" + data.Ossic_Mat + "', '" + data.Ossic_Pros + "', '" + data.Ossic_Recon + "', '" + data.Mastoidectomy + "', '" + data.OblitFlap_Palva + "', '" + data.OblitFlap_Muscle + "', '" + data.OblitFlap_Fascial + "', '" + data.OblitFlap_MidTemporal + "', '" + data.OblitFlap_TempParietal + "', '" + data.OblitFlap_NA + "', '" + data.OblitMat_BonePaste + "', '" + data.OblitMat_BoneChips + "', '" + data.OblitMat_Cartilage + "', '" + data.OblitMat_HAGranules + "', '" + data.OblitMat_SerenoCem + "', '" + data.OblitMat_FatBlind + "', '" + data.OblitMat_NA + "', '" + data.CW_Recon + "', '" + data.Stapes_Op + "', '" + data.Stapes_Chorda + "', '" + data.Stapes_Fensize + "', '" + data.Stapes_ProsType + "', '" + data.Stapes_ProsSize + "', '" + data.Stapes_Attach + "', '" + data.Stapes_IntTissue + "', '" + data.Fen_Pick + "', '" + data.Fen_Drill + "', '" + data.Fen_Laser + "', '" + data.Fen_NA + "', '" + data.Laser + "', '" + data.WinSeal_Fat + "', '" + data.WinSeal_BloodClot + "', '" + data.WinSeal_Other + "', '" + data.WinSeal_GelFoam + "', '" + data.WinSeal_Nil + "', '" + data.Comments + "', '" + createdAt + "', '" + data.OblitMat_Bioglass + "', '" + data.OtoEndosopicMethod + "', '" + data.OtoEndosopicSize + "', '" + data.OtoEndosopicLength + "', '" + data.OtoEndosopicAngle+ "'" + ")";

		myWebSQL.webdb.executeSql(cmd, [], function(tx, results) {
			if (results.rowsAffected <= 0) {
				return callback(coaOffline.config.UPDATE_FAIL_JSON);
			} else {
				coaOffline.captureAction('createProcedure', org_data, function() {
					return callback(coaOffline.config.UPDATE_SUCCESS_JSON);
				});
			}
		});
		return;

	};
	step1(data, callback);
	return false;
};
coaOffline.searchCase = function(data, callback) {
	var json = {
		"Rows" : []
	};
	if (coaOffline.user.area == 'MA') {
		myWebSQL.webdb.select("PreOp", "CaseCode", "HospCode ='" + data.HospCode + "' and PatCode = '" + data.PatCode + "'", function(tx, results) {
			for (var i = 0; i < results.rows.length; ++i) {
				var item = results.rows.item(i);
				json.Rows.push(item);
			};
			callback(json);
		});
		return;

	}
	if (coaOffline.user.level.match("^1") || coaOffline.user.level.match("^2")) {
		myWebSQL.webdb.select("PreOp", "CaseCode, For_MA", "HospCode ='" + data.HospCode + "' and PatCode = '" + data.PatCode + "'", function(tx, results) {
			for (var i = 0; i < results.rows.length; ++i) {
				var item = results.rows.item(i);
				json.Rows.push(item);
			};
			callback(json);
		});
		return;
	} else {
		return callback(coaOffline.config.ERROR_JSON);
	}
	return false;
};
coaOffline.getPreOpDetails = function(data, callback) {
	var json = {
		"Rows" : []
	};
	myWebSQL.webdb.select("PreOp op, Patient p", "op.*, p.[Sex], p.[DoB]", "p.HospCode = op.HospCode and p.PatCode = op.PatCode and op.HospCode ='" + data.HospCode + "' and op.PatCode = '" + data.PatCode + "' and op.CaseCode = '" + data.CaseCode + "'", function(tx, results) {
		for (var i = 0; i < results.rows.length; ++i) {
			var item = results.rows.item(i);
			json.Rows.push(item);
		};
		callback(json);
	});
	return false;
};
coaOffline.getOperationDetails = function(data, callback) {
	var json = {
		"Rows" : []
	};
	myWebSQL.webdb.select("Op", "*", "HospCode ='" + data.HospCode + "' and CaseCode = '" + data.CaseCode + "'", function(tx, results) {
		for (var i = 0; i < results.rows.length; ++i) {
			var item = results.rows.item(i);
			json.Rows.push(item);
		};
		callback(json);
	});
	return false;
};
coaOffline.getPostOpDetails = function(data, callback) {
	var json = {
		"Rows" : []
	};

	myWebSQL.webdb.select("[PostOp] post, [Op] op", "post.*, op.Opdate", "post.HospCode = op.HospCode and post.CaseCode = op.CaseCode and post.HospCode ='" + data.HospCode + "' and post.CaseCode = '" + data.CaseCode + "' and post.AssInterval = " + data.AssInterval, function(tx, results) {
		for (var i = 0; i < results.rows.length; ++i) {
			var item = results.rows.item(i);
			json.Rows.push(item);
		};
		callback(json);
	});
	return false;
};
coaOffline.getProcedureDetails = function(data, callback) {
	var json = {
		"Rows" : []
	};
	myWebSQL.webdb.select("Procedure", "*", "HospCode ='" + data.HospCode + "' and CaseCode = '" + data.CaseCode + "'", function(tx, results) {
		for (var i = 0; i < results.rows.length; ++i) {
			var item = results.rows.item(i);
			json.Rows.push(item);
		};
		callback(json);
	});
	return false;
};
coaOffline.getUserName = function(data, callback) {
	var json = {
		"Rows" : []
	};
	data.hospital_no = coaOffline.user.HospCode;
	data.user_name = coaOffline.user.name;

	myWebSQL.webdb.select("[users] u", "u.[user_level], u.[Surname], u.[Forename]", "u.[hospital_no]='" + data.hospital_no + "' and u.[user_name]= '" + data.user_name + "'", function(tx, results) {
		for (var i = 0; i < results.rows.length; ++i) {
			var item = results.rows.item(i);
			json.Rows.push(item);
		};
		callback(json);
	});
	return false;
};
coaOffline.getUserProfile = function(data, callback) {
	var json = {
		"Rows" : []
	};

	data.hospital_no = coaOffline.user.HospCode;
	data.user_name = coaOffline.user.name;

	myWebSQL.webdb.select("[users] u, [hospitals] h", "u.*, h.[hospital_address], h.[name_of_hospital]", "h.hospital_no = u.hospital_no and u.[hospital_no]='" + data.hospital_no + "' and u.[user_name]= '" + data.user_name + "'", function(tx, results) {
		for (var i = 0; i < results.rows.length; ++i) {
			var item = results.rows.item(i);
			json.Rows.push(item);
		};
		callback(json);
	});
	return false;
};

