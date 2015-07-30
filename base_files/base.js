/**********************************************************************
    Written by Jens Diemer
    :license: GNU GPL v3 or above, see LICENSE for more details
    :homepage: https://github.com/jedie/WebCrypto-bench
/*********************************************************************/

var TEST_STRING = " 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

// helper function for console logging
// set debug to true to enable debug logging
function log() {
    if (window.console && window.console.log) {
        try {
            window.console.log(Array.prototype.join.call(arguments,''));
        } catch (e) {
            log("Error:" + e);
        }

    }
}
log("JS logging initialized");

function low_level_error(msg) {
    log("Low level error: "+msg);
    window.stdout("\nERROR:\n"+msg+"\n");
    //alert(msg);
    throw "ERROR: " + msg;
}

function hex(buffer) {
    // from example here:
    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
    var hexCodes = [];
    var view = new DataView(buffer);
    for (var i = 0; i < view.byteLength; i += 4) {
        // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
        var value = view.getUint32(i)
        // toString(16) will give the hex representation of the number without padding
        var stringValue = value.toString(16)
        // We use concatenation and slice for padding
        var padding = '00000000'
        var paddedValue = (padding + stringValue).slice(-padding.length)
        hexCodes.push(paddedValue);
    }
    return hexCodes.join(""); // Join all the hex strings into one
}

function init_out() {
    out = $("#output");
    window.stdout = function(data) {
        out.append(data);
    }
    window.stdout.reset = function(data) {
        out.empty();
    }
}

function check_webcrypto() {
    window.stdout("Check WebCrypto API: ");

    // IE11 has window.msCrypto but doesn't provide promise .then() / .catch()
    // it used the outdated .oncomplete() and .onerror()
    if (!window.crypto) {
        low_level_error("Your browser doesn't support Web Cryptography API: 'window.crypto' doesn't exists!");
    }
    if (window.crypto.webkitSubtle) {  // Safari
        window.crypto.subtle = window.crypto.webkitSubtle;
    }
    window.stdout("Web Cryptography API is generally supported: 'window.crypto' exists.\n");
    if (!window.crypto.subtle) {
        low_level_error("Your browser doesn't support Web Cryptography API: 'window.crypto.subtle' doesn't exists!");
    }
}
