import React from 'react';
import ImageUpload from './ImageUpload';
import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import type { FilterOption } from '../../types/Book';

export interface LibroFormValues {
  titulo: string;
  autor: string;      // El nombre del autor (texto libre o escogido de la lista)
  genero: string;     // Igual para género
  editorial: string;  // Igual para editorial
  precio: number;
  disponible: boolean;
  imagen?: File | null
}

interface Props {
  register: UseFormRegister<LibroFormValues>;
  errors: FieldErrors<LibroFormValues>;
  autores: FilterOption[];
  generos: FilterOption[];
  editoriales: FilterOption[];
  imagePreview: string | null;
  onImageSelect: (file: File | null, previewUrl: string | null) => void;
  isEditMode: boolean,
  setValue: UseFormSetValue<LibroFormValues>;
}

export const BookFormFields: React.FC<Props> = ({
  register,
  errors,
  autores,
  generos,
  editoriales,
  imagePreview,
  onImageSelect,
  isEditMode,
  setValue
}) => {
  return (
    <>
      <div>
        <label htmlFor="titulo" style={{ display: 'block', marginBottom: '5px' }}>Título:</label>
        <input
          type="text"
          id="titulo"
          {...register('titulo', {
            required: !isEditMode ? 'El título es requerido' : false // <-- Lógica condicional
          })}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        {errors.titulo && <p className="error-message" style={{ color: 'red', fontSize: '0.9em' }}>{errors.titulo.message}</p>}
      </div>

      <div>
        <label htmlFor="autorName" style={{ display: 'block', marginBottom: '5px' }}>Autor:</label>
        <input
          type="text"
          id="autorName"
          {...register('autor', {
            required: !isEditMode ? 'El autor es requerido' : false // <-- Lógica condicional
          })}
          list="autores-existentes"
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <datalist id="autores-existentes">
          {autores.map(autor => (
            <option key={autor.id} value={autor.nombre} />
          ))}
        </datalist>
        {errors.autor && <p className="error-message" style={{ color: 'red', fontSize: '0.9em' }}>{errors.autor.message}</p>}
      </div>

      <div>
        <label htmlFor="generoName" style={{ display: 'block', marginBottom: '5px' }}>Género:</label>
        <input
          type="text"
          id="generoName"
          {...register('genero', {
            required: !isEditMode ? 'El género es requerido' : false // <-- Lógica condicional
          })}
          list="generos-existentes"
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <datalist id="generos-existentes">
          {generos.map(genero => (
            <option key={genero.id} value={genero.nombre} />
          ))}
        </datalist>
        {errors.genero && <p className="error-message" style={{ color: 'red', fontSize: '0.9em' }}>{errors.genero.message}</p>}
      </div>

      <div>
        <label htmlFor="editorialName" style={{ display: 'block', marginBottom: '5px' }}>Editorial:</label>
        <input
          type="text"
          id="editorialName"
          {...register('editorial', {
            required: !isEditMode ? 'La editorial es requerida' : false // <-- Lógica condicional
          })}
          list="editoriales-existentes"
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <datalist id="editoriales-existentes">
          {editoriales.map(editorial => (
            <option key={editorial.id} value={editorial.nombre} />
          ))}
        </datalist>
        {errors.editorial && <p className="error-message" style={{ color: 'red', fontSize: '0.9em' }}>{errors.editorial.message}</p>}
      </div>

      <div>
        <label htmlFor="precio" style={{ display: 'block', marginBottom: '5px' }}>Precio:</label>
        <input
          type="number"
          id="precio"
          step="0.01"
          {...register('precio', {
            required: !isEditMode ? 'El precio es requerido' : false, // <-- Lógica condicional
            valueAsNumber: true,
            min: 0
          })}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        {errors.precio && <p className="error-message" style={{ color: 'red', fontSize: '0.9em' }}>{errors.precio.message}</p>}
      </div>

      <div>
        <label htmlFor="disponible" style={{ display: 'block', marginBottom: '5px' }}>Disponible:</label>
        <input
          type="checkbox"
          id="disponible"
          {...register('disponible')}
          style={{ marginRight: '5px' }}
        />
      </div>

      <ImageUpload
        onImageSelect={(file, previewUrl) => {
          setValue('imagen', file, { shouldValidate: true }); // 
          onImageSelect(file, previewUrl);
        }}
        initialImagePreview={imagePreview}
      />
    </>
  );
};