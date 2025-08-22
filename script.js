const questionEl = $("#question");
const answerButtons = $("#answer-buttons");
const nextBtn = $("#next-btn");
const scoreEl = $("#score");
const themeBtn = $("#theme-btn");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;

// Load theme from localStorage if set
if (localStorage.getItem("theme") === "dark") {
  $("body").addClass("dark-mode");
}

// Toggle dark/light theme and save preference
themeBtn.click(() => {
  $("body").toggleClass("dark-mode");
  if ($("body").hasClass("dark-mode")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});

// Fetch 5 random multiple-choice questions from Open Trivia Database API
async function fetchQuestions() {
  try {
    const response = await fetch(
      "https://opentdb.com/api.php?amount=5&type=multiple"
    );
    const data = await response.json();
    questions = data.results.map((q) => ({
      question: q.question,
      answers: [...q.incorrect_answers, q.correct_answer].sort(
        () => Math.random() - 0.5
      ),
      correct: q.correct_answer,
    }));
    showQuestion();
  } catch (error) {
    questionEl.text("Failed to load questions.");
    console.error(error);
  }
}

// Display current question and answers
function showQuestion() {
  resetState();
  let current = questions[currentQuestionIndex];
  questionEl.html(current.question);

  current.answers.forEach((ans) => {
    const btn = $(`<button class="btn btn-outline-primary">${ans}</button>`);
    btn.click(() => selectAnswer(ans));
    answerButtons.append(btn);
  });
}

// Reset answer buttons and hide next button
function resetState() {
  nextBtn.hide();
  answerButtons.empty();
  scoreEl.text("");
}

// Handle answer selection and animations
function selectAnswer(answer) {
  let current = questions[currentQuestionIndex];
  if (answer === current.correct) score++;

  answerButtons.children().each(function () {
    $(this).prop("disabled", true);
    if ($(this).text() === current.correct)
      $(this).removeClass("btn-outline-primary").addClass("btn-success");
    else $(this).removeClass("btn-outline-primary").addClass("btn-danger");
  });

  // Simple jQuery animation: fade effect
  answerButtons.children().fadeOut(50).fadeIn(100);

  nextBtn.show();
}

// Show next question or final score
nextBtn.click(() => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
});

// Display final score and allow restart
function showScore() {
  questionEl.text("Quiz Finished!");
  answerButtons.empty();
  scoreEl.text(`Your score: ${score} / ${questions.length}`);

  // Change Next button to Restart Quiz
  nextBtn.text("Restart Quiz");
  nextBtn.show();

  // Remove previous click handlers and set restart functionality
  nextBtn.off("click").click(() => {
    currentQuestionIndex = 0;
    score = 0;
    nextBtn.text("Next");

    // Restore normal Next button functionality
    nextBtn.off("click").click(() => {
      currentQuestionIndex++;
      if (currentQuestionIndex < questions.length) {
        showQuestion();
      } else {
        showScore();
      }
    });

    showQuestion();
  });
}

// Initialize quiz on page load
$(document).ready(function () {
  nextBtn.hide();
  fetchQuestions();
});
