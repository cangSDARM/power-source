export function isFireOnBindedTarget(e: Event) {
  return e.currentTarget === e.target;
}
