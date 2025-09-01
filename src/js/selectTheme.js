const redirectToBattle = (e) =>{
  console.log(e.textContent);
  localStorage.setItem('theme', e.textContent);
  localStorage.setItem('currentTheme', e.textContent)
  window.location = 'battle.html'
}