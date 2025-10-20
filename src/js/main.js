console.log("working")



for (let i = localStorage.length - 1; i >= 0; i--) {
  let key = localStorage.key(i);
  console.log(key)
  localStorage.removeItem(key);
}
localStorage.clear();


const redirectToQuestions = () =>{
  localStorage.setItem('solo', 1);
  window.location = 'questions.html'
}

const redirectToBattle = () =>{
  window.location = 'selectTheme.html'
}

const redirectToCustomization = () =>{
  window.location = 'personalizacao.html'  
}

const redirectToInfo = () =>{
  window.location = 'info.html'
}
