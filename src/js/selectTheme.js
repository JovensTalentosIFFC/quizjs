const returnButton = document.querySelector('nav i');

returnButton.addEventListener('click', () =>{
  window.history.back();
})

for (let i = localStorage.length - 1; i >= 0; i--) {
  let key = localStorage.key(i);
  console.log(key)
  localStorage.removeItem(key);
}
localStorage.clear();


const redirectToBattle = (e) =>{
  console.log(e.textContent);
  localStorage.setItem('theme', e.textContent);

  if(localStorage.getItem('solo')) { 
    window.location = 'questions.html'; 
    return 
  }
  else window.location = 'battle.html'
}