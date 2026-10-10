/**
 * ========================================================
 * صفحة آراء الطلاب وأولياء الأمور - تفاعلية المعرض والـ Lightbox
 * أ. منه خالد الهلبي
 * ========================================================
 */

(function () {
  "use strict";

  // تحديث السنة
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Scroll Progress Bar
  const progressBar = document.getElementById("progress-bar");
  if (progressBar) {
    window.addEventListener("scroll", () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const progress = h > 0 ? (window.scrollY / h) * 100 : 0;
      progressBar.style.width = `${progress}%`;
    }, { passive: true });
  }

  // Lightbox Implementation
  const modal = document.getElementById("lightboxModal");
  const modalImg = document.getElementById("lightboxImage");
  const modalCounter = document.getElementById("lightboxCounter");
  const backdrop = document.getElementById("lightboxBackdrop");
  const closeBtn = document.getElementById("lightboxClose");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");

  const cards = Array.from(document.querySelectorAll(".review-card"));
  const totalReviews = cards.length;
  let currentIndex = 0;

  function openLightbox(index) {
    if (index < 0 || index >= totalReviews) return;
    currentIndex = index;
    const card = cards[currentIndex];
    const img = card.querySelector(".review-card-img");
    if (!img) return;

    modalImg.src = img.src;
    modalCounter.textContent = `${currentIndex + 1} / ${totalReviews}`;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    modalImg.src = "";
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % totalReviews;
    openLightbox(currentIndex);
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + totalReviews) % totalReviews;
    openLightbox(currentIndex);
  }

  cards.forEach((card, idx) => {
    card.addEventListener("click", () => openLightbox(idx));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(idx);
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  if (backdrop) backdrop.addEventListener("click", closeLightbox);
  if (nextBtn) nextBtn.addEventListener("click", showNext);
  if (prevBtn) prevBtn.addEventListener("click", showPrev);

  // Keyboard navigation
  window.addEventListener("keydown", (e) => {
    if (!modal || !modal.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showNext(); // RTL: next is to the left
    if (e.key === "ArrowRight") showPrev(); // RTL: prev is to the right
  });

  // Mobile swipe gestures
  let touchStartX = 0;
  let touchEndX = 0;

  if (modal) {
    modal.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    modal.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        showPrev(); // RTL swipe right -> previous
      } else {
        showNext(); // RTL swipe left -> next
      }
    }
  }
})();
