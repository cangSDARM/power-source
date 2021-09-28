export function narrow(num: number, limits: [number, number]) {
  if (num > limits[1]) {
    return limits[1];
  }

  if (num < limits[0]) {
    return limits[0];
  }

  return num;
}
