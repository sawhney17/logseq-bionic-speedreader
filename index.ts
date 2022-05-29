import "@logseq/libs";

var fixation = "50";
var saccade = "1";
var buttonInTopBar = "yes";
var fixNum, sacNum;
var isOn = true;

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = function () {
  // Use traditional 'for loops' for IE 11
  ToggleBionicMode();
};

const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = setTimeout(() => (inThrottle = false), limit);
    }
  };
};

var targetNode = top.document.getElementById("app-container");
const ToggleBionicModeToggled = throttle(ToggleBionicMode, 300);
const observer = new MutationObserver(ToggleBionicModeToggled);

//Full credits to the awesome RoamResearch plugin https://github.com/fbgallet/Roam-extensions/blob/main/bionic_text.js
function ToggleBionicMode() {
  fixNum = parseInt(fixation);
  sacNum = parseInt(saccade);
  setTimeout(() => {
    targetNode = top.document.getElementById("app-container");
    observer.observe(targetNode!, config);
  }, 300);
  if (isOn) console.log("Bionic text on");
  else console.log("Bionic text off");
  let elt = top.document.getElementsByClassName("block-content");
  for (let i = 0; i < elt.length; i++) {
    if (isTextBlock(elt[i].innerHTML) == true) {
      elt[i].innerHTML = elt[i].innerHTML
        .replaceAll("<b>", "")
        .replaceAll("</b>", "");
      if (isOn == false) {
        continue;
      }
      let spanTab = [];
      spanTab = splitTextFromHtml(elt[i].innerHTML);
      spanTab = processBlockSegments(spanTab);
      elt[i].innerHTML = spanTab.join("");
    }
  }

  function isTextBlock(c) {
    if (
      c.includes("rm-code-warning") ||
      c.includes("rm-code-block") ||
      c.includes("kanban-board")
      //          c.includes('<label')
    )
      return false;
    else return true;
  }

  function splitTextFromHtml(htmlStr) {
    let tab = [];
    let index = 0;
    tab = getAllIndexOf("<", ">", htmlStr);
    let splitTab = [];
    let shiftL = 0;
    let shiftR = 1;
    for (let i = 0; i < tab.length - 1; i++) {
      splitTab.push(htmlStr.substring(tab[i] + shiftL, tab[i + 1] + shiftR));
      let x = shiftR;
      shiftR = shiftL;
      shiftL = x;
    }
    return splitTab;
  }

  function getAllIndexOf(s1, s2, str) {
    let index = 0;
    let tab = [];
    while (index != -1) {
      index = str.indexOf(s1, index);
      if (index == -1) break;
      tab.push(index);
      index = str.indexOf(s2, index);
      tab.push(index);
    }
    return tab;
  }

  function processBlockSegments(tab) {
    for (let k = 0; k < tab.length; k++) {
      let words = new Array();
      if (tab[k].includes("<")) continue;
      words = tab[k].split(" ");
      for (let i = 0; i < words.length; i += sacNum) {
        let w = words[i];
        if (w.length != 0) words[i] = boldHalfWord(w);
      }
      tab[k] = words.join(" ");
    }
    return tab;
  }

  function boldHalfWord(word) {
    let midIndex = 0;
    let len = word.length;
    if (len > 3) midIndex = Math.ceil((len * fixNum) / 100);
    else {
      midIndex = Math.floor((len * fixNum) / 100);
      if (midIndex < 1) midIndex = 1;
    }
    word = "<b>" + word.slice(0, midIndex) + "</b>" + word.slice(midIndex);
    return word;
  }
}

function updateUI() {
  isOn = !isOn;

  ToggleBionicMode();
  if (isOn) {
    logseq.App.registerUIItem("toolbar", {
      key: "Bionic",
      template: `<a class="button" data-on-click="startup">
    <i class="ti ti-atom"></i>
  </a>`,
    });
  } else {
    observer.disconnect();
    logseq.App.registerUIItem("toolbar", {
      key: "Bionic",
      template: `<a class="button" data-on-click="startup">
  <i class="ti ti-atom-2"></i>
</a>`,
    });
  }
}
const main = () => {
  logseq.provideModel({
    startup() {
      updateUI();
    },
  });

  updateUI();
  logseq.App.onRouteChanged(() => {
    // setTimeout(() => {
    //   targetNode = top.document.getElementById("app-container");
    //   observer.observe(targetNode!, config);
    // }, 300);
  });

  logseq.App.registerCommandShortcut({ binding: "mod+t" }, () => {
    updateUI();
  });
};
logseq.ready(main).catch(console.error);