// SOURCE: https://stackoverflow.com/a/39538518
function delay(t, v) {
  return new Promise((resolve) => {
    setTimeout(resolve.bind(null, v), t);
  });
}


module.exports = { delay };
