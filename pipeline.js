(() => {
  const figure = document.getElementById('pipeline-image');
  const dialog = document.getElementById('pipeline-dialog');
  const fullImage = document.getElementById('pipeline-full-image');
  const path = 'assets/figure-2-pipeline.png';
  figure.src = window.EMBEDDED_ASSETS?.[path] || path;
  document.getElementById('expand-pipeline').onclick = () => {
    fullImage.src = figure.src;
    dialog.showModal();
    document.getElementById('close-pipeline').focus();
  };
  document.getElementById('close-pipeline').onclick = () => dialog.close();
})();
