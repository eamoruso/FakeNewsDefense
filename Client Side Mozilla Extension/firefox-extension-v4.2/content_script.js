// ---------------------------------------------------------- //
// all of the javascript code that executes after page load   //
// ---------------------------------------------------------- //

(function() {

	console.clear();
	console.log('----------------');
	console.log('| Version 4.2  |');
	console.log('----------------');

	// --------------------------------- global vars --------------------------------- //
	let importedPubKey;										// used for publickey
	var pubKeyDer;											// special format needed for verify
	var saltLengthValue = 64;								// used for Public key verify
	var imgTime = [];										// time taken to load image and info
	var startTime = [];										// used for timer metrics
	var isValid;											// results for cert validation
	var serverCert;											// used for server certificate
	var serverCertCN;										// server's CN name of Certificate
	var x509subjectName;									// X509 certificate conical name
	var byteArray;											// byte array of X509 certificate
	var certMatch;											// compare server to xml X509 certs
	var retObject = {};										// store values for popups
	var imgInfo = [{}];										// image information array
	var cnt = 0;											// counter for images info
	var mainURL = location.host;							// main site URL
	var imgs = document.getElementsByTagName("img");		// find images on page
	var htmldiv = [];										// use to build html info on images
	var failcnt = 0;        								// fail image count
	var valcnt = 0;       									// valid image count
	var skipcnt = 0;        								// skip no xml count
	var totalTime = 0;      								// total time init to zero

	chrome.storage.local.set({"valcnt": valcnt });			// init storage for valcnt
	chrome.storage.local.set({"failcnt": failcnt });		// init storage for failcnt
	chrome.storage.local.set({"skipcnt": skipcnt });		// init storage for skipcnt
	chrome.storage.local.set({"totalTime": totalTime});		// init storage for totaltime

	// ------- create image shield icons in base64 -------//
	const validImageIcon = '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'
	const failedImageIcon = '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'
	
	// -------- create global CSS for hover over --------//
	const style = document.createElement('style'); 
	style.innerHTML = `
		.news-container {
			position: relative;
			font-family: Arial, Helvetica, sans-serif;
			clear: both;
			min-width: 10px;
			min-height: 10px;
			overflow: hidden;			
		}
		.news-image {
			display: block;
			opacity: 1;
			width: 100%;
			height: auto;
			transition: .5s ease;
			backface-visibility: hidden;
		}
		.news-middle-valid {
			transition: .5s ease;
			opacity: 0;
			position: absolute;
			text-align: center;
			top: 10%;
			left: 10%;
			right: 10%;
		}
		.news-middle-fail {
			transition: .5s ease;
			opacity: 0;
			position: absolute;
			text-align: center;
			top: 10%;
			left: 10%;
			right: 10%;
		}
		.news-container:hover .news-middle-fail {
			opacity: .8;
		}
		.news-container:hover .news-middle-valid {
			opacity: .8;
		}
		.news-container:hover .news-image {
			opacity: .5;
		}
		.valid-news-text {
			background-color: green;
			color: white;
			padding: 5px 5px;
		}
		.fail-news-text {
			background-color: red;
			color: white;
			padding: 7px 7px;
		}
		#left { text-align: left; }
	`;
	document.head.appendChild(style);		// append style needed for text box over images

	// -----------------------------------------------
	// ----          use for hashing              ---- 
	// -----------------------------------------------
	var sha256 = function sha256(ascii) {
		function rightRotate(value, amount) {
			return (value>>>amount) | (value<<(32 - amount));
		};
		var mathPow = Math.pow;
		var maxWord = mathPow(2, 32);
		var lengthProperty = 'length'
		var i, j; // Used as a counter across the whole file
		var result = ''
		var words = [];
		var asciiBitLength = ascii[lengthProperty]*8;
		var hash = sha256.h = sha256.h || [];
		var k = sha256.k = sha256.k || [];
		var primeCounter = k[lengthProperty];
		var isComposite = {};
		for (var candidate = 2; primeCounter < 64; candidate++) {
			if (!isComposite[candidate]) {
				for (i = 0; i < 313; i += candidate) {
					isComposite[i] = candidate;
				}
				hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
				k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
			}
		}
		ascii += '\x80' // Append Ƈ' bit (plus zero padding)
		while (ascii[lengthProperty]%64 - 56) ascii += '\x00' // More zero padding
		for (i = 0; i < ascii[lengthProperty]; i++) {
			j = ascii.charCodeAt(i);
			if (j>>8) return; // ASCII check: only accept characters in range 0-255
			words[i>>2] |= j << ((3 - i)%4)*8;
		}
		words[words[lengthProperty]] = ((asciiBitLength/maxWord)|0);
		words[words[lengthProperty]] = (asciiBitLength)
		
		// process each chunk
		for (j = 0; j < words[lengthProperty];) {
			var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
			var oldHash = hash;
			// This is now the undefinedworking hash", often labelled as variables a...g
			// (we have to truncate as well, otherwise extra entries at the end accumulate
			hash = hash.slice(0, 8);
			for (i = 0; i < 64; i++) {
				var i2 = i + j;
				// Expand the message into 64 words
				// Used below if 
				var w15 = w[i - 15], w2 = w[i - 2];
				// Iterate
				var a = hash[0], e = hash[4];
				var temp1 = hash[7]
					+ (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
					+ ((e&hash[5])^((~e)&hash[6])) // ch
					+ k[i]
					// Expand the message schedule if needed
					+ (w[i] = (i < 16) ? w[i] : (
							w[i - 16]
							+ (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3)) // s0
							+ w[i - 7]
							+ (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10)) // s1
						)|0
					);
				// This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
				var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
					+ ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2])); // maj
				
				hash = [(temp1 + temp2)|0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
				hash[4] = (hash[4] + temp1)|0;
			}
			for (i = 0; i < 8; i++) {
				hash[i] = (hash[i] + oldHash[i])|0;
			}
		}
		for (i = 0; i < 8; i++) {
			for (j = 3; j + 1; j--) {
				var b = (hash[i]>>(j*8))&255;
				result += ((b < 16) ? 0 : '') + b.toString(16);
			}
		}
		return result;
	};
	// ---------------------------------------------------------
	// ---     Use for Subtle Crypto Import and Verify       ---
	// ---------------------------------------------------------
	function ab2str(buf) {
		return String.fromCharCode.apply(null, new Uint8Array(buf));
	}
	function str2ab(str) {
		const buf = new ArrayBuffer(str.length);
		const bufView = new Uint8Array(buf);
		for (let i = 0, strLen = str.length; i < strLen; i++) {
			bufView[i] = str.charCodeAt(i);
		}
		return buf;
	}
	function importPubKey(key) { 
		// return Public Certificate Object
		const pemContents = key;
		console.log('Imported Public Key pemContents:\n' + pemContents);
		// base64 decode the string to get the binary data
		const binaryDerString = window.atob(pemContents);
		// convert from a binary string to an ArrayBuffer
		const binaryDer = str2ab(binaryDerString);
		return window.crypto.subtle.importKey(
		'spki',
		binaryDer,
		{
		  name: "RSA-PSS",
		  modulusLength: 2048,
		  publicExponent: new Uint8Array([1, 0, 1]),
		  hash: {name: "SHA-256"},
		},
		  true,
		  ["verify"]
		);
	}
	function getMessageEncoding(message) {
		// console.log('Message ('+ message.length + '): '+ message);
		let enc = new TextEncoder();
		return enc.encode(message);
	}
	function getSignatureEncoding(sigValue) {
		// console.log('Signature Value:\n' + sigValue);
		let sigValue64 = sigValue.replace(/(.{32})/g,'$1\n');
		let atobSignature = atob(sigValue);
		// console.log('Converted Signature (atob): ', atobSignature);
		signature = str2ab(atobSignature);
		// console.log('Signature Array: ', signature);
		let buffer = new Uint8Array(signature, 0, 7);
		// console.log('Signing signature->', buffer);
		return signature;
	}
	function verifyMessage(publicKey, message, sigValue) {
		let encoded = getMessageEncoding(message);
		let signature = getSignatureEncoding(sigValue);
		// console.log('Message encoding->', encoded);
		// console.log('Public Key->', publicKey);
		console.log('Signature Used for Verification: ', sigValue);
		// console.log('SaltLength-> ' + saltLengthValue);
		let results = window.crypto.subtle.verify(
		{
			name: "RSA-PSS",
			hash: {name: "SHA-256"},
			saltLength: saltLengthValue,
		},
		publicKey,
		signature,
		encoded
		);
		return results;
	}
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

	// -------------------------------------------------------------------------
	// ------- Code below for extracting public key from X509 certificate ------
	// ------ is written by: Charles Engelke https://blog.engelke.com ----------
	// -------------------------------------------------------------------------
	function berToJavaScript(byteArray) {
	  var result = {};
	  var position = 0;

	  function getTag() {
	      let tag = byteArray[0] & 0x1f;
	      position += 1;
	      if (tag === 0x1f) {
	          tag = 0;
	          while (byteArray[position] >= 0x80) {
	              tag = tag * 128 + byteArray[position] - 0x80;
	              position += 1;
	          }
	          tag = tag * 128 + byteArray[position] - 0x80;
	          position += 1;
	      }
		//   console.log('bertoJavascript tag: ',tag);
	      return tag;
	  }

	  function getLength() {
	      let length = 0;

	      if (byteArray[position] < 0x80) {
	          length = byteArray[position];
	          position += 1;
	      } else {
	          var numberOfDigits = byteArray[position] & 0x7f;
	          position += 1;
	          length = 0;
	          for (var i=0; i<numberOfDigits; i++) {
	              length = length * 256 + byteArray[position];
	              position += 1;
	          }
	      }
	      return length;
	  }

	  result.cls              = (byteArray[position] & 0xc0) / 64;
	  result.structured       = ((byteArray[0] & 0x20) === 0x20);
	  result.tag              = getTag();
	  var length              = getLength(); // As encoded, which may be special value 0

	  if (length === 0x80) {
	      length = 0;
	      while (byteArray[position + length] !== 0 || byteArray[position + length + 1] !== 0) {
	          length += 1;
	      }
	      result.byteLength   = position + length + 2;
	      result.contents     = byteArray.subarray(position, position + length);
	  } else {
	      result.byteLength   = position + length;
	      result.contents     = byteArray.subarray(position, result.byteLength);
	  }

	  result.raw              = byteArray.subarray(0, result.byteLength); // May not be the whole input array
	//   console.log('raw-data -> ',result.raw);

	  return result;
	}

	function berListToJavaScript(byteArray) {
	  var result = new Array();
	  var nextPosition = 0;
	  while (nextPosition < byteArray.length) {
	      var nextPiece = berToJavaScript(byteArray.subarray(nextPosition));
	      result.push(nextPiece);
	      nextPosition += nextPiece.byteLength;
	  }
	  return result;
	}

	function parseTBSCertificate(asn1) {
	  if (asn1.cls !== 0 || asn1.tag !== 16 || !asn1.structured) {
	      throw new Error("This can't be a TBSCertificate. Wrong data type.");
	  }
	  var tbs = {asn1: asn1};  // Include the raw parser result for debugging
	  var pieces = berListToJavaScript(asn1.contents);
	  if (pieces.length < 7) {
	      throw new Error("Bad TBS Certificate. There are fewer than the seven required children.");
	  }
	  tbs.version = pieces[0];
	  tbs.serialNumber = pieces[1];
	  tbs.signature = parseAlgorithmIdentifier(pieces[2]);
	  tbs.issuer = pieces[3];
	  tbs.validity = pieces[4];
	  tbs.subject = pieces[5];
	  tbs.subjectPublicKeyInfo = parseSubjectPublicKeyInfo(pieces[6]);
	  console.log('tbs.issuer----> ',tbs.issuer);
	  console.log('tbs.validity----> ',tbs.validity);
	  console.log('tbs.subject----> ',tbs.subject);
	  console.log('tbs.subjectPublicKeyInfo----> ',tbs.subjectPublicKeyInfo);
	  return tbs;  // Ignore optional fields for now
	}
	function parseAlgorithmIdentifier(asn1) {
	  if (asn1.cls !== 0 || asn1.tag !== 16 || !asn1.structured) {
	      throw new Error("Bad algorithm identifier. Not a SEQUENCE.");
	  }
	  var alg = {asn1: asn1};
	  var pieces = berListToJavaScript(asn1.contents);
	  if (pieces.length > 2) {
	      throw new Error("Bad algorithm identifier. Contains too many child objects.");
	  }
	  var encodedAlgorithm = pieces[0];
	  if (encodedAlgorithm.cls !== 0 || encodedAlgorithm.tag !== 6 || encodedAlgorithm.structured) {
	      throw new Error("Bad algorithm identifier. Does not begin with an OBJECT IDENTIFIER.");
	  }
	  alg.algorithm = berObjectIdentifierValue(encodedAlgorithm.contents);
	  if (pieces.length === 2) {
	      alg.parameters = {asn1: pieces[1]}; // Don't need this now, so not parsing it
	  } else {
	      alg.parameters = null;  // It is optional
	  }
	  return alg;
	}

	var parseSignatureAlgorithm = parseAlgorithmIdentifier;

	function berObjectIdentifierValue(byteArray) {
	  var oid = Math.floor(byteArray[0] / 40) + "." + byteArray[0] % 40;
	  var position = 1;
	  while(position < byteArray.length) {
	      var nextInteger = 0;
	      while (byteArray[position] >= 0x80) {
	          nextInteger = nextInteger * 0x80 + (byteArray[position] & 0x7f);
	          position += 1;
	      }
	      nextInteger = nextInteger * 0x80 + byteArray[position];
	      position += 1;
	      oid += "." + nextInteger;
	  }
	  return oid;
	}
	function parseSubjectPublicKeyInfo(asn1) {
	  if (asn1.cls !== 0 || asn1.tag !== 16 || !asn1.structured) {
	      throw new Error("Bad SPKI. Not a SEQUENCE.");
	  }
	  var spki = {asn1: asn1};
	  var pieces = berListToJavaScript(asn1.contents);
	  if (pieces.length !== 2) {
	      throw new Error("Bad SubjectPublicKeyInfo. Wrong number of child objects.");
	  }
	  spki.algorithm = parseAlgorithmIdentifier(pieces[0]);
	  spki.bits = berBitStringValue(pieces[1].contents);
	  return spki;
	}
	function berBitStringValue(byteArray) {
	  return {
	      unusedBits: byteArray[0],
	      bytes: byteArray.subarray(1)
	  };
	}
	function parseSignatureValue(asn1) {
	  if (asn1.cls !== 0 || asn1.tag !== 3 || asn1.structured) {
	      throw new Error("Bad signature value. Not a BIT STRING.");
	  }
	  var sig = {asn1: asn1};   // Useful for debugging
	  sig.bits = berBitStringValue(asn1.contents);
	  return sig;
	}
	function parseCertificate(byteArray) {
	  var asn1 = berToJavaScript(byteArray);
	  if (asn1.cls !== 0 || asn1.tag !== 16 || !asn1.structured) {
	      throw new Error("This can't be an X.509 certificate. Wrong data type.");
	  }

	  var cert = {asn1: asn1};  // Include the raw parser result for debugging
	  var pieces = berListToJavaScript(asn1.contents);
	  if (pieces.length !== 3) {
	      throw new Error("Certificate contains more than the three specified children.");
	  }

	  cert.tbsCertificate     = parseTBSCertificate(pieces[0]);
	  cert.signatureAlgorithm = parseSignatureAlgorithm(pieces[1]);
	  cert.signatureValue     = parseSignatureValue(pieces[2]);
	  //console.log('ParseCertificate Signature: ' ,cert.signatureValue);

	  return cert;
	}
	// --------- End Code for extracting public key from X509 certificate ----------

	// -----------------------------------------------------------------------------
	// ------- Function to process each image on page-tab and verify with XML ------
	// -----------------------------------------------------------------------------
	function processImageVerification() {
		var imgURL;
		var imgXML;
		var xmlURL;
		var xhrImg;
		var reader;

		var strIMG = '';								// store image in base64 
		var strINFO = '';								// store image information
		var str = '';									// store both image and image info
		var wrapper = [];								// used to wrap image with class

		// --------------- Loop thru all of the images on current page tab --------------- //
		for (let i = 0; i < imgs.length; i++) {
			console.log('<---------------------' +' image: ' + i +' ----------------------->');
			startTime[i] = new Date().getTime();
			
			imgURL = document.querySelectorAll('img')[i].src;
			imgXML = document.getElementsByTagName('img')[i].getAttribute("x-media-cert");

			if (imgXML === null) {
				skipcnt++;
				chrome.storage.local.set({ "skipcnt": skipcnt });
				console.log('No x-media (sidecar file) found for ['+i+']:\n' + imgURL);
			}
			else{
				console.log('Detected x-media (sidecar file) for:\n' + imgURL);

				xmlURL = location.protocol + '//' + location.host + '/' + imgXML;
				
				try{
					xhrImg = new XMLHttpRequest();
					xhrImg.onload = function() {
						reader = new FileReader();
						reader.onloadend = function() 
						{
							strIMG =  reader.result.replace('data:image/jpeg;base64,',''); // get image to base64
							//console.log('image base64: ' + strIMG);
						}
						reader.readAsDataURL(xhrImg.response);
					};
					xhrImg.open('GET', imgURL, false);
					xhrImg.responseType = 'blob';
					xhrImg.send();

					console.log('Retrieving xml file: ['+i+']: ' + xmlURL);
					var xhrInfo = new XMLHttpRequest();
					if (!xhrInfo) {
						console.log('error getting XML file request');
					}
					xhrInfo.open("GET",xmlURL,false);
					xhrInfo.overrideMimeType('text/xml');
					xhrInfo.send();

					var xmlDataXML = xhrInfo.responseXML;
					var createdate = xmlDataXML.getElementsByTagName("contentCreated")[0].childNodes[0].nodeValue;
					var city = xmlDataXML.getElementsByTagName("city")[0].childNodes[0].nodeValue;
					var region = xmlDataXML.getElementsByTagName("region")[0].childNodes[0].nodeValue;
					var country = xmlDataXML.getElementsByTagName("country")[0].childNodes[0].nodeValue;
					var creatorName = xmlDataXML.getElementsByTagName("name")[0].childNodes[0].nodeValue;
					var creditLine  = xmlDataXML.getElementsByTagName("headline")[0].childNodes[0].nodeValue;
					var description = xmlDataXML.getElementsByTagName("description")[0].childNodes[0].nodeValue;
					var digestvalue = xmlDataXML.getElementsByTagName("DigestValue")[0].childNodes[0].nodeValue;
					var SignatureValue = xmlDataXML.getElementsByTagName("SignatureValue")[0].childNodes[0].nodeValue;
					var X509Certificate = xmlDataXML.getElementsByTagName("X509Certificate")[0].childNodes[0].nodeValue;

					// ------------ Concatinate values in xml and calc digest -------- //
					strINFO = createdate+city+region+country+creatorName+creditLine+description+X509Certificate;
					str = strINFO + strIMG;
					var calcDigest = sha256(str);
					console.log('Calculated Digest ['+i+'] Size(' + calcDigest.length+ '): ' + calcDigest);
					console.log('DigestValue from XML ['+i+'] Size(' + digestvalue.length+'): '+ digestvalue);

					// ------------------------ Webserver Certificate ------------------------- // 
					// var serverCertArray = byteArray;							// retrieved from website certificate
					// console.log('Server Certificate DER:', serverCertArray);	// show results to verify data	

					// ------------------- check if server and XML X509 match -------------------//
					// ------------------------- future feature 1 ------------------------------ //
					// if(serverCert == encoded){		
					// 	certMatch = true;
					// } else { 
					// 	certMatch = false;
					// } 
					// console.log('Both XML and Server X509 Certificates Match(' + i +'): ' + certMatch); 
					
					// ------------------------- Extract and Import Public Key ------------------------- //
					var encoded = X509Certificate;	// use images XMP X509 certificate
					//console.log('Original XML X509 certificate:\n'+ X509Certificate);
					encoded = encoded.replace('-----BEGIN CERTIFICATE-----','');	// remove header to match servers cert
					encoded = encoded.replace('-----END CERTIFICATE-----','');		// remove footer to match servers cert
					//console.log('encoded X509: ',encoded);
					var decoded = atob(encoded);
					//console.log('decoded X509 (atob):\n'+ decoded);
					var der = new Uint8Array(decoded.length);
					//console.log('New X509 Certificate DER: ',der);
					for (var x = 0; x < decoded.length; x++) {der[x] = decoded.charCodeAt(x);}
					console.log('Imported x509 Certificate DER:',der);
					var pubKey = parseCertificate(der);
					//console.log('Parsed pubKey: ',pubKey);
					//console.log('PubKey (raw):',pubKey.tbsCertificate.subjectPublicKeyInfo.asn1.raw);
					var pubKeyHex = toHexString(pubKey.tbsCertificate.subjectPublicKeyInfo.asn1.raw);
					console.log('PubKey to hex:',pubKeyHex);
					var pubKeyPEM = hexToBase64(toHexString(pubKey.tbsCertificate.subjectPublicKeyInfo.asn1.raw));
					pubKeyPEM = pubKeyPEM.replace(/(.{64})/g,'$1\n');
					console.log('PubKey to base64:\n'+ pubKeyPEM);
					pubKeyDer = pubKey.tbsCertificate.subjectPublicKeyInfo.asn1.raw;
					console.log('PubKeyDer:',pubKeyDer);

					// --------------------- Extract CN from X509 XMP certificate ---------------------- //
					x509subjectName = ab2str(pubKey.tbsCertificate.subject.raw);
					x509subjectName = x509subjectName.substring(13);
					console.log('Get subjectName from X509: ',x509subjectName);
					// --------------------------------------------------------------------------------- //

					retObject = {
						imgURL: imgURL, 
						createdate: createdate,
						city: city,
						region: region,
						country: country,
						location: location,
						creatorName: creatorName,
						creditLine: creditLine,
						description: description,
						digestvalue: digestvalue,
						SignatureValue: SignatureValue,
						X509Certificate: X509Certificate,
						x509subjectName: x509subjectName,
						imgTime: imgTime,
					};
					imgInfo[i] = retObject;
					// imgInfo[cnt] = retObject;
					// cnt++;

					importPubKey(pubKeyPEM).then((results) => {
						importedPubKey = results;
						console.log('PublicKey import results:\n', results);
					}).then((results) => {
						verifyMessage(importedPubKey, calcDigest, SignatureValue).then((resultV)=> {
							isValid = resultV;
							console.log('Signatures matched for ['+i+']: '+ isValid);
							if (calcDigest === digestvalue && isValid) {
								valcnt++;
								chrome.storage.local.set({"valcnt": valcnt },function (){
									console.log("valcnt storage successful: (" + valcnt +")");
								});
								//---create information over image---//
								htmldiv[i] = validHTML('img'+ i, imgInfo[i]);
								console.log('htmldiv Valid results: '+ htmldiv[i]);
								
								let imgValidElement = document.getElementsByTagName('img')[i];
								//---create wrapper over image---//
								wrapper[i] = document.createElement('div');
								wrapper[i].className = "news-container";
								wrapper[i].style.position = 'relative';
								wrapper[i].innerHTML = imgValidElement.outerHTML;
								console.log('Valid outerHTML: '+ imgValidElement.outerHTML);
								imgValidElement.parentNode.insertBefore(wrapper[i], imgValidElement);
								imgValidElement.remove();
								//---identify and prep image elements---//
								imgValidElement = document.getElementsByTagName('img')[i];
								imgValidElement.style.border ="7px solid green";
								imgValidElement.className = "news-image"
								imgValidElement.insertAdjacentHTML("afterend", htmldiv[i]);
							}
							else {
								failcnt++;
								chrome.storage.local.set({"failcnt": failcnt },function(){
									console.log("failcnt storage successful: ("+failcnt+")");
								});
								//---create information over image---//
								htmldiv[i] = failDivider('img'+i);
								console.log('htmldiv Failed results: '+ htmldiv[i]);
								//---identify and prep image elements---//
								let imgFailElement = document.getElementsByTagName('img')[i];
								//---create wrapper over image---//
								wrapper[i] = document.createElement('div');
								wrapper[i].className = "news-container";
								wrapper[i].style.position = 'relative';
								wrapper[i].innerHTML = imgFailElement.outerHTML;
								imgFailElement.parentNode.insertBefore(wrapper[i], imgFailElement);
								imgFailElement.remove();
								//---identify and prep image elements---//
								imgFailElement = document.getElementsByTagName('img')[i];
								imgFailElement.style.border ="7px solid red";
								imgFailElement.className = "news-image";
								imgFailElement.insertAdjacentHTML("afterend", htmldiv[i]);
							}
						}).then((results) => {
							startTime[i] = new Date().getTime() - startTime[i];
							imgTime[i] = parseInt(startTime[i]);
							console.log('image time ['+i+']: '+ imgTime[i] + 'ms');
							totalTime = totalTime + imgTime[i];
							chrome.storage.local.set({"totalTime":totalTime},function (){
								console.log("totalTime storage succesful: "+ totalTime);
							});
							console.log('Done validating image[' + i + ']');
						});
					});
				} catch (err) {console.log(err.message)}
				/* ----= end try =---- */
			} 
			/* ----+ end else +---- */
			console.log('<-------------------' +' end-image: ' + i +' --------------------->');
		}
		/* ----= end for loop =---- */
	}
	
	// ------------- get server certificate information --------------- //
	// chrome.storage.local.get("certEntryCN",function (result){
	// 	serverCertCN = result.certEntryCN
	// 	console.log('Retrieved -> serverCertCN: ' + serverCertCN);
	// });
	// chrome.storage.local.get("cert",function (result){
	// 	serverCert = result.cert
	// 	//console.log('Retrieved -> serverCert: ' + serverCert);
	// });
	// chrome.storage.local.get("byteArrayCert",function (result){
	// 	byteArray = result.byteArrayCert;
	// 	//console.log('Retrieved -> byteArray: ',byteArray);
	// });
	
	console.log('mainURL: ' + mainURL);							// active url in tab
	console.log('Total Images Found: ' + imgs.length);			// total images found

	// --- fetch images and analyze with verification box and text --- //
	processImageVerification();	

	console.log("<---------------= RESULTS =--------------->");
	console.log("-> Images in Array: " + imgInfo.length);
	console.log("-> Valid imageInfo:", imgInfo);
	console.log("<-----------------= END =----------------->\n");
	
	function validHTML(imageID, imageObject) {
		console.log('Image ID for Valid HTML: ' + imageID);
		console.log('Image ID for Valid Object', imageObject);
		var htmlvaliddiv = 
		'<div class="news-middle-valid">' +
			'<div class="valid-news-text">' + 'Verification Successful' + '</div>' +
			'<div class="valid-news-text">' + '-----------------------' + '</div>' +
			'<div class="valid-news-text">' + 'Signed by:  '+ imageObject.x509subjectName + '</div>' +
			'<div class="valid-news-text">' + 'Author:  '+ imageObject.creatorName +'</div>' +
			'<div class="valid-news-text">' + 'Date: '+ imageObject.createdate +'</div>' +
			'<div class="valid-news-text">' + imageObject.city + ', '+
				imageObject.region + ', ' +
				imageObject.country + '</div>' +
			'<div class="valid-news-text">' + imageObject.description + '</div>' +
		'</div>';
		return htmlvaliddiv;
	}
	function failDivider(imageID) {
		console.log('Image ID for Failed HTML: ' + imageID);
		const errorMSG = 'Digest information does not match information provided by the copyright holder.';
		let htmldivfail = 
		'<div class="news-middle-fail">' +
			'<div class="fail-news-text">' + 'Verification Failed' + '</div>' +
			'<div class="fail-news-text">' + '-------------------' + '</div>' +
			'<div class="fail-news-text">' + errorMSG + '</div>' +
		'</div>';
		return htmldivfail;
	}
	
})(); // ---end function--- //