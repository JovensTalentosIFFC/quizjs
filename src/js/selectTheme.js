
const redirectToBattle = (e) =>{
  console.log(e.textContent);
  localStorage.setItem('theme', e.textContent);

  if(localStorage.getItem('solo')) window.location = 'questions.html';
  else window.location = 'battle.html'
}