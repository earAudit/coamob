
var datamanager=function(filename){
    this.store=new Lawnchair({adapter:'dom',name:filename}, function (store){
                   
                            });
};

datamanager.prototype.saveData= function saveData(data){
	this.store.save(data);
};

datamanager.prototype.getData= function getData(key){
	var result;
    this.store.get(key,function(t){
                   result= t;
    });
	return result;
};
datamanager.prototype.removeData= function removeData(key){
	this.store.remove(key);
};
datamanager.prototype.getAllData= function getAllData(){
	var result;

    this.store.all(function (r){
    
                  		result=r;
                   });
	return result;
};
datamanager.prototype.clearAllData= function clearAllData(){
	this.store.nuke();
};

datamanager.prototype.getDataCount = function getDataCount(){
	// alert(this.getAllData().length);
	return this.getAllData().length;
};