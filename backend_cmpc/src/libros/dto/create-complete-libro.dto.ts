// src/libros/dto/create-libro-entity.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsUrl, isString } from 'class-validator';

export class CreateCompleteLibroDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  autor: string;

  @IsString()
  @IsNotEmpty()
  genero: string;

  @IsString()
  @IsNotEmpty()
  editorial: string;

  @IsString()
  precio: string;

  @IsString()
  disponible: string;

  @IsOptional()
  @IsString() // O @IsUrl() si siempre es una URL
  imagenUrl?: string;
}