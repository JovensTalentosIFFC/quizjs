const redirectToQuestions = (e) => {
  console.log(e.textContent);
  localStorage.setItem('theme', e.textContent);
  window.location = 'questions.html';
};