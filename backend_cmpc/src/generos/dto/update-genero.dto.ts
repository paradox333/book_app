import { PartialType } from '@nestjs/mapped-types';
import { CreateGeneroDto } from './create-genero.dto';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateGeneroDto extends PartialType(CreateGeneroDto) {
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'El nombre del género no puede exceder los 100 caracteres.' })
  readonly nombre?: string;
}