// src/usuarios/entities/usuario.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Unique,
  DeletedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'usuarios',
  paranoid: true, 
  timestamps: true,
  createdAt: false, 
  updatedAt: false,
})
export class Usuario extends Model<Usuario> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Unique
  @Column(DataType.STRING)
  email: string;

  @Column({ field: 'password_hash', type: DataType.TEXT})
  passwordHash: string;

  @Column(DataType.STRING(100))
  nombre: string;

  @DeletedAt
  @Column({ field: 'deletedat', type: DataType.DATE })
  deletedAt: Date | null;
}
