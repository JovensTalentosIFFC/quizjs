const containerVidas = document.querySelector('.containerInput.vidas');
const containerAjudas = document.querySelector('.containerInput.ajudas');
const switchModeButton = Array.from(document.querySelectorAll('.pergBotao button'))
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


let values = {
  fases: 5,
  questoes: 5,
  vidas: 3,
  ajudas: 2,
  personagens: [],
  fundos: []
}

//persornalizacao csv
// personalizacao.js
// personalizacao.js - Correção para processar o CSV no formato esperado
document.getElementById('csv').addEventListener('change', function (event) {
    const file = event.target.files[0];
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
                const [id, level, theme, question, a, b, c, d, correct, clue, explanation] = linha.split(';');

                // O 'correct' agora é o índice (0, 1, 2, ou 3) lido diretamente
                // Certifique-se de que todas as 10 colunas estão presentes
                if (!id || !level || !theme || !question || !a || !b || !c || !d || !correct || !explanation) {
                    console.error("⚠️ Linha do CSV em formato incorreto:", linha);
                    return null; // Ignora linhas mal formatadas
                }

                return modo === 'gincana' ?  {
                    id: +id,
                    level: +level,
                    theme: theme,
                    question: question,
                    options: { 0: a, 1: b, 2: c, 3: d },
                    correct: +correct, // Deve ser um número (0, 1, 2 ou 3)
                    explanation: explanation
                } : {
                  id: +id,
                  level: +level,
                  theme: theme,
                  question: question,
                  options: { 0: a, 1: b, 2: c, 3: d },
                  correct: +correct, // Deve ser um número (0, 1, 2 ou 3)
                  clue: clue,
                  explanation: explanation
                }
            }).filter(p => p !== null); // Remove qualquer linha que tenha falhado

            values.perguntas = perguntas;
            console.log("✅ Perguntas importadas do CSV do usuário:", perguntas);
        };
        reader.readAsText(file, 'UTF-8');
    }
});

const form = document.querySelector('form');
function atualizarValor(sliderId) {
  const slider = document.getElementById(sliderId);
  const span = document.getElementById('valor-' + sliderId);
  span.textContent = slider.value;
  values[sliderId] = +slider.value

  const input = document.getElementById(sliderId+'Input');
  input.value = slider.value;
}

function moverSlider(sliderId, inputId) {
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


