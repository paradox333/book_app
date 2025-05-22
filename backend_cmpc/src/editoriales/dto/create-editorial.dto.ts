import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateEditorialDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;
}
