function menu() {
  const createButton = document.getElementById("create-button")
  const joinButton = document.getElementById("join-button")
  var hello;

  if (createButton) {
    createButton.addEventListener("click", createGame)
  }

  function createGame() {
    hello = "hello";
  }

  return hello

}
export { menu }
