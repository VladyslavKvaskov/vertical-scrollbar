class VerticalScrollbar extends HTMLElement {
  #track;
  #thumb;
  #arrowUp;
  #arrowDown;

  #scrollableElement;
  #canDrag;
  #percent;
  #dragStart;
  #scrollUpInterval;
  #scrollDownInterval;
  #top;
  #scrolledPercent;
  #scrolledNowPixels;
  #scrolledNowPercent;
  #prevScrolledPercent;
  #prevScrollTop;
  #resizeObserver;
  #mutationObserver;

  constructor() {
    super();

    this.#track = document.createElement('div');
    this.#arrowUp = document.createElement('div');
    this.#thumb = document.createElement('div');
    this.#arrowDown = document.createElement('div');

    this.#track.classList.add('track');
    this.#arrowUp.classList.add('arrow-up');
    this.#thumb.classList.add('thumb');
    this.#arrowDown.classList.add('arrow-down');

    this.appendChild(this.#track);
    this.#track.appendChild(this.#arrowUp);
    this.#track.appendChild(this.#thumb);
    this.#track.appendChild(this.#arrowDown);

    if (!document.querySelector('.vertical-scrollbar-css')) {
      document.head.insertAdjacentHTML('afterbegin', `
        <style class="vertical-scrollbar-css">
          .vertical-scrollbar-target::-webkit-scrollbar {
            width: 0;
          }

          .vertical-scrollbar-target {
            scrollbar-width: none;
          }

          .vertical-scrollbar-target.vertical-scroll-behaviour-auto{
            scroll-behavior: auto;
          }

          vertical-scrollbar {
            position: absolute;
            opacity: 0;
            transition: opacity 0.3s;
            width: 15px;
            height: 100%;
            box-sizing: border-box;
            overflow: hidden;
            will-change: opacity;
          }

          vertical-scrollbar * {
            box-sizing: border-box;
          }

          vertical-scrollbar.show {
            opacity: 1;
          }

          vertical-scrollbar .track {
            position: absolute;
            top: 0;
            right: 0;
            width: 100%;
            height: 100%;
            background: #eee;
          }

          vertical-scrollbar .thumb {
            position: absolute;
            width: 100%;
            height: 50px;
            background: #aaa;
            cursor: pointer;
          }

          vertical-scrollbar .thumb:hover {
            background: #666;
          }

          vertical-scrollbar .thumb.drag {
            background: #666;
          }

          vertical-scrollbar .arrow-up, vertical-scrollbar .arrow-down {
            position: absolute;
            width: 100%;
            height: 15px;
            background: #eee;
            cursor: pointer;
            z-index: 1;
          }

          vertical-scrollbar .arrow-up {
            top: 0;
          }

          vertical-scrollbar .arrow-down {
            bottom: 0;
          }

          vertical-scrollbar .arrow-up::after, vertical-scrollbar .arrow-down::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            margin: auto;
            width: 0; 
            height: 0; 
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
          }

          vertical-scrollbar .arrow-up::after {
            border-bottom: 4px solid #666;
          }

          vertical-scrollbar .arrow-down::after {
            border-top: 4px solid #666;
          }

          vertical-scrollbar .arrow-up:hover::after {
            border-bottom: 4px solid #000;
          }

          vertical-scrollbar .arrow-down:hover::after {
            border-top: 4px solid #000;
          }
        </style>
      `)
    }
  }

  get track() { return this.#track; }
  get thumb() { return this.#thumb; }
  get arrowUp() { return this.#arrowUp; }
  get arrowDown() { return this.#arrowDown; }

  #thumbMouseDown = () => {
    this.#canDrag = true;
  }

  #arrowUpMouseDown = () => {
    if (this.#scrollableElement) {
      this.#scrollableElement.scrollTop -= 50;
      this.#scrollUpInterval = setInterval(() => {
        this.#scrollableElement.classList.add('vertical-scroll-behaviour-auto');
        this.#scrollableElement.scrollTop -= 50;
      }, 100)
    }
  }

  #arrowDownMouseDown = () => {
    if (this.#scrollableElement) {
      this.#scrollableElement.scrollTop += 50;
      this.#scrollDownInterval = setInterval(() => {
        this.#scrollableElement.classList.add('vertical-scroll-behaviour-auto');
        this.#scrollableElement.scrollTop += 50;
      }, 100)
    }
  }

  #trackMouseDown = (event) => {
    if (event.target.closest('.arrow-up') !== this.#arrowUp && event.target.closest('.arrow-down') !== this.#arrowDown && event.target.closest('.thumb') !== this.#thumb) {
      this.#percent = (event.clientY - this.#arrowUp.offsetHeight) / (this.#track.offsetHeight - this.#arrowUp.offsetHeight - this.#arrowDown.offsetHeight) * 100;
      if (this.#percent < 0) {
        this.#percent = 0;
      } else if (this.#percent > 100) {
        this.#percent = 100;
      }

      this.#scrollableElement.scrollTop = (this.#scrollableElement.scrollHeight - this.#scrollableElement.offsetHeight) * this.#percent / 100;
    }
  }

  #documentMouseUp = () => {
    this.#canDrag = false;

    if (this.#dragStart) {
      this.#dragStart = false;
      this.#thumb.dispatchEvent(new Event('drag-end'));
      this.#thumb.classList.remove('drag');
    }

    this.#scrollableElement.classList.remove('vertical-scroll-behaviour-auto');

    if (this.#scrollUpInterval) {
      clearInterval(this.#scrollUpInterval);
    }

    if (this.#scrollDownInterval) {
      clearInterval(this.#scrollDownInterval);
    }
  }

  #documentMouseMove = (event) => {
    if (this.#canDrag) {
      event.preventDefault();

      if (!this.#dragStart) {
        this.#dragStart = true;
        this.#thumb.classList.add('drag');
        this.#thumb.dispatchEvent(new Event('drag-start'));
      }

      this.#scrollableElement.classList.add('vertical-scroll-behaviour-auto');
      this.#percent = (event.clientY - this.#arrowUp.offsetHeight) / (this.#track.offsetHeight - this.#arrowUp.offsetHeight - this.#arrowDown.offsetHeight) * 100;
      if (this.#percent < 0) {
        this.#percent = 0;
      } else if (this.#percent > 100) {
        this.#percent = 100;
      }

      this.#scrollableElement.scrollTop = (this.#scrollableElement.scrollHeight - this.#scrollableElement.offsetHeight) * this.#percent / 100;
    }
  }

  #recalculate = () => {
    if (this.#scrollableElement.scrollHeight > this.#scrollableElement.offsetHeight) {
      this.style.top = 0;
      this.classList.add('show');
      this.#top = this.#scrollableElement.scrollTop;
      this.style.top = `${this.#top}px`;

      this.#scrolledPercent =
        ((this.#top) / (this.#scrollableElement.scrollHeight - this.#scrollableElement.offsetHeight)) * 100;

      if (this.#scrolledPercent > 100) {
        this.#scrolledPercent = 100;
      } else if (this.#scrolledPercent < 0) {
        this.#scrolledPercent = 0;
      }

      this.#thumb.style.top = (((this.offsetHeight * this.#scrolledPercent) / 100) -
        (this.#thumb.offsetHeight * this.#scrolledPercent / 100)) +
        (Math.abs(this.#scrolledPercent - 100) / 100 * this.#arrowUp.offsetHeight) -
        (this.#scrolledPercent / 100 * this.#arrowDown.offsetHeight) + 'px';


      if (this.#scrolledPercent !== this.#prevScrolledPercent) {
        [this.#scrollableElement, this].forEach(element => {
          this.#scrolledNowPixels = Math.max(this.#top, this.#prevScrollTop) - Math.min(this.#top, this.#prevScrollTop);
          this.#scrolledNowPercent = this.#scrolledNowPixels / (this.#scrollableElement.scrollHeight - this.#scrollableElement.offsetHeight) * 100;
          element.dispatchEvent(new CustomEvent('vertical-scroll', {
            detail: {
              scrollbar: this,
              direction: this.#prevScrolledPercent > this.#scrolledPercent ? 'up' : 'down',
              isDragged: this.#dragStart,
              totalScrolled: {
                percent: this.#scrolledPercent,
                pixels: this.#top,
              },
              scrolledNow: {
                percent: this.#scrolledNowPercent > 100 ? 100 : this.#scrolledNowPercent,
                pixels: this.#scrolledNowPixels,
              }
            }
          }));
        })
      }

      this.style.right = `${-this.#scrollableElement.scrollLeft}px`;

      this.#prevScrollTop = this.#top;
      this.#prevScrolledPercent = this.#scrolledPercent;
    }
    else {
      this.classList.remove('show');
    }
  }

  connectedCallback() {
    this.#scrollableElement = this.parentElement;

    this.#scrollableElement.verticalScrollbar = this;
    this.#scrollableElement.classList.add('vertical-scrollbar-target');

    if (window.getComputedStyle(this.#scrollableElement).position === 'static') {
      this.#scrollableElement.style.position = 'relative';
    }

    this.#resizeObserver = new ResizeObserver(this.#recalculate);
    this.#mutationObserver = new MutationObserver(this.#recalculate);
    this.#resizeObserver.observe(this.#scrollableElement);
    this.#mutationObserver.observe(this.#scrollableElement, { childList: true, subtree: true, characterData: true });

    this.#scrollableElement.addEventListener('scroll', this.#recalculate)
    this.#arrowUp.addEventListener('mousedown', this.#arrowUpMouseDown);
    this.#arrowDown.addEventListener('mousedown', this.#arrowDownMouseDown);
    this.#thumb.addEventListener('mousedown', this.#thumbMouseDown);
    this.#track.addEventListener('mousedown', this.#trackMouseDown);
    document.addEventListener('mousemove', this.#documentMouseMove);
    document.addEventListener('mouseup', this.#documentMouseUp);
  }

  disconnectedCallback() {
    this.#scrollableElement.classList.remove('vertical-scrollbar-target');

    this.#resizeObserver.disconnect();
    this.#mutationObserver.disconnect();

    this.#scrollableElement.removeEventListener('scroll', this.#recalculate);
    this.#arrowUp.removeEventListener('mousedown', this.#arrowUpMouseDown);
    this.#arrowDown.removeEventListener('mousedown', this.#arrowDownMouseDown);
    this.#thumb.removeEventListener('mousedown', this.#thumbMouseDown);
    this.#track.removeEventListener('mousedown', this.#trackMouseDown);
    document.removeEventListener('mousemove', this.#documentMouseMove);
    document.removeEventListener('mouseup', this.#documentMouseUp);
  }
}

customElements.define('vertical-scrollbar', VerticalScrollbar);

export default VerticalScrollbar;
