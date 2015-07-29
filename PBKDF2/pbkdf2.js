/**********************************************************************
    Written by Jens Diemer
    :license: GNU GPL v3 or above, see LICENSE for more details
    :homepage: https://github.com/jedie/WebCrypto-bench
/*********************************************************************/

try {
    jQuery(document);
} catch (e) {
    alert("Error, jQuery JS not loaded!\n Original error was:" + e);
}

function pbkdf2(txt, salt, iterations, bytes) {
    log("pbkdf2 calc with iterations: " + iterations + " - bytes: " + bytes)

    // TODO: add work-a-round if TextEncoder not supported
    // IE / Safari, see:
    // https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
    txt = new TextEncoder("utf-8").encode(txt);

    return window.crypto.subtle.importKey(
        "raw", txt, {name: "PBKDF2"},
        false, //whether the key is extractable (i.e. can be used in exportKey)
        ["deriveBits"] // ["deriveKey", "deriveBits"] //can be any combination of "deriveKey" and "deriveBits"
    ).then(function(key){
        salt = new TextEncoder("utf-8").encode(salt);
        return window.crypto.subtle.deriveBits(
            {
                "name": "PBKDF2",
                salt: salt,
                iterations: iterations,
                hash: {name: "SHA-1"},
            },
            key, bytes*8
        ).then(function(hash){ // get a ArrayBuffer back
            var hex_hash=hex(hash);
            log("The derived " + (bytes*8) + "-bit key is: " + hex_hash);
            return hex_hash;
        })
    })
}


function test_pbkdf2_js() {
    window.stdout("Test PBKDF2...");

    log("TEST_STRING='"+TEST_STRING+"'")
    return pbkdf2(
        txt=TEST_STRING,
        salt=TEST_STRING,
        iterations=5,
        bytes=16
    ).then(function(hex_hash){
        var should_be = '4460365dc7df037dbdd851f1ffed7130';
        if (hex_hash == should_be) {
            window.stdout("Check PBKDF2 passed.\n");
        } else {
            low_level_error("PBKDF2 test failed!\n'" + hex_hash + "' != '" + should_be + "'");
        }
    }).catch(function(err){
        low_level_error("Error running PBKDF2 test:" + err);
    });
}

$(document).ready(function() {
    init_out();
    window.stdout("Check WebCrypto API...");
    check_webcrypto();

    test_pbkdf2_js();

    $("form").submit(function() {
        var txt = $("#test_string").val();
        var salt = $("#test_salt").val();
        var iterations = parseInt($("#iterations").val());
        var bytes = parseInt($("#bytes").val());

        window.stdout("calculate PBKDF2 with "+iterations+" iterations: ");

        var start_time = new Date();
        pbkdf2(
            txt, salt,
            iterations, bytes
        ).then(function(hex_hash){
            var duration = new Date() - start_time;
            window.stdout("duration: " + duration/1000 + " sec.\n");
            window.stdout("PBKDF2 hash: " + hex_hash + "\n");
        }).catch(function(err){
            low_level_error("Error running PBKDF2 test:" + err);
        });

        return false; // don't submit form
    });
});