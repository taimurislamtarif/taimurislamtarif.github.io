  // ===== PRELOADER =====
  const preloader = document.getElementById('preloader');
  document.body.style.overflow = 'hidden';

  // ===== REMEMBER SCROLL POSITION =====
  let preloaderDone = false;
  const SCROLL_KEY = 'scrollY:' + location.pathname;

  function saveScroll(){
    if (!preloaderDone) return;   // don't overwrite the saved value while loading
    try { sessionStorage.setItem(SCROLL_KEY, String(window.scrollY)); } catch(e){}
  }
  window.addEventListener('scroll', saveScroll, { passive: true });
  window.addEventListener('pagehide', saveScroll);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveScroll();
  });

  // Restore instantly (bypass html { scroll-behavior: smooth })
  function restoreScroll(){
    // an explicit #hash in the URL wins over the saved position
    if (location.hash && document.querySelector(location.hash)) return;
    let y = 0;
    try { y = parseInt(sessionStorage.getItem(SCROLL_KEY), 10) || 0; } catch(e){}
    if (y > 0) window.scrollTo({ top: y, left: 0, behavior: 'instant' });
  }

  function hidePreloader(){
    if (preloaderDone) return;
    preloaderDone = true;
    document.body.style.overflow = '';
    restoreScroll();            // restore after scrolling is unlocked
    preloader.classList.add('loaded');
  }

  // Hide once everything (images, fonts, etc.) has loaded.
  window.addEventListener('load', () => {
    // small delay so the animation is visible even on fast connections
    setTimeout(hidePreloader, 500);
  });

  // Safety net in case 'load' never fires for some reason
  setTimeout(hidePreloader, 6000);

  const scrollBtn = document.getElementById('scrollTopBtn');
  window.addEventListener('scroll', () => {
    scrollBtn.classList.toggle('visible', window.scrollY > 200);
  });
  function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  scrollBtn.addEventListener('click', scrollToTop);

  const items = document.querySelectorAll('.fade-up,.fade-left,.fade-right');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting) entry.target.classList.add('show');
    });
  }, { threshold: 0.2 });
  items.forEach(i => observer.observe(i));

  const sideBar = document.querySelector('.sidebar');
const menuBtn = document.querySelector('.menu-icon');
const closeBtn = document.querySelector('.close-icon');

menuBtn.addEventListener('click', () => {
  sideBar.removeAttribute('style');
  sideBar.classList.remove('close-sidebar');
  sideBar.classList.add('open-sidebar');
});

closeBtn.addEventListener('click', () => {
  sideBar.classList.remove('open-sidebar');
  sideBar.classList.add('close-sidebar');
});

/* auto close when clicking a link (instant, no close animation) */
document.querySelectorAll('.sidebar a').forEach(link => {
  link.addEventListener('click', () => {
    sideBar.classList.remove('open-sidebar');
    sideBar.classList.remove('close-sidebar');
    sideBar.style.transition = 'none';
    sideBar.style.width = '0';
    sideBar.style.opacity = '0';
    sideBar.style.bottom = '70%';
    sideBar.style.borderRadius = '0 0 0 100%';
    requestAnimationFrame(() => {
      sideBar.style.transition = '';
    });
  });
});

const links = document.querySelectorAll('.links a');
const underline = document.querySelector('.nav-underline');
const sections = [...links].map(link =>
  document.getElementById(link.dataset.target)
).filter(Boolean);

let activeLink = links[0];

function setActive(link){
  if(!link) return;
  activeLink = link;
  links.forEach(l => l.classList.remove('active'));
  link.classList.add('active');

  const r = link.getBoundingClientRect();
  const pr = link.parentElement.getBoundingClientRect();
  underline.style.left = r.left - pr.left + 'px';
  underline.style.width = r.width + 'px';
}

/* click */
links.forEach(link=>{
  link.addEventListener('click',()=>{
    setActive(link);
  });
});

/* scroll spy (crash-proof, rAF-throttled) */
let ticking = false;
function updateActiveOnScroll(){
  let current = sections[0];

  sections.forEach(section=>{
    if(section && section.getBoundingClientRect().top <= 120){
      current = section;
    }
  });

  if(current){
    const link = document.querySelector(
      `.links a[data-target="${current.id}"]`
    );
    if(link) setActive(link);
  }
  ticking = false;
}

window.addEventListener('scroll',()=>{
  if(!ticking){
    requestAnimationFrame(updateActiveOnScroll);
    ticking = true;
  }
});

/* keep underline aligned with the active link on resize */
window.addEventListener('resize', () => setActive(activeLink));

/* init */
window.addEventListener('load',()=>{
  setActive(links[0]);
});

/* re-align underline once the webfont finishes loading (prevents drift) */
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => setActive(activeLink));
}
