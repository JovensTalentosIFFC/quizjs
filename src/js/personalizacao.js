
function atualizarValor(sliderId) {
  const slider = document.getElementById(sliderId);
  const span = document.getElementById('valor-' + sliderId);
  span.textContent = slider.value;
  if (sliderId === 'slider1') {
    document.getElementById('fase').value = slider.value;
  } else if (sliderId === 'slider2') {
    document.getElementById('questao').value = slider.value;
  } else if (sliderId === 'slider3') {
    document.getElementById('vida').value = slider.value;
  } else{
    document.getElementById('ajuda').value = slider.value;
  }
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
    const personagem = document.getElementById('personagem').value;
  }
}

function responder(resposta) {
      const resultado = document.getElementById('resposta');

      if (resposta === 'sim') {
        resultado.textContent = 'Quantos?';
        for(let i=0; i<document.getElementById('personagem'); i++) {
        document.getElementById('imagem').style.display = 'block';
        }
        document.getElementById('imagem').style.display = 'block';
        document.getElementById('caixapersonagem').style.display = 'block';
      } else {
        resultado.textContent = 'Deseja personalizar o fundo?';
        document.getElementById('caixapersonagem').style.display = 'none';
        document.getElementById('imagem').style.display = 'none';
        document.getElementById('botoes').style.display = 'block';
      }
    }

function answer(resp) {
    if(resp === 'sim') {
       document.getElementById('fundo') .style.display = 'block ';
    } else {
        document.getElementById('fundo').style.display = 'none';
    }
}