import { getInitials } from "../lib/userUtils";

type UserAvatarProps = {
  nombre: string;
  apellido: string;
  size?: "md" | "lg";
};

const sizeClasses = {
  md: "h-12 w-12 text-base",
  lg: "h-16 w-16 text-lg",
};

export default function UserAvatar({
  nombre,
  apellido,
  size = "lg",
}: UserAvatarProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-amber-600 font-semibold text-white ${sizeClasses[size]}`}
      aria-hidden
    >
      {getInitials(nombre, apellido)}
    </div>
  );
}
