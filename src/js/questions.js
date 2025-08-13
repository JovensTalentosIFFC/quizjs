const numberQuestion = document.querySelector('aside .perguntaContainer .pergunta span')
const question = document.querySelector('aside .perguntaContainer .pergunta p')
const answerButton = document.querySelector('form .answerButton');
const clueButton = document.querySelector('form .clueButton')
const options = Array.from(document.querySelectorAll('.respostas form .labels label'));
const optionsContainer = document.querySelector('.respostas form .labels');

let currentLevel = +localStorage.getItem('currentLevel') || 1;
let currentQuestionId = +localStorage.getItem('currentQuestionId') || 1;
let setupQuestion = localStorage.getItem('setupQuestion') || '';

// CORREÇÃO: Verificar se wrongAnswer existe e fazer parse correto
let wrongAnswer = localStorage.getItem('wrongAnswer');
if (wrongAnswer && wrongAnswer !== 'false') {
  try {
    wrongAnswer = JSON.parse(wrongAnswer);
  } catch (e) {
    wrongAnswer = false;
  }
} else {
  wrongAnswer = false;
}

const form = document.querySelector('form');
const background = Array.from(document.querySelectorAll('.background'))
const startPopup = background[0].querySelector('.popupInicio');
const endPopup = background[1].querySelector('.popupFim');
const nextLevel = document.querySelector('.proximaFase');
const startLevel = document.querySelector('.inicioFase');
const levelText = document.querySelector('.popupInicio .faseContainer h2:first-child');
const themeText = document.querySelector('.popupInicio .faseContainer h2:nth-child(2)');
let lifes, clues, optionsLength=4, questionsPerLevel=5, currentFaseAndTheme;

if((currentQuestionId-1)%questionsPerLevel===0 && currentQuestionId>1){
  background[1].classList.add('shown');
  setTimeout(() =>{
    endPopup.classList.add('shown');
  }, 500)
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
    while(wrongAnswer===this.correct){
      wrongAnswer = parseInt(Math.random()*4);
    }
  }
}

function disableButtonsAndSkip(currentQuestion){
  clueButton.style.display='none'
  answerButton.textContent = 'Avançar'
  answerButton.classList.add('skip');
  // explanation
  question.textContent = currentQuestion.explanation;
  question.style.fontSize='.8rem'
}

function resetButtonsToDefault(){
  // CORREÇÃO: Restaura os botões para o estado inicial
  clueButton.style.display='block'; // ou 'inline' dependendo do seu CSS
  answerButton.textContent = 'Responder'; // ou o texto original
  answerButton.classList.remove('skip');
  question.style.fontSize = ''; // Remove o fontSize customizado
}

(async () => {
  const info = await fetch('../../src/assets/answers.csv')
  const data = await info.text();
  let questions = data.split('\n');
  questions.shift();

  questions = questions.reduce((acm, k, j) =>{
    const [id, level, question, a, b, c, d, correct, clue, explanation] = k.split(';');
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
      clue,
      explanation
    }))
    return acm;
  }, [])
  
  const currentQuestion = questions[currentQuestionId-1];
  numberQuestion.textContent = `Fase ${currentQuestion.level}`;

  // CORREÇÃO: Só mostra a pergunta se não há erro anterior
  if (!wrongAnswer) {
    question.textContent = currentQuestion.question;
  }
  
  let seenOption = [];

  if(setupQuestion.length < optionsLength){
    options.forEach(opt =>{
        let randomOption = parseInt(Math.random()*optionsLength);
        while(seenOption.includes(randomOption)){
          randomOption = parseInt(Math.random()*optionsLength);
        }
        seenOption.push(randomOption);
        setupQuestion += randomOption;

        opt.textContent = currentQuestion.options[randomOption];
    })
    localStorage.setItem('setupQuestion', setupQuestion);
  } else{
    options.forEach((opt, idx) =>{
      opt.textContent = currentQuestion.options[setupQuestion[idx]];
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
      selectedOpt.classList.add('missed');
      options[correctIndex].classList.add('selected');
      // CORREÇÃO: Salva como JSON para manter array
      localStorage.setItem('wrongAnswer', JSON.stringify([selectedOptIndex, correctIndex]));
    } else {
      // Se acertou, remove qualquer wrongAnswer anterior
      localStorage.removeItem('wrongAnswer');
    }

    disableButtonsAndSkip(currentQuestion);
  })
})()

function selectOption(selectedOpt){
  // CORREÇÃO: Só permite seleção se não há erro anterior
  if (wrongAnswer) {
    return;
  }
  
  selectedOpt.classList.toggle('selected')
  options.forEach(opt =>{
    if(selectedOpt !== opt){
      opt.classList.remove('selected')
    }
  })
}

// CORREÇÃO: Event listener do botão skip movido para fora e com verificações
document.addEventListener('DOMContentLoaded', () => {
  // Aguarda um pouco para garantir que o botão foi criado
  setTimeout(() => {
    const skipButton = document.querySelector('form .skip');
    if (skipButton) {
      skipButton.addEventListener('click', handleSkip);
    }
    
    // Também adiciona listener ao botão original caso ele vire skip
    answerButton.addEventListener('click', (e) => {
      if (answerButton.classList.contains('skip')) {
        e.preventDefault();
        handleSkip();
      }
    });
  }, 100);
});

function handleSkip() {
  console.log('Avançando questão...');
  
  // CORREÇÃO: Limpa TODOS os estados relacionados à questão atual
  localStorage.removeItem('wrongAnswer');
  localStorage.removeItem('setupQuestion');
  
  // Restaura interface para estado normal
  optionsContainer.style.pointerEvents = 'all';
  
  // Remove classes visuais de erro
  options.forEach(opt => {
    opt.classList.remove('selected', 'missed');
  });
  
  // Restaura botões para estado inicial
  resetButtonsToDefault();
  
  // Avança questão
  currentLevel++;
  currentQuestionId++;
  localStorage.setItem('currentQuestionId', currentQuestionId);
  localStorage.setItem('currentLevel', currentLevel);
  
  // Recarrega página
  window.location.reload();
}