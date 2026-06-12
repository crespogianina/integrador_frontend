import { API_BASE, apiFetch } from "../config/api";
import type { CloudinaryResponse } from "../models/Upload";

const UPLOADS = `${API_BASE}/uploads`;

const TIPOS_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_BYTES = 5 * 1024 * 1024;

export function publicIdFromUrl(url: string): string | null {
  if (!url.includes("res.cloudinary.com")) return null;

  const partes = url.split("/upload/");
  if (partes.length < 2) return null;

  let path = partes[1].replace(/^v\d+\//, "");
  const archivo = path.split("/").pop() ?? "";

  if (archivo.includes(".")) {
    path = path.replace(/\.[^/.]+$/, "");
  }

  return path || null;
}

function validarArchivo(file: File) {
  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    throw new Error("Formato no permitido. Use JPEG, PNG, WebP o GIF.");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("La imagen supera el tamaño máximo de 5 MB.");
  }
}

async function leerError(res: Response, mensaje: string) {
  const data = await res.json().catch(() => null);
  if (typeof data?.detail === "string") return data.detail;
  return mensaje;
}

export async function subirImagen(file: File): Promise<CloudinaryResponse> {
  validarArchivo(file);

  const form = new FormData();
  form.append("file", file);

  const res = await apiFetch(`${UPLOADS}/imagen`, {
    method: "POST",
    credentials: "include",
    body: form,
  });

  if (!res.ok) {
    throw new Error(await leerError(res, "Error al subir la imagen"));
  }

  return res.json();
}

export async function eliminarImagen(publicId: string) {
  const res = await apiFetch(
    `${UPLOADS}/imagen/${encodeURIComponent(publicId)}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!res.ok && res.status !== 204) {
    throw new Error(await leerError(res, "Error al eliminar la imagen"));
  }
}

export async function eliminarImagenPorUrl(url: string) {
  const publicId = publicIdFromUrl(url);
  if (!publicId) return;
  await eliminarImagen(publicId);
}
