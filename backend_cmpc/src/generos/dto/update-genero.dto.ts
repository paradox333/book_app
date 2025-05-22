// src/generos/dto/update-genero.dto.ts
import { PartialType } from '@nestjs/mapped-types'; // O @nestjs/swagger si lo usas
import { CreateGeneroDto } from './create-genero.dto';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateGeneroDto extends PartialType(CreateGeneroDto) {
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'El nombre del género no puede exceder los 100 caracteres.' })
  readonly nombre?: string; // Ahora es opcional al actualizar
}