$(function () {
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: false
    });
    var video = document.getElementById("live_video");

    var conn = null;

    function setEditorLanguage(language) {
        editor.getSession().setMode("ace/mode/" + language);
        if (language !== 'javascript') {
            $('#evalBtn').hide();
        } else {
            $('#evalBtn').show();
        }
    }


    var peer = new Peer({ key: 'eagtl8kba9qnnrk9' });  //Development key, 50 connections max
    peer.on('open', function (id) {
        console.log('My peer ID is: ' + id);
        document.getElementById("myPeerID").innerText = id;
    });

    function communicate(conn) {
        function changeHandler(delta) {
            conn.send(JSON.stringify(delta));
        };

        conn.on('open', function () {
            $("#connectionWrapper").removeClass("disconnected");
            $("#connectionStatus").text("Connected");

            // Receive messages
            conn.on('data', function (data) {
                var delta = JSON.parse(data);
                editor.getSession().off('change', changeHandler);
                editor.getSession().getDocument().applyDeltas([delta]);
                editor.getSession().on('change', changeHandler);
            });

            // Send messages
            editor.getSession().on('change', changeHandler);
        });

        conn.on('close', function () {
            $("#connectionWrapper").addClass("disconnected");
            $("#connectionStatus").text("Not Connected");
        });
    };

    // Outgoing
    $('#evalBtn').click(event, function () {
        try {
            eval(editor.getSession().getValue());
        } catch (exception) {
            console.log("Eval failed with: " + exception);
        }
    });

    $('#disConnectBtn').click(event, function () {
        conn && conn.close();
    });

    $('#connectBtn').click(event, function () {
        conn = peer.connect(document.getElementById("targetPeerID").value);
        communicate(conn);

        // Call a peer, providing our mediaStream
        navigator.webkitGetUserMedia({ video: true, audio: true },
            function (mediaStream) {
                var call = peer.call(document.getElementById("targetPeerID").value, mediaStream);
                call.on('stream', function (stream) {
                    video.src = window.URL.createObjectURL(stream);
                });
            },
            function (error) {
                call.answer();
                call.on('stream', function (stream) {
                    video.src = window.URL.createObjectURL(stream);
                });
            }
        );
    });

    // Incoming
    peer.on('connection', function (conn) {
        communicate(conn);
    });

    peer.on('call', function (call) {
        debugger;
        // Answer the call, providing our mediaStream
        navigator.webkitGetUserMedia({ video: true, audio: true },
                function (mediaStream) {
                    call.answer(mediaStream);
                    call.on('stream', function (stream) {
                        video.src = window.URL.createObjectURL(stream);
                    });
                }, function (error) {
                    call.answer();
                    call.on('stream', function (stream) {
                        video.src = window.URL.createObjectURL(stream);
                    });
                }
            );
    });

    var languageDropdown = document.getElementById("mode");
    $(languageDropdown).on("change", function () {
        setEditorLanguage(this.value);
    });
    languageDropdown.value = "javascript";
    $(languageDropdown).change();
});
