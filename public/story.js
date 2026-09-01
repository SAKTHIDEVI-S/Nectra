const profileButton = document.querySelector('#profileButton');
const profileMenu = document.querySelector('#profileMenu');

profileButton?.addEventListener('click', () => {
  const isOpen = !profileMenu.hidden;
  profileMenu.hidden = isOpen;
  profileButton.setAttribute('aria-expanded', String(!isOpen));
});

document.addEventListener('click', event => {
  if (!event.target.closest('.profile-wrap') && profileMenu) {
    profileMenu.hidden = true;
    profileButton?.setAttribute('aria-expanded', 'false');
  }
});

const storySections = [...document.querySelectorAll('.story-v4 .story-reveal')];
if ('IntersectionObserver' in window) {
  const storyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        storyObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  storySections.forEach(section => storyObserver.observe(section));
} else storySections.forEach(section => section.classList.add('is-visible'));
