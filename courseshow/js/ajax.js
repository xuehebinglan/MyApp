var ajax = {
	getXmlRequest: function() {
		var xmlhttp_request = false;
		try{
			if( window.ActiveXObject ){
				for( var i = 5; i; i-- ){
					try{
						if( i == 2 ) {
							xmlhttp_request = new ActiveXObject( "Microsoft.XMLHTTP" ); }
						else {
							xmlhttp_request = new ActiveXObject( "Msxml2.XMLHTTP." + i + ".0" );
							xmlhttp_request.setRequestHeader("Content-Type","text/xml");
							xmlhttp_request.setRequestHeader("Charset","gb2312"); 
						}
						break;
					} catch(e) {
						xmlhttp_request = false;
					}
				} 
			} else if( window.XMLHttpRequest ) {
				xmlhttp_request = new XMLHttpRequest();
				if (xmlhttp_request.overrideMimeType) {
					xmlhttp_request.overrideMimeType('text/xml'); 
				} 
			} 
		}
		catch(e){
			xmlhttp_request = false;
		}
		return xmlhttp_request;
	},
	get: function(URL, callback) {
		var xmlReq = this.getXmlRequest();
		if (!xmlReq) {
			callback(null, -1);
			return;
		}
		xmlReq.open('GET', URL, true);
		xmlReq.send(null);
		xmlReq.onreadystatechange = function() {
			if (xmlReq.readyState==4) {
				callback(xmlReq.responseText, xmlReq.status);
			}
		}
	},
	post: function(URL, data, callback) {
		var xmlReq = this.getXmlRequest();
		if (!xmlReq) {
			callback(null, -1);
			return;
		}
		xmlReq.open('POST', URL, true);
		xmlReq.send(data);
		xmlReq.onreadystatechange = function() {
			if (xmlReq.readyState==4) {
				callback(xmlReq.responseText, xmlReq.status);
			}
		}
	}
}