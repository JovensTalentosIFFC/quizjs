const numberQuestion = document.querySelector('aside .perguntaContainer .pergunta span')
const question = document.querySelector('aside .perguntaContainer .pergunta p')
const answerButton = document.querySelector('form .answerButton');
const clueButton = document.querySelector('form .clueButton')
const options = Array.from(document.querySelectorAll('.respostas form .labels label'));
const optionsContainer = document.querySelector('.respostas form .labels');
let currentLevel = +localStorage.getItem('currentLevel') || 1;
let currentQuestionId = +localStorage.getItem('currentQuestionId') || 1;
let setupQuestion = localStorage.getItem('setupQuestion') || '';
const form = document.querySelector('form');

class Question{
  constructor(level, question, options, correct, clue){
    this.level = level;
    this.question = question;
    this.options = options;
    this.correct = correct;
    this.clue = clue;
  }

  getWrong(){
    let wrongAnswer = parseInt(Math.random()*4);
    while(wrongAnswer===this.correct){
      wrongAnswer = parseInt(Math.random()*4);
    }
  }
}

let lifes, clues;

(async () => {

  
  const info = await fetch('../../src/assets/answers.csv')
  const data = await info.text();
  let questions = data.split('\n');
  questions.shift();


  questions = questions.reduce((acm, k, j) =>{
    const [id, level, question, a, b, c, d, correct, clue] = k.split(',');
    acm.push({
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
    })
    return acm;
  }, [])
  const currentQuestion = questions[currentQuestionId];
  numberQuestion.textContent = `Pergunta ${currentQuestion.level}`;

  question.textContent = currentQuestion.question;
  let seenOption = [];

  if(setupQuestion.length<4){
    options.forEach(opt =>{
        let randomOption = parseInt(Math.random()*4);
        while(seenOption.includes(randomOption)){
          randomOption = parseInt(Math.random()*4);
        }
        seenOption.push(randomOption);
        setupQuestion+=randomOption;

        opt.textContent = currentQuestion.options[randomOption];
    })
  } else{
    options.forEach((opt, idx) =>{
      opt.textContent = currentQuestion.options[setupQuestion[idx]];
    })
  }
  localStorage.setItem('setupQuestion', setupQuestion);

  form.addEventListener('submit', (e) =>{
  e.preventDefault();
  console.log('submt')

  const selectedOptIndex = options.findIndex(opt => Array.from(opt.classList).includes('selected')) ?? -1
  const selectedOpt = options[selectedOptIndex];
  if(selectedOptIndex===-1){
    // show message asking for select one question

    return;
  }

  optionsContainer.style.pointerEvents='none';
  console.log(currentQuestion)
  let correctIndex = Array.from(setupQuestion).findIndex(k => k===currentQuestion.correct);
  console.log(correctIndex)
  if(selectedOptIndex !== correctIndex){
    selectedOpt.classList.add('missed');
    options[correctIndex].classList.add('selected');
  }

  clueButton.style.display='none'
  answerButton.textContent = 'Avançar'
  answerButton.classList.add('skip');
  const skipButton = document.querySelector('form .skip');


  skipButton.addEventListener('click', () =>{
  optionsContainer.style.pointerEvents='all';

    currentLevel++;
    currentQuestionId++;
    localStorage.setItem('currentQuestionId', currentQuestionId);
    localStorage.setItem('currentLevel', currentLevel);
    window.location.reload();
  })

})

})()

function selectOption(selectedOpt){
  selectedOpt.classList.toggle('selected')
  options.forEach(opt =>{
    if(selectedOpt!==opt){
      opt.classList.remove('selected')
    }
  })
}