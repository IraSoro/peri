export function getNormalizedProgress(value: number, maxLength: number) {
  return (value / maxLength) * 0.95;
}
