const BASE_URL = "https://opentdb.com/api.php";
const configurationPage = document.getElementById("start_page");
const questionPage = document.getElementById("question_page");
const resultPage = document.getElementById("result_page");
const optionBucket = document.getElementById("option_bucket");
const questionText = document.getElementById("question_text");
const nextQuestionButton = document.getElementById("next_question_btn");
const restartButton = document.getElementById("restart_btn");
const startQuizButton = document.getElementById("start_quiz_btn");
const loadingPage = document.getElementById("loading_page");
const questionCountProgressBar = document.getElementById(
  "question_count_progress_bar",
);
const questionCountInfo = document.getElementById("question_count_info");
const questionCountPercentage = document.getElementById(
  "question_count_percentage",
);
const themeToggle = document.getElementById("theme_toggle");
let questionsList = [];
let currentQuestionIndex = 0;
let numberOfQuestions = 0;
let isOptionSelected = false;
let isShowResult = false;
let resultScore = 0;

const getResultMessage = (percentage) => {
  if (percentage === 100)
    return {
      title: "Perfect Score!",
      icon: "./assets/trophy-icon.svg",
      subtitle: "You're a genius!",
    };
  if (percentage >= 80)
    return {
      title: "Great Job!",
      icon: "./assets/lightning-icon.svg",
      subtitle: "Almost flawless!",
    };
  if (percentage >= 60)
    return {
      title: "Good Effort!",
      icon: "./assets/target-goals-icon.svg",
      subtitle: "Room to improve.",
    };
  return {
    title: "Keep Learning!",
    icon: "./assets/target-goals-icon.svg",
    subtitle: "Practice makes perfect.",
  };
};

const fetchQuizData = async (data) => {
  const params = new URLSearchParams(data);
  try {
    const res = await fetch(BASE_URL + "?" + params);
    const jsonData = await res.json();
    return jsonData?.results;
  } catch (e) {
    alert(e);
  }
};
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const showQuestion = () => {
  if (!questionsList) {
    alert("Something went wrong!");
    return;
  }
  optionBucket.innerHTML = "";
  nextQuestionButton.disabled = true;
  nextQuestionButton.textContent = "Check Answer";
  optionBucket.disabled = false;
  questionCountProgressBar.value = currentQuestionIndex + 1;
  questionCountInfo.textContent = `Question ${currentQuestionIndex + 1} of ${numberOfQuestions}`;
  questionCountPercentage.textContent = `${Math.floor(((currentQuestionIndex + 1) / numberOfQuestions) * 100)}%`;
  const currentQuestion = questionsList[currentQuestionIndex];
  questionText.innerHTML = currentQuestion?.question;
  const incorrectOptions = currentQuestion?.incorrect_answers || [];
  const correctOption = currentQuestion?.correct_answer;
  const options = [...incorrectOptions, correctOption];
  const finalOptions = currentQuestion?.type === "multiple"?shuffleArray(options):options;
  const fragment = document.createDocumentFragment();

  //map the options array and create the option buttons
  finalOptions.map((option, index) => {
    const optionWraper = document.createElement("button");
    optionWraper.classList.add("option_btn");
    optionWraper.dataset.correct = option === correctOption;

    const optionNo = document.createElement("span");
    optionNo.classList.add("option_no");

    const optionText = document.createElement("span");
    optionText.classList.add("option_text");

    optionNo.textContent = String.fromCharCode(65 + index);
    optionText.innerHTML = option;
    optionWraper.append(optionNo, optionText);
    fragment.appendChild(optionWraper);
  });

  optionBucket.appendChild(fragment);
};

const startQuiz = () => {
  isShowResult = false;
  questionPage.classList.add("active");
  currentQuestionIndex = 0;
  questionCountProgressBar.max = numberOfQuestions;
  showQuestion();
};

const getCorrectSVG = () => `
<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
`;

const getWrongSVG = () => `
<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white"><path d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z"/></svg>
`;

const checkAnswer = () => {
  const correctButton = optionBucket.querySelector(
    '.option_btn[data-correct="true"]',
  );
  const selectedButton = optionBucket.querySelector(".option_selected");

  if (!correctButton || !selectedButton) return;

  if (selectedButton.dataset.correct === "true") {
    selectedButton
      .querySelector(".option_no")
      .classList.add("correct_option_no");
      selectedButton.classList.add("correct_option_btn")
    selectedButton.querySelector(".option_no").innerHTML = getCorrectSVG();
    resultScore++;
  } else {
    correctButton
      .querySelector(".option_no")
      .classList.add("correct_option_no");
    correctButton.classList.add("correct_option_btn");
    correctButton.querySelector(".option_no").innerHTML = getCorrectSVG();

    selectedButton.querySelector(".option_no").classList.add("wrong_option_no");
    selectedButton.classList.add("wrong_option_btn");
    selectedButton.querySelector(".option_no").innerHTML = getWrongSVG();
  }
  optionBucket.querySelectorAll(".option_btn").forEach((btn) => {
    btn.disabled = true;
  });
  if (currentQuestionIndex === numberOfQuestions - 1) {
    nextQuestionButton.innerText = "Show Result";
    isShowResult = true;
  } else {
    nextQuestionButton.innerText = "Next Question";
  }
  isOptionSelected = false;
};

const selectOption = (event) => {
  const button = event.target.closest(".option_btn");
  if (!button) return;
  const prevSelected = optionBucket.querySelector(".option_selected");

  if (prevSelected) {
    prevSelected.classList.remove("option_selected");
    prevSelected
      .querySelector(".option_no")
      ?.classList.remove("option_no_selected");
  }

  button.classList.add("option_selected");
  button.querySelector(".option_no")?.classList.add("option_no_selected");
  isOptionSelected = true;
  nextQuestionButton.removeAttribute("disabled");
};

const showResult = () => {
  const scorePercentage =
    numberOfQuestions > 0
      ? Math.round((resultScore / numberOfQuestions) * 100)
      : 0;
  let startValue = 0;
  let endValue = scorePercentage;

  const data = getResultMessage(scorePercentage);

  questionPage.classList.remove("active");
  resultPage.classList.add("active");

  const resultLogo = resultPage.querySelector(".result_logo");
  const mainMessage = resultPage.querySelector(".main_message");
  const subMessage = resultPage.querySelector(".sub_message");
  const achievedScore = resultPage.querySelector(".achived_score");
  const outOfScore = resultPage.querySelector(".out_of_score");
  const percentage = resultPage.querySelector(".result_score_percentage");
  const circulerScoreIndicator = resultPage.querySelector(
    ".circuler_score_indicator",
  );

  if (mainMessage) mainMessage.innerText = data.title;
  if (resultLogo) resultLogo.src = data.icon;
  if (subMessage) subMessage.innerText = data.subtitle;
  if (achievedScore) achievedScore.innerText = resultScore;
  if (outOfScore) outOfScore.innerText = `of ${numberOfQuestions}`;
  if (percentage) percentage.innerText = `${scorePercentage}% Correct`;

  if (circulerScoreIndicator) {
    if (endValue === 0) {
      circulerScoreIndicator.style.background = `conic-gradient(#04aa6d 0deg, #04aa6d20 0deg)`;
      return;
    }

    const progress = setInterval(() => {
      startValue++;

      circulerScoreIndicator.style.background = `conic-gradient(#04aa6d ${startValue * 3.6}deg, #04aa6d20 0deg)`;

      if (startValue >= endValue) {
        clearInterval(progress);
      }
    }, 20);
  }
};

const showLoading = () => {
  loadingPage.classList.add("loading_page_active");
  configurationPage.classList.remove("active");
};

const stopLoading = () => {
  loadingPage.classList.remove("loading_page_active");
  // configurationPage.classList.add('active')
};

const restartQuiz = () => {
  resultPage.classList.remove("active");
  configurationPage.classList.add("active");
  resultScore = 0;
  currentQuestionIndex = 0;
  numberOfQuestions = 0;
};

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("quiz_form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      showLoading();
      const form = new FormData(event.target);
      //converting the fromData Object to json data object
      const formData = Object.fromEntries(form.entries());

      questionsList = await fetchQuizData(formData);
      stopLoading();
      numberOfQuestions = questionsList?.length || 0;
      if (numberOfQuestions <= 0) {
        restartQuiz();
        return;
      }
      startQuiz();
    });
  optionBucket.addEventListener("click", (event) => selectOption(event));

  nextQuestionButton.addEventListener("click", (event) => {
    if (isShowResult) {
      showResult();
    } else if (isOptionSelected) {
      checkAnswer();
    } else {
      currentQuestionIndex++;
      showQuestion();
    }
  });

  restartButton.addEventListener("click", () => restartQuiz());

  themeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    themeToggle.innerHTML =  document.documentElement.classList.contains("dark")
      ?`  <svg
    fill="#fff"
    width="20px"
    height="20px"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
  </svg>`
      :`        <svg
          width="16px"
          height="16px"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.66077 11.3619C2.09296 11.4524 2.54093 11.5 3.00002 11.5C6.58987 11.5 9.50002 8.58987 9.50002 5.00002C9.50002 3.25482 8.81224 1.67027 7.69295 0.502625C11.4697 0.604839 14.5 3.69855 14.5 7.50002C14.5 11.366 11.366 14.5 7.49999 14.5C5.06138 14.5 2.91401 13.253 1.66077 11.3619Z"
            stroke="#000000"
            strokeLinejoin="round"
          />
        </svg>`;
  });
});
