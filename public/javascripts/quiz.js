var questions_completed = 0;
var n_questions = 0;
var correct_answer = "";

function start_quiz() {
    var n_questions = document.getElementById('number-of-questions').value;
    console.log(n_questions);
    if (n_questions === '' || n_questions === null || n_questions === 0) {
        alert("Your need to specify number of questions (1~100) in the quiz.");
        return;
    }
    get_question();
}

function get_question() {
    var url = window.location.host + "/quiz/question";
    var protocol = "http";
    var xhr = new XMLHttpRequest();
    if (!url.startsWith(protocol)) {
        url = protocol + "://" + url;
    };
    xhr.open("GET", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
        let response = JSON.parse(xhr.responseText);
        if (response["status"] == 0) {
            alert("Server failure: Failed to get question.");
        } else {
            console.log(response);
            correct_answer = response["word_lang2"];
            document.getElementById("qa-container").innerHTML = `
                <div class="quiz_card" id="question-container">
                    <p> In ${response["lang1"]}: <h4>${response["word_lang1"]}</h4> </p>
                    <p> In ${response["lang2"]}: <h4>?</h4> </p>
                </div>
                <div class="quiz_card" id="answer-container">
                    <form>
                        <label for="user-answer">Your answer:</label> <input id="user-answer">
                    </form>
                    <button id="submit-quiz-answer" onclick="submit_quiz_answer();">Submit</button>
                </div>
                <div class="quiz_status_bar" id="quiz-status-bar">
                </div>
                <div class="quiz_progress_bar" id="quiz-progress-bar">
                </div>
            `;
        }
    };
    xhr.send();
}

function submit_quiz_answer() {
    var user_answer = document.getElementById('user-answer').value;
    if (user_answer == '') {
        alert("Your need to provide an answer.");
        return;
    }
    if (user_answer.toLowerCase() == correct_answer.toLowerCase()) {
        document.getElementById("quiz-status-bar").innerHTML += `✅`;
    } else {
        document.getElementById("quiz-status-bar").innerHTML += `🙅`;
    }
    document.getElementById("quiz-progress-bar").innerHTML = `
        ${'>' * 4 * questions_completed} ${questions_completed} in ${n_questions}
    `;
    questions_completed += 1;
    if (questions_completed < n_questions) { 
        get_question();
    }
}