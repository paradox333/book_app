import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
 
import type { Book, LibroResponse } from '../../types/Book'; // Asegúrate de que esta ruta sea correcta
import ImageUpload from './ImageUpload'; // Componente para cargar imagen
import { type SubmitHandler, useForm } from 'react-hook-form';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

 
interface LibroFormValues {
  id?: string; // Solo para edición
  titulo: string;
  autorName: string;   // Usuario ingresa el nombre
  generoName: string;  // Usuario ingresa el nombre
  editorialName: string; // Usuario ingresa el nombre
  precio: number;
  disponible: boolean;
  imagenUrl?: string; // Para previsualización de imagen existente
}

 
interface FilterOption {
  id: number;
  nombre: string;
}

const LibroForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

 
  const [generosExistentes, setGenerosExistentes] = useState<FilterOption[]>([]);
  const [autoresExistentes, setAutoresExistentes] = useState<FilterOption[]>([]);
  const [editorialesExistentes, setEditorialesExistentes] = useState<FilterOption[]>([]);

 
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LibroFormValues>();

 
  const findOrCreateEntity = useCallback(async (
    entityType: 'autores' | 'generos' | 'editoriales', // El nombre del endpoint
    entityName: string,
    existingOptions: FilterOption[],
  ): Promise<number | null> => {
    if (!entityName || entityName.trim() === '') {
      setError(`El nombre del ${entityType.slice(0, -1)} es requerido.`);
      return null;
    }

    const trimmedName = entityName.trim();
 
    const existing = existingOptions.find(opt => opt.nombre.toLowerCase() === trimmedName.toLowerCase());
    if (existing) {
      return existing.id; // Entidad ya existe, devolver su ID
    }

 
    try {
      const createRes = await axios.post<{ id: number; nombre: string }>(
        `${API_BASE_URL}/${entityType}`,
        { nombre: trimmedName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
 
      return createRes.data.id;
    } catch (err: any) {
 
      console.error(`Error al crear ${entityType.slice(0, -1)} '${trimmedName}':`, err.response?.data || err.message);
      setError(`Error al crear ${entityType.slice(0, -1)} '${trimmedName}'. Puede que ya exista o haya un problema con el servidor.`);
      return null;
    }
  }, [token]); // Dependencia del token

 
  useEffect(() => {
    const fetchAllOptions = async () => {
      if (!token) {
        setError('No autenticado. Por favor, inicie sesión.');
        return;
      }
      try {
        const [generosRes, autoresRes, editorialesRes] = await Promise.all([
          axios.get<any>(`${API_BASE_URL}/generos`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get<any>(`${API_BASE_URL}/autores`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get<any>(`${API_BASE_URL}/editoriales`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

 
 
 
        setGenerosExistentes(generosRes.data.data || generosRes.data || []);
        setAutoresExistentes(autoresRes.data.data || autoresRes.data || []);
        setEditorialesExistentes(editorialesRes.data.data || editorialesRes.data || []);

      } catch (err: any) {
        console.error('Error al cargar listas de entidades:', err.response?.data || err.message);
        setError('Error al cargar las listas de autores, géneros y editoriales. Asegúrese de que los endpoints estén funcionando.');
        if (err.response && err.response.status === 401) logout();
      }
    };
    fetchAllOptions();
  }, [token, logout]); // Dependencias para re-cargar si el token cambia o si deslogueamos

 
 
 
  useEffect(() => {
    if (id && autoresExistentes.length > 0 && generosExistentes.length > 0 && editorialesExistentes.length > 0) {
      const fetchLibroParaEdicion = async () => {
        setLoading(true);
        setError(null);
        try {
 
 
          const response = await axios.get<LibroResponse>(`${API_BASE_URL}/libros/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const libroData = response.data;

 
          setValue('titulo', libroData.titulo);
          setValue('precio', libroData.precio);
          setValue('disponible', libroData.disponible);
          setImagePreview(libroData.imagenUrl || null);

 
 
 
 
 
          const autorNombre = autoresExistentes.find(a => a.id === libroData.autorId)?.nombre || '';
          const generoNombre = generosExistentes.find(g => g.id === libroData.generoId)?.nombre || '';
          const editorialNombre = editorialesExistentes.find(e => e.id === libroData.editorialId)?.nombre || '';
          
          setValue('autorName', autorNombre);
          setValue('generoName', generoNombre);
          setValue('editorialName', editorialNombre);

        } catch (err: any) {
          console.error('Error al cargar libro para edición:', err.response?.data || err.message);
          setError('No se pudo cargar el libro para edición. Verifique la ID o la conexión.');
          if (err.response && err.response.status === 401) logout();
        } finally {
          setLoading(false);
        }
      };
      fetchLibroParaEdicion();
    }
  }, [
    id,
    token,
    logout,
    setValue,
    autoresExistentes, // Depende de que las opciones estén cargadas
    generosExistentes,
    editorialesExistentes,
  ]);

  const onSubmit: SubmitHandler<LibroFormValues> = async (data) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

 
    const autorId = await findOrCreateEntity('autores', data.autorName, autoresExistentes);
    if (autorId === null) { setLoading(false); return; } // Si hubo un error o no se encontró/creó

    const generoId = await findOrCreateEntity('generos', data.generoName, generosExistentes);
    if (generoId === null) { setLoading(false); return; }

    const editorialId = await findOrCreateEntity('editoriales', data.editorialName, editorialesExistentes);
    if (editorialId === null) { setLoading(false); return; }

 
    const formData = new FormData();
    formData.append('titulo', data.titulo);
    formData.append('autorId', String(autorId)); // Enviar el ID obtenido/creado
    formData.append('generoId', String(generoId)); // Enviar el ID obtenido/creado
    formData.append('editorialId', String(editorialId)); // Enviar el ID obtenido/creado
    formData.append('precio', String(data.precio));
    formData.append('disponible', String(data.disponible));

     const bookPayload = {
        titulo: data.titulo,
        autorId: autorId,
        generoId: generoId,
        editorialId: editorialId,
        precio: data.precio, // Send as number
        disponible: data.disponible,
        imagenUrl: data.imagenUrl, // Only if applicable and if not sending file
    };

    if (selectedImage) {
      formData.append('image', selectedImage); // 'image' debe coincidir con el campo que espera tu backend para la imagen
    }
 
 
 
 
 
 

 
    try {
      if (id) {
 
        await axios.put(`${API_BASE_URL}/libros/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Importante para enviar archivos
            'Authorization': `Bearer ${token}`,
          },
        });
        setSuccessMessage('Libro actualizado exitosamente.');
      } else {
 
        await axios.post(`${API_BASE_URL}/libros`, bookPayload, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setSuccessMessage('Libro creado exitosamente.');
 
 
 
      }
      navigate('/books'); // Redirigir a la lista después de la operación
    } catch (err: any) {
      console.error('Error al guardar libro:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error al guardar libro.');
      if (err.response && err.response.status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (file: File | null, previewUrl: string | null) => {
    setSelectedImage(file);
    setImagePreview(previewUrl);
  };

 
  if (!token) return <p className="error-message">Debes iniciar sesión para gestionar libros.</p>;

 
  const isLoadingInitialData = (id && !autoresExistentes.length) || loading;

  if (isLoadingInitialData) return <p>Cargando datos del formulario...</p>;
  if (error) return <p className="error-message" style={{ color: 'red' }}>{error}</p>; // Mostrar error general
 
  if (successMessage) return <p className="success-message" style={{ color: 'green' }}>{successMessage}</p>;


  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2>{id ? 'Editar Libro' : 'Nuevo Libro'}</h2>
      {loading && <p>Guardando...</p>} {/* Mensaje de guardado durante onSubmit */}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="titulo" style={{ display: 'block', marginBottom: '5px' }}>Título:</label>
          <input
            type="text"
            id="titulo"
            {...register('titulo', { required: 'El título es requerido' })}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          {errors.titulo && <p className="error-message" style={{ color: 'red', fontSize: '0.9em' }}>{errors.titulo.message}</p>}
        </div>

        {/* Campos de texto para Autor, Género, Editorial */}
        <div>
          <label htmlFor="autorName" style={{ display: 'block', marginBottom: '5px' }}>Autor:</label>
          <input
            type="text"
            id="autorName"
            {...register('autorName', { required: 'El autor es requerido' })}
            list="autores-existentes" // Para sugerencias
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <datalist id="autores-existentes">
            {autoresExistentes.map(autor => (
              <option key={autor.id} value={autor.nombre} />
            ))}
          </datalist>
          {errors.autorName && <p className="error-message" style={{ color: 'red', fontSize: '0.9em' }}>{errors.autorName.message}</p>}
        </div>

        <div>
          <label htmlFor="generoName" style={{ display: 'block', marginBottom: '5px' }}>Género:</label>
          <input
            type="text"
            id="generoName"
            {...register('generoName', { required: 'El género es requerido' })}
            list="generos-existentes" // Para sugerencias
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <datalist id="generos-existentes">
            {generosExistentes.map(genero => (
              <option key={genero.id} value={genero.nombre} />
            ))}
          </datalist>
          {errors.generoName && <p className="error-message" style={{ color: 'red', fontSize: '0.9em' }}>{errors.generoName.message}</p>}
        </div>

        <div>
          <label htmlFor="editorialName" style={{ display: 'block', marginBottom: '5px' }}>Editorial:</label>
          <input
            type="text"
            id="editorialName"
            {...register('editorialName', { required: 'La editorial es requerida' })}
            list="editoriales-existentes" // Para sugerencias
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <datalist id="editoriales-existentes">
            {editorialesExistentes.map(editorial => (
              <option key={editorial.id} value={editorial.nombre} />
            ))}
          </datalist>
          {errors.editorialName && <p className="error-message" style={{ color: 'red', fontSize: '0.9em' }}>{errors.editorialName.message}</p>}
        </div>

        <div>
          <label htmlFor="precio" style={{ display: 'block', marginBottom: '5px' }}>Precio:</label>
          <input
            type="number"
            id="precio"
            step="0.01" // Para permitir decimales
            {...register('precio', { required: 'El precio es requerido', valueAsNumber: true, min: 0 })}
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

        {/* Componente de carga de imagen */}
        <ImageUpload
          onImageSelect={handleImageSelect}
          initialImagePreview={imagePreview}
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