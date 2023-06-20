const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const questionNumber = document.getElementById('question-number');
const questionText = document.getElementById('question');
const optionsContainer = document.getElementById('options');
const feedbackText = document.getElementById('feedback');
const finalScore = document.getElementById('final-score');
const loadingScreen = document.getElementById('loading-screen');
const loadingSpinner = document.getElementById('loading-spinner');

let currentQuestionIndex = 0;
let score = 0;
let questions = [];

startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', loadNextQuestion);
restartBtn.addEventListener('click', restartQuiz);

function startQuiz() {
  document.getElementById('start-screen').style.display = 'none';
  loadingScreen.style.display = 'block';

  fetchQuestions()
    .then(data => {
      questions = data.results;
      loadingScreen.style.display = 'none';
      document.getElementById('quiz-screen').style.display = 'block';
      loadQuestion();
    })
    .catch(error => {
      console.error(error);
      alert('Failed to fetch questions. Please try again later.');
      loadingScreen.style.display = 'none';
      document.getElementById('start-screen').style.display = 'block';
    });
}

function fetchQuestions() {
  const apiUrl = 'https://opentdb.com/api.php?amount=10&type=multiple';
  return fetch(apiUrl)
    .then(response => response.json());
}

function loadQuestion() {
  const question = questions[currentQuestionIndex];
  questionNumber.innerText = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

  const parser = new DOMParser();
  const decodedQuestion = parser.parseFromString(`<!doctype html><body>${question.question}`, 'text/html').body.textContent;
  questionText.innerHTML = decodedQuestion;

  optionsContainer.innerHTML = '';
  question.incorrect_answers.forEach(answer => {
    const decodedAnswer = parser.parseFromString(`<!doctype html><body>${answer}`, 'text/html').body.textContent;
    const button = createOptionButton(decodedAnswer, false);
    optionsContainer.appendChild(button);
  });

  const correctAnswer = parser.parseFromString(`<!doctype html><body>${question.correct_answer}`, 'text/html').body.textContent;
  const correctButton = createOptionButton(correctAnswer, true);
  optionsContainer.appendChild(correctButton);

  shuffleOptions();
  nextBtn.style.display = 'none'; // Hide the next button
}

function createOptionButton(answer, isCorrect) {
  const button = document.createElement('button');
  button.innerText = answer;
  button.classList.add('option');
  if (isCorrect) {
    button.dataset.correct = 'true';
  }
  button.addEventListener('click', selectOption);
  return button;
}

function selectOption(e) {
  const selectedButton = e.target;
  const isCorrect = selectedButton.dataset.correct === 'true';

  Array.from(optionsContainer.children).forEach(button => {
    if (button === selectedButton) {
      if (isCorrect) {
        button.classList.add('correct');
        showFeedback(true);
        updateScore(true);
      } else {
        button.classList.add('incorrect');
        showFeedback(false);
        updateScore(false);
      }
    } else {
      if (button.dataset.correct === 'true') {
        button.classList.add('correct');
      }
      button.disabled = true;
    }
  });

  nextBtn.style.display = 'block'; // Show the next button
  nextBtn.disabled = false; // Enable the next button
}

function showFeedback(correct) {
  feedbackText.innerText = correct ? 'Correct!' : 'Incorrect!';
  feedbackText.style.color = correct ? 'green' : 'red';
}

function updateScore(correct) {
  if (correct) {
    score++;
  }
}

function shuffleOptions() {
  const options = Array.from(optionsContainer.children);
  options.sort(() => Math.random() - 0.5);
  options.forEach(option => optionsContainer.appendChild(option));
}

function loadNextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    resetFeedback();
    nextBtn.style.display = 'none'; // Hide the next button
    enableOptions();
    loadQuestion();
  } else {
    showResults();
  }
}

function resetFeedback() {
  feedbackText.innerText = '';
  feedbackText.style.color = '';
}

function enableOptions() {
  const options = optionsContainer.children;
  for (let i = 0; i < options.length; i++) {
    options[i].disabled = false;
    options[i].classList.remove('correct', 'incorrect');
  }
}

function showResults() {
  document.getElementById('quiz-screen').style.display = 'none';
  document.getElementById('results-screen').style.display = 'block';
  finalScore.innerText = `Your final score is ${score} out of ${questions.length}`;
}

function restartQuiz() {
  document.getElementById('results-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('loading-screen').style.display = 'block';
  currentQuestionIndex = 0;
  score = 0;
  questions = [];

  resetFeedback(); // Reset feedback text

  fetchQuestions()
    .then(data => {
      questions = data.results;
      document.getElementById('loading-screen').style.display = 'none';
      document.getElementById('quiz-screen').style.display = 'block';
      loadQuestion();
    })
    .catch(error => {
      console.error(error);
      alert('Failed to fetch questions. Please try again later.');
      document.getElementById('loading-screen').style.display = 'none';
      document.getElementById('start-screen').style.display = 'block';
    });
}


