export function genPid() {
  return btoa(Math.random().toString(36).substring(2)).slice(0, 8);
}
