export type UsuarioPerfil = {
  id: number;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  celular: string | null;
  roles: string[];
};

export type UsuarioPerfilUpdate = {
  nombre: string;
  apellido: string;
  email: string;
  celular: string | null;
};
