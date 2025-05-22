// src/generos/dto/create-genero.dto.ts
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateGeneroDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del género no puede estar vacío.' })
  @MaxLength(100, { message: 'El nombre del género no puede exceder los 100 caracteres.' })
  readonly nombre: string;
}