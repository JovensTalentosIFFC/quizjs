// load configs
const configs = JSON.parse(localStorage.getItem('configs'));

// totalLevels agora será atualizado dinamicamente com base no CSV do usuário ou configs.fases
let optionsLength = 4,
  totalLevels = configs ? +configs.fases : 2,
  totalQuestionsPerLevelOnCsv = 5,
  questionsPerLevel = configs ? configs.questoes : 3;
let lifes = configs ? configs.vidas : 3;
let clues = configs ? configs.ajudas : 2;

// corrige leitura quando o valor salvo é 0
const storedLifes = localStorage.getItem('lifes');
if (storedLifes !== null) lifes = +storedLifes;
const storedClues = localStorage.getItem('clues');
if (storedClues !== null) clues = +storedClues;

const numberQuestion = document.querySelector(
  'aside .perguntaContainer .pergunta span'
);
const question = document.querySelector(
  'aside .perguntaContainer .pergunta p'
);
const answerButton = document.querySelector('form .answerButton');
const clueButton = document.querySelector('form .clueButton');
const options = Array.from(
  document.querySelectorAll('.respostas form .labels label')
);
const optionsContainer = document.querySelector('.respostas form .labels');

const letters = ['A) ', 'B) ', 'C) ', 'D) '];

const lifeSpan = document.querySelector('.menu .vida .lifes');
const clueSpan = document.querySelector('.menu .ajuda .clues');
const personagem = document.querySelector('.perguntaContainer img');
function updateLives() {
  if (lifeSpan) lifeSpan.textContent = '❤️'.repeat(lifes);
}
function updateClues() {
  if (clueSpan) clueSpan.textContent = '💡'.repeat(clues);
}

updateLives();
updateClues();

let currentLevel = +localStorage.getItem('currentLevel') || 1;
let setupQuestion = localStorage.getItem('setupQuestion') || '';
let seenQuestions = +localStorage.getItem('seenQuestions') || 1;
let seenIdQuestions = JSON.parse(localStorage.getItem('seenIdQuestions')) || [];

let wrongAnswer = JSON.parse(localStorage.getItem('wrongAnswer') || 'false');
let correctAnswer = JSON.parse(localStorage.getItem('correctAnswer') || 'false');
let removedOption = localStorage.getItem('removedOption');

const currentQuestionSpan = document.querySelector(
  '.topPergunta span:nth-child(2)'
);


const pathsSolo = {
  pathCsv: `../src/assets/solo.csv`,
  pathTeacher: '../src/assets/Projeto-Quiz/professor.png'
}
currentQuestionSpan.textContent = `${seenQuestions}/${questionsPerLevel}`;

const form = document.querySelector('form');
const background = Array.from(document.querySelectorAll('.background'));
const startPopup = background[0].querySelector('.popupInicio');
const endPopup = background[1].querySelector('.popupFim');
const endSpan = endPopup.querySelector('span');
const advicePopup = background[2].querySelector('.popupAviso');
const restartButton = advicePopup.querySelector('button');
const nextLevel = document.querySelector('.proximaFase');
const startLevel = document.querySelector('.inicioFase');
const levelText = document.querySelector(
  '.popupInicio .faseContainer h2:first-child'
);
const themeText = document.querySelector(
  '.popupInicio .faseContainer h2:nth-child(2)'
);

// fim de fase
if ((seenQuestions - 1) % questionsPerLevel === 0 && currentLevel !== 1) {
  background[1].classList.add('shown');
  endSpan.textContent = currentLevel;
  setTimeout(() => {
    endPopup.classList.add('shown');
  }, 500);

  // resetar vidas
  lifes = configs ? configs.vidas : 3;
  localStorage.setItem('lifes', lifes);
  updateLives();

  // resetar dicas
  clues = configs ? configs.ajudas : 2;
  localStorage.setItem('clues', clues);
  updateClues();
}

nextLevel.addEventListener('click', () => {
  endPopup.classList.remove('shown');
  background[1].classList.remove('shown');
});

// REMOVIDO: O popup de início agora é tratado dentro da função assíncrona.

class Question {
  constructor({ id, level, theme, question, options, correct, explanation }) {
    this.id = id;
    this.level = level;
    this.theme = theme || '';
    this.question = question;
    this.options = options;
    this.correct = correct;
    this.explanation = explanation;
  }
  getWrong() {
    let wrong = parseInt(Math.random() * 4);
    while (wrong === +this.correct) {
      wrong = parseInt(Math.random() * 4);
    }
    return wrong;
  }
}

function disableButtonsAndSkip(currentQuestion) {
  clueButton.style.display = 'none';
  answerButton.textContent = 'Avançar';
  answerButton.classList.add('skip');
  personagem.src = pathsSolo.pathTeacher;
  question.textContent = currentQuestion.explanation;
  question.style.fontSize = '1.2rem';
}

function resetButtonsToDefault() {
  clueButton.style.display = 'block';
  clueButton.disabled = clues <= 0;
  answerButton.textContent = 'Responder';
  answerButton.classList.remove('skip');
  question.style.fontSize = '';
}

(async () => {
  let questions = [];
  let isUsingUserCsv = false;

  if (configs && configs.perguntas && configs.perguntas.length > 0) {
    questions = configs.perguntas.map((p) => new Question(p));
    isUsingUserCsv = true;
    console.log('✅ Usando CSV do usuário no modo Solo.');
  } else {
    const info = await fetch(pathsSolo.pathCsv);
    const data = await info.text();
    let tempQuestions = data.split('\n');
    tempQuestions.shift();
    questions = tempQuestions.reduce((acm, k) => {
      const columns = k.split(';');
      const [
        id,
        level,
        theme,
        questionText,
        a,
        b,
        c,
        d,
        correct,
        explanation,
      ] = columns;
      acm.push(
        new Question({
          id,
          level,
          theme,
          question: questionText,
          options: { 0: a, 1: b, 2: c, 3: d },
          correct,
          explanation,
        })
      );
      return acm;
    }, []);
    console.log('⚠️ Usando CSV padrão (solo.csv) no modo Solo.');
  }

  if (configs) {
    if (!configs.personagens[0]) {
      personagem.src = `../src/assets/Projeto-Quiz/personagem${
        ((currentLevel - 1) % 3) + 1
      }.png`;
    } else {
      personagem.src = configs.personagens[currentLevel - 1]
        ? configs.personagens[currentLevel - 1]
        : configs.personagens[0];
    }
    if (configs.fundos[0]) {
      document.body.style.backgroundImage = `url(${configs.fundos[0]})`;
    }
  }

  const questionsForCurrentLevel = questions.filter(
    (q) => +q.level === currentLevel
  );

  // CORREÇÃO: O popup de início agora aparece na primeira pergunta de QUALQUER fase.
  if (seenQuestions === 1) { 
    let themeName = 'Tema';
    if (questionsForCurrentLevel.length > 0) {
      themeName = questionsForCurrentLevel[0].theme || 'Tema';
    }

    levelText.textContent = `Fase: ${currentLevel}`;
    themeText.textContent = `Tema: ${themeName}`;

//     background[0].classList.add('shown');
//     setTimeout(() => {
//       startPopup.classList.add('shown');
//     }, 500);
//     startLevel.addEventListener('click', () => {
//       startPopup.classList.remove('shown');
//       background[0].classList.remove('shown');
//     });
  }
  // FIM DA CORREÇÃO

  let currentQuestion;
  let availableQuestions = questionsForCurrentLevel.filter(
    (q) => !seenIdQuestions.includes(q.id)
  );

  if (availableQuestions.length === 0 && questionsForCurrentLevel.length > 0) {
    availableQuestions = questionsForCurrentLevel;
  }

  if (localStorage.getItem('currentQuestionId')) {
    const savedId = localStorage.getItem('currentQuestionId');
    currentQuestion = questions.find((q) => q.id == savedId);
  } else if (availableQuestions.length > 0) {
    currentQuestion =
    availableQuestions[parseInt(Math.random() * availableQuestions.length)];
    localStorage.setItem('currentQuestionId', currentQuestion.id);
    seenIdQuestions.push(currentQuestion.id);
    localStorage.setItem('seenIdQuestions', JSON.stringify(seenIdQuestions));
  } else {
    console.error('Nenhuma pergunta disponível para a Fase:', currentLevel);
    if (currentLevel + 1 > totalLevels && seenQuestions === questionsPerLevel)
      window.location = './win.html';
    return;
  }

  // CORREÇÃO: Garantir que o tema apareça para o CSV padrão.
  numberQuestion.textContent = `Fase ${currentQuestion.level}: ${
    currentQuestion.theme || 'Tema'
  }`;
  // FIM DA CORREÇÃO

  question.textContent = currentQuestion.question;

  let seenOption = [];
  if (setupQuestion.length < optionsLength) {
    options.forEach((opt, idx) => {
      let randomOption = parseInt(Math.random() * optionsLength);
      while (seenOption.includes(randomOption)) {
        randomOption = parseInt(Math.random() * optionsLength);
      }
      seenOption.push(randomOption);
      setupQuestion += randomOption;
      opt.textContent =
        letters[idx] + currentQuestion.options[randomOption];
    });
    localStorage.setItem('setupQuestion', setupQuestion);
  } else {
    options.forEach((opt, idx) => {
      opt.textContent =
        letters[idx] + currentQuestion.options[+setupQuestion[idx]];
    });
  }

  if (wrongAnswer && Array.isArray(wrongAnswer) && wrongAnswer.length === 2) {
    const [selectedIndex, correctIndex] = wrongAnswer;
    if (options[selectedIndex]) options[selectedIndex].classList.add('missed');
    if (options[correctIndex]) options[correctIndex].classList.add('selected');
    optionsContainer.style.pointerEvents = 'none';
    disableButtonsAndSkip(currentQuestion);
  }

  if (correctAnswer && Array.isArray(correctAnswer) && correctAnswer.length == 1) {
    const [correctIndex] = correctAnswer;
    if (options[correctIndex]) options[correctIndex].classList.add('selected');
    optionsContainer.style.pointerEvents = 'none';
    disableButtonsAndSkip(currentQuestion);
  }

  if (removedOption !== null && removedOption !== undefined) {
    const remIdx = parseInt(removedOption, 10);
    if (!Number.isNaN(remIdx) && options[remIdx]) {
      options[remIdx].style.backgroundColor = 'grey';
      options[remIdx].style.pointerEvents = 'none';
    }
    clueButton.disabled = clues <= 0;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedOptIndex = options.findIndex((opt) =>
      opt.classList.contains('selected')
    );
    if (selectedOptIndex === -1) {
      alert('Selecione uma opção!');
      return;
    }

    optionsContainer.style.pointerEvents = 'none';
    let correctIndex = Array.from(setupQuestion).findIndex(
      (k) => k == currentQuestion.correct
    );

    if (selectedOptIndex !== correctIndex) {
      options[selectedOptIndex].classList.add('missed');
      options[correctIndex].classList.add('selected');
      localStorage.setItem(
        'wrongAnswer',
        JSON.stringify([selectedOptIndex, correctIndex])
      );
      localStorage.removeItem('correctAnswer');

      lifes--;
      updateLives();
      localStorage.setItem('lifes', lifes);

      if (lifes <= 0) {
        lifes = 0;
        updateLives();
        background[2].classList.add('shown');
        advicePopup.classList.add('shown');
        return;
      }
    } else {
      localStorage.removeItem('wrongAnswer');
      localStorage.setItem('correctAnswer', JSON.stringify([correctIndex]));
    }

    disableButtonsAndSkip(currentQuestion);
  });

  clueButton.addEventListener('click', () => {
    if (clues <= 0) {
      background[2].classList.add('shown');
      setTimeout(() => {
        advicePopup.querySelector('h2').textContent =
          'Parece que você não tem mais dicas disponíveis...';
        restartButton.textContent = 'Continuar';
        advicePopup.classList.add('shown');
      }, 500);
      return;
    }

    clueButton.disabled = true;
    const wrongIdx = currentQuestion.getWrong();
    const corrIdx = Array.from(setupQuestion).findIndex(
      (l) => +l === wrongIdx
    );
    if (corrIdx !== -1 && !localStorage.getItem('removedOption')) {
      options[corrIdx].style.backgroundColor = 'grey';
      options[corrIdx].style.pointerEvents = 'none';
      localStorage.setItem('removedOption', corrIdx);
      clues--;
      updateClues();
      localStorage.setItem('clues', clues);
    }

    setTimeout(() => {
      if (clues > 0) clueButton.disabled = false;
    }, 300);
  });

  restartButton.addEventListener('click', () => {
    const label = restartButton.textContent.trim().toLowerCase();
    if (label === 'continuar') {
      advicePopup.classList.remove('shown');
      background[2].classList.remove('shown');
      restartButton.textContent = 'Reiniciar';
      return;
    }
    localStorage.clear();
    localStorage.setItem('configs', JSON.stringify(configs));
    window.location.reload();
  });
})();

function selectOption(selectedOpt) {
  if (wrongAnswer || correctAnswer) return;
  const optElem =
    selectedOpt instanceof Element
      ? selectedOpt
      : selectedOpt.currentTarget || null;
  if (!optElem) return;
  options.forEach((opt) => opt.classList.remove('selected'));
  optElem.classList.add('selected');
}

document.addEventListener('DOMContentLoaded', () => {
  options.forEach((opt) => opt.addEventListener('click', selectOption));
  setTimeout(() => {
    const skipButton = document.querySelector('form .skip');
    if (skipButton) skipButton.addEventListener('click', handleSkip);
    answerButton.addEventListener('click', (e) => {
      if (answerButton.classList.contains('skip')) {
        e.preventDefault();
        handleSkip();
      }
    });
  }, 100);
});

function handleSkip() {
  if (currentLevel + 1 > totalLevels && seenQuestions === questionsPerLevel) {
    window.location = './win.html';
    return;
  }
  if (lifes <= 0) {
    background[2].classList.add('shown');
    advicePopup.classList.add('shown');
    return;
  }

  localStorage.removeItem('currentQuestionId');
  localStorage.removeItem('removedOption');
  localStorage.removeItem('wrongAnswer');
  localStorage.removeItem('correctAnswer');
  localStorage.removeItem('setupQuestion');

  optionsContainer.style.pointerEvents = 'all';
  options.forEach((opt) => opt.classList.remove('selected', 'missed'));
  resetButtonsToDefault();

  if (seenQuestions === questionsPerLevel) {
    currentLevel++;
    seenQuestions = 0;
  }
  seenQuestions++;
  localStorage.setItem('currentLevel', currentLevel);
  localStorage.setItem('seenQuestions', seenQuestions);
  window.location.reload();
}