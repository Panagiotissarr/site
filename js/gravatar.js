const card = document.querySelector('.gravatar-hovercard');

card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const maxTilt = parseFloat(
    getComputedStyle(card).getPropertyValue('--tilt-max')
  );

  const rotateX = ((x - centerX) / centerX) * maxTilt;
  const rotateY = -((y - centerY) / centerY) * maxTilt;

  card.style.setProperty('--x-rotation', rotateX + 'deg');
  card.style.setProperty('--y-rotation', rotateY + 'deg');
});

card.addEventListener('mouseleave', () => {
  card.style.setProperty('--x-rotation', '0deg');
  card.style.setProperty('--y-rotation', '0deg');
});
