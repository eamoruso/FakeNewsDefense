/*
	Fake News Plugin Icon	
	Version 4.0  June 24, 2021
	By: Edward Amoruso
*/

(function() {

	console.clear();
	console.log('----------------');
	console.log('| Version 4.2  |');
	console.log('----------------');

	var validCount;
	var failCount;
	var skipCount;
	var totalTime;

	function toHexString(byteArray) {
		return Array.prototype.map.call(byteArray, function(byte) {
			return ('0' + (byte & 0xFF).toString(16)).slice(-2);
		}).join('');
	}
	
	function hexToBase64(hexStr) {
		let base64 = "";
		for(let i = 0; i < hexStr.length; i++) {
			base64 += !(i - 1 & 1) ? String.fromCharCode(parseInt(hexStr.substring(i - 1, i + 1), 16)) : ""
		}
		return btoa(base64);
	}

	function statusBar() {
		let i = 0;
		let timer= 713000000;
		if (i == 0) {
			i = 1;
			var elem = document.getElementById("myBar");
			var width = 2;
			var id = setInterval(frame, 1);
			function frame() {
				if (width >= 100) {
					clearInterval(id);
					i = 0;
				} else {
					width=width+2;
					elem.style.width = width + "%";
					elem.innerHTML = width  + "%";
				}
			}
		}
		for(let x=0; x < timer; x++); // add delay effect
	}

	function retrieveServerCert(){
		var countEntries = 1;
		var certEntryCN = '';
		var certEntryDER = '';
		const backgroundPage = browser.extension.getBackgroundPage();
		
		if(backgroundPage == null){
			console.log('background-page-> ',backgroundPage);
			certEntryCN = "Private Browsing Enabled";
		}
		else {
			var entries = Object.keys(backgroundPage.rootCertStats);
			console.log('Number of entries-> '+ entries.length);
			try {
				if (entries.length > 0) {
					for (let entry of entries){			// Find certificate for each image
						if( countEntries === 1 ){		// pull the first entry off the list
							certEntryCN = entry;
							console.log('certCN: '+ certEntryCN);
						}
						if( countEntries === 2 ) { 		// pull second entry for RAW DER
							certEntryDER = entry;
							console.log('RAW DER: '+ certEntryDER);
						}
						if( countEntries === 3 ) {		// break out of for loop on third entry
							console.log('Done with looping thru entries for certificate information...');
							break;
						}
						countEntries++;  		// increment entries so we know when to stop
					}
					var arr1 = certEntryDER.split(',');					// convert to int array
					var byteArray = new Uint8Array(arr1);				// create constructor for certbinary					
					console.log('ByteArray Certificate from Server:\n', byteArray);
					var binaryCert = toHexString(byteArray);			// create binary certificate
					console.log('Binary X509 Certificate from Server:\n',binaryCert);
					var base64Cert = hexToBase64(binaryCert);
					console.log('Base64 Certificate:\n' + base64Cert.replace(/(.{64})/g,'$1\n'));			
				} 
			} catch (err) {console.log(err.message)}
		}
		chrome.storage.local.set({"certEntryCN":certEntryCN},function (){
			console.log('CN Storage Succesful: '+certEntryCN);
		});
		chrome.storage.local.set({"byteArrayCert":byteArray},function (){
			console.log("byteArrayCert Storage Succesful");
		});
		chrome.storage.local.set({"cert":base64Cert},function (){
			console.log("PEM (base64) Certificate Storage Succesful");
		});
	}

	/* 
		----------------------- On Icon Load -----------------------
	*/
	// retrieveServerCert();	// load browser tab server certificate

	browser.tabs.executeScript({ 
		file: "/content_script.js"
	}).then((error) => {
		statusBar();		// use to help results catch-up for below
	}).then((error) => {
		chrome.storage.local.get('failcnt', function (result) {
			failCount = result.failcnt;
			document.getElementById("fake-news-images-count").innerHTML = failCount;
		});
		chrome.storage.local.get('valcnt', function (result) {
			validCount = result.valcnt;
			console.log('Recieved this valid count: '+ validCount);
			document.getElementById("valid-images-count").innerHTML = validCount;
		});
		chrome.storage.local.get('skipcnt', function (result) {
			skipCount = result.skipcnt;
			document.getElementById("skip-images-count").innerHTML = skipCount;
		});
		chrome.storage.local.get("totalTime",function (result){
			totalTime = result.totalTime;
			document.getElementById("fake-news-time-took").innerHTML = totalTime +' ms';
		});
		// chrome.storage.local.get("certEntryCN",function (result){
		// 	certEntryCN = result.certEntryCN;
		// 	document.getElementById("cert-images-info").innerHTML = certEntryCN;
		// });

		/*
			Perform cleanup of chrome storage variables used by extension
		*/
		chrome.storage.local.clear(function() {
			var error = chrome.runtime.lastError;
			if (error) {
				console.error(error);
			}
			else {
				console.log('Done Processing and performing house cleaning...');
			}
		});
	}); 
})(); // ---end function--- //