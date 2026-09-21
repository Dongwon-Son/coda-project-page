(() => {
  const assets = window.EMBEDDED_ASSETS || {};
  const assetUrl = path => assets[path] || path;
  document.querySelectorAll('[data-project-asset]').forEach(element => {
    element[element.tagName === 'IMG' ? 'src' : 'href'] = assetUrl(element.dataset.projectAsset);
  });
  const menu = document.getElementById('project-menu');
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
  document.addEventListener('click', event => { if (!menu.contains(event.target)) menu.open = false; });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
  });
  const overview = document.getElementById('overview-dialog');
  document.getElementById('expand-overview').addEventListener('click', () => {
    overview.showModal();
    document.getElementById('close-overview').focus();
  });
  document.getElementById('close-overview').addEventListener('click', () => overview.close());
  const videoReady = new WeakMap();
  const chapterRequests = new WeakMap();
  const videoBlobs = new Set();
  async function prepareVideo(video) {
    video.poster = assetUrl(video.dataset.projectPoster);
    let source = assetUrl(video.dataset.projectVideo);
    video.setAttribute('aria-busy', 'true');
    // Some static hosts ignore Range requests. A complete Blob gives the media
    // element a seekable source without relying on server-side byte ranges.
    if (new URL(source, document.baseURI).protocol !== 'file:') {
      try {
        const response = await fetch(source);
        if (!response.ok) throw new Error(`Video request failed: ${response.status}`);
        const blob = await response.blob();
        source = URL.createObjectURL(blob.type === 'video/mp4' ? blob : new Blob([blob], {type: 'video/mp4'}));
        videoBlobs.add(source);
      } catch {
        // Keep direct playback available if full-file loading is unavailable.
      }
    }
    return new Promise((resolve, reject) => {
      const clear = () => {
        video.removeEventListener('loadedmetadata', loaded);
        video.removeEventListener('error', failed);
        video.removeAttribute('aria-busy');
      };
      const loaded = () => { clear(); resolve(); };
      const failed = () => { clear(); reject(new Error('Video could not be loaded')); };
      video.addEventListener('loadedmetadata', loaded);
      video.addEventListener('error', failed);
      video.preload = 'metadata';
      video.src = source;
      video.load();
    });
  }
  document.querySelectorAll('[data-project-video]').forEach(video => {
    const ready = prepareVideo(video);
    videoReady.set(video, ready);
    ready.catch(() => {}); // Native media controls also report loading errors.
  });
  document.querySelectorAll('[data-video-time]').forEach(button => {
    button.addEventListener('click', async () => {
      const video = document.querySelector(button.dataset.videoTarget || '#project-video');
      if (!video) return;
      const request = (chapterRequests.get(video) || 0) + 1;
      chapterRequests.set(video, request);
      try {
        await videoReady.get(video);
        if (chapterRequests.get(video) !== request) return;
        video.currentTime = Math.max(0, Math.min(Number(button.dataset.videoTime), video.duration));
        await video.play();
      } catch {
        video.focus();
      }
    });
  });
  window.addEventListener('pagehide', event => {
    if (!event.persisted) videoBlobs.forEach(url => URL.revokeObjectURL(url));
  });
})();
