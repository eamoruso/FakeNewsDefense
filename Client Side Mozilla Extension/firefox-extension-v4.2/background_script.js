"use strict";
var log = console.log.bind(console);
var rootCertStats = {};

log('----------------');
log('| Version 4.2  |');
log('----------------\n');

log("Starting background script....");

// add listener
browser.tabs.onActivated.addListener(tab => {
  browser.tabs.get(tab.tabId, current_tab_info => {
    console.log('tab-> '+ current_tab_info.url);
    if ( current_tab_info.url.toLowerCase().slice(0,5) === 'https') {
      console.log('protocol-> '+ current_tab_info.url.toLowerCase().slice(0,5));
      console.log('Scanning for Fake News Items...');
      browser.tabs.executeScript(null, {file: "/content_script.js"}, () => console.log('Injected content_script'))
    }
  });
});

function handleUpdated(tabId, changeInfo, tabInfo) {
  console.log("Updated tab: " + tabId);
  console.log("Changed attributes: " + changeInfo.status);
  console.log("New tab URL: " + tabInfo.url);
  if ( changeInfo.status === 'complete' ) {
    browser.tabs.executeScript(null, {file: "/content_script.js"}, () => console.log('Injected content_script'))
  }
}

browser.tabs.onUpdated.addListener(handleUpdated);

/*
  Retrieve Certificate Information (future feature 1) 
*/
// async function logRootCert(details) {
//   try {
//     log('Loading ' + details.url +'   with ID: ' +  details.requestId);
//     let securityInfo = await browser.webRequest.getSecurityInfo(
//       details.requestId,
//       {"certificateChain": false, rawDER: true}
//     );
//     if ((securityInfo.state == "secure" || securityInfo.state == "weak") &&
//         !securityInfo.isUntrusted) {
      
//       let rootName = securityInfo.certificates[securityInfo.certificates.length - 1].subject;
//       log('RootName: '+rootName);
//       let rootrawDER = securityInfo.certificates[securityInfo.certificates.length - 1].rawDER;
      
//       if (rootCertStats[rootName] === undefined) {
//         rootCertStats[rootName] = 1;
//         rootCertStats[rootrawDER] = 1;
//       } 
//       else {
//         rootCertStats[rootName] = rootCertStats[rootName] + 1;
//         rootCertStats[rootrawDER] = rootCertStats[rootrawDER] + 1;
//       }
//       // log('security info: ' + JSON.stringify(securityInfo, null, 1));
//       log('security info: ', securityInfo);
//     }
//   }
//   catch(error) {
//     rootCertStats[error] = 1;
//   }
// }



/*
  Listen for all onHeadersReceived events. (future feature 1)
*/
// browser.webRequest.onHeadersReceived.addListener( 
//   logRootCert,
//   {urls: ["<all_urls>"]},
//   ["blocking"]
// );

/*
  Listen for all storage events.
*/
// chrome.storage.onChanged.addListener(function (changes, namespace) {
//   for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
//     console.log(
//       `Storage key "${key}" in namespace "${namespace}" changed.`,
//       `Old value was "${oldValue}", new value is "${newValue}".`
//     );
//   }
// });