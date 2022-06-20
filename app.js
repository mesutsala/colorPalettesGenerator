//GLOBAL SELECTION AND VARIABLES

const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate"); //PANEL
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustButton = document.querySelectorAll(".adjust");
const lockButton = document.querySelectorAll(".lock");
const closeAdjustment = document.querySelectorAll(".close-adjustment");
const sliderContainer = document.querySelectorAll(".sliders");
console.log(popup);
// console.log(sliders); //GLOBAL SLIDER
let initialColors;
//LOCAL STORAGE
let savedPalettes = [];

//ADD EVENTS LISTENERS

generateBtn.addEventListener("click", randomColors);

lockButton.forEach((button, index) => {
  button.addEventListener("click", (event) => {
    lockColor(event, index);
  });
});

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});

currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    //WITHOUT THE ARROW FUNCTION, HEX CANNOT BE INVOKED
    copyToClipboard(hex);
  });
});

popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});

adjustButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    //ARROW FUNCTION TO PASS THE INDEX
    openAdjustmentPanel(index);
  });
});

closeAdjustment.forEach((button, index) => {
  button.addEventListener("click", () => {
    //ARROW FUNCTION TO PASS THE INDEX
    closeAdjustmentPanel(index);
  });
});

//FUNCTIONS

//colorgenerator
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
  //NOT USING CHROMA TO CREATE RANDOM COLOR NUMBER
  //   const letters = "12345678ABCDEFGH";
  //   let hash = "#";
  //   for (i = 0; i < 6; i++) {
  //     hash += letters[Math.floor(Math.random() * 16)];
  //   }
  //   return hash;
}

//TOGGLE LOCK BUTTONS
function lockColor(button, index) {
  colorDivs[index].classList.toggle("lock");
  // function lockColor(event, index) {
  // if (colorDivs[index].classList.contains("lock")) {
  //   event.target.innerHTML = '<i class=" fas fa-lock"></i>';
  // } else {
  //   event.target.innerHTML = '<i class=" fas fa-open"></i>';
  // }
  lockButton[index].children[0].classList.toggle("fa-lock-open");
  lockButton[index].children[0].classList.toggle("fa-lock");
}

//randomBackgroundcolor
function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    // const array = ["🍎", "🍌", "🍍"];

    // array.forEach(function (current, index, array) {
    //   console.log(current);
    //   console.log(index);
    //   console.log(array);
    //   console.log("\n");
    // });
    //div: div color - see HTML
    // console.log(div);
    // console.log(div.children[0]); //H2 is the text (Hex)
    const hexText = div.children[0];
    const randomColor = generateHex();
    // console.log(randomColor);
    if (div.classList.contains("lock")) {
      initialColors.push(hexText.innerText);
      return;
    } //ADD IT TO THE ARRAY
    else {
      initialColors.push(chroma(randomColor).hex());
    }
    //ADD COLOR TO THE BACKGROUND
    div.style.backgroundColor = randomColor;
    hexText.innerHTML = randomColor;

    //CHECK FOR CONTRAST
    checktextContrast(randomColor, hexText);

    //COLORIZE SLIDERS
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    //The global one is getting ALL the sliders in ALL the color divs.
    // The other is just getting the sliders in the single color div with the
    // slider that triggered the event.
    // console.log(sliders); //NODE-LIST
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });

  //RESET INPUTS
  resetinputs();
  //CHECK FOR BUTTON CONTRASTS
  adjustButton.forEach((button, index) => {
    // console.log(button);
    // console.log(lockButton[index]);
    checktextContrast(initialColors[index], button);
    checktextContrast(initialColors[index], lockButton[index]);
  });
}

function checktextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  //SCALE SATURATION
  const noSat = color.set("hsl.s", 0); //SEE CHROMA DOCUMENTATION
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]); //SEE CHROMA DOCUMENTATION

  //SCALE BRIGHTNESS
  const midBrightness = color.set("hsl.s", 0.5);
  const scaleBrightness = chroma.scale(["black", midBrightness, "white"]);

  //SCALE HUE
  //UPDATE INPUT COLORS
  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(
    0
  )}, ${scaleSat(1)}`;
  //
  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBrightness(
    0
  )},${scaleBrightness(0.5)}, ${scaleBrightness(1)}`;

  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75), rgb(204,204, 7), rgb(75,204,75),rgb(75,204,204),rgb(75,75,204), rgb(204,75,204), rgb(204,75,75))`;
}

function hslControls(event) {
  //   console.log(event);
  const index =
    event.target.getAttribute("data-bright") || //OR
    event.target.getAttribute("data-hue") ||
    event.target.getAttribute("data-sat"); //DATA FROM HTML
  //   console.log(index);

  let sliders = event.target.parentElement.querySelectorAll(
    'input[type = "range"]'
  );
  // console.log(sliders); //NODE-LIST
  //Indivdual list
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  // const bgColor = colorDivs[index].querySelector("h2").innerText; //GIVE YOU THE BACKGROUND COLOR OF DIV
  const bgColor = initialColors[index]; //INITIAL COLOR IS SAVED
  console.log(bgColor);

  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;

  //COLORIZE SLIDERS INPUTS
  colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];

  const color = chroma(activeDiv.style.backgroundColor);
  console.log(color);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");

  textHex.innerText = color.hex();
  //check contrast
  checktextContrast(color, textHex);
  for (icon of icons) {
    checktextContrast(color, icon);
  }
}

function resetinputs() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl[0];
      console.log(hueValue);
      slider.value = Math.floor(hueValue);
    }

    if (slider === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl[1];
      console.log(satValue);
      slider.value = Math.floor(satValue * 100) / 100;
    }

    if (slider === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl[1];
      console.log(brightValue);
      slider.value = Math.floor(brightValue * 100) / 100;
    }
  });
}

function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  navigator.clipboard.writeText(hex.innerText);
  document.body.removeChild(el);
  //POP UP ANIMATION
  const popupBox = popup.children[0];
  console.log(popupBox);
  popup.classList.add("active");
  popupBox.classList.add("active");
}

function openAdjustmentPanel(index) {
  sliderContainer[index].classList.toggle("active");
}

function closeAdjustmentPanel(index) {
  sliderContainer[index].classList.remove("active");
}

//IMPLEMENT SAVE TO PALETTE AND LOCAL STORAGE
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");

// console.log(submitSave);
//EVENT LISTNERS
saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

//FUNCTION
function openPalette(event) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}
function closePalette(event) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
}

function savePalette(event) {
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });
  //GENERATE OBJECT
  let paletteNumber;
  const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
  if (paletteObjects) {
    paletteNumber = paletteObjects.length;
  } else {
    paletteNumber = savedPalettes.length;
  }
  const paletteObj = { name, colors, number: paletteNumber };
  savedPalettes.push(paletteObj);
  // console.log(savedPalettes);
  //SAVE TO LOCAL STORAGE
  savetoLocal(paletteObj);
  saveInput.value = "";

  //GENERATE PALLETE FOR LIBRARY

  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");

  paletteObj.colors.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  });

  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObj.number);
  paletteBtn.innerText = "Select";

  //ATTACH EVENT TO THE SELECT BTN
  paletteBtn.addEventListener("click", (event) => {
    closeLibrary();
    const paletteIndex = event.target.classList[1];
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checktextContrast(color, text);
      updateTextUI(index);
    }); //savedPaletts is the Object
    resetinputs();
  });
  //APPEND TO LIBRARY
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  libraryContainer.children[0].appendChild(palette);
}

function savetoLocal(paletteObject) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObject);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function openLibrary(event) {
  console.log(event.taget);
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popup.classList.add("active");
}
function closeLibrary(event) {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popup.classList.remove("active");
}

function getLocal() {
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    savedPalettes = [...paletteObjects];
    paletteObjects.forEach((paletteObj) => {
      //REPEATED CODE FROM ABOVE
      //GENERATE PALLETE FOR LIBRARY
      const palette = document.createElement("div");
      palette.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = paletteObj.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");

      paletteObj.colors.forEach((smallColor) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
      });

      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick-palette-btn");
      paletteBtn.classList.add(paletteObj.number);
      paletteBtn.innerText = "Select";

      //ATTACH EVENT TO THE SELECT BTN
      paletteBtn.addEventListener("click", (event) => {
        closeLibrary();
        const paletteIndex = event.target.classList[1];
        initialColors = [];
        paletteObjects[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          checktextContrast(color, text);
          updateTextUI(index);
        }); //savedPaletts is the Object
        resetinputs();
      });
      //APPEND TO LIBRARY
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      libraryContainer.children[0].appendChild(palette);
    });
  }
}

getLocal();
randomColors();
