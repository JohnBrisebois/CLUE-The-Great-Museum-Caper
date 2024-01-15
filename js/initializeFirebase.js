

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-analytics.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-auth.js";
import { getDatabase, ref, set, onValue, child, get, update } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDWgwMBx_QZMOHPs_CoVqao9nva5Zye024",
  authDomain: "clue-81228.firebaseapp.com",
  databaseURL: "https://clue-81228-default-rtdb.firebaseio.com",
  projectId: "clue-81228",
  storageBucket: "clue-81228.appspot.com",
  messagingSenderId: "564942320020",
  appId: "1:564942320020:web:333e43cb43a44436b29f81",
  measurementId: "G-ZQXPC6Z2DM"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
signInAnonymously(auth);
const analytics = getAnalytics(app);

function readCell(item, gameID) {
  const db = getDatabase();
  const cellRef = ref(db, gameID + "/" + item.id + "/cell")
  onValue(cellRef, (snapshot) => {
    const data = snapshot.val();
    const cell = document.getElementById(data)
    cell.appendChild(item)
  })
}
function writeCell(item, cell, gameID) {
  const itemID = item.id;
  const cellID = cell.id;
  const db = getDatabase();
  update(ref(db, gameID + "/" + itemID + "/"), {
    cell: cellID
  })
}

function readAvailablity(item, gameID) {
  const db = getDatabase();
  const cellRef = ref(db, gameID + "/" + item.id + "/available")
  const button = document.querySelector("." + item.id)
  onValue(cellRef, (snapshot) => {
    const data = snapshot.val();
    if (data == false) {
      item.classList.remove("available")
      button.classList.remove("available")
    } else {
      item.classList.add("available")
      button.classList.add("available")
    }
  })
}

function writeAvailability(item, state, gameID) {
  const itemID = item.id;
  const db = getDatabase();
  update(ref(db, gameID + "/" + itemID +"/"), {
    available: state
  })
}

function reset() {

}

function checkId(id) {
}

function createGameDatabase(id) {
  const players = ["red", "blue", "yellow", "purple", "thief"]
  const db = getDatabase();
  for (var i = 1; i < 7; i++) {
    set(ref(db, id + "/camera-" + i), {
      cell: "camera-container",
      operational: true,
      revealed: false
    })
  }
  for (var i = 0; i < 4; i++) {
    set(ref(db, id + "/marker-" + players[i]), {
      cell: "marker-container",
      available: true,
      ready: false
    })
  }
  set(ref(db, id + "/marker-thief"), {
    cell: "marker-container",
    available: true,
    ready: false,
    visible: true
  })

  for (var i = 1; i < 10; i++) {
    set(ref(db, id + "/painting-" + i), {
      cell: "painting-container",
      stolen: false
    })
  }
  var totalUnlocked = 0
  for (var i = 1; i < 12; i++) {
    var isUnlocked;
    var state = false
    if (Math.floor(Math.random() * 11) < 7) {
      state = true
    }
    if (6 - totalUnlocked <= 11 - i) {
      totalUnlocked = totalUnlocked + 1;
      update(ref(db, id + "/lock-" + i), {
        unlocked: state,
        revealed: false
      })
    } else {
      update(ref(db, id + "/lock-" + i), {
        unlocked: false,
        revealed: false
      })
    }
  }
  update(ref(db, id + "/"), {
    state: "setup",
    turn: 0,
    info: "info"
  })
}

function writeGameState(state, id) {
  const db = getDatabase();
  update(ref(db, id + "/"), {
    state: state
  })
  console.log(gameState)
  if (state == "detectivewin") {
    writeInfo("The thief has been captured!", id)
  }
}

function readGameState(id) {
  const db = getDatabase();
  const cellRef = ref(db, id + "/state")
  onValue(cellRef, (snapshot) => {
    const data = snapshot.val();
    gameState = data;
    if (gameState == "endgame") {
      document.getElementById("marker-thief").style.display = "inline-block"
      document.getElementById("dice-controls-container").style.display = "none"
      document.getElementById("dice-action").style.display = "none"
      writeThiefVis(true, id)
      readThiefVis(id)
    }
  })
}

function nextTurnState(id) {
  const db = getDatabase();
  if (turnState < 3) {
    turnState++
  } else {
    turnState = 0
  }
  update(ref(db, id + "/"), {
    turn: turnState
  })
}

function readTurnState(id) {
  const db = getDatabase();
  const cellRef = ref(db, id + "/turn")
  onValue(cellRef, (snapshot) => {
    const data = snapshot.val();
    turnState = data;
  })
}

var readyStates = [ false, false, false, false ]
const markerIDs = [ "marker-red", "marker-blue", "marker-yellow", "marker-purple" ]

function writeReadyState(item, state, id) {
  const db = getDatabase();
  update(ref(db, id + "/" + item.id), {
    ready: state
  })
}

function readReadyState(item, id) {
  const db = getDatabase();
  const itemNumber = markerIDs.indexOf(item.id)
  const cellRef = ref(db, id + "/" + item.id + "/ready")
  onValue(cellRef, (snapshot) => {
    const data = snapshot.val();
    readyStates[itemNumber] = data
    console.log(readyStates[itemNumber])
    if (readyStates[0] == readyStates[1] == true) {
      gameState = "thiefsetup";
      console.log(gameState)
    }
  })
}

function writeCameraState(camera, hiddenState, info, id) {
  const db = getDatabase();
  update(ref(db, id + "/" + camera.id), {
    operational: hiddenState,
    revealed: info
  })
}

const cameraIDs = ["camera-1", "camera-2", "camera-3", "camera-4", "camera-5", "camera-6"]

function readCameraState(camera, id) {
  const db = getDatabase();
  const cellRef = ref(db, id + "/" + camera.id + "/revealed")
  onValue(cellRef, (snapshot) => {
    const data = snapshot.val();
    if (data == true) {
      camera.style.display = "none"
      writeCell(camera, document.getElementById("camera-container"), id)
    }
  })
}

function readHiddenCameraState(camera, id) {
  const db = getDatabase();
  const cellRef = ref(db, id + "/" + camera.id + "/operational")
  onValue(cellRef, (snapshot) => {
    const data = snapshot.val();
    if (data == false) {
      cameraStates[cameraIDs.indexOf(camera.id)] = false;
    }
  })
}

function writeInfo(infoString, id) {
  const db = getDatabase();
  update(ref(db, id + "/"), {
    info: infoString
  })
}

function writePaintingState(painting, state, id) {
  const db = getDatabase();
  update(ref(db, id + "/" + painting.id), {
    stolen: state
  })
}

function readPaintingState(painting, id) {
  const db = getDatabase();
  const cellRef = ref(db, id + "/" + painting.id + "/stolen")
  onValue(cellRef, (snapshot) => {
    const data = snapshot.val();
    if (data == true) {
      writeCell(painting, document.getElementById("painting-container"), id)
      writeInfo("The thief has stolen " + painting.id + "!", id)
    }
  })
}

function readInfo(id) {
  const db = getDatabase();
  const cellRef = ref(db, id + "/info")
  onValue(cellRef, (snapshot) => {
    const data = snapshot.val();
    document.getElementById("info").innerHTML = data;
  })
}

function readThiefVis(id) {
  const db = getDatabase();
  const cellRef = ref(db, id + "/marker-thief/visible")
  onValue(cellRef, (snapshot) => {
    const data = snapshot.val();
    if (data == true) {
      document.getElementById("marker-thief").style.display = "inline-block"
      console.log("thif vis")
    } else if (data == false) {
      document.getElementById("marker-thief").style.display = "none"
      console.log("thief invis")
    }
  })
}

function writeThiefVis(state, id) {
  const db = getDatabase();
  update(ref(db, id + "/marker-thief"), {
    visible: state
  })
}

function thiefTestReset(id) {
  const db = getDatabase();
  update(ref(db, id + "/" + "marker-thief"), {
    available: false,
    cell: "marker-container",
    ready: false
  })
  update(ref(db, id + "/"), {
    state: "thiefsetup",
    turn: 0
  })
}

function writeLockState(lockID, state, id) {
  const db = getDatabase();
  update(ref(db, id + "/" + lockID), {
    revealed: state
  })
}

const lockIDs = ["lock-1", "lock-2", "lock-3", "lock-4", "lock-5", "lock-6", "lock-7", "lock-8", "lock-9", "lock-10", "lock-11"]
function readLockState(lock, id) {
  const db = getDatabase();
  const cellRef = ref(db, id + "/" + lock.id + "/unlocked")
  onValue(cellRef, (snapshot) => {
    const data = snapshot.val();
    lockStates[lockIDs.indexOf(lock.id)] = data
    console.log(lock.id + ": " + data)
  })
}

function readRevealedLockState(lock, id) {
  const db = getDatabase();
  const cellRef = ref(db, id + "/" + lock.id + "/revealed")
  onValue(cellRef, (snapshot) => {
    const data = snapshot.val();
    const state = lockStates[lockIDs.indexOf(lock.id)]
    if (data == true) {
      if (state == false) {
        lock.innerHTML = '<img src="locks/lock_locked.png" width="56" height="82">'
      } else if (state  == true) {
        lock.innerHTML = '<img src="locks/lock_open.png" width="56" height="82">'
      }
    }
  })
}

function createThiefTest(id) {
  const db = getDatabase();
  update(ref(db, id + "/camera-1"), {
    cell: "cell-02-05",
    operational: false,
  })
  update(ref(db, id + "/camera-2"), {
    cell: "cell-02-06",
    operational: true
  })
  update(ref(db, id + "/camera-3"), {
    cell: "cell-01-05",
    operational: true
  })
  update(ref(db, id + "/camera-4"), {
    cell: "cell-08-02",
    operational: true
  })
  update(ref(db, id + "/camera-5"), {
    cell: "cell-04-01",
    operational: true
  })
  update(ref(db, id + "/camera-6"), {
    cell: "cell-01-04",
    operational: true
  })
  update(ref(db, id + "/marker-blue"), {
    available: false,
    cell: "cell-05-04",
    ready: true
  })
  update(ref(db, id + "/marker-red"), {
    available: false,
    cell: "cell-08-01",
    ready: true
  })
  update(ref(db, id + "/" + "marker-thief"), {
    available: true,
    cell: "marker-container",
    ready: false
  })
  update(ref(db, id + "/"), {
    state: "thiefsetup",
    turn: 0
  })
  for (var i = 1; i < 9; i++) {
    update(ref(db, id + "/" + "painting-" + i), {
      cell: "cell-07-0" + i,
      stolen: false
    })
  }
  update(ref(db, id + "/" + "painting-9"), {
    cell: "cell-03-11",
    stolen: false
  })
}

function createMarkerTest(id) {
  const db = getDatabase();
  update(ref(db, id + "/camera-1"), {
    cell: "cell-03-09",
    operational: false,
    revealed: false
  })
  update(ref(db, id + "/camera-2"), {
    cell: "cell-02-06",
  })
  update(ref(db, id + "/camera-3"), {
    cell: "cell-06-07",
  })
  update(ref(db, id + "/camera-4"), {
    cell: "cell-08-02",
  })
  update(ref(db, id + "/camera-5"), {
    cell: "cell-04-01",
  })
  update(ref(db, id + "/camera-6"), {
    cell: "cell-01-04",
  })
  update(ref(db, id + "/marker-blue"), {
    available: false,
    cell: "cell-05-04",
    ready: true
  })
  update(ref(db, id + "/marker-red"), {
    available: false,
    cell: "cell-08-07",
    ready: true
  })
  update(ref(db, id + "/" + "marker-thief"), {
    available: true,
    cell: "cell-09-07",
    ready: false
  })
  update(ref(db, id + "/"), {
    state: "endgame",
    turn: 1
  })
  for (var i = 1; i < 9; i++) {
    update(ref(db, id + "/" + "painting-" + i), {
      cell: "cell-07-0" + i
    })
  }
  update(ref(db, id + "/" + "painting-9"), {
    cell: "cell-03-02"
  })
}

export let gameState = "setup"
export let turnState = 0
export let readyState = false
export let cameraStates = [true, true, true, true, true, true]
export let lockStates = [false, false, false, false, false, false, false, false, false, false, false]
export { readRevealedLockState, writeLockState, readLockState, readThiefVis, writeThiefVis, writePaintingState, readPaintingState, writeInfo, readInfo, writeCameraState, readHiddenCameraState, readCameraState, writeCell, readCell, createMarkerTest, createThiefTest, writeAvailability, readAvailablity, checkId, createGameDatabase, writeGameState, readGameState, nextTurnState, readTurnState, readReadyState, writeReadyState, }
//export { getCell }
