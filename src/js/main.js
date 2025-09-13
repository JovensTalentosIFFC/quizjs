console.log("working")


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
