const configs = JSON.parse(localStorage.getItem('configs'));
let questions = [];
let levelThemes = [];

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

let optionsLength = 4, totalLevels = configs ? configs.fases : 2, totalQuestionsPerLevelOnCsv = 20, questionsPerLevel=configs ? configs.questoes : 4;

const numberLevel = document.querySelector('aside .perguntaContainer .pergunta span')
const question = document.querySelector('aside .perguntaContainer .pergunta p')
const answerButton = document.querySelector('form .answerButton');

const optionsContainer = document.querySelector('.respostas form .labels');
const options = optionsContainer ? Array.from(optionsContainer.querySelectorAll('label')) : [];

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

(async () => {
    if (configs && configs.perguntas && configs.perguntas.length > 0) {
        //Usar CSV do usuário 
        questions = configs.perguntas.map(p => new Question(p));
        console.log("Usando CSV do usuário");

        questions.forEach(q => {
            if (!levelThemes.includes(q.theme)) {
                levelThemes.push(q.theme)
            }
        });

    } else {
        // Usar CSV padrão
        const info = await fetch(`../../src/assets/quiz_tecnologia.csv`); 
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

        console.log("⚠️ Usando CSV padrão");
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

    if(configs){
        if(personagem){
            if(!configs.personagens[0]){
                personagem.src = `./assets/Projeto-Quiz/personagem${((currentLevel-1)%3)+1}.png`; 
            } else{
                personagem.src = configs.personagens[currentLevel-1] ? configs.personagens[currentLevel-1] : configs.personagens[0]
            }
        }
        if(configs.fundos[0]){
            document.body.style.backgroundImage = `url(${configs.fundos[0]})`
        }
    }

    console.log(levelThemes)
    if (numberLevel) numberLevel.textContent = `Fase ${currentLevel}: ${levelThemes[currentLevel-1] || 'Tema'}`;
    if (themeText) themeText.textContent = levelThemes[currentLevel-1] || 'Tema';
    if (themeEndPopup) {
        themeEndPopup.textContent = 'Tema: ' + (levelThemes[currentLevel-1] || 'Tema');
        themeEndPopup.style.fontSize = '1.2rem'
    }
    
    if (!wrongAnswer && question) {
        question.textContent = currentQuestion.question;
    }
    
  
    let seenOption = [];
    if(options.length > 0) {
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
    }
    
    if(wrongAnswer && Array.isArray(wrongAnswer) && wrongAnswer.length === 2 && optionsContainer){
        const [selectedIndex, correctIndex] = wrongAnswer;
        if(options[selectedIndex]) options[selectedIndex].classList.add('missed');
        if(options[correctIndex]) options[correctIndex].classList.add('selected');
        optionsContainer.style.pointerEvents = 'none';
        disableButtonsAndSkip(currentQuestion);
    }

    if(correctAnswer && Array.isArray(correctAnswer) && correctAnswer.length==1 && optionsContainer){
        // ... (Seu código de restauração de acerto)
        const [correctIndex] = correctAnswer;
        if(options[correctIndex]) options[correctIndex].classList.add('selected');
        optionsContainer.style.pointerEvents = 'none';
        disableButtonsAndSkip(currentQuestion);
    }

    if(removedOption && options[removedOption]){
        options[removedOption].style.backgroundColor='grey';
    }

    if (form) {
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
            
            if (optionsContainer) optionsContainer.style.pointerEvents = 'none';
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
                    if(scoreTime2Span) scoreTime2Span.textContent = scoreTime2;
                } else if(localStorage.getItem('currentTime') === "Time2"){
                    scoreTime1+=50;
                    localStorage.setItem('scoreTime1', scoreTime1);
                    if(scoreTime1Span) scoreTime1Span.textContent = scoreTime1;
                }

            } else { // ============================================ correct answer
                localStorage.removeItem('wrongAnswer');
                localStorage.setItem('correctAnswer',JSON.stringify([correctIndex]));
                if(localStorage.getItem("currentTime") == "Time1"){
                    scoreTime1+=100;
                    localStorage.setItem('scoreTime1', scoreTime1);
                    if(scoreTime1Span) scoreTime1Span.textContent = scoreTime1;
                } else if(localStorage.getItem('currentTime') === "Time2"){
                    scoreTime2+=100;
                    localStorage.setItem('scoreTime2', scoreTime2);
                    if(scoreTime2Span) scoreTime2Span.textContent = scoreTime2;
                }
            }

            disableButtonsAndSkip(currentQuestion);
        });
    }
    
})(); 

if(seenQuestions-1 % questionsPerLevel===0 && currentLevel!==1 && endPopup && background[1] && endSpan && themeEndPopup){
    localStorage.setItem('questionsPerLevel', questionsPerLevel);
    background[1].classList.add('shown');
    endSpan.textContent = currentLevel;
    if(currentTheme) themeEndPopup.textContent = currentTheme;
    setTimeout(() =>{
        endPopup.classList.add('shown');
    }, 500)
}
if(numPergunta) numPergunta.textContent = `${seenQuestions}/${questionsPerLevel}`

if(currentTime==='Time1'){
    if (selectTime1) {
        selectTime1.disabled = true;
        selectTime1.textContent = 'Selecionado';
    }
    localStorage.setItem( "currentTime" , "Time1" )
    if (selectTime2) selectTime2.disabled = false;
} else if(currentTime==='Time2'){
    if (selectTime2) {
        selectTime2.disabled=true;
        selectTime2.textContent = 'Selecionado';
    }
    localStorage.setItem( "currentTime", "Time2" )
    if (selectTime1) selectTime1.disabled=false;
}

if(nextLevel) nextLevel.addEventListener('click', () =>{
    if (endPopup) endPopup.classList.remove('shown');
    if (background[1]) background[1].classList.remove('shown');
})

// Lógica de Popup de Início de Jogo/Fase
if(seenQuestions===1 && currentLevel===1 && startPopup && background[0] && levelText && themeText && startLevel){
    const firstTheme = levelThemes[0] || 'Tema'; // pega o primeiro tema carregado
    currentFaseAndTheme = [1, firstTheme]; 
    
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

function handleSkip() {
    // Se terminou todas as questões da fase atual
    if(seenQuestions === questionsPerLevel){
        if(currentLevel < totalLevels){ 
            // Há próxima fase, então avança
            currentLevel++;
            seenQuestions = 0;
        } else {
            // Não há próxima fase → fim do jogo
            if(scoreTime1 !== scoreTime2){ 
                if(scoreTime1 > scoreTime2){
                    window.location = './winTime1.html';
                    return;
                } else if(scoreTime2 > scoreTime1){
                    window.location = './winTime2.html';
                    return;
                }
            }
            // Caso empate ou qualquer outra situação, mostrar desempate ou tela final
            if(tiebreak) tiebreak.classList.add('shown');
            return; // não recarrega mais
        }
    }

    // Atualiza o número de questões vistas
    seenQuestions++;
    localStorage.setItem('currentLevel', currentLevel);
    localStorage.setItem('seenQuestions', seenQuestions);

    // Limpa dados temporários da questão atual
    localStorage.removeItem('currentQuestionId');
    localStorage.removeItem('removedOption');
    localStorage.removeItem('wrongAnswer');
    localStorage.removeItem('correctAnswer');
    localStorage.removeItem('setupQuestion');
    localStorage.removeItem('currentTime');

    if (optionsContainer) optionsContainer.style.pointerEvents = 'all';
    options.forEach(opt => opt.classList.remove('selected', 'missed'));
    
    resetButtonsToDefault();

    // Recarrega a página para carregar a próxima questão/fase
    window.location.reload();
}


// Ativar o handleSkip no botão 'Avançar'
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

// Funções de Seleção de Time
const selectTime1Function = () =>{
    if (selectTime1) {
        selectTime1.disabled = true;
        selectTime1.textContent = 'Selecionado';
    }
    if(selectTime2 && selectTime2.textContent==='Selecionado') selectTime2.textContent='Selecionar';
    localStorage.setItem( "currentTime" , "Time1" )
    if (selectTime2) selectTime2.disabled = false;
}

const selectTime2Function = () =>{
    if (selectTime2) {
        selectTime2.disabled=true;
        selectTime2.textContent = 'Selecionado';
    }
    if(selectTime1 && selectTime1.textContent==='Selecionado') selectTime1.textContent='Selecionar';
    localStorage.setItem( "currentTime", "Time2" )
    if (selectTime1) selectTime1.disabled=false;
}

if (selectTime1) selectTime1.addEventListener('click', selectTime1Function)
document.addEventListener('keydown', ({ key }) =>{
    if(key==='1') selectTime1Function();
})

if (selectTime2) selectTime2.addEventListener('click', selectTime2Function);
document.addEventListener('keydown', ({ key }) =>{
    if(key==='2') selectTime2Function();
})