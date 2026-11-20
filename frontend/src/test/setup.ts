import '@testing-library/jest-dom';

// Mock WebGL and ResizeObserver for jsdom test environment
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = MockResizeObserver;

// Mock HTMLCanvasElement.getContext for Three.js
HTMLCanvasElement.prototype.getContext = (() => {
  return {
    fillRect: () => {},
    clearRect: () => {},
    getImageData: () => ({ data: new Array(4) }),
    putImageData: () => {},
    createImageData: () => [],
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    transform: () => {},
    rect: () => {},
    clip: () => {},
  } as unknown as RenderingContext;
}) as unknown as typeof HTMLCanvasElement.prototype.getContext;

// Mock window.navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: () => Promise.resolve(),
  },
});
