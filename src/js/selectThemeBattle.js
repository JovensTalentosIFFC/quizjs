
const redirectToBattle = (e) =>{
  console.log(e.textContent);
  localStorage.setItem('theme', e.textContent);
  window.location = 'battle.html'
}