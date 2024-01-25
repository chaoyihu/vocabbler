var questions_completed = 0;
var n_questions = 0;
var correct_count = 0;
var correct_answer = "";


function start_quiz() {
    n_questions = parseInt(document.getElementById('number-of-questions').value);
    console.log(`setting: ${n_questions} questions`);
    if (n_questions === '' || isNaN(n_questions)) {
        alert("Your need to specify number of questions (1~100) in the quiz.");
        return;
    }
    document.getElementById("qa-container").innerHTML = `  
        <div class="quiz_card" id="question-container">
        </div>              
        <div class="quiz_card" id="answer-container">
        <form>
            <label for="user-answer">Your answer:</label> <input id="user-answer">
        </form>
        <button id="submit-quiz-answer" onclick="submit_quiz_answer();">Submit</button>
        </div>
        <div class="quiz_status_bar" id="quiz-status-bar">
            ▶️
        </div>
        <div class="quiz_progress_bar" id="quiz-progress-bar">
            ${'>>>'.repeat(questions_completed)} ${questions_completed} &#47; ${n_questions}
        </div>
    `
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
            document.getElementById("question-container").innerHTML = `
                <h4> In ${response["lang1"]}: <strong>${response["word_lang1"]}<strong> </h4>
                <h4> In ${response["lang2"]}: <strong>?<strong> </h4>
            `;
            document.getElementById("user-answer").text = '';
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
        correct_count += 1;
    } else {
        document.getElementById("quiz-status-bar").innerHTML += `🙅`;
    }
    questions_completed += 1;
    document.getElementById("quiz-progress-bar").innerHTML = `
        ${'>>>'.repeat(questions_completed)} ${questions_completed} &#47; ${n_questions}
    `;
    if (questions_completed < n_questions) { 
        get_question();
    } else {
        document.getElementById("quiz-status-bar").innerHTML += `🏁`;
        if (correct_count == n_questions) {
            document.getElementById("qa-container").innerHTML += `
                <p>Quiz finished! You scored 💯.</p>
            `;
        } else {
            document.getElementById("qa-container").innerHTML += `
                <p>Quiz finished! You scored <strong>${correct_count / n_questions * 100} %<strong>.</p>
            `;
        }
    }
}