// src/generos/genero.model.ts
import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, Unique } from 'sequelize-typescript';

@Table({
  tableName: 'generos',
  schema: 'cmpc',  
  timestamps: false,
})
export class Genero extends Model<Genero> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    field: 'id',
  })
  id: number;

  @AllowNull(false)
  @Unique 
  @Column({
    type: DataType.STRING(100),
    field: 'nombre',
  })
  nombre: string;
}