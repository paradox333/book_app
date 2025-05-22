// src/autores/dto/create-author.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAutorDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
