import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAutorDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
