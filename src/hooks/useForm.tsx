import { useState } from "react";

export function useForm<T>(initialValues: T) {
  const [form, setForm] = useState<T>(initialValues);
  const [errores, setErrores] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const target = event.target;
    const { name, value, type } = target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (target as HTMLInputElement).checked
          : type === "number"
            ? value === ""
              ? ""
              : Number(value)
            : value,
    }));

    setErrores((prev) => ({ ...prev, [name]: undefined }));
  };

  const resetForm = () => {
    setForm(initialValues);
    setErrores({});
  };

  return { form, setForm, handleChange, errores, setErrores, resetForm };
}
