import { useRef, useState } from "react";
import { eliminarImagenPorUrl, subirImagen } from "../lib/upload";

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
};

export default function ImageUploader({
  value,
  onChange,
  multiple = false,
  maxFiles = 10,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  const limite = multiple ? maxFiles : 1;

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setError("");
    setSubiendo(true);

    try {
      const lista = Array.from(files);
      const restantes = limite - value.length;

      if (lista.length > restantes) {
        throw new Error(`Máximo ${limite} imagen${limite > 1 ? "es" : ""}.`);
      }

      const urls: string[] = [];

      for (const file of lista) {
        const respuesta = await subirImagen(file);
        urls.push(respuesta.secure_url);
      }

      onChange(multiple ? [...value, ...urls] : urls);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al subir la imagen",
      );
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const quitar = async (index: number) => {
    setError("");
    const url = value[index];

    try {
      await eliminarImagenPorUrl(url);
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : "Error al eliminar la imagen";

      if (!mensaje.toLowerCase().includes("no encontrada")) {
        setError(mensaje);
        return;
      }
    }

    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept="image/jpeg,image/png,image/webp,image/gif"
        disabled={subiendo || value.length >= limite}
        className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-600 hover:file:bg-blue-100 disabled:opacity-50"
        onChange={(e) => void handleChange(e)}
      />

      <p className="text-xs text-slate-500">
        JPEG, PNG, WebP o GIF. Máximo 5 MB.
      </p>

      {subiendo && <p className="text-sm text-blue-600">Subiendo...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative overflow-hidden rounded-xl border border-slate-200"
            >
              <img
                src={url}
                alt=""
                className="h-24 w-24 object-cover"
              />
              <button
                type="button"
                disabled={subiendo}
                onClick={() => void quitar(index)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white hover:bg-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
