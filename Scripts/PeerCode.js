var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");

function setEditorLanguage (language)
{
    editor.getSession().setMode("ace/mode/" + language);
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
        $("#connectionInfo").addClass("connected");
        $("#connectionStatus").text("Connected");

        // Receive messages
        conn.on('data', function (data) {
            var delta = JSON.parse(data);
            editor.getSession().off('change', changeHandler);
            editor.getSession().getDocument().applyDeltas([delta.data]);
            editor.getSession().on('change', changeHandler);
        });

        // Send messages
        editor.getSession().on('change', changeHandler);
    });

    conn.on('close', function () {
        $("#connectionInfo").removeClass("connected");
        $("#connectionStatus").text("Not Connected");
    });
};

// Outgoing
$(function () {
    $('#connectBtn').click(event, function () {
        var conn = peer.connect(document.getElementById("targetPeerID").value);
        communicate(conn);
    });


    // Incoming
    peer.on('connection', function (conn) {
        communicate(conn);
    });

    var languageDropdown = document.getElementById("mode");
    $(languageDropdown).on("change", function () {
        setEditorLanguage(this.value);
    });
    languageDropdown.value = "javascript";
    $(languageDropdown).change();
    
});