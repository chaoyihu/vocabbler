function view_words() {
    var complete_href = "http://" + window.location.host + "/vocabbler/words"; // window.location.href will not work on localhost.
    console.log("redirecting to " + complete_href);
    window.location.replace(complete_href); 
}