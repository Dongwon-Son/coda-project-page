// Add the final URLs here when these resources are ready; empty values stay inactive.
const CODA_RESOURCE_LINKS = {
  paper: '',
  code: 'https://github.com/iMSquared/CODA/tree/release',
  dataset: 'https://huggingface.co/datasets/HugeLab/CODA',
};
for (const button of document.querySelectorAll('[data-resource]')) {
  const value = CODA_RESOURCE_LINKS[button.dataset.resource].trim();
  if (!value) continue;
  const url = new URL(value, document.baseURI);
  if (!['https:', 'http:'].includes(url.protocol)) continue;
  button.href = url.href;
  button.target = '_blank';
  button.rel = 'noopener noreferrer';
  button.removeAttribute('aria-disabled');
  button.querySelector('.resource-status').textContent = 'Open ↗';
}
