const configs = JSON.parse(localStorage.getItem('configs'));
let questions = [];
let levelThemes = [];

let   totalLevels = configs ? +configs.fases : 2,
  totalQuestionsPerLevelOnCsv = 5,
  questionsPerLevel = configs ? configs.questoes : 3;

class Question {
    constructor({ id, level, theme, question, options, correct, explanation }) {
        this.id = id;
        this.level = level;
        this.theme = theme;
        this.question = question;
        this.options = options;
        this.correct = correct;
        this.explanation = explanation;
    }

    getWrong() {
        let wrongAnswer = parseInt(Math.random() * 4);
        while (wrongAnswer === +this.correct) {
            wrongAnswer = parseInt(Math.random() * 4);
        }
        return wrongAnswer;
    }
}

let optionsLength = 4;

const numberLevel = document.querySelector('aside .perguntaContainer .pergunta span')
const question = document.querySelector('aside .perguntaContainer .pergunta p')
const answerButton = document.querySelector('form .answerButton');

const optionsContainer = document.querySelector('.respostas form .labels');
const options = optionsContainer ? Array.from(optionsContainer.querySelectorAll('label')) : [];

const scoreTime1Span = document.querySelector('.pontosTime1');
const scoreTime2Span = document.querySelector('.pontosTime2');
const themeEndPopup = document.querySelector('.theme');
const personagem = document.querySelector('.perguntaContainer img');
const letters = ["A) ", "B) ", "C) ", "D) "];

const form = document.querySelector('form');
const background = Array.from(document.querySelectorAll('.background'))
const startPopup = background[0] ? background[0].querySelector('.popupInicio') : null;
const endPopup = background[1] ? background[1].querySelector('.popupFim') : null;
const endSpan = endPopup ? endPopup.querySelector('span') : null;

const nextLevel = document.querySelector('.proximaFase');
const startLevel = document.querySelector('.inicioFase');
const levelText = document.querySelector('.popupInicio .faseContainer h2:first-child');
const themeText = document.querySelector('.popupInicio .faseContainer h2:nth-child(2)');
const numPergunta = document.querySelector('.topPergunta .numPergunta');
const currentTime = localStorage.getItem('currentTime');

let scoreTime1 = +localStorage.getItem('scoreTime1') || 0;
let scoreTime2 = +localStorage.getItem('scoreTime2') || 0;
if (scoreTime1Span) scoreTime1Span.textContent = scoreTime1;
if (scoreTime2Span) scoreTime2Span.textContent = scoreTime2;

let currentLevel = +localStorage.getItem('currentLevel') || 1;
let seenIdQuestions = JSON.parse(localStorage.getItem('seenIdQuestions')) || [];
let seenQuestions = +localStorage.getItem('seenQuestions') || 1;
let currentTheme = localStorage.getItem('theme');
// document.querySelector('body').style.backgroundImage = `url('./assets/Projeto-Quiz/tela${currentTheme}.png')`
let currentQuestionId = +localStorage.getItem('currentQuestionId') || 1;
let setupQuestion = localStorage.getItem('setupQuestion') || '';

let wrongAnswer = localStorage.getItem('wrongAnswer');
let correctAnswer = JSON.parse(localStorage.getItem('correctAnswer') || 'false');
let removedOption = localStorage.getItem('removedOption');

if (wrongAnswer && wrongAnswer !== 'false') {
    try {
        wrongAnswer = JSON.parse(wrongAnswer);
    } catch (e) {
        wrongAnswer = false;
    }
} else {
    wrongAnswer = false;
}

function disableButtonsAndSkip(q) {
    if (!answerButton || !personagem || !question) return;
    answerButton.textContent = 'Avançar'
    answerButton.classList.add('skip');
    personagem.src = './assets/Projeto-Quiz/professor.png';
    question.textContent = q.explanation;
}

function resetButtonsToDefault() {
    if (!answerButton || !question) return;
    answerButton.textContent = 'Responder';
    answerButton.classList.remove('skip');
    question.style.fontSize = '';
}

function selectOption(selectedOpt) {
    if (wrongAnswer) {
        return;
    }

    selectedOpt.classList.toggle('selected');
    options.forEach(opt => {
        if (selectedOpt !== opt) {
            opt.classList.remove('selected');
        }
    })
}

(async () => {
    if (configs && configs.perguntas && configs.perguntas.length > 0) {
        questions = configs.perguntas.map(p => new Question(p));
        questions.forEach(q => {
            if (!levelThemes.includes(q.theme)) {
                levelThemes.push(q.theme)
            }
        });
    } else {
        const info = await fetch(`../../src/assets/quiz_${localStorage.getItem('theme').toLowerCase()}.csv`);
        const data = await info.text();

        let tempQuestions = data.split('\n');
        tempQuestions.shift();

        questions = tempQuestions.reduce((acm, k) => {
            const [id, level, theme, qText, a, b, c, d, correct, explanation] = k.split(';');
            const tempQuestion = new Question({ id, level, theme, question: qText, options: { 0: a, 1: b, 2: c, 3: d }, correct, explanation });
            acm.push(tempQuestion);
            if (!levelThemes.includes(tempQuestion.theme)) {
                levelThemes.push(tempQuestion.theme)
            }
            return acm;
        }, []);

    }

    let currentQuestion;
    if (localStorage.getItem('currentQuestionId')) {
        const savedId = localStorage.getItem('currentQuestionId');
        currentQuestion = questions.find(q => q.id == savedId);
    } else {
        const questionsForCurrentLevel = questions.filter(q => q.level == currentLevel);
        let availableQuestions = questionsForCurrentLevel.filter(q => !seenIdQuestions.includes(q.id));
        if (availableQuestions.length === 0) {
            availableQuestions = questionsForCurrentLevel;
        }

        currentQuestion = availableQuestions[parseInt(Math.random() * availableQuestions.length)];

        if (currentQuestion) {
            localStorage.setItem('currentQuestionId', currentQuestion.id);
            seenIdQuestions.push(currentQuestion.id);
            localStorage.setItem('seenIdQuestions', JSON.stringify(seenIdQuestions));
        } else {
            console.error("Nenhuma questão encontrada para o level:", currentLevel);
            return;
        }
    }

    if (configs) {
        if (personagem) {
            if (!configs.personagens[0]) {
                personagem.src = `./assets/Projeto-Quiz/personagem${((currentLevel - 1) % 3) + 1}.png`;
            } else {
                personagem.src = configs.personagens[currentLevel - 1] ? configs.personagens[currentLevel - 1] : configs.personagens[0]
            }
        }
        if (configs.fundos[0]) {
            document.body.style.backgroundImage = `url(${configs.fundos[0]})`
        } else{
          document.body.style.backgroundImage = `url('/src/assets/Projeto-Quiz/telaInicial.png')`
        }
    }

    if (numberLevel) numberLevel.textContent = `Fase ${currentLevel}: ${levelThemes[currentLevel - 1] || 'Tema'}`;
    if (themeText) themeText.textContent = levelThemes[currentLevel - 1] || 'Tema';
    if (themeEndPopup) {
        themeEndPopup.textContent = 'Tema: ' + (levelThemes[currentLevel - 1] || 'Tema');
        themeEndPopup.style.fontSize = '1.2rem'
    }

    // 🔥 Atualiza o contador de perguntas
    if (numPergunta) {
        numPergunta.textContent = `${seenQuestions}/${questionsPerLevel}`;
    }

    if (!wrongAnswer && question) {
        question.textContent = currentQuestion.question;
    }

    let seenOption = [];
    if (options.length > 0) {
        if (setupQuestion.length < optionsLength) {
            options.forEach((opt, idx) => {
                let randomOption = parseInt(Math.random() * optionsLength);
                while (seenOption.includes(randomOption)) {
                    randomOption = parseInt(Math.random() * optionsLength);
                }
                seenOption.push(randomOption);
                setupQuestion += randomOption;
                opt.textContent = `${letters[idx]} ${currentQuestion.options[randomOption]}`;
            })
            localStorage.setItem('setupQuestion', setupQuestion);
        } else {
            options.forEach((opt, idx) => {
                opt.textContent = `${letters[idx]} ${currentQuestion.options[setupQuestion[idx]]}`;
            })
        }
    }

    if (wrongAnswer && Array.isArray(wrongAnswer) && wrongAnswer.length === 2 && optionsContainer) {
        const [selectedIndex, correctIndex] = wrongAnswer;
        if (options[selectedIndex]) options[selectedIndex].classList.add('missed');
        if (options[correctIndex]) options[correctIndex].classList.add('selected');
        optionsContainer.style.pointerEvents = 'none';
        disableButtonsAndSkip(currentQuestion);
    }

    if (correctAnswer && Array.isArray(correctAnswer) && correctAnswer.length == 1 && optionsContainer) {
        const [correctIndex] = correctAnswer;
        if (options[correctIndex]) options[correctIndex].classList.add('selected');
        optionsContainer.style.pointerEvents = 'none';
        disableButtonsAndSkip(currentQuestion);
    }

    if (removedOption && options[removedOption]) {
        options[removedOption].style.backgroundColor = 'grey';
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const selectedOptIndex = options.findIndex(opt => Array.from(opt.classList).includes('selected')) ?? -1
            const selectedOpt = options[selectedOptIndex];

            if (selectedOptIndex === -1) {
                alert('Por favor, selecione uma opção!');
                return;
            }

            if (!localStorage.getItem('currentTime')) {
                alert('Por favor, escolha um time!');
                return;
            }

            if (optionsContainer) optionsContainer.style.pointerEvents = 'none';
            let correctIndex = Array.from(setupQuestion).findIndex(k => k == currentQuestion.correct);

            if (selectedOptIndex !== correctIndex) {
                selectedOpt.classList.add('missed');
                options[correctIndex].classList.add('selected');

                localStorage.setItem('wrongAnswer', JSON.stringify([selectedOptIndex, correctIndex]));
                localStorage.removeItem('correctAnswer');

                if (localStorage.getItem("currentTime") == "Time1") {
                    scoreTime2 += 50;
                    localStorage.setItem('scoreTime2', scoreTime2);
                    if (scoreTime2Span) scoreTime2Span.textContent = scoreTime2;
                } else if (localStorage.getItem('currentTime') === "Time2") {
                    scoreTime1 += 50;
                    localStorage.setItem('scoreTime1', scoreTime1);
                    if (scoreTime1Span) scoreTime1Span.textContent = scoreTime1;
                }

            } else {
                localStorage.removeItem('wrongAnswer');
                localStorage.setItem('correctAnswer', JSON.stringify([correctIndex]));
                if (localStorage.getItem("currentTime") == "Time1") {
                    scoreTime1 += 100;
                    localStorage.setItem('scoreTime1', scoreTime1);
                    if (scoreTime1Span) scoreTime1Span.textContent = scoreTime1;
                } else if (localStorage.getItem('currentTime') === "Time2") {
                    scoreTime2 += 100;
                    localStorage.setItem('scoreTime2', scoreTime2);
                    if (scoreTime2Span) scoreTime2Span.textContent = scoreTime2;
                }
            }

            disableButtonsAndSkip(currentQuestion);
        });
    }
})();

function handleSkip() {

  if((currentLevel+1 > totalLevels && seenQuestions === questionsPerLevel) || localStorage.getItem('isOnTiebreak')){
     console.log(localStorage.getItem('isOnTiebreak'))
    if(scoreTime1>scoreTime2){
      window.location = './winTime1.html'
      return
    } else if(scoreTime1<scoreTime2){
      window.location = './winTime2.html'
      return
    }

    localStorage.setItem('isOnTiebreak', 'true');

  }

    localStorage.removeItem('currentQuestionId');
    localStorage.removeItem('removedOption');
    localStorage.removeItem('wrongAnswer');
    localStorage.removeItem('correctAnswer');
    localStorage.removeItem('setupQuestion');
    localStorage.removeItem('currentTime')

    if (optionsContainer) optionsContainer.style.pointerEvents = 'all';

    options.forEach(opt => {
        opt.classList.remove('selected', 'missed');
    });

    resetButtonsToDefault();

    if (seenQuestions === questionsPerLevel) {
        currentLevel++;
        seenQuestions = 0
    }


    seenQuestions++;
    localStorage.setItem('currentLevel', currentLevel);
    localStorage.setItem('seenQuestions', seenQuestions);

    window.location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    if (answerButton) {
        answerButton.addEventListener('click', (e) => {
            if (answerButton.classList.contains('skip')) {
                e.preventDefault();
                handleSkip();
            }
        });
    }
});

// ======================== Seleção de times =========================
const selectTime1Function = () => {
    const selectTime1 = document.querySelector('.time1 .escolhaTime');
    const selectTime2 = document.querySelector('.time2 .escolhaTime');

    if (selectTime1) {
        selectTime1.disabled = true;
        selectTime1.textContent = 'Selecionado';
    }
    if (selectTime2 && selectTime2.textContent === 'Selecionado') {
        selectTime2.textContent = 'Selecionar';
    }
    localStorage.setItem("currentTime", "Time1");
    if (selectTime2) selectTime2.disabled = false;
}

const selectTime2Function = () => {
    const selectTime1 = document.querySelector('.time1 .escolhaTime');
    const selectTime2 = document.querySelector('.time2 .escolhaTime');

    if (selectTime2) {
        selectTime2.disabled = true;
        selectTime2.textContent = 'Selecionado';
    }
    if (selectTime1 && selectTime1.textContent === 'Selecionado') {
        selectTime1.textContent = 'Selecionar';
    }
    localStorage.setItem("currentTime", "Time2");
    if (selectTime1) selectTime1.disabled = false;
}

const btnTime1 = document.querySelector('.time1 .escolhaTime');
const btnTime2 = document.querySelector('.time2 .escolhaTime');

if (btnTime1) btnTime1.addEventListener('click', selectTime1Function);
if (btnTime2) btnTime2.addEventListener('click', selectTime2Function);

document.addEventListener('keydown', ({ key }) => {
    if (key === '1') selectTime1Function();
    if (key === '2') selectTime2Function();
});
