(async () => {
  const info = await fetch('../../src/assets/answers.csv')
  const data = await info.text();
  let questions = data.split('\n');
  questions.shift();
  console.log(questions);

  questions = questions.reduce((acm, k, j) =>{
    const [level, question, a, b, c, d, correct, clue] = k.split(',');
    acm.push({
      level,
      question,
      options: {
        a,
        b,
        c,
        d
      },
      correct,
      clue
    })
    return acm;
  }, [])
  console.log(questions);
})()