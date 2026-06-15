// ================================================================
// SÉLECTION DES ÉLÉMENTS
// ================================================================
const poolImages  = document.getElementById('pool-images');
const btnReset    = document.getElementById('btn-reset');
const inputUpload = document.getElementById('input-upload');
const tierZones   = document.querySelectorAll('.tier-zone');
let   tierItems   = document.querySelectorAll('.tier-item');

// ================================================================
// DRAG & DROP
// ================================================================
let elementEnDrag = null;

function handleDragStart(e) {
  elementEnDrag = e.target;
  e.target.classList.add('dragging');
  e.dataTransfer.setData('text/plain', e.target.id);
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  elementEnDrag = null;
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');

  const id    = e.dataTransfer.getData('text/plain');
  const image = document.getElementById(id);

  if (image) {
    e.currentTarget.appendChild(image);
    mettreAJourCompteurs();
  }
}

// ================================================================
// ATTACHER LES ÉVÉNEMENTS SUR UNE IMAGE
// ================================================================
function attacherDragEvents(image) {
  image.addEventListener('dragstart', handleDragStart);
  image.addEventListener('dragend',   handleDragEnd);

  image.addEventListener('dblclick', function () {
    poolImages.appendChild(image);
    mettreAJourCompteurs();
  });
}

// Attache sur toutes les images existantes
tierItems.forEach(function (image) {
  attacherDragEvents(image);
});

// Attache sur les zones de tier
tierZones.forEach(function (zone) {
  zone.addEventListener('dragover',   handleDragOver);
  zone.addEventListener('dragenter',  handleDragEnter);
  zone.addEventListener('dragleave',  handleDragLeave);
  zone.addEventListener('drop',       handleDrop);
});

// Attache aussi sur le pool
poolImages.addEventListener('dragover',  handleDragOver);
poolImages.addEventListener('dragenter', handleDragEnter);
poolImages.addEventListener('dragleave', handleDragLeave);
poolImages.addEventListener('drop',      handleDrop);

// ================================================================
// BOUTON RESET
// ================================================================
btnReset.addEventListener('click', function () {
  if (!confirm('Remettre toutes les images dans le pool ?')) return;

  document.querySelectorAll('.tier-item').forEach(function (image) {
    poolImages.appendChild(image);
  });

  mettreAJourCompteurs();

  poolImages.style.borderColor = '#66bb6a';
  setTimeout(function () {
    poolImages.style.borderColor = '';
  }, 500);
});

// ================================================================
// UPLOAD D'IMAGES
// ================================================================
let compteurUpload = 0;

inputUpload.addEventListener('change', function (e) {
  const fichiers = e.target.files;

  for (let i = 0; i < fichiers.length; i++) {
    const fichier = fichiers[i];

    if (!fichier.type.startsWith('image/')) continue;

    const reader = new FileReader();

    reader.onload = function (event) {
      const img       = document.createElement('img');
      img.src         = event.target.result;
      img.alt         = fichier.name.replace(/\.[^.]+$/, '');
      img.className   = 'tier-item';
      img.draggable   = true;
      img.id          = 'upload-' + compteurUpload;
      compteurUpload++;

      attacherDragEvents(img);
      poolImages.appendChild(img);
    };

    reader.readAsDataURL(fichier);
  }

  e.target.value = '';
});

// ================================================================
// COMPTEUR PAR TIER
// ================================================================
function mettreAJourCompteurs() {
  tierZones.forEach(function (zone) {
    const nb = zone.querySelectorAll('.tier-item').length;
    zone.setAttribute('data-count', nb);
  });
}
// ================================================================
// EXPORT PNG
// ================================================================
document.getElementById('btn-export').addEventListener('click', function () {
  const rows = document.querySelectorAll('.tier-row');
  const LABEL_W = 80;
  const ITEM_SIZE = 70;
  const PADDING = 5;
  const ROW_H = 80;
  const GAP = 4;

  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = rows.length * (ROW_H + GAP);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  const rowsArray = Array.from(rows);
  let rowIndex = 0;

  function dessinerRow(row, yPos, callback) {
    const label = row.querySelector('.tier-label');
    const zone = row.querySelector('.tier-zone');
    const items = Array.from(zone.querySelectorAll('.tier-item'));

    // fond
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, yPos, canvas.width, ROW_H);

    // label couleur
    ctx.fillStyle = label.style.backgroundColor || '#888';
    ctx.fillRect(0, yPos, LABEL_W, ROW_H);

    // lettre
    ctx.fillStyle = '#000';
    ctx.font = 'bold 36px Segoe UI';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label.textContent.trim(), LABEL_W / 2, yPos + ROW_H / 2);

    if (items.length === 0) {
      callback();
      return;
    }

    let loaded = 0;

    items.forEach(function (imgEl, i) {
      const x = LABEL_W + PADDING + i * (ITEM_SIZE + PADDING);

      // On crée une nouvelle image à partir du src déjà chargé
      const newImg = new Image();
      newImg.crossOrigin = 'anonymous';

      newImg.onload = function () {
        ctx.drawImage(newImg, x, yPos + PADDING, ITEM_SIZE, ITEM_SIZE);
        loaded++;
        if (loaded === items.length) callback();
      };

      newImg.onerror = function () {
        // si l'image échoue on dessine un carré gris à la place
        ctx.fillStyle = '#333';
        ctx.fillRect(x, yPos + PADDING, ITEM_SIZE, ITEM_SIZE);
        loaded++;
        if (loaded === items.length) callback();
      };

      newImg.src = imgEl.src;
    });
  }

  function suite() {
    if (rowIndex >= rowsArray.length) {
      try {
        const lien = document.createElement('a');
        lien.download = 'tierlist.png';
        lien.href = canvas.toDataURL('image/png');
        lien.click();
      } catch (e) {
        alert('Export impossible : ' + e.message);
      }
      return;
    }
    dessinerRow(rowsArray[rowIndex], rowIndex * (ROW_H + GAP), function () {
      rowIndex++;
      suite();
    });
  }

  suite();
});
// Initialisation
mettreAJourCompteurs();
