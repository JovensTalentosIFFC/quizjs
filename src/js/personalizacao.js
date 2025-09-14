function atualizarValor(sliderId) {
  const slider = document.getElementById(sliderId);
  const span = document.getElementById('valor-' + sliderId);
  span.textContent = slider.value;

  const map = {
    slider1: 'fase',
    slider2: 'questao',
    slider3: 'vida',
    slider4: 'ajuda'
  };

  const input = document.getElementById(map[sliderId]);
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
  if (event.key === "Enter") {
    event.preventDefault();
    moverSlider(sliderId, inputId);
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

    if (!isNaN(n) && n > 0 && n <= 10) {
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
      alert('Digite um número válido, entre 1 e 10.');
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
      previewFundo.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    previewFundo.src = '';
    previewFundo.style.display = 'none';
  }
});
