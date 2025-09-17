const numberQuestion = document.querySelector('aside .perguntaContainer .pergunta span')
const question = document.querySelector('aside .perguntaContainer .pergunta p')
const answerButton = document.querySelector('form .answerButton');
const clueButton = document.querySelector('form .clueButton')
const options = Array.from(document.querySelectorAll('.respostas form .labels label'));
const optionsContainer = document.querySelector('.respostas form .labels');

const letters = ['A) ', 'B) ', 'C) ', 'D) '];

let optionsLength = 4, totalLevels = 3, totalQuestionsPerLevel = 5;

const lifeSpan = document.querySelector('.menu .vida .lifes');
const clueSpan = document.querySelector('.menu .ajuda .clues');
const personagem = document.querySelector('.perguntaContainer img');

// <-- inicializações corrigidas para preservar 0 corretamente -->
let lifes = Number(localStorage.getItem('lifes') ?? 3);
let clues = Number(localStorage.getItem('clues') ?? 2);

function updateLives() { if (lifeSpan) lifeSpan.textContent = '❤️'.repeat(lifes); }
function updateClues() { if (clueSpan) clueSpan.textContent = '💡'.repeat(clues); }

updateLives();
updateClues();

// outras variáveis de estado (também usando ?? para defaults)
let currentLevel = Number(localStorage.getItem('currentLevel') ?? 1);
let setupQuestion = localStorage.getItem('setupQuestion') ?? '';
let seenQuestions = Number(localStorage.getItem('seenQuestions') ?? 1);
let seenIdQuestions = JSON.parse(localStorage.getItem('seenIdQuestions')) || [];

let wrongAnswer = JSON.parse(localStorage.getItem('wrongAnswer') || 'false');
let correctAnswer = JSON.parse(localStorage.getItem('correctAnswer') || 'false');
let removedOption = localStorage.getItem('removedOption');

const form = document.querySelector('form');
const background = Array.from(document.querySelectorAll('.background'))
const startPopup = background[0].querySelector('.popupInicio');
const endPopup = background[1].querySelector('.popupFim');
const endSpan = endPopup.querySelector('span')
const advicePopup = background[2].querySelector('.popupAviso');
const restartButton = advicePopup.querySelector('button');
const nextLevel = document.querySelector('.proximaFase');
const startLevel = document.querySelector('.inicioFase');
const levelText = document.querySelector('.popupInicio .faseContainer h2:first-child');
const themeText = document.querySelector('.popupInicio .faseContainer h2:nth-child(2)');

// --- helpers para popup/advice e restart ---
function restartGame() {
  localStorage.clear();
  window.location.reload();
}

function showAdvice(message, btnText = 'Reiniciar', btnHandler = restartGame) {
  advicePopup.querySelector('h2').textContent = message;
  restartButton.textContent = btnText;
  restartButton.onclick = (e) => {
    e.preventDefault();
    btnHandler();
  };

  background[2].classList.add('shown');
  setTimeout(() => {
    advicePopup.classList.add('shown');
  }, 200);
}

// configuração inicial do botão (padrão reiniciar)
restartButton.onclick = restartGame;

// -------- popup final --------
if (currentLevel > totalLevels) {
  background[1].classList.add('shown');
  endSpan.textContent = totalLevels;
  setTimeout(() => { endPopup.classList.add('shown'); }, 500);
  lifes = 3; localStorage.setItem('lifes', lifes); updateLives();
}

nextLevel.addEventListener('click', () =>{
  endPopup.classList.remove('shown');
  background[1].classList.remove('shown');
});

// -------- popup início em todas fases --------
if (seenQuestions === 1 && currentLevel <= totalLevels) {
  const temas = ['Árvores', 'Animais', 'Frutas']; // Exemplo
  const currentFaseAndTheme = [currentLevel, temas[currentLevel-1] || 'Tema'];
  levelText.textContent = `Fase: ${currentFaseAndTheme[0]}`;
  themeText.textContent = `Tema: ${currentFaseAndTheme[1]}`;
  background[0].classList.add('shown');
  setTimeout(()=>{ startPopup.classList.add('shown'); }, 500)
  startLevel.addEventListener('click', ()=>{
    startPopup.classList.remove('shown');
    background[0].classList.remove('shown');
  })
}

class Question{
  constructor({id, level, question, options, correct, clue, explanation}){
    this.id=id; this.level=level; this.question=question;
    this.options=options; this.correct=correct; this.clue=clue; this.explanation=explanation;
  }
  getWrong(){
    let wrong=parseInt(Math.random()*4);
    while(wrong===+this.correct){ wrong=parseInt(Math.random()*4); }
    return wrong;
  }
}

function disableButtonsAndSkip(currentQuestion){
  clueButton.style.display='none';
  answerButton.textContent='Avançar';
  answerButton.classList.add('skip');
  personagem.src='./assets/Projeto-Quiz/professor.png';
  question.textContent=currentQuestion.explanation;
  question.style.fontSize='1.2rem';
}

function resetButtonsToDefault(){
  clueButton.style.display='block';
  answerButton.textContent='Responder';
  answerButton.classList.remove('skip');
  question.style.fontSize='';
}

(async()=>{
  const info = await fetch(`../../src/assets/solo.csv`);
  const data = await info.text();
  let questions = data.split('\n');
  questions.shift();
  personagem.src = `./assets/Projeto-Quiz/personagem${((currentLevel-1)%3)+1}.png`;

  questions = questions.reduce((acm,k)=>{
    const [id, level, question, a,b,c,d, correct, clue, explanation] = k.split(';');
    acm.push(new Question({id, level, question, options:{0:a,1:b,2:c,3:d}, correct, clue, explanation}));
    return acm;
  },[])

  let currentQuestion;
  if(localStorage.getItem('currentQuestionId')){
    const savedId = localStorage.getItem('currentQuestionId');
    currentQuestion = questions.find(q=>q.id==savedId);
  } else {
    currentQuestion = currentLevel===1
      ? questions[parseInt(Math.random()*totalQuestionsPerLevel)]
      : questions[parseInt(Math.random()*totalQuestionsPerLevel)+totalQuestionsPerLevel];
    while(seenIdQuestions.includes(currentQuestion.id)){
      currentQuestion = currentLevel===1
        ? questions[parseInt(Math.random()*totalQuestionsPerLevel)]
        : questions[parseInt(Math.random()*totalQuestionsPerLevel)+totalQuestionsPerLevel];
    }
    localStorage.setItem('currentQuestionId', currentQuestion.id);
    seenIdQuestions.push(currentQuestion.id);
    localStorage.setItem('seenIdQuestions', JSON.stringify(seenIdQuestions));
  }

  numberQuestion.textContent = `Fase ${currentQuestion.level}`;
  question.textContent = currentQuestion.question;

  let seenOption=[];
  if(setupQuestion.length<optionsLength){
    options.forEach((opt, idx)=>{
      let rand = parseInt(Math.random()*optionsLength);
      while(seenOption.includes(rand)) rand=parseInt(Math.random()*optionsLength);
      seenOption.push(rand);
      setupQuestion+=rand;
      opt.textContent = letters[idx]+currentQuestion.options[rand];
    });
    localStorage.setItem('setupQuestion', setupQuestion);
  } else {
    options.forEach((opt,idx)=>{
      opt.textContent = letters[idx]+currentQuestion.options[setupQuestion[idx]];
    })
  }

  // restauração questão errada/certa
  if (wrongAnswer && Array.isArray(wrongAnswer) && wrongAnswer.length === 2) {
    const [selectedIndex, correctIndex] = wrongAnswer;
    numberQuestion.textContent = `Fase ${currentQuestion.level}`;
    question.textContent = currentQuestion.question;
    options.forEach((opt, idx) =>{
      opt.textContent = letters[idx] + currentQuestion.options[idx];
    });
    options[selectedIndex]?.classList.add('missed');
    options[correctIndex]?.classList.add('selected');
    optionsContainer.style.pointerEvents = 'none';
    disableButtonsAndSkip(currentQuestion);
  } else if (correctAnswer && Array.isArray(correctAnswer) && correctAnswer.length === 1) {
    numberQuestion.textContent = `Fase ${currentQuestion.level}`;
    question.textContent = currentQuestion.question;
    options.forEach((opt, idx) =>{
      opt.textContent = letters[idx] + currentQuestion.options[idx];
    });
    options[correctAnswer]?.classList.add('selected');
    optionsContainer.style.pointerEvents = 'none';
    disableButtonsAndSkip(currentQuestion);
  } 
  if(removedOption){
    options[removedOption].style.backgroundColor='grey';
    clueButton.disabled=true;
  }

  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const selectedOptIndex = options.findIndex(opt=>opt.classList.contains('selected'));
    if(selectedOptIndex===-1){ alert('Selecione uma opção!'); return; }

    optionsContainer.style.pointerEvents='none';
    const mapping=(setupQuestion||'').split('').map(ch=>+ch);
    let correctIndex=mapping.findIndex(n=>n===Number(currentQuestion.correct));
    if(correctIndex===-1) correctIndex=Number(currentQuestion.correct);

    if(selectedOptIndex!==correctIndex){
        options[selectedOptIndex].classList.add('missed');
        options[correctIndex].classList.add('selected');
        localStorage.setItem('wrongAnswer',JSON.stringify([selectedOptIndex,correctIndex]));
        localStorage.removeItem('correctAnswer');
        lifes--;
        updateLives();
        localStorage.setItem('lifes', lifes);
        if(lifes <= 0){
            lifes = 0;
            updateLives();
            showAdvice('Você perdeu todas as vidas!', 'Reiniciar', restartGame);
            return; 
        }
    } else {
        localStorage.removeItem('wrongAnswer');
        localStorage.setItem('correctAnswer',JSON.stringify([correctIndex]));
    }

    disableButtonsAndSkip(currentQuestion);
  });

  // --- botão de ajuda corrigido ---
  clueButton.addEventListener('click', ()=>{
    if (clues <= 0) {
      showAdvice('Parece que você não tem mais dicas disponíveis...', 'Continuar', () => {
        advicePopup.classList.remove('shown');
        background[2].classList.remove('shown');
      });
      return;
    }

    clueButton.disabled = true;

    const wrongIdx=currentQuestion.getWrong();
    const mapping=(setupQuestion||'').split('').map(ch=>+ch);
    const corrIdx=mapping.findIndex(l=>l===wrongIdx);

    if(clues>1 && corrIdx>=0 && options[corrIdx]){
      options[corrIdx].style.backgroundColor='grey';
      options[corrIdx].style.pointerEvents='none';
      localStorage.setItem('removedOption',corrIdx);
    }

    clues--;
    updateClues();
    localStorage.setItem('clues',clues);

    if(clues===0){
      showAdvice('Parece que você não tem mais dicas disponíveis...', 'Continuar', () => {
        advicePopup.classList.remove('shown');
        background[2].classList.remove('shown');
      });
    }
  });
})();

function selectOption(selectedOpt){
  if(wrongAnswer || correctAnswer) return;
  const optElem = (selectedOpt instanceof Element) ? selectedOpt : selectedOpt.currentTarget || null;
  if(!optElem) return;
  options.forEach(opt=>opt.classList.remove('selected'));
  optElem.classList.add('selected');
}

document.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{
    const skipButton=document.querySelector('form .skip');
    if(skipButton) skipButton.addEventListener('click',handleSkip);
    answerButton.addEventListener('click',(e)=>{
      if(answerButton.classList.contains('skip')){ e.preventDefault(); handleSkip(); }
    });
  },100);
});

// --- avanço de fase corrigido ---
function handleSkip(){
    if(lifes <= 0){
        showAdvice('Você perdeu todas as vidas!', 'Reiniciar', restartGame);
        return;
    }
    localStorage.removeItem('currentQuestionId');
    localStorage.removeItem('removedOption');
    localStorage.removeItem('wrongAnswer');
    localStorage.removeItem('correctAnswer');
    localStorage.removeItem('setupQuestion');

    optionsContainer.style.pointerEvents='all';
    options.forEach(opt => opt.classList.remove('selected','missed'));
    resetButtonsToDefault();

    if(seenQuestions >= totalQuestionsPerLevel){
        currentLevel++;
        seenQuestions = 0;
    }
    seenQuestions++;
    localStorage.setItem('currentLevel',currentLevel);
    localStorage.setItem('seenQuestions',seenQuestions);
    window.location.reload();
}

