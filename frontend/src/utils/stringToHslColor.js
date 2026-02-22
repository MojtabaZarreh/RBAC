function stringToHslColor(str, saturation = 60, lightness = 50) {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export default stringToHslColor;