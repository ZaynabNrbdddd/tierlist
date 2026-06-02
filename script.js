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

// Initialisation
mettreAJourCompteurs();