class PredictiveSearch extends HTMLElement {
  constructor() {
    super();
    this.cachedResults = {};
    this.input = this.querySelector('input[type="search"]');
    this.closeIconSearch = this.querySelector('.close-search');
    this.searchProduct = document.querySelector('[data-search-products]');
    this.predictiveSearchResults = this.querySelector('[data-predictive-search]');
    this.isOpen = false;

    this.setupEventListeners();
  }

  setupEventListeners() {
    const form = this.querySelector('form.search');
    form.addEventListener('submit', this.onFormSubmit.bind(this));

    this.input.addEventListener('input', debounce((event) => {
      this.onChange(event);
    }, 300).bind(this));
    this.input.addEventListener('focus', this.onFocus.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.addEventListener('keyup', this.onKeyup.bind(this));
    this.addEventListener('keydown', (e) => {
      this.onKeydown.bind(this);
      if ((e.keyCode || e.which) === 27) this.onFocusOut.bind(this)
    });
    this.animationWorker();
  }

  getQuery() {
    return this.input.value.trim();
  }

  onChange() {
    const searchTerm = this.getQuery();
    this.getSuggestedTerms(searchTerm);
    if (!searchTerm.length) {
      this.close(true);
      return;
    }

    this.getSearchResults(searchTerm);
  }

  onFormSubmit(event) {
    if (!this.getQuery().length || this.querySelector('[aria-selected="true"] a')) event.preventDefault();
  }

  onFocus() {
    const searchTerm = this.getQuery();
    this.closeIconSearch.style.display = 'block';
    if (!searchTerm.length) {
      this.searchProduct.style.display = 'block';
      this.setAttribute('product', true);
    } else {
      this.searchProduct.style.display = 'none';
      this.setAttribute('product', false);
    }
    if (this.getAttribute('results') === 'true') {
      this.open();
    }
    // else {
      // this.getSearchResults(searchTerm);
    // }
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement) ) {
        this.searchProduct.style.display = 'none';
        this.closeIconSearch.style.display = 'none';
        this.setAttribute('product', false);
        this.close();
      }
    })
  }

  onKeyup(event) {
    if (!this.getQuery().length) {
      this.close(true);
      this.searchProduct.style.display = 'block';
      this.setAttribute('product', true);
    } else {
      this.searchProduct.style.display = 'none';
      this.setAttribute('product', false);
    };

    event.preventDefault();

    switch (event.code) {
      case 'ArrowUp':
        this.switchOption('up')
        break;
      case 'ArrowDown':
        this.switchOption('down');
        break;
      case 'Enter':
        this.selectOption();
        break;
    }
  }

  onKeydown(event) {
    // Prevent the cursor from moving in the input when using the up and down arrow keys
    if (
      event.code === 'ArrowUp' ||
      event.code === 'ArrowDown'
    ) {
      event.preventDefault();
    }
  }

  switchOption(direction) {
    if (!this.getAttribute('open')) return;

    const moveUp = direction === 'up';
    const selectedElement = this.querySelector('[aria-selected="true"]');
    const allElements = this.querySelectorAll('li');
    let activeElement = this.querySelector('li');

    if (moveUp && !selectedElement) return;

    this.statusElement.textContent = '';

    if (!moveUp && selectedElement) {
      activeElement = selectedElement.nextElementSibling || allElements[0];
    } else if (moveUp) {
      activeElement = selectedElement.previousElementSibling || allElements[allElements.length - 1];
    }

    if (activeElement === selectedElement) return;

    activeElement.setAttribute('aria-selected', true);
    if (selectedElement) selectedElement.setAttribute('aria-selected', false);

    this.setLiveRegionText(activeElement.textContent);
    this.input.setAttribute('aria-activedescendant', activeElement.id);
  }

  selectOption() {
    const selectedProduct = this.querySelector('[aria-selected="true"] a, [aria-selected="true"] button');

    if (selectedProduct) selectedProduct.click();
  }

  getSearchResults(searchTerm) {
    const queryKey = searchTerm.replace(" ", "-").toLowerCase();
    this.setLiveRegionLoadingState();
    this.getSuggestedTerms(searchTerm);
    if (this.cachedResults[queryKey]) {
      this.renderSearchResults(this.cachedResults[queryKey]);
      return;
    }

    fetch(`${routes.predictive_search_url}?q=${encodeURIComponent(searchTerm)}&${encodeURIComponent('resources[type]')}=product&${encodeURIComponent('resources[limit]')}=3&section_id=predictive-search`)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          this.close();
          throw error;
        }

        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector('#shopify-section-predictive-search').innerHTML;
        this.cachedResults[queryKey] = resultsMarkup;
        this.renderSearchResults(resultsMarkup);
      })
      .catch((error) => {
        this.close();
        throw error;
      });
  }

  getSuggestedTerms(searchTerm) {
    let emptyArray = [];
    if(searchTerm) {
      emptyArray = suggested.filter(function(data) {
        return data.toLocaleLowerCase().startsWith(searchTerm.toLocaleLowerCase())
      });

      emptyArray = emptyArray.slice(0, 5).map(function(data) {
        let url = data.replace(/\s+/g, '+');
        return data = '<li class="search-results-suggested__item"><a class="search-results-suggested__link" href="/search?q='+url+'">'+data+'</a></li>';
      });
      $('[data-suggested-list]').html(emptyArray);
    }
  }

  setLiveRegionLoadingState() {
    this.statusElement = this.statusElement || this.querySelector('.predictive-search-status');
    this.loadingText = this.loadingText || this.getAttribute('data-loading-text');

    this.setLiveRegionText(this.loadingText);
    this.setAttribute('loading', true);
  }

  setLiveRegionText(statusText) {
    this.statusElement.setAttribute('aria-hidden', 'false');
    this.statusElement.textContent = statusText;

    setTimeout(() => {
      this.statusElement.setAttribute('aria-hidden', 'true');
    }, 1000);
  }

  renderSearchResults(resultsMarkup) {
    this.predictiveSearchResults.innerHTML = resultsMarkup;
    this.setAttribute('results', true);

    this.setLiveRegionResults();
    this.open();
  }

  setLiveRegionResults() {
    this.removeAttribute('loading');
    this.setLiveRegionText(this.querySelector('[data-predictive-search-live-region-count-value]').textContent);
  }

  getResultsMaxHeight() {
    this.resultsMaxHeight = window.innerHeight - document.getElementById('shopify-section-header').getBoundingClientRect().bottom;
    return this.resultsMaxHeight;
  }

  open() {
    this.predictiveSearchResults.style.maxHeight = this.resultsMaxHeight || `${this.getResultsMaxHeight()}px`;
    this.setAttribute('open', true);
    this.input.setAttribute('aria-expanded', true);
    this.isOpen = true;
  }

  close(clearSearchTerm = false) {
    if (clearSearchTerm) {
      this.input.value = '';
      this.removeAttribute('results');
    }

    const selected = this.querySelector('[aria-selected="true"]');

    if (selected) selected.setAttribute('aria-selected', false);

    this.input.setAttribute('aria-activedescendant', '');
    this.removeAttribute('open');
    this.input.setAttribute('aria-expanded', false);
    this.resultsMaxHeight = false
    this.predictiveSearchResults.removeAttribute('style');

    this.isOpen = false;
  }

  animationWorker() {
    const string = window.placeholder;
    var texts = string.split(', ');
    const input = document.querySelector('input[type="search"]');
    const animationWorker = function (input, texts) {
      this.input = input;
      this.defaultPlaceholder = this.input.getAttribute('placeholder');
      this.texts = texts;
      this.curTextNum = 0;
      this.curPlaceholder = '';
      this.blinkCounter = 0;
      this.animationFrameId = 0;
      this.animationActive = false;
      this.input.setAttribute('placeholder',this.curPlaceholder);

      this.switch = (timeout) => {
        this.input.classList.add('imitatefocus');
        setTimeout(
          () => {
            this.input.classList.remove('imitatefocus');
            if (this.curTextNum == 0)
              this.input.setAttribute('placeholder',this.defaultPlaceholder);
            else
              this.input.setAttribute('placeholder',this.curPlaceholder);

            setTimeout(
              () => {
                this.input.setAttribute('placeholder',this.curPlaceholder);
                if(this.animationActive)
                  this.animationFrameId = window.requestAnimationFrame(this.animate)},
              timeout);
          },
          timeout);
      }

      this.animate = () => {
        if(!this.animationActive) return;
        let curPlaceholderFullText = this.texts[this.curTextNum];
        let timeout = 900;
        if (this.curPlaceholder == curPlaceholderFullText+'|' && this.blinkCounter==3) {
          this.blinkCounter = 0;
          this.curTextNum = (this.curTextNum >= this.texts.length-1)? 0 : this.curTextNum+1;
          this.curPlaceholder = '|';
          this.switch(3000);
          return;
        }
        else if (this.curPlaceholder == curPlaceholderFullText+'|' && this.blinkCounter<3) {
          this.curPlaceholder = curPlaceholderFullText;
          this.blinkCounter++;
        }
        else if (this.curPlaceholder == curPlaceholderFullText && this.blinkCounter<3) {
          this.curPlaceholder = this.curPlaceholder+'|';
        }
        else {
          this.curPlaceholder = curPlaceholderFullText
            .split('')
            .slice(0,this.curPlaceholder.length+1)
            .join('') + '|';
          timeout = 150;
        }
        this.input.setAttribute('placeholder',this.curPlaceholder);
        setTimeout(
          () => { if(this.animationActive) this.animationFrameId = window.requestAnimationFrame(this.animate)},
          timeout);
      }

      this.stop = () => {
        this.animationActive = false;
        window.cancelAnimationFrame(this.animationFrameId);
      }

      this.start = () => {
        this.animationActive = true;
        this.animationFrameId = window.requestAnimationFrame(this.animate);
        return this;
      }
    }

    document.addEventListener("DOMContentLoaded", () => {
      let aw = new animationWorker(input, texts).start();
      input.addEventListener("focus", (e) => aw.stop());
      input.addEventListener("blur", (e) => {
        aw = new animationWorker(input, texts);
        if(e.target.value == '') setTimeout( aw.start, 5000);
      });
    });
  }
}

customElements.define('predictive-search', PredictiveSearch);
