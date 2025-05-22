// src/autores/entities/author.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  DeletedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'autores',
  paranoid: true, 
  timestamps: true,
  createdAt: false, 
  updatedAt: false,
})
export class Autor extends Model<Autor> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  nombre: string;

  @DeletedAt
  @Column({ field: 'deletedat', type: DataType.DATE })
  deletedAt: Date | null;
}
