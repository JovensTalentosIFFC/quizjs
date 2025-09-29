// load configs
const configs = JSON.parse(localStorage.getItem('configs'));
// totalLevels agora será atualizado dinamicamente com base no CSV do usuário ou configs.fases
let optionsLength = 4, totalLevels = configs ? configs.fases : 2, totalQuestionsPerLevelOnCsv = 5, questionsPerLevel=configs ? configs.questoes : 3;
let lifes=configs ? configs.vidas : 3;
let clues=configs ? configs.ajudas : 2;

if(+localStorage.getItem('lifes')) lifes = +localStorage.getItem('lifes');
if(+localStorage.getItem('clues')) clues = +localStorage.getItem('clues');


const numberQuestion = document.querySelector('aside .perguntaContainer .pergunta span')
const question = document.querySelector('aside .perguntaContainer .pergunta p')
const answerButton = document.querySelector('form .answerButton');
const clueButton = document.querySelector('form .clueButton')
const options = Array.from(document.querySelectorAll('.respostas form .labels label'));
const optionsContainer = document.querySelector('.respostas form .labels');


const letters = ['A) ', 'B) ', 'C) ', 'D) '];


const lifeSpan = document.querySelector('.menu .vida .lifes');
const clueSpan = document.querySelector('.menu .ajuda .clues');
const personagem = document.querySelector('.perguntaContainer img');
function updateLives() { if (lifeSpan) lifeSpan.textContent = '❤️'.repeat(lifes); }
function updateClues() { if (clueSpan) clueSpan.textContent = '💡'.repeat(clues); }

updateLives();
updateClues();

let currentLevel = +localStorage.getItem('currentLevel') || 1;
let setupQuestion = localStorage.getItem('setupQuestion') || '';
let seenQuestions = +localStorage.getItem('seenQuestions') || 1;
let seenIdQuestions = JSON.parse(localStorage.getItem('seenIdQuestions')) || [];


let wrongAnswer = JSON.parse(localStorage.getItem('wrongAnswer') || 'false');
let correctAnswer = JSON.parse(localStorage.getItem('correctAnswer') || 'false');
let removedOption = localStorage.getItem('removedOption');

const currentQuestionSpan = document.querySelector('.topPergunta span:nth-child(2)')
currentQuestionSpan.textContent = `${seenQuestions}/${questionsPerLevel}`

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

// inicio cada fase

if(seenQuestions-1 % questionsPerLevel===0 && currentLevel!==1){
  background[1].classList.add('shown');
  endSpan.textContent = currentLevel+1;
  setTimeout(() => { endPopup.classList.add('shown'); }, 500)
  lifes=3; localStorage.setItem('lifes', lifes); updateLives();
}


nextLevel.addEventListener('click', () =>{
  endPopup.classList.remove('shown');
  background[1].classList.remove('shown');
});

// inicio total

if(seenQuestions===1 && currentLevel===1){
  currentFaseAndTheme = [1,'Árvores'];
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
  // Adicionada 'theme' para consistência com o CSV do usuário e 'clue' opcional
  constructor({id, level, theme, question, options, correct, clue, explanation}){ 
    this.id=id; 
    this.level=level; 
    this.theme=theme || ''; 
    this.question=question;
    this.options=options; 
    this.correct=correct; 
    this.clue=clue || ''; // Defina como '' se não for fornecido
    this.explanation=explanation;
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
  let questions = [];
  let isUsingUserCsv = false;
    
  // ==============================================
  // 1. TENTAR USAR CSV DO USUÁRIO
  // ==============================================
  if (configs && configs.perguntas && configs.perguntas.length > 0) {
    questions = configs.perguntas.map(p => new Question(p));
    isUsingUserCsv = true;
    console.log("✅ Usando CSV do usuário no modo Solo.");
    
    // Atualiza o total de fases baseado no CSV do usuário, se aplicável
    totalLevels = [...new Set(questions.map(q => +q.level))].length;
    
  } else {
    // ==============================================
    // 2. FALLBACK: USAR CSV PADRÃO (solo.csv)
    // ==============================================
    const info = await fetch(`../../src/assets/solo.csv`);
    const data = await info.text();
    let tempQuestions = data.split('\n');
    tempQuestions.shift(); // Remove cabeçalho
    
    questions = tempQuestions.reduce((acm,k)=>{
      // O CSV padrão parece ter colunas: id, level, question, a, b, c, d, correct, clue, explanation.
      // O seu CSV de personalização tem: id, level, theme, question, a, b, c, d, correct, explanation
      // Vamos tentar carregar o CSV padrão com todas as colunas possíveis:
      const columns = k.split(';');
      // Assumindo que o CSV padrão tem menos colunas que o do usuário, vamos mapear o que for possível
      const [id, level, questionText, a, b, c, d, correct, clue, explanation] = columns;

      acm.push(new Question({id, level, question: questionText, options:{0:a,1:b,2:c,3:d}, correct, clue, explanation}));
      return acm;
    },[])
    console.log("⚠️ Usando CSV padrão (solo.csv) no modo Solo.");
  }

  if(!configs.personagens[0]){
    personagem.src = `./assets/Projeto-Quiz/personagem${((currentLevel-1)%3)+1}.png`; 
  } else{
    personagem.src = configs.personagens[currentLevel-1] ? configs.personagens[currentLevel-1] : configs.personagens[0]
  }

  if(configs.fundos[0]){
    document.body.style.backgroundImage = `url(${configs.fundos[0]})`
  }


  let currentQuestion;
  // Filtra as perguntas disponíveis para o nível atual
  const questionsForCurrentLevel = questions.filter(q => +q.level === currentLevel);
  let availableQuestions = questionsForCurrentLevel.filter(q => !seenIdQuestions.includes(q.id));
  
  // Se já viu todas as perguntas do nível, reinicia a pool para este nível
  if (availableQuestions.length === 0 && questionsForCurrentLevel.length > 0) {
      availableQuestions = questionsForCurrentLevel;
      // Não limpa seenIdQuestions para que o jogador não caia na mesma pergunta imediatamente se recarregar
  }

  if(localStorage.getItem('currentQuestionId')){
    const savedId = localStorage.getItem('currentQuestionId');
    currentQuestion = questions.find(q=>q.id==savedId);
  } else if (availableQuestions.length > 0) {
    // Seleciona uma pergunta aleatória dentre as disponíveis/não vistas
    currentQuestion = availableQuestions[parseInt(Math.random() * availableQuestions.length)];
    
    // Salva a pergunta selecionada
    localStorage.setItem('currentQuestionId', currentQuestion.id);
    seenIdQuestions.push(currentQuestion.id);
    localStorage.setItem('seenIdQuestions', JSON.stringify(seenIdQuestions));
  } else {
      console.error("Nenhuma pergunta disponível para a Fase:", currentLevel);
      if(currentLevel > totalLevels) window.location = './win.html';
      return;
  }
  
  // Atualiza o texto da fase/tema
  if (isUsingUserCsv) {
      numberQuestion.textContent = `Fase ${currentQuestion.level}: ${currentQuestion.theme || 'Tema'}`;
  } else {
      numberQuestion.textContent = `Fase ${currentQuestion.level}`; 
  }

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

      opt.textContent = letters[idx] + currentQuestion.options[+setupQuestion[idx]];
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
    clueButton.disabled=true;
  }


  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const selectedOptIndex = options.findIndex(opt=>opt.classList.contains('selected'));
    if(selectedOptIndex===-1){ alert('Selecione uma opção!'); return; }

    optionsContainer.style.pointerEvents='none';
    let correctIndex = Array.from(setupQuestion).findIndex(k => k == currentQuestion.correct);

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
            background[2].classList.add('shown');
            advicePopup.classList.add('shown');
            return; 
        }
    } else {
        localStorage.removeItem('wrongAnswer');
        localStorage.setItem('correctAnswer',JSON.stringify([correctIndex]));
    }

    disableButtonsAndSkip(currentQuestion);
  });

  clueButton.addEventListener('click', ()=>{
    // Verifica se está usando o CSV do usuário, que não tem o campo de dica
    if (isUsingUserCsv && !currentQuestion.clue) {
      background[2].classList.add('shown');
      setTimeout(()=>{
        advicePopup.querySelector('h2').textContent='As perguntas personalizadas não possuem dicas.';
        advicePopup.querySelector('button').textContent='Continuar';
        advicePopup.classList.add('shown');
      },500)
      return;
    }
    
    clueButton.disabled=true;
    const wrongIdx=currentQuestion.getWrong();
    const corrIdx=Array.from(setupQuestion).findIndex(l=>+l===wrongIdx);
    if(clues>1){ options[corrIdx].style.backgroundColor='grey'; options[corrIdx].style.pointerEvents='none'; localStorage.setItem('removedOption',corrIdx);}
    clues--;
    updateClues(); localStorage.setItem('clues',clues);
    if(clues===0){
      localStorage.setItem('clues',clues+1);
      background[2].classList.add('shown');
      setTimeout(()=>{
        advicePopup.querySelector('h2').textContent='Parece que você não tem mais dicas disponíveis...';
        advicePopup.querySelector('button').textContent='Continuar';
        advicePopup.classList.add('shown');
      },500)
    }
  });

  restartButton.addEventListener('click',()=>{
    localStorage.clear();
    // Garante que as configurações (incluindo o CSV) não sejam perdidas ao reiniciar
    localStorage.setItem('configs', JSON.stringify(configs)); 
    window.location.reload();
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
  // Adiciona event listeners de click para as opções
  options.forEach(opt => opt.addEventListener('click', selectOption));
    
  setTimeout(()=>{
    const skipButton=document.querySelector('form .skip');
    if(skipButton) skipButton.addEventListener('click',handleSkip);
    answerButton.addEventListener('click',(e)=>{
      if(answerButton.classList.contains('skip')){ e.preventDefault(); handleSkip(); }
    });
  },100);
});

function handleSkip(){
  if(lifes <= 0){
    background[2].classList.add('shown');
    advicePopup.classList.add('shown');
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
  
  if(seenQuestions===questionsPerLevel){
    currentLevel++;
    seenQuestions=0;
  }
  seenQuestions++;
  localStorage.setItem('currentLevel',currentLevel);
  localStorage.setItem('seenQuestions',seenQuestions);
    if (currentLevel > totalLevels) window.location = './win.html'
    else window.location.reload();
}