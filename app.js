/**
 * ========================================================
 * أ. منه خالد الهلبي - معلّمة مادة الرياضيات
 * المحرك التفاعلي، خفة الأداء للهواتف، والربط بالواتساب
 * ========================================================
 */

(function () {
  "use strict";

  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // تحديث سنة الفوتر تلقائياً
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ========================================================
     1. شاشة التحميل الخفيفة السريعة (Preloader)
     ======================================================== */
  const loader = document.getElementById("loader");
  const loaderBar = document.getElementById("loader-bar");
  const loaderPercent = document.getElementById("loader-percent");

  function runLoader() {
    document.body.classList.add("is-loading");
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 28 + 18;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        if (loaderBar) loaderBar.style.width = "100%";
        if (loaderPercent) loaderPercent.textContent = "100%";
        setTimeout(() => {
          if (loader) loader.classList.add("is-done");
          document.body.classList.remove("is-loading");
          initSite();
        }, 120);
      } else {
        if (loaderBar) loaderBar.style.width = progress + "%";
        if (loaderPercent) loaderPercent.textContent = Math.floor(progress) + "%";
      }
    }, 40);
  }

  /* ========================================================
     2. مؤشر الماوس المخصص (شاشات الكمبيوتر فقط)
     ======================================================== */
  function initCursor() {
    if (!isDesktop || prefersReduced || isTouch) return;
    const cursor = document.getElementById("cursor");
    if (!cursor) return;

    document.body.classList.add("has-cursor");
    const dot = cursor.querySelector(".cursor-dot");
    const ring = cursor.querySelector(".cursor-ring");
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (dot) {
        dot.style.left = mx + "px";
        dot.style.top = my + "px";
      }
    }, { passive: true });

    function animateRing() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ring) {
        ring.style.left = rx + "px";
        ring.style.top = ry + "px";
      }
      requestAnimationFrame(animateRing);
    }
    animateRing();

    const interactiveElements = document.querySelectorAll(
      "a, button, input, select, textarea, .method-step, .stage-card, .c-card, .portrait-frame"
    );
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  }

  /* ========================================================
     3. خلفية الجزيئات ثلاثية الأبعاد (سطح المكتب فقط لتوفير بطارية الهاتف)
     ======================================================== */
  function initBg3D() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas || typeof THREE === "undefined" || prefersReduced) {
      if (canvas) canvas.style.display = "none";
      return;
    }

    // تعطيل كامل على الموبايل والتابلت لسرعة البرق وتوفير الطاقة
    if (window.innerWidth < 800 || isTouch) {
      canvas.style.display = "none";
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 9;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // جزيئات الورد والذهب
    const roseCount = 50;
    const rosePositions = new Float32Array(roseCount * 3);
    for (let i = 0; i < roseCount; i++) {
      rosePositions[i * 3] = (Math.random() - 0.5) * 18;
      rosePositions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      rosePositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    const roseGeo = new THREE.BufferGeometry();
    roseGeo.setAttribute("position", new THREE.BufferAttribute(rosePositions, 3));
    const roseMat = new THREE.PointsMaterial({
      color: 0xe08ba0,
      size: 0.055,
      transparent: true,
      opacity: 0.42,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const rosePoints = new THREE.Points(roseGeo, roseMat);
    scene.add(rosePoints);

    const goldCount = 40;
    const goldPositions = new Float32Array(goldCount * 3);
    for (let i = 0; i < goldCount; i++) {
      goldPositions[i * 3] = (Math.random() - 0.5) * 16;
      goldPositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      goldPositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const goldGeo = new THREE.BufferGeometry();
    goldGeo.setAttribute("position", new THREE.BufferAttribute(goldPositions, 3));
    const goldMat = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.045,
      transparent: true,
      opacity: 0.38,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const goldPoints = new THREE.Points(goldGeo, goldMat);
    scene.add(goldPoints);

    let mouseX = 0, mouseY = 0;
    let targetRotY = 0, targetRotX = 0;

    document.addEventListener("mousemove", (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.28;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.2;
    }, { passive: true });

    let frame = 0;
    let running = true;

    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running) animate();
    });

    function animate() {
      if (!running) return;
      frame++;
      targetRotY = frame * 0.0003 + mouseX * 0.22;
      targetRotX = Math.sin(frame * 0.0002) * 0.05 + mouseY * 0.15;

      rosePoints.rotation.y += (targetRotY - rosePoints.rotation.y) * 0.05;
      rosePoints.rotation.x += (targetRotX - rosePoints.rotation.x) * 0.05;

      goldPoints.rotation.y -= (targetRotY * 1.1 + goldPoints.rotation.y) * 0.04;
      goldPoints.rotation.x += (targetRotX * 0.9 - goldPoints.rotation.x) * 0.04;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth < 800) {
          canvas.style.display = "none";
          running = false;
          return;
        }
        canvas.style.display = "";
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }, 150);
    }, { passive: true });
  }

  /* ========================================================
     4. حركة البارالاكس للهيرو (Hero Parallax)
     ======================================================== */
  function initHeroParallax() {
    if (prefersReduced) return;
    const bg = document.querySelector(".hero-bg");
    const img = document.querySelector(".hero-bg-img");
    const hero = document.getElementById("hero");
    if (!bg || !img || !hero) return;

    if (isTouch || window.innerWidth < 900) {
      img.classList.add("is-drifting");
      return;
    }

    img.classList.add("is-drifting");
    let mx = 0, my = 0, cx = 0, cy = 0;
    let active = true;
    let raf = 0;

    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }, { passive: true });

    hero.addEventListener("mouseleave", () => { mx = 0; my = 0; }, { passive: true });

    document.addEventListener("visibilitychange", () => {
      active = !document.hidden;
      if (active && !raf) raf = requestAnimationFrame(tick);
    });

    function tick() {
      raf = 0;
      if (!active) return;
      cx += (mx - cx) * 0.05;
      cy += (my - cy) * 0.05;
      bg.style.transform = `translate3d(${cx * -12}px, ${cy * -8}px, 0)`;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
  }

  /* ========================================================
     5. التمرير فائق السلاسة (Lenis Smooth Scroll)
     ======================================================== */
  let lenis = null;
  function initLenis() {
    // معطل على أجهزة اللمس للحفاظ التام على سلاسة التمرير الأصلي 120Hz/60Hz
    if (prefersReduced || typeof Lenis === "undefined" || isTouch) return;

    lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ========================================================
     6. شريط تقدم التمرير (Scroll Progress)
     ======================================================== */
  function initScrollProgress() {
    const bar = document.getElementById("progress-bar");
    if (!bar) return;

    function update() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + "%";
    }

    if (lenis) lenis.on("scroll", update);
    else window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ========================================================
     7. شريط التنقل والتنقل النشط (Nav & Mobile Menu)
     ======================================================== */
  function initNav() {
    const nav = document.getElementById("nav");
    const toggle = document.getElementById("nav-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    const links = document.querySelectorAll(".nav-links a, .mobile-menu-links a, .nav-logo");

    function onScroll() {
      if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 30);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (toggle && mobileMenu) {
      toggle.addEventListener("click", () => {
        const isOpen = mobileMenu.classList.toggle("is-open");
        toggle.classList.toggle("is-open", isOpen);
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        mobileMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
        document.body.style.overflow = isOpen ? "hidden" : "";
      });

      mobileMenu.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", () => {
          mobileMenu.classList.remove("is-open");
          toggle.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          mobileMenu.setAttribute("aria-hidden", "true");
          document.body.style.overflow = "";
        });
      });
    }

    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -20 });
        else target.scrollIntoView({ behavior: "smooth" });
      });
    });

    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-links a[data-section]");
    function updateActive() {
      let current = "";
      const scrollY = window.scrollY + 140;
      sections.forEach((sec) => {
        if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
          current = sec.id;
        }
      });
      navLinks.forEach((a) => {
        a.classList.toggle("is-active", a.getAttribute("data-section") === current);
      });
    }
    window.addEventListener("scroll", updateActive, { passive: true });
    updateActive();
  }

  /* ========================================================
     8. المنهجية التفاعلية (Method Stepper)
     ======================================================== */
  function initMethod() {
    const steps = document.querySelectorAll(".method-step");
    const progressBar = document.getElementById("method-progress-bar");
    if (!steps.length) return;

    function activate(index) {
      steps.forEach((s, i) => s.classList.toggle("is-active", i === index));
      if (progressBar) progressBar.style.width = ((index + 1) / steps.length) * 100 + "%";
    }

    steps.forEach((step, i) => {
      step.addEventListener("mouseenter", () => activate(i));
      step.addEventListener("focus", () => activate(i));
      step.addEventListener("click", () => activate(i));
    });
  }

  /* ========================================================
     9. أنيميشن الظهور وحركات GSAP الخفيفة
     ======================================================== */
  function initAnimations() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined" || prefersReduced) return;
    gsap.registerPlugin(ScrollTrigger);

    // تايم لاين قسم الهيرو
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTl
      .from(".hero-bg-img", { scale: 1.15, opacity: 0.65, duration: 1.5 }, 0)
      .from(".hero-meta", { opacity: 0, y: 16, duration: 0.7 }, 0.35)
      .from(".hero-name .name-line", { opacity: 0, y: 35, duration: 0.85, stagger: 0.12 }, 0.45)
      .from(".hero-title", { opacity: 0, y: 16, duration: 0.65 }, 0.7)
      .from(".hero-tagline", { opacity: 0, y: 16, duration: 0.65 }, 0.85)
      .from(".hero-chips .h-chip", { opacity: 0, y: 12, duration: 0.5, stagger: 0.08 }, 0.95)
      .from(".hero-actions .btn", { opacity: 0, y: 16, duration: 0.55, stagger: 0.08 }, 1.05);

    initHeroParallax();

    // عناوين الأقسام
    gsap.utils.toArray(".section-label, .section-title").forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
        opacity: 0,
        y: 25,
        duration: 0.75,
        ease: "power3.out",
      });
    });

    // قسم عن المعلمة والبورتريه
    gsap.from(".about-portrait-wrap", {
      scrollTrigger: { trigger: ".about-portrait-wrap", start: "top 85%" },
      opacity: 0,
      scale: 0.94,
      y: 25,
      duration: 0.9,
      ease: "power3.out",
    });

    // بطاقات قنوات التواصل
    gsap.from(".c-card", {
      scrollTrigger: { trigger: ".contact-cards-grid", start: "top 85%" },
      opacity: 0,
      y: 25,
      duration: 0.7,
      stagger: 0.1,
      ease: "power3.out",
    });
  }

  /* ========================================================
     10. نموذج الحجز المباشر بالواتساب (أ. منه خالد الهلبي)
     ======================================================== */
  window.handleBookingSubmit = function () {
    const studentName = document.getElementById("student-name").value.trim();
    const parentPhone = document.getElementById("parent-phone").value.trim();
    const studentGrade = document.getElementById("student-grade").value;
    const studyMode = document.getElementById("study-mode").value;
    const studentNotes = document.getElementById("student-notes").value.trim();

    if (!studentName || !parentPhone || !studentGrade || !studyMode) {
      alert("يرجى ملء جميع الحقول المطلوبة لتأكيد الحجز.");
      return;
    }

    let message = `السلام عليكم ورحمة الله وبركاته، أستاذة منه خالد الهلبي 🌸\n`;
    message += `أرغب في حجز مقعد لدراسة مادة الرياضيات مع حضراتكم:\n\n`;
    message += `👤 اسم الطالب/ة: ${studentName}\n`;
    message += `📱 هاتف ولي الأمر: ${parentPhone}\n`;
    message += `📚 الصف الدراسي: ${studentGrade}\n`;
    message += `🏫 نظام الحضور: ${studyMode}\n`;
    if (studentNotes) {
      message += `📝 ملاحظات خاصة: ${studentNotes}\n`;
    }
    message += `\nبرجاء التكرم بموافاتنا بالمواعيد المتاحة ومقرات الحصص أو رابط حصة الزوم. شكراً جزيلاً لحضرتك!`;

    const teacherWhatsApp = "201069687611";
    const encodedMsg = encodeURIComponent(message);
    const waUrl = `https://wa.me/${teacherWhatsApp}?text=${encodedMsg}`;

    window.open(waUrl, "_blank");
  };

  /* ========================================================
     نظام حماية وتشفير صورة الأستاذة (Secure Canvas & Anti-Screenshot)
     ======================================================== */
  function initSecurePortrait() {
    const canvas = document.getElementById("portraitCanvas");
    const frame = document.getElementById("securePortraitFrame");
    const shield = document.getElementById("portraitShield");
    if (!canvas || !frame) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: false });

    // 1. فك تشفير بيانات الصورة من الذاكرة (XOR + Base64 Decryption)
    if (window.__SECURE_PAYLOAD) {
      try {
        const binaryStr = atob(window.__SECURE_PAYLOAD);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        const key = "MennaKhaledElhelbyMath2026";
        const keyLen = key.length;

        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i) ^ key.charCodeAt(i % keyLen);
        }

        // مسح الـ payload المشفر فوراً من ذاكرة الـ window
        window.__SECURE_PAYLOAD = null;

        const blob = new Blob([bytes], { type: "image/jpeg" });
        const blobUrl = URL.createObjectURL(blob);
        const img = new Image();

        img.onload = function () {
          const cw = canvas.width;
          const ch = canvas.height;
          ctx.drawImage(img, 0, 0, cw, ch);

          // إتلاف رابط الـ Blob المؤقت فوراً
          URL.revokeObjectURL(blobUrl);
        };

        img.src = blobUrl;
      } catch (err) {
        console.warn("Security engine initialized with fallback.");
      }
    }

    // 3. منع كليك يمين والسحب والإفلات والحفظ
    const preventAll = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    [frame, canvas, shield].forEach((el) => {
      if (el) {
        el.addEventListener("contextmenu", preventAll);
        el.addEventListener("dragstart", preventAll);
        el.addEventListener("selectstart", preventAll);
        el.addEventListener("copy", preventAll);
      }
    });

    // 4. الحماية الذكية من لقطات الشاشة (Anti-Screenshot Guard)
    // عند فتح أداة القص أو مغادرة التركيز عن الصفحة (window blur)
    window.addEventListener("blur", () => {
      frame.classList.add("is-guarded");
    });

    window.addEventListener("focus", () => {
      frame.classList.remove("is-guarded");
    });

    // عند الضغط على مفتاح تصوير الشاشة (PrintScreen)
    window.addEventListener("keyup", (e) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        frame.classList.add("is-guarded");
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText("").catch(() => {});
        }
        setTimeout(() => frame.classList.remove("is-guarded"), 2500);
      }
    });

    // حظر اختصارات حفظ الصفحة أو الطباعة أو أدوات المطور
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "p" || e.key === "u")) {
        e.preventDefault();
        frame.classList.add("is-guarded");
        setTimeout(() => frame.classList.remove("is-guarded"), 2000);
      }
    });
  }

  /* ========================================================
     تشغيل الموقع
     ======================================================== */
  function initSite() {
    initCursor();
    initBg3D();
    initLenis();
    initScrollProgress();
    initNav();
    initMethod();
    initAnimations();
    initSecurePortrait();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runLoader);
  } else {
    runLoader();
  }
})();
