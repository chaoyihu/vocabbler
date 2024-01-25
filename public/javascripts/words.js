var words_display = {};

get_words();  // call it immediately when loading page


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
        var word_list = JSON.parse(xhr.responseText)["words"];
        for (word of word_list) { words_display[word["id"]] = word; }
        console.log(words_display);
        let word_list_table = document.getElementById("words_list_table");
        word_list_table.innerHTML = `
        <tr id="word_table_row_head">
            <th>id</th>
            <th>English</th>
            <th>Hebrew</th>
            <th>Portuguese</th>
            <th>Chinese</th>
            <th>Action</th>
        </tr>` + word_list.map(word => `
        <tr id="word_table_row_${word["id"]}">
            ${Object.keys(word).map(key => "<th>" + word[key] + "</th>").join("")}
            <th><button onclick="delete_word(${word['id']})">delete</button></th>
        </tr>`
        ).join("");
    };
    xhr.send();
}


function quiz() {
    var complete_href = "http://" + window.location.host + "/quiz"; 
    console.log("redirecting to " + complete_href);
    window.location.replace(complete_href); 
}


function add_new_word() {
    if (!document.getElementById('new_word_en').value) {
        alert("Please enter the word in English. It is a mandatory field marked with *");
        return;
    }
    let data = {
        "en"    : document.getElementById('new_word_en').value,
        "he"    : document.getElementById('new_word_he').value,
        "pt"    : document.getElementById('new_word_pt').value,
        "zh_cn" : document.getElementById('new_word_zh_cn').value
    };
    if (Object.values(data).reduce((cnt, x) => (x != '' ? cnt + 1 : cnt), 0) < 2) {
        alert("Please enter the word in at least two languages to make a valid pair.");
        return;
    }
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
            let word_list_table = document.getElementById("words_list_table");
            if (response.hasOwnProperty("updated")) { // updating an existing word
                var word = response["updated"];
                if (word["id"] in words_display) {
                    document.getElementById(`word_table_row_${word["id"]}`)
                    .innerHTML = `${Object.keys(word).map(key => "<th>" + word[key] + "</th>").join("")}`
                }
            } else {   // new word inserted
                var word = response["inserted"];
                word_list_table.innerHTML += `
                    <tr id="word_table_row_${word["id"]}">
                    ${Object.keys(word).map(key => "<th>" + word[key] + "</th>").join("")}
                    </tr>`;
            }
        } 
    }
    xhr.send(JSON.stringify(data));
    document.getElementById('new_word_en').value = '';
    document.getElementById('new_word_he').value = '';
    document.getElementById('new_word_pt').value = '';
    document.getElementById('new_word_zh_cn').value = '';
};

function delete_word(wid) {
    var url = window.location.host + `/words/delete/${wid}`;
    var protocol = "http";
    var xhr = new XMLHttpRequest();
    if (!url.startsWith(protocol)) {
        url = protocol + "://" + url;
    };
    xhr.open("DELETE", url);
    xhr.onload = () => {
        var response = JSON.parse(xhr.responseText);
        if (response["status"] == 0) {
            alert("Server failure: Failed to delete data.");
        } else {
            document.getElementById(`word_table_row_${wid}`).remove();
        }
    };
    xhr.send();
}


function start_quiz() {
    var complete_href = "http://" + window.location.host + "/quiz";
    console.log("redirecting to " + complete_href);
    window.location.replace(complete_href);
}