export function peak(samples: Float32Array): number {
  let top = 0;
  for (let sample of samples) {
    top = Math.max(top, Math.abs(sample));
  }
  return top;
}
