console.log("working")


localStorage.clear();

const redirectToQuestions = () =>{
  localStorage.setItem('solo', 1);
  window.location = 'selectTheme.html'
}

const redirectToBattle = () =>{
  window.location = 'selectTheme.html'
}