const numberQuestion = document.querySelector('aside .perguntaContainer .pergunta span')
const question = document.querySelector('aside .perguntaContainer .pergunta p')
const answerButton = document.querySelector('form .answerButton');
const clueButton = document.querySelector('form .clueButton')
const options = Array.from(document.querySelectorAll('.respostas form .labels label'));
const optionsContainer = document.querySelector('.respostas form .labels');

const letters = ['A) ', 'B) ', 'C) ', 'D) '];

let optionsLength=4, questionsPerLevel=4, currentFaseAndTheme, questionsLength=15;
let totalLevels=3, totalQuestionsPerLevel=5;
const lifeImg = document.querySelector('.menu .vida img');
const scoreImg = document.querySelector('.avanco img');
const clueImg = document.querySelector('.menu .ajuda img');
const personagem = document.querySelector('.perguntaContainer img');

let lifes = +localStorage.getItem('lifes') || 4;
let clues= +localStorage.getItem('clues') || 3;
let score = 0 || +localStorage.getItem('score');

scoreImg.src = `./assets/Projeto-Quiz/avanco${score}.png`;
lifeImg.src = `./assets/Projeto-Quiz/${lifes-1}vidas.png`;
clueImg.src = clues-1 ? `./assets/Projeto-Quiz/${clues-1}ajuda.png` : null;

let currentLevel = +localStorage.getItem('currentLevel') || 1;
let setupQuestion = localStorage.getItem('setupQuestion') || '';
let seenQuestions = +localStorage.getItem('seenQuestions') || 1;
let seenIdQuestions = JSON.parse(localStorage.getItem('seenIdQuestions')) || [];

// Restaurar estado salvo
let wrongAnswer = JSON.parse(localStorage.getItem('wrongAnswer') || 'false');
let correctAnswer = JSON.parse(localStorage.getItem('correctAnswer') || 'false');
let removedOption = localStorage.getItem('removedOption');

const form = document.querySelector('form');
const background = Array.from(document.querySelectorAll('.background'))
const startPopup = background[0].querySelector('.popupInicio');
const endPopup = background[1].querySelector('.popupFim');
const endText = endPopup.querySelector('p');
const endSpan = endPopup.querySelector('span')
const advicePopup = background[2].querySelector('.popupAviso');
const restartButton = advicePopup.querySelector('button');
const nextLevel = document.querySelector('.proximaFase');
const startLevel = document.querySelector('.inicioFase');
const levelText = document.querySelector('.popupInicio .faseContainer h2:first-child');
const themeText = document.querySelector('.popupInicio .faseContainer h2:nth-child(2)');

if(currentLevel===totalLevels && seenQuestions===1){
  background[1].classList.add('shown');
  endSpan.textContent = currentLevel+1;
  setTimeout(() =>{
    endPopup.classList.add('shown');
  }, 500)
  localStorage.setItem('score', 0);

  lifes=4;
  lifeImg.src=`./assets/Projeto-Quiz/${lifes-1}vidas.png`
  localStorage.setItem('lifes', lifes)
  score=0;
  scoreImg.src = `./assets/Projeto-Quiz/avanco${score}.png`;
  localStorage.setItem('score', score);
}

nextLevel.addEventListener('click', () =>{
  endPopup.classList.remove('shown');
  background[1].classList.remove('shown');
})

if(seenQuestions===1 && currentLevel===1){
  currentFaseAndTheme = [1, 'Árvores']

  levelText.textContent = `Fase: ${currentFaseAndTheme[0]}`;
  themeText.textContent = `Tema: ${currentFaseAndTheme[1]}`;

  background[0].classList.add('shown');
  setTimeout(() =>{
    startPopup.classList.add('shown');
  }, 500)
  startLevel.addEventListener('click', () =>{
    startPopup.classList.remove('shown');
    background[0].classList.remove('shown');
  })
}

class Question{
  constructor({id, level, question, options, correct, clue, explanation}){
    this.id = id
    this.level = level;
    this.question = question;
    this.options = options;
    this.correct = correct;
    this.clue = clue;
    this.explanation = explanation;
  }

  getWrong(){
    let wrongAnswer = parseInt(Math.random()*4);
    while(wrongAnswer=== +this.correct){
      wrongAnswer = parseInt(Math.random()*4);
    }
    return wrongAnswer;
  }
}

function disableButtonsAndSkip(currentQuestion){
  clueButton.style.display='none'
  answerButton.textContent = 'Avançar'
  answerButton.classList.add('skip');
  personagem.src = './assets/Projeto-Quiz/professor.png';
  question.textContent = currentQuestion.explanation;
  question.style.fontSize='1.2rem'
}

function resetButtonsToDefault(){
  clueButton.style.display='block';
  answerButton.textContent = 'Responder';
  answerButton.classList.remove('skip');
  question.style.fontSize = '';
}

(async () => {
  const info = await fetch(`../../src/assets/solo.csv`)
  const data = await info.text();
  let questions = data.split('\n');
  questions.shift();
  personagem.src = `./assets/Projeto-Quiz/personagem${((currentLevel-1)%3)+1}.png`;
  
  questions = questions.reduce((acm, k, j) =>{
    const [id, level, question, a, b, c, d, correct, clue, explanation] = k.split(';');
    acm.push(new Question({
      id,
      level,
      question,
      options: { 0: a, 1: b, 2: c, 3: d },
      correct,
      clue,
      explanation
    }))
    return acm;
  }, [])

  let currentQuestion;

  // Restauração de questão errada
  if (wrongAnswer && Array.isArray(wrongAnswer) && wrongAnswer.length === 3) {
    const [selectedIndex, correctIndex, wrongQuestionId] = wrongAnswer;
    currentQuestion = questions[wrongQuestionId - 1];

    numberQuestion.textContent = `Fase ${currentQuestion.level}`;
    question.textContent = currentQuestion.question;

    options.forEach((opt, idx) =>{
      opt.textContent = letters[idx] + currentQuestion.options[idx];
    });

    options[selectedIndex]?.classList.add('missed');
    options[correctIndex]?.classList.add('selected');

    optionsContainer.style.pointerEvents = 'none';
    disableButtonsAndSkip(currentQuestion);

  // Restauração de questão correta
  } else if (correctAnswer && Array.isArray(correctAnswer) && correctAnswer.length === 2) {
    const [correctIndex, correctQuestionId] = correctAnswer;
    currentQuestion = questions[correctQuestionId - 1];

    numberQuestion.textContent = `Fase ${currentQuestion.level}`;
    question.textContent = currentQuestion.question;

    options.forEach((opt, idx) =>{
      opt.textContent = letters[idx] + currentQuestion.options[idx];
    });

    options[correctIndex]?.classList.add('selected');

    optionsContainer.style.pointerEvents = 'none';
    disableButtonsAndSkip(currentQuestion);

  } else {
    // Carregar nova questão normalmente
    currentQuestion = currentLevel===1 ?  
      questions[parseInt(Math.random()*totalQuestionsPerLevel)] : 
      questions[parseInt(Math.random()*totalQuestionsPerLevel)+totalQuestionsPerLevel];

    while(seenIdQuestions.includes(currentQuestion.id)){
      currentQuestion = currentLevel===1 ?  
        questions[parseInt(Math.random()*5)] : 
        questions[parseInt(Math.random()*5)+5];
    }

    seenIdQuestions.push(currentQuestion.id);
    localStorage.setItem('seenIdQuestions', JSON.stringify(seenIdQuestions));

    numberQuestion.textContent = `Fase ${currentQuestion.level}`;
    question.textContent = currentQuestion.question;

    let seenOption = [];
    if(setupQuestion.length < optionsLength){
      options.forEach((opt, idx)=>{
        let randomOption = parseInt(Math.random()*optionsLength);
        while(seenOption.includes(randomOption)){
          randomOption = parseInt(Math.random()*optionsLength);
        }
        seenOption.push(randomOption);
        setupQuestion += randomOption;

        opt.textContent = letters[idx] + currentQuestion.options[randomOption];
      })
      localStorage.setItem('setupQuestion', setupQuestion);
    } else{
      options.forEach((opt, idx) =>{
        opt.textContent = letters[idx] + currentQuestion.options[setupQuestion[idx]];
      })
    }
  }
  
  if(removedOption){
    options[removedOption].style.backgroundColor='grey';
    clueButton.disabled=true;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const selectedOptIndex = options.findIndex(opt => Array.from(opt.classList).includes('selected')) ?? -1
    const selectedOpt = options[selectedOptIndex];
    
    if(selectedOptIndex === -1){
      alert('Por favor, selecione uma opção!');
      return;
    }

    optionsContainer.style.pointerEvents = 'none';
    let correctIndex = Array.from(setupQuestion).findIndex(k => k == currentQuestion.correct);
    
    if(selectedOptIndex !== correctIndex){
      // ERRO
      selectedOpt.classList.add('missed');
      options[correctIndex].classList.add('selected');
      localStorage.setItem('wrongAnswer', JSON.stringify([selectedOptIndex, correctIndex, +currentQuestion.id]));
      localStorage.removeItem('correctAnswer');

      lifes--;
      if(lifes===1){
        background[2].classList.add('shown');
        setTimeout(() =>{
          advicePopup.classList.add('shown');
        }, 500)
      }
      if(lifes>0) lifeImg.src = `./assets/Projeto-Quiz/${lifes}vidas.png`;
      localStorage.setItem('lifes', lifes)

    } else { 
      // ACERTO
      localStorage.removeItem('wrongAnswer');
      localStorage.setItem('correctAnswer', JSON.stringify([correctIndex, +currentQuestion.id]));

      score++;
      scoreImg.src = `./assets/Projeto-Quiz/avanco${score}.png`
      localStorage.setItem('score', score);
    }

    disableButtonsAndSkip(currentQuestion);
  })

  clueButton.addEventListener('click', () =>{
    clueButton.disabled=true;
    const anyWrongIndex = currentQuestion.getWrong();
    const correspondentIndex = Array.from(setupQuestion).findIndex(let => +let===anyWrongIndex);
    if(clues>1){
      options[correspondentIndex].style.backgroundColor = 'grey'
      options[correspondentIndex].style.pointerEvents = 'none';
      localStorage.setItem('removedOption', correspondentIndex);
    }
    clues--;
    if(clues>0) clueImg.src = clues-1 ? `./assets/Projeto-Quiz/${clues-1}ajuda.png` : null;
    localStorage.setItem('clues', clues);
    if(clues===0){
      localStorage.setItem('clues', clues+1);
      background[2].classList.add('shown');
      setTimeout(() =>{
        advicePopup.querySelector('h2').textContent = 'Parece que você não tem mais dicas disponíveis...'
        advicePopup.querySelector('button').textContent='Continuar';
        advicePopup.classList.add('shown');
      }, 500)
    }
  })

  restartButton.addEventListener('click', () =>{
    if(restartButton.textContent==='Reiniciar'){
      localStorage.clear();
      window.location.reload();
    } else{
      advicePopup.classList.remove('shown');
      background[2].classList.remove('shown');
    }
  })

})()

function selectOption(selectedOpt){
  if (wrongAnswer || correctAnswer) {
    return;
  }
  
  selectedOpt.classList.toggle('selected');
  options.forEach(opt =>{
    if(selectedOpt !== opt){
      opt.classList.remove('selected');
    }
  })
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const skipButton = document.querySelector('form .skip');
    if (skipButton) {
      skipButton.addEventListener('click', handleSkip);
    }
    
    answerButton.addEventListener('click', (e) => {
      if (answerButton.classList.contains('skip')) {
        e.preventDefault();
        handleSkip();
      }
    });
  }, 100);
});

function handleSkip() {
  if(seenQuestions===4 && currentLevel===totalLevels){
      window.location = './win.html'
      return;
  }

  localStorage.removeItem('removedOption');
  localStorage.removeItem('wrongAnswer');
  localStorage.removeItem('correctAnswer');
  localStorage.removeItem('setupQuestion');
  
  optionsContainer.style.pointerEvents = 'all';
  
  options.forEach(opt => {
    opt.classList.remove('selected', 'missed');
  });
  
  resetButtonsToDefault();
  
  if(seenQuestions===4){
    currentLevel++;
    seenQuestions=0;
  }
  seenQuestions++;
  localStorage.setItem('currentLevel', currentLevel);
  localStorage.setItem('seenQuestions', seenQuestions);

  window.location.reload();
}
