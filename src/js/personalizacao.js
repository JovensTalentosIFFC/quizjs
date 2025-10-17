const containerVidas = document.querySelector('.containerInput.vidas');
const containerAjudas = document.querySelector('.containerInput.ajudas');
const switchModeButton = Array.from(document.querySelectorAll('.pergBotao button'))

let levelsQuantity= localStorage.getItem('levelsQuantity') || 0;


const csvInput = document.querySelector('#csv');
switchModeButton[0].addEventListener('click', () =>{
  switchModeButton[0].disabled=true
  switchModeButton[0].style.pointerEvents = 'none'
  switchModeButton[1].disabled=false;
  switchModeButton[1].style.pointerEvents = 'all'

  localStorage.setItem('modo', 'solo')

  containerAjudas.style.display = '';
  containerVidas.style.display = ''
})

switchModeButton[1].addEventListener('click', () =>{
  switchModeButton[1].disabled=true
  switchModeButton[1].style.pointerEvents = 'none'
  switchModeButton[0].disabled=false;
  switchModeButton[0].style.pointerEvents = 'all'

  localStorage.setItem('modo', 'gincana')

  containerAjudas.style.display = 'none';
  containerVidas.style.display = 'none'

})

let modo = localStorage.getItem('modo')

if(modo && modo == "gincana"){
  containerAjudas.style.display = 'none';
  containerVidas.style.display = 'none'
}

const submitFormButton = document.querySelector('.enviarform')

const configs = JSON.parse(localStorage.getItem('configs'));
let values = {
  fases: configs ? configs.fases : 5,
  vidas: configs ? configs.vidas : 3,
  ajudas: configs ? configs.ajudas : 2,
  personagens: configs ? configs.personagens : [],
  fundos: configs ? configs.fundos :[],
  questoes: configs ? configs.questoes : 5,
}


let inputFases = document.getElementById('fasesInput');
let sliderFases = document.getElementById('fases');
let valorFases = document.getElementById('valor-fases');

let inputQuestoes = document.getElementById('questoesInput');
let sliderQuestoes = document.getElementById('questoes');
let valorQuestoes = document.getElementById('valor-questoes');

let inputVidas = document.getElementById('vidasInput');
let sliderVidas = document.getElementById('vidas');
let valorVidas = document.getElementById('valor-vidas');

let inputAjudas = document.getElementById('ajudasInput');
let sliderAjudas = document.getElementById('ajudas');
let valorAjudas = document.getElementById('valor-ajudas');

// Atualiza os valores conforme o objeto configs
if(configs){
  inputFases.value = configs.fases;
  sliderFases.value = configs.fases;
  valorFases.textContent = configs.fases;

  inputQuestoes.value = configs.questoes;
  sliderQuestoes.value = configs.questoes;
  valorQuestoes.textContent = configs.questoes;

  inputVidas.value = configs.vidas;
  sliderVidas.value = configs.vidas;
  valorVidas.textContent = configs.vidas;

  inputAjudas.value = configs.ajudas;
  sliderAjudas.value = configs.ajudas;
  valorAjudas.textContent = configs.ajudas;
}



//persornalizacao csv
// personalizacao.js
// personalizacao.js - Correção para processar o CSV no formato esperado
document.getElementById('csv').addEventListener('change', loadCsv);

const form = document.querySelector('form');
function atualizarValor(sliderId) {
  submitFormButton.disabled=false

  const slider = document.getElementById(sliderId);
  const span = document.getElementById('valor-' + sliderId);
  span.textContent = slider.value;
  values[sliderId] = +slider.value

  const input = document.getElementById(sliderId+'Input');
  input.value = slider.value;
}

function moverSlider(sliderId, inputId) {
  submitFormButton.disabled=false
  const input = document.getElementById(inputId);
  const slider = document.getElementById(sliderId);
  const span = document.getElementById('valor-' + sliderId);
  const valor = parseInt(input.value);

  if (!isNaN(valor) && valor >= parseInt(slider.min) && valor <= parseInt(slider.max)) {

    slider.value = valor;
    span.textContent = valor;
  } else {
    alert("Digite um número válido entre " + slider.min + " e " + slider.max);
  }
}

function verificaEnter(event, sliderId, inputId) {
  if (event.key === 'Enter'){
  event.preventDefault();
  moverSlider(sliderId, inputId);
  atualizarValor(sliderId)
  }
}

function responder(resposta) {
  const respostaP = document.getElementById('resposta');
  const caixapersonagem = document.getElementById('caixapersonagem');
  const uploadsContainer = document.getElementById('uploadsContainer');
  const botoes = document.getElementById('botoes');

  if (resposta === 'sim') {
    respostaP.textContent = 'Quantos personagens?';
    caixapersonagem.classList.add('mostrar');
    uploadsContainer.innerHTML = '';
    botoes.style.display = 'none';
  } else {
    respostaP.textContent = 'Deseja personalizar o fundo?';
    caixapersonagem.classList.remove('mostrar');
    uploadsContainer.innerHTML = '';
    botoes.style.display = 'flex';
  }
}

function answer(resp) {
  const fundo = document.getElementById('fundo');
  fundo.style.display = resp === 'sim' ? 'block' : 'none';
}

function verificarTodosArquivosSelecionados(total) {
  const container = document.getElementById('uploadsContainer');
  const botoesB = document.getElementById('botoes');
  const respostaP = document.getElementById('Resp');

  const inputs = container.querySelectorAll('input[type="file"]');
  const todosSelecionados = Array.from(inputs).every(input => input.files.length > 0);

  if (todosSelecionados && inputs.length === total) {
    respostaP.textContent = 'Deseja personalizar o fundo?';
    botoesB.style.display = 'flex';
  } else {
    respostaP.textContent = '';
    botoesB.style.display = 'none';
  }
}

function verEnter(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    const inputNum = event.target;
    const n = parseInt(inputNum.value);
    const container = document.getElementById('uploadsContainer');

    container.innerHTML = '';

    if (!isNaN(n) && n >= 0 && n <= 10) {
      for (let i = 1; i <= n; i++) {
        const div = document.createElement('div');
        div.className = 'upload-container';

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.id = `upload_${i}`;

        const imgPreview = document.createElement('img');
        imgPreview.id = `preview_${i}`;
        imgPreview.className = 'preview';
        imgPreview.style.display = 'none';
        imgPreview.style.maxWidth = '150px';
        imgPreview.style.marginTop = '5px';
        imgPreview.style.borderRadius = '6px';
        imgPreview.style.boxShadow = '0 0 5px rgba(44, 157, 170, 0.3)';

        fileInput.addEventListener('change', function () {
          const file = fileInput.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
              imgPreview.src = e.target.result;
              values.personagens.push(e.target.result)
              imgPreview.style.display = 'block';
              verificarTodosArquivosSelecionados(n);
            };
            reader.readAsDataURL(file);
          } else {
            imgPreview.src = '';
            imgPreview.style.display = 'none';
            verificarTodosArquivosSelecionados(n);
          }
        });

        div.appendChild(fileInput);
        div.appendChild(imgPreview);
        container.appendChild(div);
      }
    } else {
      alert('Digite um número válido, entre 0 e 10.');
    }

    inputNum.value = '';
  }
}

document.getElementById('uploadFundo').addEventListener('change', function (event) {
  submitFormButton.disabled=false

  const file = event.target.files[0];
  const previewFundo = document.getElementById('previewFundo');

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      previewFundo.src = e.target.result;
      values.fundos.push(e.target.result)
      previewFundo.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    previewFundo.src = '';
    previewFundo.style.display = 'none';
  }
});


form.addEventListener('submit', (e) =>{
  e.preventDefault();

  if(levelsQuantity<valorFases.textContent){
    alert('Insira um número de fases correspondente com o csv!')
    submitFormButton.disabled=true
    return;
  } else{
    submitFormButton.disabled=false
  }

  if(values.perguntas.length/levelsQuantity < valorQuestoes.textContent){
    alert('Insira um número de perguntas correspondente com o csv!')
    submitFormButton.disabled=true
    return;
  } else{
    submitFormButton.disabled=false
  }

  modo = localStorage.getItem('modo')
  // const formatedValues
  localStorage.setItem('configs', JSON.stringify(values));
  if(modo === "solo") {
    window.location = './questions.html'
    return; 
  }else if(modo==='gincana'){
    window.location = './battle.html'
  } else{
    alert('Por favor, escolha um modo!')
  }
})


function loadCsv() {
  submitFormButton.disabled=false
    const file = csvInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            const linhas = text.split('\n').map(l => l.trim()).filter(l => l);

            // Se o CSV for do usuário, ele precisa ter o cabeçalho id;level;theme;question;a;b;c;d;correct;explanation
            // Ignora cabeçalho
            if (linhas[0] && linhas[0].toLowerCase().startsWith("id;level;theme")) {
                linhas.shift();
            }
            const perguntas = linhas.map((linha) => {
                // Usar ';' como delimitador para ser consistente com o arquivo padrão
                const [id, level, theme, question, a, b, c, d, correct, explanation] = linha.split(';');

                // O 'correct' agora é o índice (0, 1, 2, ou 3) lido diretamente
                // Certifique-se de que todas as 10 colunas estão presentes
                if (!id || !level || !theme || !question || !a || !b || !c || !d || !correct || !explanation) {
                    console.error("⚠️ Linha do CSV em formato incorreto:", linha);
                    return null; // Ignora linhas mal formatadas
                }
                if(level>levelsQuantity) levelsQuantity=level;
                return {
                    id: +id,
                    level: +level,
                    theme: theme,
                    question: question,
                    options: { 0: a, 1: b, 2: c, 3: d },
                    correct: +correct, // Deve ser um número (0, 1, 2 ou 3)
                    explanation: explanation
                } 
            }).filter(p => p !== null); // Remove qualquer linha que tenha falhado
            
            console.log(levelsQuantity, valorFases.textContent)
            values.perguntas = perguntas;
            console.log("✅ Perguntas importadas do CSV do usuário:", perguntas);
        };
        reader.readAsText(file, 'UTF-8');
    }
}
loadCsv();
console.log(values.perguntas);