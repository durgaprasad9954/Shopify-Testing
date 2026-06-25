document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-sub90-main]').forEach((section) => {
    const mainImage = section.querySelector('[data-sub90-main-image]');
    const mainImageButton = section.querySelector('[data-sub90-lightbox-open]');
    const lightbox = section.querySelector('[data-sub90-lightbox]');
    const lightboxImage = section.querySelector('[data-sub90-lightbox-image]');
    const lightboxClose = section.querySelector('[data-sub90-lightbox-close]');
    const thumbs = section.querySelectorAll('[data-sub90-thumb]');
    const stickyPrice = section.querySelector('[data-sub90-sticky-price]');
    const price = section.querySelector('[data-sub90-price]');
    const colorFieldsets = section.querySelectorAll('.sub90-main-variants fieldset');

    const syncColorLegend = (fieldset) => {
      const legend = fieldset.querySelector('legend');
      const checkedInput = fieldset.querySelector('input[type="radio"]:checked');

      if (!legend || !checkedInput) {
        return;
      }

      legend.innerHTML = `COLOR: <span>${checkedInput.value}</span>`;
    };

    colorFieldsets.forEach((fieldset) => {
      syncColorLegend(fieldset);
      fieldset.querySelectorAll('input[type="radio"]').forEach((input) => {
        input.addEventListener('change', () => syncColorLegend(fieldset));
      });
    });

    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const src = thumb.getAttribute('data-image-src');
        const alt = thumb.getAttribute('data-image-alt') || '';

        if (mainImage && src) {
          mainImage.src = src;
          mainImage.alt = alt;
        }

        if (lightboxImage && src) {
          lightboxImage.src = src;
          lightboxImage.alt = alt;
        }

        thumbs.forEach((item) => item.classList.remove('is-active'));
        thumb.classList.add('is-active');
      });
    });

    if (mainImageButton && lightbox && lightboxImage && mainImage) {
      mainImageButton.addEventListener('click', () => {
        lightboxImage.src = mainImage.currentSrc || mainImage.src;
        lightboxImage.alt = mainImage.alt || '';
        lightbox.classList.add('is-open');
        document.body.classList.add('overflow-hidden');
      });
    }

    if (lightboxClose && lightbox) {
      lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('is-open');
        document.body.classList.remove('overflow-hidden');
      });
    }

    if (lightbox) {
      lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
          lightbox.classList.remove('is-open');
          document.body.classList.remove('overflow-hidden');
        }
      });
    }

    if (stickyPrice && price) {
      stickyPrice.textContent = price.textContent.trim();
    }
  });
});
