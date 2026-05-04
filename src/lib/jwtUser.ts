import type { AuthUser, Rol } from "../types/auth";

function isRol(value: unknown): value is Rol {
  return value === "ADMIN" || value === "CONSULTA";
}

/** Lee claims del JWT (solo para UI; la autorización real la hace el backend). */
export function parseUserFromJwt(token: string): AuthUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const json = atob(padded);
    const payload = JSON.parse(json) as Record<string, unknown>;

    const idRaw = payload.user_id ?? payload.id ?? payload.sub;
    const id =
      typeof idRaw === "number"
        ? idRaw
        : typeof idRaw === "string"
          ? Number.parseInt(idRaw, 10)
          : NaN;
    if (!Number.isFinite(id)) return null;

    const username =
      typeof payload.username === "string"
        ? payload.username
        : typeof payload.sub === "string" && !Number.isFinite(Number(payload.sub))
          ? payload.sub
          : "";
    if (!username) return null;

    const rolRaw = payload.rol ?? payload.role;
    const rol = isRol(rolRaw) ? rolRaw : null;
    if (!rol) return null;

    return { id, username, rol };
  } catch {
    return null;
  }
}
