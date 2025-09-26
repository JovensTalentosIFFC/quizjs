const configs = JSON.parse(localStorage.getItem('configs'));
(async () => {
    let questions = [];

    if (configs && configs.perguntas && configs.perguntas.length > 0) {
        // CSV do usuário
        questions = configs.perguntas.map(p => new Question(p));
        console.log("✅ Usando CSV do usuário");
    } else {
        // CSV padrão
        const info = await fetch(`../../src/assets/solo.csv`);
        const data = await info.text();
        const linhas = data.split('\n').slice(1);
        questions = linhas.map((k, idx) => {
            const [id, level, question, a,b,c,d, correct, clue, explanation] = k.split(';');
            return new Question({id, level, question, options:{0:a,1:b,2:c,3:d}, correct, clue, explanation});
        });
        console.log("⚠️ Usando CSV padrão");
    }

    // ... resto do código para exibir perguntas ...
})();


let optionsLength = 4, totalLevels = configs ? configs.fases : 2, totalQuestionsPerLevelOnCsv = 20, questionsPerLevel=configs ? configs.questoes : 4;
let currentFaseAndTheme;


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
const tiebreak = document.querySelector('.desempate');
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
scoreTime1Span.textContent = scoreTime1;
scoreTime2Span.textContent = scoreTime2;

// let scores = {
  //   scoreTime1: 0 || +localStorage.getItem('scoreTime1'),
  //   scoreTime2: 0 || +localStorage.getItem('scoreTime2')
  // }
  
  let currentLevel = +localStorage.getItem('currentLevel') || 1;
  let seenIdQuestions = JSON.parse(localStorage.getItem('seenIdQuestions')) || [];
  let seenQuestions = +localStorage.getItem('seenQuestions') || 1;
  let currentTheme = localStorage.getItem('theme');
  document.querySelector('body').style.backgroundImage = `url('./assets/Projeto-Quiz/tela${currentTheme}.png')`
  let currentQuestionId = +localStorage.getItem('currentQuestionId') || 1;
  let setupQuestion = localStorage.getItem('setupQuestion') || '';

// CORREÇÃO: Verificar se wrongAnswer existe e fazer parse correto
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



if(seenQuestions-1 % questionsPerLevel===0 && currentLevel!==1){
  localStorage.setItem('questionsPerLevel', questionsPerLevel);
 // new level 
  background[1].classList.add('shown');
  endSpan.textContent = currentLevel;
  if(currentTheme) themeEndPopup.textContent = currentTheme;
  setTimeout(() =>{
    endPopup.classList.add('shown');
  }, 500)
}
numPergunta.textContent = `${seenQuestions}/${questionsPerLevel}`

// if(questionsPerLevel===5) {
  
//   tiebreak.classList.add('shown');
//   setTimeout(() =>{
//     tiebreak.classList.remove('shown');
//   }, 2000);
//   seenQuestions--;
// }

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
  constructor({id, level, theme,question, options, correct,explanation}){
    this.id = id
    this.level = level;
    this.theme = theme
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
}

function resetButtonsToDefault(){
  // CORREÇÃO: Restaura os botões para o estado inicial
  answerButton.textContent = 'Responder'; // ou o texto original
  answerButton.classList.remove('skip');
  question.style.fontSize = ''; // Remove o fontSize customizado
}

(async () => {
  // const info = await fetch(`../../src/assets/quiz_${localStorage.getItem('theme').toLowerCase()}.csv`)
  const info = await fetch(`../../src/assets/quiz_tecnologia.csv`)
  const data = await info.text();

  let questions = data.split('\n');
  questions.shift();

  if(configs){
    if(!configs.personagens[0]){
    personagem.src = `./assets/Projeto-Quiz/personagem${((currentLevel-1)%3)+1}.png`; 
    } else{
      personagem.src = configs.personagens[currentLevel-1] ? configs.personagens[currentLevel-1] : configs.personagens[0]
    }
    if(configs.fundos[0]){
      document.body.style.backgroundImage = `url(${configs.fundos[0]})`
    }
  }


  let levelThemes = [];
  questions = questions.reduce((acm,k)=>{
    const [id, level, theme,question, a,b,c,d, correct, explanation] = k.split(';');
    const tempQuestion = new Question({id,level, theme,question, options:{0:a,1:b,2:c,3:d}, correct, explanation});
    acm.push(tempQuestion);
    if(!levelThemes.includes(tempQuestion.theme)){
      levelThemes.push(tempQuestion.theme)
    }
    return acm;
  },[])
  let currentQuestion;
  if(localStorage.getItem('currentQuestionId')){
    const savedId = localStorage.getItem('currentQuestionId');
    currentQuestion = questions.find(q=>q.id==savedId);
  } else {

    currentQuestion = currentLevel===1
      ? questions[parseInt(Math.random()*totalQuestionsPerLevelOnCsv)]
      : questions[parseInt(Math.random()*totalQuestionsPerLevelOnCsv)+totalQuestionsPerLevelOnCsv];
    while(seenIdQuestions.includes(currentQuestion.id)){
      currentQuestion = currentLevel===1
        ? questions[parseInt(Math.random()*totalQuestionsPerLevelOnCsv)]
        : questions[parseInt(Math.random()*totalQuestionsPerLevelOnCsv)+totalQuestionsPerLevelOnCsv];
    }
    localStorage.setItem('currentQuestionId', currentQuestion.id);
    seenIdQuestions.push(currentQuestion.id);
    localStorage.setItem('seenIdQuestions', JSON.stringify(seenIdQuestions));
  }

  console.log(levelThemes)
  numberLevel.textContent = `Fase ${currentLevel}: ${levelThemes[currentLevel-1]}`;
  themeText.textContent = levelThemes[currentLevel-1];
  themeEndPopup.textContent = 'Tema: ' + levelThemes[currentLevel-1];
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

  if(correctAnswer && Array.isArray(correctAnswer) && correctAnswer.length==1){
    console.log('ok')
    const [correctIndex] = correctAnswer;
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
      localStorage.removeItem('correctAnswer');

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
      localStorage.setItem('correctAnswer',JSON.stringify([correctIndex]));
      if(localStorage.getItem("currentTime") == "Time1"){
        scoreTime1+=100;
        localStorage.setItem('scoreTime1', scoreTime1);
        scoreTime1Span.textContent = scoreTime1;
      } else if(localStorage.getItem('currentTime') === "Time2"){
        scoreTime2+=100;
        localStorage.setItem('scoreTime2', scoreTime2);
        scoreTime2Span.textContent = scoreTime2;
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


  if(seenQuestions===questionsPerLevel && currentLevel===totalLevels){
      if(scoreTime1!==scoreTime2){ 
        if(scoreTime1>scoreTime2){
            window.location = './winTime1.html';
            return;
          
        }
        else if(scoreTime2>scoreTime1){
          window.location = './winTime2.html';
          return;
        }
    }
  }

  console.log('Avançando questão...');
  localStorage.removeItem('currentQuestionId');

  localStorage.removeItem('removedOption');
  localStorage.removeItem('wrongAnswer');
  localStorage.removeItem('correctAnswer');
  localStorage.removeItem('setupQuestion');
  localStorage.removeItem('currentTime')

  // ==================== desempate

  optionsContainer.style.pointerEvents = 'all';
  
  options.forEach(opt => {
    opt.classList.remove('selected', 'missed');
  });
  
  resetButtonsToDefault();
  
  if(seenQuestions===questionsPerLevel){
    currentLevel++;
    seenQuestions=0
  }

  seenQuestions++;
  localStorage.setItem('currentLevel', currentLevel);
  localStorage.setItem('seenQuestions', seenQuestions);

  window.location.reload();
}

const selectTime1Function = () =>{
  selectTime1.disabled = true;
  selectTime1.textContent = 'Selecionado';
  if(selectTime2.textContent==='Selecionado') selectTime2.textContent='Selecionar';
  localStorage.setItem( "currentTime" , "Time1" )
  selectTime2.disabled = false;
}

const selectTime2Function = () =>{
  selectTime2.disabled=true;
  selectTime2.textContent = 'Selecionado';
  if(selectTime1.textContent==='Selecionado') selectTime1.textContent='Selecionar';
  localStorage.setItem( "currentTime", "Time2" )
  selectTime1.disabled=false;
}

selectTime1.addEventListener('click', selectTime1Function)
document.addEventListener('keydown', ({ key }) =>{
  if(key==='1') selectTime1Function();
})

selectTime2.addEventListener('click', selectTime2Function);
document.addEventListener('keydown', ({ key }) =>{
  if(key==='2') selectTime2Function();
})