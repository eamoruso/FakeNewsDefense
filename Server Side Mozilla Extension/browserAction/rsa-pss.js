(() => {

  console.clear();
  /*
  Store the calculated signature here, so we can verify it later.
  */
  let signature;
  let saltLengthValue = 64;
  let importedPubKey;   // used for imported key
  let importedPrivKey;  // used for importanted private key
  let boxImportedPrivKey;
  let boxImportedPubKey;
  let pubKeyPem;
  let privKeyPem;
  let signatureXML;

  const pubHeader = '-----BEGIN PUBLIC KEY-----';
  const pubKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuuXeXhyyouIY5n/sVyc1rU5lz6UlXcqJIQlUn/DLtv1f3vkTGfWoBKYQiulTG4IRDuUDMj9vghlw4YFMREjKlqsqta30dG//qa0sa6CERg09DoUd/V/l7Chsa1Fr1A5Wk8r50oQrQQsmfx87uWIQ5cBlQvfb2X2pstwY7BBaaRfhMXYcE4Z/tGVDNdyzDPo/I/i2J8KjPHmFtP1rydWWdvLejueMesj5N2lSiA+MH/GkfSwiDG49gDzftBRna79Tx4DHqgM6D2vVCagZFPc4NACY2q0cLd3CcMEWKuY90CLNJemllNYG9bKEFtZaArLmGyWpHxd5JqEXjtkq0J2IXwIDAQAB';
  const pubFooter = '-----END PUBLIC KEY-----';

  const priKeyHeader = '-----BEGIN PRIVATE KEY-----'
  const privKey = 'MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC65d5eHLKi4hjmf+xXJzWtTmXPpSVdyokhCVSf8Mu2/V/e+RMZ9agEphCK6VMbghEO5QMyP2+CGXDhgUxESMqWqyq1rfR0b/+prSxroIRGDT0OhR39X+XsKGxrUWvUDlaTyvnShCtBCyZ/Hzu5YhDlwGVC99vZfamy3BjsEFppF+ExdhwThn+0ZUM13LMM+j8j+LYnwqM8eYW0/WvJ1ZZ28t6O54x6yPk3aVKID4wf8aR9LCIMbj2APN+0FGdrv1PHgMeqAzoPa9UJqBkU9zg0AJjarRwt3cJwwRYq5j3QIs0l6aWU1gb1soQW1loCsuYbJakfF3kmoReO2SrQnYhfAgMBAAECggEAAK/xtmTin0i3kLlttBBX2TBNnYrc7VBeWrm/DuuCxESAQsClulW17XZy3x/mh1ZeG7Dp5xhmn5LaYGnqTuH5pL4yZQKjwH3c8dHKNQcdFWjdDZ2ds53TqZ+obmiZPeljlh2L96M2yYFx/cuum4rpxv6DINDqhQ06P4chrFSPEI3dTzZpga0ruNVzUtCRnibzXavNSQhzva6Vz7L4ve25WJvrzOzIFifZ0YsofAfrKdwNGXKh7WlP7jdT6K8ZrcKQW2wjf1Y8cFvruu41VzCqDrVsix2sFOhVaj3X8uPip752y5zZsjiE+xR1NAvCzyTz5WJ2ocWpMVMIcyZtlU0iOQKBgQDx2z1V20G12UcCSdvRAbzE9LdR816Cvi0tmr4IqUE5kQ6Hzf4gHEu3jyT1WbJhD9qjiAqudDSkewu4k6i9lxcWVMHyOZhZ/nEfN7SSHu/xv22KKQMtOP3mC5vhSFSmS/CTxYsKbbF91M4p9g9EB2EhpMF09kt3OXQM/Zsx6y2X2wKBgQDF09yoYgnxJ2qRXtb/BVM76ggTplRu9Ow37u0gT+KtRkWhRiLFqfmQ6Aa5ZSwZPYnE8Sqc+bJUecOb9evPKFEDCh6FRBYiWvQ98eI+TjBwjH6bZgQDleTUWS+gdEWX6Pt6F3OF1R8CpkS3EfG6usaSLcb5fGchzzGHt5zLgeMqzQKBgAUHrT/i3nv8t9hZVuQC6D0kZcejixym/eOL61Xcx0l+NdInO5jJXd3EcV1U7zvLi52JD8fPDOU61eSR1ZmT0dwaCSqTfhKpEws2KmA7mnvpokqUTceb/tPQ+/30diY7QBairiCaZW2bhmoi/vBIQwHjHk7jbHBfVoWKpLamEH2vAoGAGNGRl1ZlZOnLBt3dHzVt0dB0nvJ5GUqE8Cd7fFhJWe+9AJSp/B5s/u79GPlGZQxBYoHXFMaGxu5XyhM6OE0YjMcSOSnnlPvQNI1KEwMANL6Li7dqvYBqqvFddkXgDUTfd9vFVH7+Wvi9GjKYHxMbom83zUj8L1OtJRe2BhoPg+kCgYAffmSaEIH8VYGAnzhfpOtjkJfuC1XBKihlxGRRUCk4VpgRfUfP/dwFZYPm2uhnj/JeOihgbi3867PTD5h+i4ND+gJyB1a6Qo6h2QMjlL5ESJHD4XTwcVbaU8nOMm0MNlGkPDJQFZPxxZ4WhhdYJL1+e0l+LyAzDnedx2ElQYnsYQ=='
  const privKeyFooter = '-----END PRIVATE KEY-----'
  
  signatureXML = 'c3lK117xsOplcK65T41xpKB0ClabgmKkFBLxZds2r6kED1rtVXTA1i1bkzOfQsD06Pq3UJvjGWNHKeopGUCvxbuT/MRbrt8wRnX0I87EbNETrSJSVIRkyoJTc9nSMkt9jykSL5QPiE1IHVzJjbjvTftozuGTqnHtnLhay+i1/p3zaOU78XmIuQyQEDEmGNrwo11OYkw4yYyXvjB2cAr7qtOeOyTFoH1W1oWJlcqyPgk0POBmeAvggx7IJue9tX+TQ/eBfZqsbsP5WzoKHDSbbBkB69zTu/L45usEtKCYQknefHAApncZqgZwFfEauZvjTyXio7ykDbQQc9WHubK/gg==';
  console.log('XML signature:\n' + signatureXML.replace(/(.{64})/g,'$1\n'));

  function str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  }

  function importPrivKey(key) {
    // return Private Certificate Object
    let pemHeader = '-----BEGIN PRIVATE KEY-----'
    let pemFooter = '-----END PRIVATE KEY-----'
    const pemContentsPriv = key.substring(pemHeader.length, key.length - pemFooter.length);
    console.log('Imported Private Key pemContents: ', pemContentsPriv);
    // base64 decode the string to get the binary data
    const binaryDerStringPriv = window.atob(pemContentsPriv);
    // convert from a binary string to an ArrayBuffer
    const binaryDerPriv = str2ab(binaryDerStringPriv);
    return window.crypto.subtle.importKey(
    'pkcs8',
    binaryDerPriv,
    {
      name: "RSA-PSS",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: {name: "SHA-256"},
    },
      true,
      ["sign"]
    );
  }
  function importPubKey(key) { 
      // return Public Certificate Object
      let pemHeader = "-----BEGIN PUBLIC KEY-----";
      let pemFooter = "-----END PUBLIC KEY-----";
      const pemContents = key.substring(pemHeader.length, key.length - pemFooter.length);
      console.log('Imported Public Key pemContents: ',pemContents );
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

  /*
  Fetch the contents of the "Private Key" textbox and 
  clean up space with reformating to make compatible with
  import key function.
  */
  function getPrivateKey() {
    const messageBox = document.querySelector("#rsa-pss-private-key");
    let message = messageBox.value;
    console.log('Text Box Private Key ('+ message.length + '):\n'+ message);
    let pemHeader = '-----BEGIN PRIVATE KEY-----'
    let pemFooter = '-----END PRIVATE KEY-----'
    let pemContentsPriv = message.substring(pemHeader.length, message.length - pemFooter.length);
    pemContentsPriv = pemContentsPriv.split(' ').join('');
    pemContentsPriv = pemContentsPriv.replace(/(.{64})/g,'$1\n');
    pemContentsPriv = pemHeader + '\n' +pemContentsPriv+ '\n' + pemFooter;
    return pemContentsPriv;
  }

  /*
  Fetch the contents of the "Private Key" textbox and cleanup for
  import function.
  */
  function getPublicKey() {
    const messageBox = document.querySelector("#rsa-pss-public-key");
    let message = messageBox.value;
    console.log('Text Box Public Key ('+ message.length + '):\n'+ message);
    let pemHeader = "-----BEGIN PUBLIC KEY-----";
    let pemFooter = "-----END PUBLIC KEY-----";
    let pemContents = message.substring(pemHeader.length, message.length - pemFooter.length);
    pemContents = pemContents.split(' ').join('');
    pemContents = pemContents.replace(/(.{64})/g,'$1\n');
    pemContents = pemHeader + '\n' +pemContents+ '\n' + pemFooter;
    return pemContents;
  }

  /*
  Fetch the contents of the "message" textbox, and encode it
  in a form we can use for sign operation.
  */
  function getMessageEncoding() {
    const messageBox = document.querySelector("#rsa-pss-message");
    let message = messageBox.value;
    console.log('Message ('+ message.length + '): '+ message);
    // saltLengthValue = message.length;   // set to zero size of message
    let enc = new TextEncoder();
    return enc.encode(message);
  }

  /*
  Convert XMP signature into ArrayBuffer for subtle.verify function.
  */
  function getSignatureEncoding(sigValue) {
    const signatureValue = document.querySelector(".rsa-pss .signature-value");
    signatureValue.classList.remove("valid", "invalid");
    console.log('Signature Value:\n' + sigValue);
    let sigValue64 = sigValue.replace(/(.{32})/g,'$1\n');
    let atobSignature = atob(sigValue);
    console.log('Converted Signature (atob): ', atobSignature);
    signature = str2ab(atobSignature);
    console.log('Signature Array: ', signature);
    signatureValue.classList.add('fade-in');
    signatureValue.addEventListener('animationend', () => {
      signatureValue.classList.remove('fade-in');
    });
    let buffer = new Uint8Array(signature, 0, 7);
    console.log('Signing signature->', buffer);
    let buffer2 = new Uint8Array(signature,0,signature.byteLength);
    console.log('Signing signature All Values->', buffer2);
    signatureValue.textContent = `${sigValue64}...[${signature.byteLength} bytes total]`;
  }
  
  /*
  Get the encoded message-to-sign, sign it and display a representation
  of the first part of it in the "signature" element.
  */
  async function signMessage(privateKey) {
    const signatureValue = document.querySelector(".rsa-pss .signature-value");
    signatureValue.classList.remove("valid", "invalid");
    console.log('signature value-> ',signatureValue);
    let encoded = getMessageEncoding();
    console.log('Encoded Message-> ',encoded);
    console.log('Using SaltLength-> '+ saltLengthValue);
    signature = await window.crypto.subtle.sign(
      {
        name: "RSA-PSS",
        saltLength: saltLengthValue,
      },
      privateKey,
      encoded
    );
    signatureValue.classList.add('fade-in');
    signatureValue.addEventListener('animationend', () => {
      signatureValue.classList.remove('fade-in');
    });
    let buffer = new Uint8Array(signature, 0, 7);
    let buffer2 = btoa(ab2str(signature));
    let buffer3 = buffer2.replace(/(.{60})/g,'$1\n')
    // signatureValue.textContent = `${buffer3} [${signature.byteLength} bytes total]`;
    signatureValue.textContent = buffer3;
    console.log('Signature Raw:\n'+buffer2);
    console.log('Signature:\n' + buffer2.replace(/(.{64})/g,'$1\n'));
  }

  /*
  Fetch the encoded message-to-sign and verify it against the stored signature.
  * If it checks out, set the "valid" class on the signature.
  * Otherwise set the "invalid" class.
  */
  async function verifyMessage(publicKey) {
    const signatureValue = document.querySelector(".rsa-pss .signature-value");
    signatureValue.classList.remove("valid", "invalid");
    let encoded = getMessageEncoding();
    console.log('Message encoding->', encoded);
    console.log('Public Key->', publicKey);
    console.log('Signature Used->',signature);
    console.log('SaltLength-> ' + saltLengthValue);
    
    let result = await window.crypto.subtle.verify(
      {
        name: "RSA-PSS",
        hash: {name: "SHA-256"},
        saltLength: saltLengthValue,
      },
      publicKey,
      signature,
      encoded
    );
    signatureValue.classList.add(result ? "valid" : "invalid");
  }

  /*
  Get Private and Public Key from text boxes.
  */
  boxImportedPrivKey = getPrivateKey();
  console.log('Private Key from Text Box results->\n' + boxImportedPrivKey);
  boxImportedPubKey = getPublicKey();
  console.log('Public Key from Text Box results->\n' + boxImportedPubKey);
  
  /*
  Assign correctly formated PEM certificates 
  to both Public and Private Keys for processing.
  */
  // pubKeyPem = pubHeader +'\n' + pubKey.replace(/(.{64})/g,'$1\n') +'\n' + pubFooter; 
  pubKeyPem = boxImportedPubKey;
  console.log("PubKeyPem: \n" + pubKeyPem);
  // privKeyPem = priKeyHeader +'\n' + privKey.replace(/(.{64})/g,'$1\n') +'\n' + privKeyFooter;
  privKeyPem = boxImportedPrivKey;
  console.log("privKeyPem: \n" + privKeyPem);
  
  /*
  Import a sign/verify Public and Private key.
  */
  importPubKey(pubKeyPem).then((results) => {
    importedPubKey = results;
    console.log('PublicKey import results-> ',results);
  });
  
  importPrivKey(privKeyPem).then((results) => {
    importedPrivKey = results;
    console.log('PrivateKey import results-> ',results);
  });

  /*
  Generate a sign/verify key, then set up event listeners
  on the "Sign" and "Verify" buttons.
  */
  window.crypto.subtle.generateKey(
    {
      name: "RSA-PSS",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  ).then((keyPair) => {
    const signButton = document.querySelector(".rsa-pss .sign-button");
    signButton.addEventListener("click", () => {
      // signMessage(keyPair.privateKey);
      // getSignatureEncoding(signatureXML);
      signMessage(importedPrivKey);
    });
    const verifyButton = document.querySelector(".rsa-pss .verify-button");
    verifyButton.addEventListener("click", () => {
      // console.log('Generated Public Key: ', keyPair.publicKey);
      // verifyMessage(keyPair.publicKey);
      //console.log('Using Imported publicKey to verify: ', importedPubKey);
      verifyMessage(importedPubKey);
    });
  });

})();
