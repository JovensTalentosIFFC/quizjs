const numberQuestion = document.querySelector('aside .perguntaContainer .pergunta span')
const question = document.querySelector('aside .perguntaContainer .pergunta p')
const answerButton = document.querySelector('form .answerButton');
const clueButton = document.querySelector('form .clueButton')
const options = Array.from(document.querySelectorAll('.respostas form .labels label'));
const optionsContainer = document.querySelector('.respostas form .labels');
let currentLevel = localStorage.getItem('currentLevel') || 1;
let currentQuestionIndex = localStorage.getItem('currentQuestion') || 1;
let setupQuestion = localStorage.getItem('setupQuestion') || '';
const form = document.querySelector('form');

let lifes, clues;

(async () => {

  
  const info = await fetch('../../src/assets/answers.csv')
  const data = await info.text();
  let questions = data.split('\n');
  questions.shift();


  questions = questions.reduce((acm, k, j) =>{
    const [level, question, a, b, c, d, correct, clue] = k.split(',');
    acm.push({
      level,
      question,
      options: {
        a,
        b,
        c,
        d
      },
      correct: correct.toLowerCase(),
      clue,
      questionIndex: j%5==0 ? 1 : parseInt((j+1)/level)
    })
    return acm;
  }, [])
  
  const currentQuestion = questions[currentQuestionIndex-1];

  numberQuestion.textContent = `Pergunta ${currentQuestion.level}`;

  question.textContent = currentQuestion.question;
  let seenOption = [];

  if(setupQuestion.length<4){
    options.forEach(opt =>{
        let randomOption = Object.values(currentQuestion.options)[parseInt(Math.random()*4)]
        while(seenOption.includes(randomOption)){
          randomOption = Object.values(currentQuestion.options)[parseInt(Math.random()*4)];
        }

        for(const k of Object.keys(currentQuestion.options)){
          if(currentQuestion.options[k] == randomOption){
            setupQuestion+=k
          }
        }


        opt.textContent = randomOption;
        seenOption.push(randomOption);
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

  const selectedOptIndex = options.findIndex(opt => Array.from(opt.classList).includes('selected')) || 0
  const selectedOpt = options[selectedOptIndex];
  if(!selectedOptIndex){
    // show message asking for select one question

    return;
  }
  optionsContainer.style.pointerEvents='none';
  let correctIndex = Array.from(setupQuestion).findIndex(opt => opt===currentQuestion.correct);
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

    if(currentQuestionIndex===5){
      currentLevel++;
      currentQuestionIndex=0;
    }
    currentQuestionIndex++;
    localStorage.setItem('currentQuestion', currentQuestionIndex);
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