// src/usuarios/dto/create-usuario.dto.ts
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string; // se convertirá en hash luego

  @IsNotEmpty()
  nombre: string;
}
