document.addEventListener('DOMContentLoaded', () => {
  const url = new URL(window.location.href);
  const shouldAutoAdd = url.searchParams.get('sub90_autocart') === '1';

  document.querySelectorAll('[data-sub90-main]').forEach((section) => {
    const mainImage = section.querySelector('[data-sub90-main-image]');
    const mainImageButton = section.querySelector('[data-sub90-lightbox-open]');
    const galleryFrame = section.querySelector('.sub90-gallery__frame');
    const lightbox = section.querySelector('[data-sub90-lightbox]');
    const lightboxImage = section.querySelector('[data-sub90-lightbox-image]');
    const lightboxClose = section.querySelector('[data-sub90-lightbox-close]');
    const thumbs = section.querySelectorAll('[data-sub90-thumb]');
    const stickyPrice = section.querySelector('[data-sub90-sticky-price]');
    const price = section.querySelector('[data-sub90-price]');
    const variantsScript = section.querySelector('[data-sub90-variants]');
    const setupCards = section.querySelectorAll('[data-sub90-setup-card]');
    const setupInputs = section.querySelectorAll('.sub90-setup-card__input');
    const addToCartSpans = section.querySelectorAll('.sub90-main-form button[type="submit"] span');
    const currencyCode = section.querySelector('variant-selects')?.dataset.currencyCode || 'USD';
    const colorFieldsets = section.querySelectorAll('.sub90-main-variants fieldset');
    let variantData = [];

    if (variantsScript) {
      try {
        variantData = JSON.parse(variantsScript.textContent.trim() || '[]');
      } catch (error) {
        variantData = [];
      }
    }

    const normalizeAmount = (amount) => {
      const raw = String(amount ?? '').trim();
      if (!raw) return null;

      const numeric = Number(raw.replace(/[^0-9.]/g, ''));
      if (!Number.isFinite(numeric)) return null;

      return raw.includes('.') ? Math.round(numeric * 100) : Math.round(numeric);
    };

    const formatMoney = (amount) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }).format(Number(amount));

    const getSelectedOptionValues = () =>
      Array.from(section.querySelectorAll('.sub90-main-variants fieldset')).map((fieldset) => {
        const checked = fieldset.querySelector('input[type="radio"]:checked');
        return checked ? checked.value : null;
      });

    const updateThumbSelection = (src) => {
      if (!src) return;
      thumbs.forEach((thumb) => {
        const thumbSrc = thumb.getAttribute('data-image-src') || '';
        thumb.classList.toggle('is-active', thumbSrc === src);
      });
    };

    const applyVariant = (variant) => {
      if (!variant) return;

      if (mainImage) {
        const imageSrc = variant.featured_image?.src || variant.featured_media?.preview_image?.src;
        if (imageSrc) {
          mainImage.src = imageSrc;
          if (lightboxImage) lightboxImage.src = imageSrc;
          updateThumbSelection(imageSrc);
        }
        if (variant.featured_image?.alt) {
          mainImage.alt = variant.featured_image.alt;
          if (lightboxImage) lightboxImage.alt = variant.featured_image.alt;
        }
      }

      if (section.querySelector('input[name="id"]')) {
        section.querySelectorAll('input[name="id"]').forEach((input) => {
          input.value = variant.id;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
    };

    const findVariantFromSelection = () => {
      const selectedValues = getSelectedOptionValues();

      if (!variantData.length || !selectedValues.length) return null;

      return (
        variantData.find((variant) =>
          selectedValues.every((value, index) => {
            if (!value) return false;
            return [variant.option1, variant.option2, variant.option3].filter(Boolean)[index] === value;
          })
        ) || variantData[0]
      );
    };

    const syncSetupCards = () => {
      setupCards.forEach((card) => card.classList.remove('is-active'));
      setupInputs.forEach((input) => {
        const card = input.closest('[data-sub90-setup-card]');
        if (input.checked && card) {
          card.classList.add('is-active');
          const selectedPrice = card.getAttribute('data-setup-price') || '';
          const selectedPriceRaw = card.getAttribute('data-setup-price-raw') || '';
          const targetAmount = normalizeAmount(selectedPriceRaw);
          const matchedVariant =
            targetAmount === null
              ? null
              : variantData.find((variant) => normalizeAmount(variant.price) === targetAmount) || null;

          if (matchedVariant) {
            applyVariant(matchedVariant);
          }

          if (price && selectedPrice) {
            price.textContent = selectedPrice;
          }
          if (stickyPrice && selectedPrice) {
            stickyPrice.textContent = selectedPrice;
          }
          if (addToCartSpans.length && selectedPrice) {
            addToCartSpans.forEach((span) => {
              span.textContent = `Add to Cart. ${selectedPrice}`;
            });
          }
        }
      });
    };

    const syncFromVariantPicker = () => {
      const variant = findVariantFromSelection();
      if (variant) {
        applyVariant(variant);
      }
    };

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

    syncFromVariantPicker();
    syncSetupCards();

    section.addEventListener('change', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.closest('.sub90-main-variants')) {
        window.requestAnimationFrame(syncFromVariantPicker);
      }

      if (target.classList.contains('sub90-setup-card__input')) {
        syncSetupCards();
      }
    });

    setupCards.forEach((card) => {
      card.addEventListener('click', () => {
        const input = card.querySelector('.sub90-setup-card__input');
        if (input && !input.checked) {
          input.checked = true;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
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

    if (galleryFrame && mainImage) {
      const updateZoomOrigin = (event) => {
        const rect = galleryFrame.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        mainImage.style.transformOrigin = `${x}% ${y}%`;
      };

      galleryFrame.addEventListener('mousemove', updateZoomOrigin);
      galleryFrame.addEventListener('mouseenter', updateZoomOrigin);
      galleryFrame.addEventListener('mouseleave', () => {
        mainImage.style.transformOrigin = 'center center';
      });
    }

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

    if (shouldAutoAdd) {
      const submitButton = section.querySelector('.sub90-main-form button[type="submit"]');
      if (submitButton) {
        url.searchParams.delete('sub90_autocart');
        window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
        window.requestAnimationFrame(() => submitButton.click());
      }
    }
  });
});
