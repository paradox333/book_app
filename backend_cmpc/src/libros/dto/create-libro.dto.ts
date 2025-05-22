import {
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateLibroDto {
  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsNotEmpty()
  @IsNumber()
  autorId: number;

  @IsNotEmpty()
  @IsNumber()
  editorialId: number;

  @IsNotEmpty()
  @IsNumber()
  generoId: number;

  @IsNotEmpty()
  @IsNumber()
  precio: number;

  @IsOptional()
  @IsBoolean()
  disponible?: boolean;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'imagenUrl debe ser una URL válida' })
  imagenUrl?: string;
}
