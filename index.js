var Enumerable = require("./linq")
var crypto = require('crypto')
var fs = require("fs")
var algorithm = 'aes-256-ctr'
module.exports = function(file, password){
	password = password || "429GUWwqQ8IE7c9G"
	if(!fs.existsSync(file)){
		var newObj = {}
		fs.writeFileSync(file, encrypt(JSON.stringify(newObj)))
	}
	function encrypt(text){
		var cipher = crypto.createCipher(algorithm, password)
		var crypted = cipher.update(text,'utf8','binary')
		crypted += cipher.final('binary')
		return crypted
	}
	function decrypt(text){
		var decipher = crypto.createDecipher(algorithm, password)
		var decrypted = decipher.update(text,'binary','utf8')
		decrypted += decipher.final('utf8')
		return decrypted
	}
	function update(obj){
		fs.writeFileSync(file, encrypt(JSON.stringify(obj)))
	}
	this.parse = function(){
		try{
			return JSON.parse(decrypt(fs.readFileSync(file, "utf8")))
		}
		catch(e){
			throw "Can not read the database file!"
		}
	}
	this.createGroup = function(name){
		var obj = this.parse()
		if(obj[name] == undefined){
			obj[name] = {lastId: 0, items: []}
			update(obj)
		}
		return obj
	}
	this.deleteGroup = function(name){
		var obj = this.parse()
		if(obj[name] != undefined){
			delete obj[name]
			update(obj)
		}
		return obj
	}
	this.renameGroup = function(oldName, newName){
		var obj = this.parse()
		if(obj[newName] != undefined)
			throw "There is another group named '"+newName+"'"
		else{
			obj[newName] = obj[oldName]
			delete obj[oldName]
			update(obj)
		}
		return obj
	}
	this.insert = function(group, item){
		var obj = this.parse()
		if(item.id == "#"){
			obj[group].lastId++
			item.id = obj[group].lastId
		}
		else if(!/[^#]/.test(item.id))
			item.id = item.id.replace("##","#")
		obj[group].items.push(item)
		update(obj)
		return obj
	}
	this.select = function(group, where){
		var obj = this.parse()
		if(obj[group] != undefined)
			return Enumerable.From(obj[group].items).Where(where).ToArray()
		else
			return []
	}
	this.delete = function(group, where){
		var obj = this.parse()
		if(obj[group] != undefined){
			Enumerable.From(obj[group].items).Delete(where)
			update(obj)
		}
		return obj
	}
	this.update = function(group, where, items){
		var obj = this.parse()
		if(obj[group] != undefined){
			Enumerable.From(obj[group].items).Update(where, items)
			update(obj)
		}
		return obj
	}
}
