// src/autores/dto/update-author.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateAutorDto } from './create-autor.dto';

export class UpdateAutorDto extends PartialType(CreateAutorDto) {}
