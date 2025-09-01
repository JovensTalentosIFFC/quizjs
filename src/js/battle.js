const numberLevel = document.querySelector('aside .perguntaContainer .pergunta span')
const question = document.querySelector('aside .perguntaContainer .pergunta p')
const answerButton = document.querySelector('form .answerButton');
const options = Array.from(document.querySelectorAll('.respostas form .labels label'));
const optionsContainer = document.querySelector('.respostas form .labels');
const selectTime1 = document.querySelector(".time1 button")
const selectTime2 = document.querySelector(".time2 button")
const scoreTime1Span = document.querySelector('.pontosTime1');
const scoreTime2Span = document.querySelector('.pontosTime2');
const themeEndPopup = document.querySelector('.theme');
let optionsLength=4, questionsPerLevel= localStorage.getItem('questionsPerLevel') || 4, currentFaseAndTheme, questionsLength=15;

const personagem = document.querySelector('.perguntaContainer img');
const letters = ["A) ","B) ","C) ","D) "];

const form = document.querySelector('form');
const background = Array.from(document.querySelectorAll('.background'))
const startPopup = background[0].querySelector('.popupInicio');
const endPopup = background[1].querySelector('.popupFim');
const endText = endPopup.querySelector('p');
const endSpan = endPopup.querySelector('span')
const advicePopup = background[2].querySelector('.popupAviso');
const nextLevel = document.querySelector('.proximaFase');
const startLevel = document.querySelector('.inicioFase');
const levelText = document.querySelector('.popupInicio .faseContainer h2:first-child');
const themeText = document.querySelector('.popupInicio .faseContainer h2:nth-child(2)');
const numPergunta = document.querySelector('.topPergunta .numPergunta');
const currentTime = localStorage.getItem('currentTime');

let scoreTime1 = 0 || +localStorage.getItem('scoreTime1');
let scoreTime2 = 0 || +localStorage.getItem('scoreTime2');
let correctAnswersTeam1 = 0 || +localStorage.getItem('correctAnswersTeam1');
let correctAnswersTeam2 = 0 || +localStorage.getItem('correctAnswersTeam2');
scoreTime1Span.textContent = scoreTime1;
scoreTime2Span.textContent = scoreTime2;

let finalLevels = [ 4, 9, 14];
// let scores = {
  //   scoreTime1: 0 || +localStorage.getItem('scoreTime1'),
  //   scoreTime2: 0 || +localStorage.getItem('scoreTime2')
  // }
  
  let currentLevel = +localStorage.getItem('currentLevel') || 1;
  let currentTheme = localStorage.getItem('currentTheme');
  let currentQuestionId = +localStorage.getItem('currentQuestionId') || 1;
  let setupQuestion = localStorage.getItem('setupQuestion') || '';

// CORREÇÃO: Verificar se wrongAnswer existe e fazer parse correto
let wrongAnswer = localStorage.getItem('wrongAnswer');
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

if((currentQuestionId-1)%5===0 && currentQuestionId>1){
  questionsPerLevel=4;
  localStorage.setItem('questionsPerLevel', questionsPerLevel);
 // new level 
  background[1].classList.add('shown');
  endSpan.textContent = currentLevel;
  if(currentTheme) themeEndPopup.textContent = currentTheme;
  setTimeout(() =>{
    endPopup.classList.add('shown');
  }, 500)
  correctAnswersTeam1=0;
  correctAnswersTeam2=0;
  localStorage.setItem('correctAnswersTeam1', correctAnswersTeam1);
  localStorage.setItem('correctAnswersTeam2', correctAnswersTeam2);

  
}
numPergunta.textContent = `${((currentQuestionId-1)%5)+1}/${questionsPerLevel}`


if(currentTime==='Time1'){
  selectTime1.disabled = true;
  selectTime1.textContent = 'Selecionado';
  localStorage.setItem( "currentTime" , "Time1" )
  selectTime2.disabled = false;
} else if(currentTime==='Time2'){
  selectTime2.disabled=true;
  selectTime2.textContent = 'Selecionado';
  localStorage.setItem( "currentTime", "Time2" )
  selectTime1.disabled=false;
}




nextLevel.addEventListener('click', () =>{
  endPopup.classList.remove('shown');
  background[1].classList.remove('shown');
})

if(currentQuestionId===1){
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
  constructor({id, level, question, options, correct,explanation}){
    this.id = id
    this.level = level;
    this.question = question;
    this.options = options;
    this.correct = correct;
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
  answerButton.textContent = 'Avançar'
  answerButton.classList.add('skip');
  // explanation
  personagem.src = './assets/Projeto-Quiz/professor.png';
  question.textContent = currentQuestion.explanation;
  question.style.fontSize='1rem'
}

function resetButtonsToDefault(){
  // CORREÇÃO: Restaura os botões para o estado inicial
  answerButton.textContent = 'Responder'; // ou o texto original
  answerButton.classList.remove('skip');
  question.style.fontSize = ''; // Remove o fontSize customizado
}

(async () => {
  const info = await fetch(`../../src/assets/quiz_${localStorage.getItem('theme').toLowerCase()}.csv`)
  const data = await info.text();

  const temaFasesCsv = await fetch(`../../src/assets/temas_${localStorage.getItem('currentTheme').toLowerCase()}.csv`)
  let levelThemes = await temaFasesCsv.text();
  levelThemes = levelThemes.split('\n');
  levelThemes.shift();
  
  levelThemes = levelThemes.reduce((acm, k) =>{
    const [level, theme] = k.split(';');
    acm[level] = theme;
    return acm;
  }, {})

  let questions = data.split('\n');
  questions.shift();
  personagem.src = `./assets/Projeto-Quiz/personagem${((currentLevel-1)%3)+1}.png`;
  questions = questions.reduce((acm, k, j) =>{
    const [id, level, question, a, b, c, d, correct, explanation] = k.split(';');
    acm.push(new Question({
      id,
      level,
      question,
      options: {
        0: a,
        1: b,
        2: c,
        3: d
      },
      correct,
      explanation
    }))
    return acm;
  }, [])

  const currentQuestion = questions[currentQuestionId-1];
  numberLevel.textContent = `Fase ${currentQuestion.level}: ${levelThemes[currentLevel]}`;
  themeText.textContent = levelThemes[currentLevel];
  themeEndPopup.textContent = 'Tema: ' + levelThemes[currentLevel];
  localStorage.setItem('currentTheme', levelThemes[currentLevel])
  themeEndPopup.style.fontSize = '1.2rem'
  // CORREÇÃO: Só mostra a pergunta se não há erro anterior
  if (!wrongAnswer) {
    question.textContent = currentQuestion.question;
  }
  
  let seenOption = [];

  if(setupQuestion.length < optionsLength){
    options.forEach((opt, idx) =>{
        let randomOption = parseInt(Math.random()*optionsLength);
        while(seenOption.includes(randomOption)){
          randomOption = parseInt(Math.random()*optionsLength);
        }
        seenOption.push(randomOption);
        setupQuestion += randomOption;

        opt.textContent = `${letters[idx]} ${currentQuestion.options[randomOption]}`;
    })
    localStorage.setItem('setupQuestion', setupQuestion);
  } else{
    options.forEach((opt, idx) =>{
      opt.textContent = `${letters[idx]} ${currentQuestion.options[setupQuestion[idx]]}`;
    })
  }
  
  // CORREÇÃO: Verifica se tem erro anterior e restaura estado
  if(wrongAnswer && Array.isArray(wrongAnswer) && wrongAnswer.length === 2){
    console.log('Restaurando estado de erro anterior...');
    const [selectedIndex, correctIndex] = wrongAnswer;
    
    // Marca visualmente as respostas
    if(options[selectedIndex]) {
      options[selectedIndex].classList.add('missed');
    }
    if(options[correctIndex]) {
      options[correctIndex].classList.add('selected');
    }
    
    // Desabilita interação
    optionsContainer.style.pointerEvents = 'none';
    
    // Configura interface para modo "já respondida"
    disableButtonsAndSkip(currentQuestion);
  }

  if(removedOption){
    options[removedOption].style.backgroundColor='grey';
  }
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    
    const selectedOptIndex = options.findIndex(opt => Array.from(opt.classList).includes('selected')) ?? -1
    const selectedOpt = options[selectedOptIndex];
    
    if(selectedOptIndex === -1){
      alert('Por favor, selecione uma opção!');
      return;
    }

    if(!localStorage.getItem('currentTime')){
      alert('Por favor, escolha um time!');
      return;
    }
    

    optionsContainer.style.pointerEvents = 'none';
    let correctIndex = Array.from(setupQuestion).findIndex(k => k == currentQuestion.correct);
    
    // =========================== wrong answer
    if(selectedOptIndex !== correctIndex){
      selectedOpt.classList.add('missed');
      options[correctIndex].classList.add('selected');
      localStorage.setItem('wrongAnswer', JSON.stringify([selectedOptIndex, correctIndex]));

      if(localStorage.getItem("currentTime") == "Time1"){
        scoreTime2+=50;
        localStorage.setItem('scoreTime2', scoreTime2);
        scoreTime2Span.textContent = scoreTime2;
      } else if(localStorage.getItem('currentTime') === "Time2"){
        scoreTime1+=50;
        localStorage.setItem('scoreTime1', scoreTime1);
        scoreTime1Span.textContent = scoreTime1;
      }

    } else { // ============================================ correct answer


      localStorage.removeItem('wrongAnswer');
      if(localStorage.getItem("currentTime") == "Time1"){
        scoreTime1+=100;
        localStorage.setItem('scoreTime1', scoreTime1);
        scoreTime1Span.textContent = scoreTime1;
        correctAnswersTeam1++;
        localStorage.setItem('correctAnswersTeam1', correctAnswersTeam1);
      } else if(localStorage.getItem('currentTime') === "Time2"){
        scoreTime2+=100;
        localStorage.setItem('scoreTime2', scoreTime2);
        scoreTime2Span.textContent = scoreTime2;
        correctAnswersTeam2++;
        localStorage.setItem('correctAnswersTeam2', correctAnswersTeam2);
      }


    }

    disableButtonsAndSkip(currentQuestion);
  })

})();

function selectOption(selectedOpt){
  if (wrongAnswer) {
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


  if(currentQuestionId >= questionsLength-1){
    if(scoreTime1>scoreTime2){
      window.location = './winTime1.html';
      return;
    }
    else if(scoreTime2>scoreTime1){
      window.location = './winTime2.html';
      return;
    }
  }

  console.log('Avançando questão...');
  localStorage.removeItem('removedOption');
  localStorage.removeItem('wrongAnswer');
  localStorage.removeItem('setupQuestion');
  localStorage.removeItem('currentTime')

  // ==================== desempate

  optionsContainer.style.pointerEvents = 'all';
  
  options.forEach(opt => {
    opt.classList.remove('selected', 'missed');
  });
  
  resetButtonsToDefault();
  
  if(finalLevels.includes(currentQuestionId)){
    currentLevel++;
    questionsPerLevel=4;
    localStorage.setItem('questionsPerLevel', 4)
    if(correctAnswersTeam1===correctAnswersTeam2 && (correctAnswersTeam1>0 || correctAnswersTeam2>0)){
      console.log('empate')
      questionsPerLevel=5;
      localStorage.setItem('questionsPerLevel', 5);
      
    } else if(correctAnswersTeam1!==correctAnswersTeam2 && (correctAnswersTeam1>0 || correctAnswersTeam2>0)){
      console.log('not empate')
      questionsPerLevel=4;
      currentQuestionId++;
      localStorage.setItem('questionsPerLevel', 4)
    }

  }

  currentQuestionId++;
  localStorage.setItem('currentQuestionId', currentQuestionId);
  localStorage.setItem('currentLevel', currentLevel);


  window.location.reload();
}

selectTime1.addEventListener('click', () =>{
  selectTime1.disabled = true;
  selectTime1.textContent = 'Selecionado';
  localStorage.setItem( "currentTime" , "Time1" )
  selectTime2.disabled = false;
})

selectTime2.addEventListener('click', () =>{
  selectTime2.disabled=true;
  selectTime2.textContent = 'Selecionado';
  localStorage.setItem( "currentTime", "Time2" )
  selectTime1.disabled=false;
})