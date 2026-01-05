document.querySelectorAll('.gravatar-hovercard').forEach(card => {
  const max = 8;

  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty(
      '--rx',
      ((e.clientX - r.left - r.width / 2) / r.width) * max * 2 + 'deg'
    );
    card.style.setProperty(
      '--ry',
      (-(e.clientY - r.top - r.height / 2) / r.height) * max * 2 + 'deg'
    );
  });

  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  });
});
