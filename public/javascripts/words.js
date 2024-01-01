// request words data from server
function get_words() {
    var url = window.location.host + "/words/list";
    var protocol = "http";
    var xhr = new XMLHttpRequest();
    if (!url.startsWith(protocol)) {
        url = protocol + "://" + url;
    };
    xhr.open("GET", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
        let word_list = document.getElementById("words_list_table");
        word_list.innerHTML = `<tr>
            <th>id</th>
            <th>English</th>
            <th>Hebrew</th>
            <th>Portuguese</th>
            <th>Chinese</th>
        </tr>` + JSON.parse(xhr.responseText)["txt"];
    };
    xhr.send();
}

get_words();  // call it immediately when loading page


function start_quiz() {
    console.log("quiz started");
}


function add_new_word() {
    if (!document.getElementById('new_word_en').value) {
        alert("Please fill in all mandatory fields, marked with *");
        return;
    }
    let data = {
        "en"    : document.getElementById('new_word_en').value,
        "he"    : document.getElementById('new_word_he').value,
        "pt"    : document.getElementById('new_word_pt').value,
        "cn"    : document.getElementById('new_word_cn').value
    };
    var url = window.location.host + "/words/create";
    var protocol = "http";
    var xhr = new XMLHttpRequest();
    if (!url.startsWith(protocol)) {
        url = protocol + "://" + url;
    };
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
        let response = JSON.parse(xhr.responseText);
        if (response["status"] == 0) {
            alert("Server failure: Failed to insert data.");
        } else {
            let word_list = document.getElementById("words_list_table");
            word_list.innerHTML += response["txt"];
        }
    };
    xhr.send(JSON.stringify(data));
}