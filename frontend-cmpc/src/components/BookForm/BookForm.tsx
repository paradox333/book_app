// src/components/LibroForm.tsx
import React from 'react';
import { useLibroForm } from '../../hooks/useBookForm';
import { BookFormFields } from './BookFormFields'; // Importa el componente de campos

const LibroForm: React.FC = () => {
  const {
    form: { register, handleSubmit, formState: { errors } },
    onSubmit,
    imagePreview,
    loading,
    error,
    successMessage,
    id,
    token,
    autores,
    isEditMode, // <-- Asegúrate de desestructurar isEditMode
    generos,
    editoriales,
    handleImageSelect
  } = useLibroForm();

  // Mensajes de carga/error/éxito (fuera del formulario principal)
  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (successMessage) return <p style={{ color: 'green' }}>{successMessage}</p>;

  // Mensaje si no hay token (no autenticado)
  if (!token) return <p className="error-message">Debes iniciar sesión para gestionar libros.</p>;

  // Mensaje de carga de datos iniciales (para edición)
  const isLoadingInitialData = (id && !autores.length) || loading;
  if (isLoadingInitialData) return <p>Cargando datos del formulario...</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2>{id ? 'Editar Libro' : 'Nuevo Libro'}</h2>
      {loading && <p>Guardando...</p>} {/* Mensaje de guardado durante onSubmit */}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Aquí es donde renderizamos el componente de campos */}
        <BookFormFields
          register={register}
          errors={errors}
          autores={autores}
          generos={generos}
          editoriales={editoriales}
          imagePreview={imagePreview}
          onImageSelect={handleImageSelect}
          isEditMode={isEditMode} // <-- ¡Pasamos isEditMode a los campos!
        />

        <button type="submit" disabled={loading}
                style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1em', marginTop: '10px' }}>
          {loading ? 'Guardando...' : (id ? 'Guardar Cambios' : 'Crear Libro')}
        </button>
      </form>
    </div>
  );
};

export default LibroForm;