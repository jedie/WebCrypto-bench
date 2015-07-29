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

function sha1_hexdigest(buffer, iterations, sha_type) {
    return window.crypto.subtle.digest(sha_type, buffer).then(function(hash) {
        if (iterations>0) {
            return sha1_hexdigest(hash, iterations-1, sha_type)
        } else {
            return hex(hash);
        }
    });
}


function test_SHA_js() {
	/* hacked in python:
	import hashlib
	TEST_DATA=b" 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	ALGORITHMS=("sha1","sha256","sha384","sha512")
	for algorithm in ALGORITHMS:
		hash_func=getattr(hashlib, algorithm)
		sha = hash_func(TEST_DATA)
		for no in range(3):
			sha = hash_func(sha.digest())
		print("%s: %s" % (algorithm, sha.hexdigest()))
	*/
    window.stdout("Test SHA:\n");
	log("TEST_STRING='"+TEST_STRING+"'")

	var DATA=[ // all with TEST_STRING and 3 iterations
		["SHA-1", "d0de252b2a5e98cdbed13f4cef7baf412e4a1a8f"],
		["SHA-256", "dabb0b8d14d9073f1a5dcc39542bacadd007fb9e4139e000ca45c7d8d212641e"],
		["SHA-384", "d38852fc5b5a628a7297f728f009121e3b7ed59ba634f6780540fd373ac23d36ec36f7132e723d59bf0e692bd370fc79"],
		["SHA-512", "f493b50b8387ca0e0e6e7181cdcb2d0121c1521bb7a37496b60c8489c80d4d65aa93df5622564f3424c9bec9e7711af2e136d09c905249ba66ca943238e88d4a"],
	]
    function test(element, index, array) {
		var sha_type=element[0];
		var should_be=element[1];
		//log(sha_type + " - " + should_be + "\n");
		sha1_hexdigest(
			buffer = new TextEncoder("utf-8").encode(TEST_STRING),
			iterations=3,
			sha_type=sha_type
		).then(function(hex_hash){
			if (hex_hash == should_be) {
				window.stdout("Check "+sha_type+" passed.\n");
			} else {
				low_level_error(sha_type+" test failed!\n'" + hex_hash + "' != '" + should_be + "'");
			}
		}).catch(function(err){
			low_level_error("Error running "+sha_type+" test:" + err);
		});
	}
	DATA.forEach(test);
}

$(document).ready(function() {
    init_out();
    window.stdout("Check WebCrypto API...");
    check_webcrypto();

    test_SHA_js();

    $("form").submit(function() {
    	sha_type = $("input:radio[name=sha_type]:checked").val();

		var test_string = $("#test_string").val();
		test_string = new TextEncoder("utf-8").encode(test_string);

        var iterations = $("#iterations").val();
        iterations = parseInt(iterations)

        window.stdout("calculate "+sha_type+" with "+iterations+" iterations: ");

        var start_time = new Date();
		sha1_hexdigest(
			buffer = test_string,
			iterations = iterations,
			sha_type = sha_type
		).then(function(hex_hash){
            var duration = new Date() - start_time;
            window.stdout("duration: " + duration/1000 + " sec.\n");
            window.stdout(sha_type+": " + hex_hash + "\n");
		}).catch(function(err){
			low_level_error("Error running "+sha_type+" test:" + err);
		});

        return false; // don't submit form
    });
});