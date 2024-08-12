const $ = (el) => document.querySelector(el);
const $$ = (el) => document.querySelectorAll(el);

const $selectorItems = $("#selector-items");
const $imgInput = $("#image-input");

$imgInput.addEventListener("change", (e) => {
  if (e.target.files.length) {
    //  o tambien se puede hacer Array.from(e.target.files).forEach(file=>...)
    for (let file of e.target.files) {
      // console.log(file); //element File

      const reader = new FileReader();
      reader.onload = (eventReader) => {
        //console.log(eventReader.target.result); //imagen en base64
        createImage(eventReader.target.result, $selectorItems);
      };
      reader.readAsDataURL(file);
    }
  }
});

function createImage(src, parent) {
  const $img = document.createElement("img");

  $img.draggable = true;
  $img.addEventListener("dragstart", handleDragStart);
  $img.addEventListener("dragend", handleDragEnd);

  $img.classList = "item";
  $img.src = src;
  parent.appendChild($img);
}

let draggedElement = null;
let parentContainer = null;

function handleDragStart(event) {
  console.log("drag start");
  draggedElement = event.target;
  parentContainer = draggedElement.parentNode;
}

function handleDragEnd(event) {
  console.log("drag end");
  draggedElement = null;
  parentContainer = null;
}

const rows = $$(".row");
rows.forEach((row) => {
  row.addEventListener("drop", handleDrop);
  row.addEventListener("dragover", handleDragOver);
  row.addEventListener("dragleave", handleDragLeave);
});
$selectorItems.addEventListener("drop", handleDrop);
$selectorItems.addEventListener("dragover", handleDragOver);
$selectorItems.addEventListener("dragleave", handleDragLeave);

function handleDrop(event) {
  event.preventDefault();
  event.target.classList.remove("drag-over");
  event.target.parentNode.classList.remove("drag-over");
  if (
    parentContainer !== event.target &&
    parentContainer !== event.target.parentNode
  ) {
    parentContainer.removeChild(draggedElement);
  } else return;
  if (event.target.className.includes("item")) {
    createImage(draggedElement.src, event.target.parentNode);
  } else {
    createImage(draggedElement.src, event.target);
  }
  const dragPreview = $(".drag-preview");

  if (event.target.contains(dragPreview)) {
    event.target.removeChild(dragPreview);
  }
  console.log("drop", event);
}
function handleDragOver(event) {
  event.preventDefault();
  const { currentTarget } = event;
  if (currentTarget === parentContainer) return;
  console.log("drag over");
  currentTarget.classList.add("drag-over");
  // console.log(event.currentTarget.contains(draggedElement));
  const dragPreview = $(".drag-preview");

  if (!dragPreview) {
    const previewElement = draggedElement.cloneNode(true);
    previewElement.classList.add("drag-preview");
    event.currentTarget.appendChild(previewElement);
  }
}
function handleDragLeave(event) {
  event.preventDefault();
  console.log("drag leave");
  const { currentTarget } = event;
  currentTarget.classList.remove("drag-over");
  const dragPreview = $(".drag-preview");
  // console.log(currentTarget.contains(dragPreview));
  if (currentTarget.contains(dragPreview)) {
    currentTarget.removeChild(dragPreview);
  }
}

const deleteButton = $("#delete-button");
deleteButton.addEventListener("drop", handleDelete);
deleteButton.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.currentTarget.classList.add("delete-image");
});
deleteButton.addEventListener("dragleave", (e) => {
  e.preventDefault();
  e.currentTarget.classList.remove("delete-image");
});

function handleDelete(event) {
  parentContainer.removeChild(draggedElement);
  event.currentTarget.classList.remove("delete-image");
}

deleteButton.addEventListener("click", (e) => {
  const $message = $("#message-delete");
  $message.style.display = "block";
  $message.style.opacity = 1;
  setTimeout(() => {
    $message.style.opacity = 0;
    $message.style.display = "none";
  }, 1750);
});

const resetButton = $("#reset-button");
resetButton.addEventListener("click", handleReset);
function handleReset(event) {
  const items = $$(".tier .item");
  items.forEach((item) => {
    item.remove();
    $selectorItems.appendChild(item);
  });
}

$selectorItems.addEventListener("drop", handleDropFromDesktop);
$selectorItems.addEventListener("dragover", handleDragOverFromDesktop);

function handleDragOverFromDesktop(event) {
  if (draggedElement) return;
  event.preventDefault();

  const { currentTarget, dataTransfer } = event;
  if (dataTransfer.types.includes("Files") && !draggedElement) {
    currentTarget.classList.add("drag-files");
  }
}
function handleDropFromDesktop(event) {
  if (draggedElement) return;
  event.preventDefault();
  const { currentTarget, dataTransfer } = event;
  console.log({ currentTarget, dataTransfer });

  if (dataTransfer.types.includes("Files")) {
    currentTarget.classList.remove("drag-files");
    const { files } = dataTransfer;
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (eventReader) => {
        createImage(eventReader.target.result, $selectorItems);
      };
      reader.readAsDataURL(file);
    }
  }
  currentTarget.classList.remove("drag-files");
}

const saveButton = $("#save-button");
saveButton.addEventListener("click", handleScreenshot);
function handleScreenshot(event) {
  const tierContainer = $(".tier");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  import("https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.8/+esm").then(
    ({ default: html2canvas }) => {
      html2canvas(tierContainer).then((canvas) => {
        ctx.drawImage(canvas, 0, 0);
        const imgURL = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = "tier.png";
        downloadLink.href = imgURL;
        downloadLink.click();
      });
    }
  );
}
