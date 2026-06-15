export function getInitials(nombre: string, apellido: string): string {
  const n = nombre.trim()[0] ?? "";
  const a = apellido.trim()[0] ?? "";
  const iniciales = (n + a).toUpperCase();
  return iniciales || "?";
}
