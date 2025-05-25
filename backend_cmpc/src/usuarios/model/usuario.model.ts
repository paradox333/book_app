import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Unique,
  DeletedAt,
  Index,
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

  @Index
  @Unique
  @Column(DataType.STRING)
  email: string;

  @Column({ field: 'password_hash', type: DataType.TEXT})
  passwordHash: string;

  @Index
  @Column(DataType.STRING(100))
  nombre: string;

  @DeletedAt
  @Column({ field: 'deletedat', type: DataType.DATE })
  deletedAt: Date | null;
}
