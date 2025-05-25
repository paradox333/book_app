import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  DeletedAt,
  Index
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

  @Index
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  nombre: string;

  @DeletedAt
  @Column({ field: 'deletedat', type: DataType.DATE })
  deletedAt: Date | null;
}
