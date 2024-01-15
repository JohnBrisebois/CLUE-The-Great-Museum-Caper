const markers = document.querySelectorAll(".marker");
const totalcells = document.querySelectorAll(".cell");
const allCameras = document.querySelectorAll(".camera");
const allMarkers = document.querySelectorAll(".marker")
const hiddenCells = document.querySelectorAll(".hidden")
const doors = document.querySelectorAll(".door")
const allPaintings = document.querySelectorAll(".painting")
const allLocks = document.querySelectorAll(".lock")
const markerRed = document.getElementById("marker-red")
const markerBlue = document.getElementById("marker-blue")
const markerYellow = document.getElementById("marker-yellow")
const markerPurple = document.getElementById("marker-purple")
const markerThief = document.getElementById("marker-thief")
const dice = document.getElementById("dice-number")
const actionDice = document.getElementById("dice-action");
const startButton = document.getElementById("start-button")
const selectBlue = document.getElementById("select-blue")
const selectRed = document.getElementById("select-red")
const selectYellow = document.getElementById("select-yellow")
const selectPurple = document.getElementById("select-purple")
const selectThief = document.getElementById("select-thief")
const createButton = document.getElementById("create-button")
const joinButton = document.getElementById("join-button")
const thiefCreateButton = document.getElementById("thiefTest-button")
const markerCreateButton = document.getElementById("markerTest-button")
const info = document.getElementById("info");
const cameraButton = document.getElementById("button-cameras")
const motionButton = document.getElementById("button-motion")
const eyeButton = document.getElementById("button-eye")

const paintingContainer = document.getElementById("painting-container")
const cameraContainer = document.getElementById("camera-container")
const gameStates = ["setup", "midgame", "endgame", "detectivewin", "thiefwin"]
const turnStates = ["marker-thief", "marker-red", "marker-thief", "marker-blue", "marker-thief", "marker-yellow", "marker-thief", "marker-purple"]
const cameraIDs = ["camera-1", "camera-2", "camera-3", "camera-4", "camera-5", "camera-6"]
const lockIDs = ["lock-1", "lock-2", "lock-3", "lock-4", "lock-5", "lock-6", "lock-7", "lock-8", "lock-9", "lock-10", "lock-11"]
var gameID;
var cells = document.querySelectorAll(".cell");
var moving = false;
var currentcell = null;
var currentElement
var unplaced = true;
var playerMarker;
import { readRevealedLockState, writeLockState, readLockState, lockStates, readThiefVis, writeThiefVis, writePaintingState, readPaintingState, writeInfo, readInfo, writeCameraState, cameraStates, readHiddenCameraState, readCameraState, gameState, turnState, createMarkerTest, createThiefTest, readReadyState, writeReadyState, readyState, writeCell, readCell, writeAvailability, readAvailablity, checkId, createGameDatabase, writeGameState, readGameState, nextTurnState, readTurnState  } from "./initializeFirebase.js"

menu()

function menu() {
  createButton.addEventListener("click", createGame)
  joinButton.addEventListener("click", joinGame)
  thiefCreateButton.addEventListener("click", thiefTest)
  markerCreateButton.addEventListener("click", markerTest)
}

function markerTest() {
  playerMarker = markerRed
  createGame()
  setup()
  createMarkerTest(gameID)
  setupEnd()
  detectiveTurnStart()
  createMarkerTest(gameID)
}

function thiefTest() {
  createGame()
  createThiefTest(gameID)
  console.log(gameState)
}

function joinGame() {
  const id = document.getElementById("input-id").value
  gameID = id
  document.getElementById("title").innerHTML = "CLUE " + gameID
  document.getElementById("menu-background").style.visibility="hidden"
  syncStates()
  assignMarker()
}

function createGame() {
  gameID = Math.floor(Math.random() * 100000)
  console.log(gameID)
  checkId(gameID)
  createGameDatabase(gameID)
  document.getElementById("menu-container").style.visibility="hidden"
  document.getElementById("title").innerHTML = "CLUE " + gameID
  syncStates()
  assignMarker()
}

function setup() {
  document.getElementById("menu-background").style.visibility="hidden"
  document.getElementById("marker-select-container").style.visibility="hidden"
  document.getElementById("marker-thief").style.display="none"
  createCellListester();
  addItemListeners();
  startButton.addEventListener("click", setupEnd)
}

function assignMarker() {
  document.getElementById("marker-select-container").style.visibility="visible"
  selectBlue.addEventListener("click", chooseBlue)
  selectRed.addEventListener("click", chooseRed)
  selectYellow.addEventListener("click", chooseYellow)
  selectPurple.addEventListener("click", choosePurple)
  selectThief.addEventListener("click", chooseThief)

  function chooseBlue() {
    if (markerBlue.classList.contains("available")) {
      playerMarker = markerBlue;
      writeAvailability(markerBlue, false, gameID)
      console.log("blue chosen")
      setup()
    }
  }
  function chooseRed() {
    if (markerRed.classList.contains("available")) {
      playerMarker = markerRed
      writeAvailability(markerRed, false, gameID)
      console.log("red chosen")
      setup()
    }
  }
  function chooseYellow() {
    if (markerYellow.classList.contains("available")) {
      playerMarker = markerYellow;
      writeAvailability(markerYellow, false, gameID)
      console.log("yellow chosen")
      setup()
    }
  }
  function choosePurple() {
    if (markerPurple.classList.contains("available")) {
      playerMarker = markerPurple;
      writeAvailability(markerPurple, false, gameID)
      console.log("Purple chosen")
      setup()
    }
  }
  function chooseThief() {
    if (markerThief.classList.contains("available")) {
      playerMarker = markerThief;
      writeAvailability(markerThief, false, gameID)
      console.log("Thief chosen")
      thiefSetup()
    }
  }
}

function thiefSetup() {
  document.getElementById("menu-background").style.visibility="hidden"
  document.getElementById("marker-select-container").style.visibility="hidden"
  createCellListester();
  allLocks.forEach(lock => {
    lock.addEventListener("click", checkLock)
    lock.addEventListener("mouseover", function() {getId(lock)})
  })
  playerMarker.addEventListener("mouseover", function() {getId(playerMarker)})
  playerMarker.addEventListener("dragstart", thiefMoveStart)
  playerMarker.addEventListener("dragend", thiefMoveEnd)
}

function thiefMoveStart() {
  if (turnStates[turnState] == "marker-thief") {
    if (currentLoot != null) {
      if (currentLoot.classList.contains("painting")) {
        writePaintingState(currentLoot, true, gameID)
      }
    }
    playerMarker.classList.add("dragging")
    switch (gameState) {
      case "thiefsetup":
        doors.forEach(door => {
          door.classList.add("moveable")
        })
        break;
      case "midgame":
      calculateCells(currentcell, 3)
        break;
    }
  } else {
    console.log("not your turn idiot")
  }
  function calculateCells(cell, stepsLeft) {
    cell.classList.add("moveable");
    const currentID = cell.id;
    const row = returnRow(currentID);
    const column = returnColumn(currentID);
    if (stepsLeft > 0) {
      var rowUp = row - 1;
      var rowDown = row + 1;
      var rowLeftRight = row;
      var columnLeft = column - 1;
      var columnRight = column + 1;
      var columnUpDown = column;
      if(rowUp < 10) {
        rowUp = "0" + rowUp;
      }
      if(rowDown < 10) {
        rowDown = "0" + rowDown;
      }
      if(columnRight < 10) {
        columnRight = "0" + columnRight;
      }
      if(columnLeft < 10) {
        columnLeft = "0" + columnLeft;
      }
      if(columnUpDown < 10) {
        columnUpDown = "0" + columnUpDown;
      }
      if(rowLeftRight < 10) {
        rowLeftRight = "0" + rowLeftRight;
      }
      const idLeft = ("cell-" + columnLeft + "-" + rowLeftRight);
      const cellLeft = document.getElementById("cell-" + rowLeftRight + "-" + columnLeft);
      const cellRight = document.getElementById("cell-" + rowLeftRight + "-" + columnRight);
      const cellUp = document.getElementById("cell-" + rowUp + "-" + columnUpDown);
      const cellDown = document.getElementById("cell-" + rowDown + "-" + columnUpDown);
      if (cellLeft !== null && !cell.classList.contains("wall1")) {
        calculateCells(cellLeft, stepsLeft - 1);
      }
      if (cellRight !== null && !cell.classList.contains("wall3")) {
        calculateCells(cellRight, stepsLeft - 1);
      }
      if (cellUp !== null && !cell.classList.contains("wall4")) {
        calculateCells(cellUp, stepsLeft - 1);
      }
      if (cellDown !== null && !cell.classList.contains("wall2")) {
        calculateCells(cellDown, stepsLeft - 1);
      }
    }
  }

  function returnRow(id) {
    var idArray = id.split("");
    var row = (parseFloat(idArray[5])*10)+parseFloat(idArray[6]);
    return row;
  }

  function returnColumn(id) {
    var idArray = id.split("");
    var column = (parseFloat(idArray[8])*10)+parseFloat(idArray[9]);
    return column;
  }
}

const lockLocations = ["cell-04-01", "cell-06-02", "cell-08-01", "cell-09-02", "cell-10-06", "cell-10-07", "cell-08-12", "cell-05-11", "cell-03-11", "cell-01-08", "cell-01-05"]
function checkLock() {
  console.log("checking lock!")
  const lock = currentElement.id
  const cell = playerMarker.parentNode.id
  console.log(cell)
  console.log(lock)
  console.log(lockLocations[lockIDs.indexOf(lock)])
  if (lockLocations[lockIDs.indexOf(lock)] == cell) {
    writeLockState(lock, true, gameID)
    if (lockStates[lockIDs.indexOf(lock)] == true) {
      writeGameState("thiefwin", gameID)
      let num = document.getElementById("painting-container").children.length
      writeInfo("The thief escaped with " + num + " paintings!", gameID)
    }
  }
}

function thiefMoveEnd() {
  console.log(currentcell)
  if (turnStates[turnState] == "marker-thief" && gameState == "midgame") {
    nextTurnState(gameID)
    console.log(turnState)
  }
  if (gameState == "thiefsetup") {
    writeGameState("midgame", gameID)
  }
  totalcells.forEach(cell => {cell.classList.remove("moveable")
})
  playerMarker.classList.remove("dragging")
  if (cellItem != null) {
    if (currentLoot.classList.contains("camera")) {
      cameraContainer.appendChild(cellItem)
      writeCameraState(cellItem, false, false, gameID)
    } else if (currentLoot.classList.contains("painting")) {
      paintingContainer.appendChild(cellItem)
    }
    cellItem.style.display = "inline-block"
    cellItem = null;
  }
}

function syncStates() {
  allCameras.forEach(camera => {
    readCell(camera, gameID)
    readHiddenCameraState(camera, gameID)
    readCameraState(camera, gameID)
  })
  allPaintings.forEach(painting => {
    readCell(painting, gameID)
    readPaintingState(painting, gameID)
  })
  allMarkers.forEach(marker => {
    readCell(marker, gameID)
    readAvailablity(marker, gameID)
    readReadyState(marker, gameID)
  })
  allLocks.forEach(lock => {
    readRevealedLockState(lock, gameID)
    readLockState(lock, gameID)
  })
  readGameState(gameID)
  readTurnState(gameID)
  readInfo(gameID)
}

function addItemListeners() {
  allCameras.forEach(camera => {
    camera.addEventListener("mouseover", function() {getId(camera)})
    itemListener(camera, true)
  })
  allPaintings.forEach(painting => {
    painting.addEventListener("mouseover", function() {getId(painting)})
    itemListener(painting, true)
  })
  allLocks.forEach(lock => {
    lock.addEventListener("mouseover", function() {getId(lock)})
  })
  playerMarker.addEventListener("mouseover", function() {getId(playerMarker)})
  itemListener(playerMarker, true)
}

function setupEnd() {
  var endable = true;
  allCameras.forEach(camera => {
    if (camera.parentNode.id == "camera-container") {
      endable = false;
    }
  })
  if (playerMarker.parentNode.id == "marker-container") {
    endable = false;
  }
  if (endable == true) {
    writeReadyState(playerMarker, true, gameID)
    console.log(gameState)
    allCameras.forEach(camera => {
      itemListener(camera, false)
    })
    allPaintings.forEach(painting => {
      itemListener(painting, false)
    })
    itemListener(playerMarker, false)
    currentcell = playerMarker.parentNode;
    detectiveTurnStart()
    startButton.removeEventListener("click", setupEnd)
  }
}

var rollable = true;
function detectiveTurnStart() {
  dice.addEventListener("click", detectiveMoveStart);
}

function detectiveTurnEnd() {
  nextTurnState(gameID)
  rollable = true;
}

function rollDice() {
  const number = Math.floor(Math.random()*6 + 1);
  return number
}

function rollActionDice() {
  const roll = rollDice();
  var actionRoll;
  if (roll == 5) {
    actionRoll = "camera"
  } else if (roll == 6) {
    actionRoll = "motion"
  } else {
    actionRoll = "eye";
  }
  return actionRoll;
}

function detectiveMoveStart() {
  if (turnStates[turnState] == playerMarker.id && rollable == true) {
    if (gameState == "midgame") {
      rollable = false;
      const roll = rollDice();
      const actionRoll = rollActionDice()
      dice.src = "Dice/dice_1.png";
      dice.innerHTML = "<img src='Dice/dice_" + roll + ".png' width='70' height='70'>";
      actionDice.innerHTML = "<img src='Dice/" + actionRoll + ".jpg' width='70' height='70'>";
      detectiveMove(playerMarker, roll);
      detectiveAction(actionRoll)
    } else if (gameState == "endgame") {
      rollable = false;
      const roll = rollDice();
      dice.innerHTML = "<img src='Dice/dice_" + roll + ".png' width='70' height='70'>";
      actionDone = true;
      detectiveMove(playerMarker, roll);
    }
  } else {
    console.log("not your turn!")
  }
}

var actionDone = false;
function detectiveAction(action) {
  if (action == "eye") {
    allCameras.forEach(camera => {
      camera.addEventListener("click", eyeLookStart)
    })
    eyeButton.addEventListener("click", seeingEyeLookStart)
  } if (action == "camera") {
    cameraButton.addEventListener("click", cameraLookStart)
  } if (action == "motion") {
    motionButton.addEventListener("click", motionStart)
  }
  function eyeLookStart() {
    const camID = currentElement.id
    allCameras.forEach(camera => {
      camera.removeEventListener("click", eyeLookStart)
    })
    if (cameraStates[cameraIDs.indexOf(camID)] == false) {
      writeCameraState(currentElement, false, true, gameID)
      writeInfo(camID + " has been sabataged!", gameID)
    } else {
      const result = cameraLook(currentElement)
      eyeButton.removeEventListener("click", seeingEyeLookStart)
      if (result != "") {
        writeInfo("Camera number " + result + " can see the thief!", gameID)
      } else {
        writeInfo(camID + " can NOT see the thief!", gameID)
      }
    }
    actionDone = true
    if (dragDone == true) {
      detectiveTurnEnd()
      actionDone = false
      dragDone = false
    }
  }
  function seeingEyeLookStart() {
    const result = cameraLook(playerMarker)
    allCameras.forEach(camera => {
      camera.removeEventListener("click", cameraLookStart)
    })
    eyeButton.removeEventListener("click", seeingEyeLookStart)
    if (result !== "") {
      writeInfo(playerMarker.id + " can see the thief!", gameID)
      writeGameState("endgame", gameID)
    } else {
      writeInfo(playerMarker.id + " can NOT see the thief!", gameID)
    }
    actionDone = true
    if (dragDone == true) {
      detectiveTurnEnd()
      actionDone = false
      dragDone = false
    }
  }
  function cameraLookStart() {
    var infoString = "Cameras that can see the thief:"
    allCameras.forEach(camera => {
      if (cameraStates[cameraIDs.indexOf(camera.id)] == false) {
        writeCameraState(camera, false, true, gameID)
      } else {
        console.log(cameraStates)
        const result = cameraLook(camera)
        if (result != "") {
          infoString = infoString + " " + result
        }
      }
    })
    if (infoString != "Cameras that can see the thief:") {
      writeInfo(infoString, gameID)
    } else {
      writeInfo("NO cameras can see the thief!", gameID)
    }
    cameraButton.removeEventListener("click", cameraLookStart)
    actionDone = true
    if (dragDone == true) {
      detectiveTurnEnd()
      actionDone = false
      dragDone = false
    }
  }
  function motionStart() {
    const color = getRoom()
    writeInfo("The thief is in the " + color + " room!", gameID)
    motionButton.removeEventListener("click", motionStart)
    actionDone = true
    if (dragDone == true) {
      detectiveTurnEnd()
      actionDone = false
      dragDone = false
    }
  }
}


var currentItem
function itemListener(item, add) {
  if (add == true) {
    item.addEventListener("dragstart", startItemDrag)
    item.addEventListener("dragend", endItemDrag)
  } else {
    item.removeEventListener("dragstart", startItemDrag)
    item.removeEventListener("dragend", endItemDrag)
  }
}

function startItemDrag() {
  currentItem = currentElement
  currentItem.classList.add("dragging")
  currentcell = null;
  addMoveable()
}
function endItemDrag() {
  currentItem.classList.remove("dragging")
  removeMoveable()
}

function getId(element) {
  currentElement = element
  console.log(currentElement)
}

var state = false;
function detectiveMove(marker, roll) {
  console.log(marker)
  marker.addEventListener('dragstart', startdrag, true);
  marker.addEventListener("dragend", dragEnd, true)

  function dragEnd() {
    marker.classList.remove("dragging");
    removeMoveable();
    endDrag();
    console.log("epic " + state);
    //      if (!state) {
    marker.removeEventListener('dragstart', startdrag, true);
    marker.removeEventListener("dragend", dragEnd, true);
    //      }
  }

  function startdrag()  {
    console.log("startdrag");
    moving = true;
    marker.classList.add("dragging");
    if (currentcell !== null) {
      calculateCells(currentcell, roll);
    } else {
      addMoveable()
    }
  }

  function calculateCells(cell, stepsLeft) {
    if (cell == currentcell || (!cell.hasChildNodes()) || ((cell.querySelector("#marker-thief") == markerThief)  && (cell.children.length == 1))) {
      cell.classList.add("moveable");
      console.log(cell.children.length)
    }
    console.log
    const currentID = cell.id;
    const row = returnRow(currentID);
    const column = returnColumn(currentID);
    if (stepsLeft > 0) {
      var rowUp = row - 1;
      var rowDown = row + 1;
      var rowLeftRight = row;
      var columnLeft = column - 1;
      var columnRight = column + 1;
      var columnUpDown = column;
      if(rowUp < 10) {
        rowUp = "0" + rowUp;
      }
      if(rowDown < 10) {
        rowDown = "0" + rowDown;
      }
      if(columnRight < 10) {
        columnRight = "0" + columnRight;
      }
      if(columnLeft < 10) {
        columnLeft = "0" + columnLeft;
      }
      if(columnUpDown < 10) {
        columnUpDown = "0" + columnUpDown;
      }
      if(rowLeftRight < 10) {
        rowLeftRight = "0" + rowLeftRight;
      }
      const idLeft = ("cell-" + columnLeft + "-" + rowLeftRight);
      const cellLeft = document.getElementById("cell-" + rowLeftRight + "-" + columnLeft);
      const cellRight = document.getElementById("cell-" + rowLeftRight + "-" + columnRight);
      const cellUp = document.getElementById("cell-" + rowUp + "-" + columnUpDown);
      const cellDown = document.getElementById("cell-" + rowDown + "-" + columnUpDown);
      if (cellLeft !== null && !cell.classList.contains("wall1")) {
        calculateCells(cellLeft, stepsLeft - 1);
      }
      if (cellRight !== null && !cell.classList.contains("wall3")) {
        calculateCells(cellRight, stepsLeft - 1);
      }
      if (cellUp !== null && !cell.classList.contains("wall4")) {
        calculateCells(cellUp, stepsLeft - 1);
      }
      if (cellDown !== null && !cell.classList.contains("wall2")) {
        calculateCells(cellDown, stepsLeft - 1);
      }
    }
  }

  function returnRow(id) {
    var idArray = id.split("");
    var row = (parseFloat(idArray[5])*10)+parseFloat(idArray[6]);
    return row;
  }

  function returnColumn(id) {
    var idArray = id.split("");
    var column = (parseFloat(idArray[8])*10)+parseFloat(idArray[9]);
    return column;
  }
}

var currentLoot = null;
var currentLootCell;

function createCellListester() {
  var moveablecells = document.querySelectorAll(".cell");
  moveablecells.forEach(cell => {
    cell.addEventListener("dragover", e=> addListen(cell, e), true)
  })

}

var cellItem = null;
function addListen(cell, e) {
  if (currentLoot != null && cell.querySelector("#" + currentLoot.id) !== currentLoot && cell.classList.contains("moveable")) {
    currentLoot.style.display = "inline-block"
    currentLoot = null
    cellItem = null
  }
  if (playerMarker == markerThief) {
    if (typeof cell !== "undefined"){
      if (cell.classList.contains("moveable") && (cell == currentcell || !cell.hasChildNodes())) {
        e.preventDefault();
        const draggable = document.querySelector(".dragging");
        writeCell(draggable, cell, gameID)
        if (currentcell !== cell) {
          currentcell = cell;
          state = false;
          console.log(state)
        } else {
          state = true;
        }
      } else if (cell.classList.contains("moveable") && (cell.hasChildNodes())) {
        cellItem = cell.firstChild
        if (!cellItem.classList.contains("marker")) {
          e.preventDefault();
          const draggable = document.querySelector(".dragging");
          writeCell(draggable, cell, gameID)
          cellItem.style.display = "none"
          currentLoot = cellItem
          if (currentcell !== cell) {
            currentcell = cell;
            state = false;
            console.log(state)
          } else {
            state = true;
          }
        }
      }
    }
  } else {
    if (typeof cell !== "undefined"){
      if (cell.classList.contains("moveable") && (cell == currentcell || !cell.hasChildNodes() || ((cell.querySelector("#marker-thief") == markerThief)  && (cell.children.length == 1)))) {
        if (cell.querySelector("#marker-thief") && gameState == "endgame") {
          writeThiefVis(false, gameID)
        } else if (gameState == "endgame"){
          writeThiefVis(true, gameID)
        }
        e.preventDefault();
        const draggable = document.querySelector(".dragging");
        writeCell(draggable, cell, gameID)
        if (currentcell !== cell) {
          currentcell = cell;
          state = false;
          console.log(state)
        } else {
          state = true;
        }
      }
    }
  }
}

function removeMoveable() {
  cells.forEach(cell => {
    cell.classList.remove("moveable");
  });
}

function addMoveable() {
  cells.forEach(cell => {
    if (!cell.classList.contains("hidden")) {
      cell.classList.add("moveable");
    }
  });
}

var dragDone = false
function endDrag() {
  moving = false;
  totalcells.forEach(cell => {
    cell.removeEventListener("dragover", addListen());
  })
  if (currentcell.querySelector("#marker-thief") && playerMarker != markerThief) {
    writeGameState("detectivewin", gameID)
  }
  dragDone = true
  if (actionDone == true) {
    detectiveTurnEnd()
    actionDone = false
    dragDone = false
  }
  if (playerMarker.parentNode.querySelector("#marker-thief") == markerThief) {
    writeGameState("detectivewin", gameID)
  }
}

function getRoom() {
  var cell = markerThief.parentNode
  if (cell.classList.contains("grey")) {
    return "grey"
  } else if (cell.classList.contains("red")) {
    return "red"
  } else if (cell.classList.contains("green")) {
    return "green"
  } else if (cell.classList.contains("purple")) {
    return "purple"
  } else if (cell.classList.contains("orange")) {
    return "orange"
  } else if (cell.classList.contains("beige")) {
    return "beige"
  } else if (cell.classList.contains("blue")) {
    return "blue"
  }
}

function cameraLook(camera) {
  var cell = camera.parentNode
  var camNumber
  if (camera != playerMarker) {
    camNumber = cameraIDs.indexOf(camera.id) + 1
  } else {
    camNumber = 1
  }
  getCellRight(cell)
  getCellLeft(cell)
  getCellUp(cell)
  getCellDown(cell)
  setTimeout(removeLooking, 2000)
  if (markerThief.parentNode.classList.contains(camNumber + "looking")) {
    console.log("Camera number " + camNumber + " can see the thief!")
    return camNumber
  } else {
    return ""
  }

  function removeLooking() {
    totalcells.forEach(cell => {
      cell.classList.remove("looking")
      cell.classList.remove(camNumber + "looking")
    })
  }

  function getCellRight(cell) {
    cell.classList.add("looking");
    cell.classList.add(camNumber + "looking");
    const currentID = cell.id;
    var row = returnRow(currentID);
    var column = returnColumn(currentID);
    var columnRight = column + 1;
    if(columnRight < 10) {
      columnRight = "0" + columnRight;
    }
    if(row < 10) {
      row = "0" + row;
    }
    const cellRight = document.getElementById("cell-" + row + "-" + columnRight);
    console.log("cell-" + row + "-" + columnRight)
    if (cellRight !== null && !cell.classList.contains("wall3")) {
      getCellRight(cellRight);
    }
  }
  function getCellLeft(cell) {
    cell.classList.add("looking");
    cell.classList.add(camNumber + "looking");
    const currentID = cell.id;
    var row = returnRow(currentID);
    var column = returnColumn(currentID);
    var columnleft = column - 1;
    if(columnleft < 10) {
      columnleft = "0" + columnleft;
    }
    if(row < 10) {
      row = "0" + row;
    }
    const cellleft = document.getElementById("cell-" + row + "-" + columnleft);
    console.log("cell-" + row + "-" + columnleft)
    if (cellleft !== null && !cell.classList.contains("wall1")) {
      getCellLeft(cellleft);
    }
  }
  function getCellUp(cell) {
    cell.classList.add("looking");
    cell.classList.add(camNumber + "looking");
    const currentID = cell.id;
    var row = returnRow(currentID);
    var column = returnColumn(currentID);
    var rowUp = row - 1;
    if(rowUp < 10) {
      rowUp = "0" + rowUp;
    }
    if(column < 10) {
      column = "0" + column;
    }
    const cellup = document.getElementById("cell-" + rowUp + "-" + column);
    if (cellup !== null && !cell.classList.contains("wall4")) {
      getCellUp(cellup);
    }
  }
  function getCellDown(cell) {
    cell.classList.add("looking");
    cell.classList.add(camNumber + "looking");
    const currentID = cell.id;
    var row = returnRow(currentID);
    var column = returnColumn(currentID);
    var rowUp = row + 1;
    if(rowUp < 10) {
      rowUp = "0" + rowUp;
    }
    if(column < 10) {
      column = "0" + column;
    }
    const celldown = document.getElementById("cell-" + rowUp + "-" + column);
    if (celldown !== null && !cell.classList.contains("wall2")) {
      getCellDown(celldown);
    }
  }

  function returnRow(id) {
    var idArray = id.split("");
    var row = (parseFloat(idArray[5])*10)+parseFloat(idArray[6]);
    return row;
  }
  function returnColumn(id) {
    var idArray = id.split("");
    var column = (parseFloat(idArray[8])*10)+parseFloat(idArray[9]);
    console.log(column)
    return column;
  }
}
