const appWrapper = document.querySelector('.app-wrapper');

let scrollTimeout;

appWrapper.addEventListener('vertical-scroll', (event) => {
  clearTimeout(scrollTimeout);
  const { direction, scrolledNow, scrollbar } = event.detail;
  const { fire } = scrollbar.thumb || {};

  scrollbar.classList.add(direction === 'up' ? 'up' : 'down');
  scrollbar.classList.remove(direction === 'up' ? 'down' : 'up');

  const fireHeight = scrollbar.offsetHeight * (scrolledNow.percent) / 100;
  fire.style.height = `${fireHeight > 100 ? 100 : fireHeight}px`;
  scrollTimeout = setTimeout(() => {
    fire.removeAttribute('style');
  }, 300);
});

customElements.whenDefined('vertical-scrollbar').then(() => {
  const scrollbar = appWrapper.verticalScrollbar;

  scrollbar.classList.add('down');
  scrollbar.thumb.fire = document.createElement('div');
  scrollbar.thumb.rocket = document.createElement('div');
  const { fire } = scrollbar.thumb;
  const { rocket } = scrollbar.thumb;
  fire.classList.add('fire');
  rocket.classList.add('rocket');

  document.addEventListener('dblclick', (event) => {
    if (event.target === rocket) {
      scrollbar.thumb.classList.toggle('scaled');
    }
  });

  document.addEventListener('click', (event) => {
    if (event.target !== rocket) {
      scrollbar.thumb.classList.remove('scaled');
    }
  });

  appWrapper.verticalScrollbar.thumb.appendChild(fire);
  appWrapper.verticalScrollbar.thumb.appendChild(rocket);
})
