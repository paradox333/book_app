import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  Default,
  CreatedAt,
  DeletedAt,
} from 'sequelize-typescript';
import { Autor } from 'src/autores/model/autores.model';
import { Editorial } from 'src/editoriales/model/editorial.model';
import { Genero } from 'src/generos/model/genero.model';

@Table({
  tableName: 'libros',
  paranoid: true, 
  timestamps: true,
  createdAt: false, 
  updatedAt: false,
})
export class Libro extends Model<Libro> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  titulo: string;

  @ForeignKey(() => Autor)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'autor_id',
  })
  autorId: number;

  @ForeignKey(() => Editorial)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'editorial_id',
  })
  editorialId: number;

  @ForeignKey(() => Genero)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'genero_id',
  })
  generoId: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  precio: number;

  @Default(true)
  @Column(DataType.BOOLEAN)
  disponible: boolean;

  @Column({field: 'imagen_url', type: DataType.TEXT})
  imagenUrl: string;

  @DeletedAt
  @Column({ field: 'deletedat', type: DataType.DATE })
  deletedAt: Date | null;

  @BelongsTo(() => Autor)
  autor: Autor;

  @BelongsTo(() => Editorial)
  editorial: Editorial;

  @BelongsTo(() => Genero)
  genero: Genero;
}
