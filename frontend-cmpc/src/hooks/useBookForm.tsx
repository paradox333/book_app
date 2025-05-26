import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { BookService } from '../services/books.service';
import {GenreService} from '../services/genres.service'
import {AuthorService} from '../services/authors.service'
import {EditorialService} from '../services/editorials.service'
import {EntityService} from '../services/entity.service'

import { useAuth } from '../context/AuthContext';
import type { BookCompletePayload, UpdateBook } from '../types/Book';
import type { LibroFormValues } from '../components/BookForm/BookFormFields';

interface FilterOption {
  id: number;
  nombre: string;
}



export const useLibroForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [autores, setAutores] = useState<FilterOption[]>([]);
  const [generos, setGeneros] = useState<FilterOption[]>([]);
  const [editoriales, setEditoriales] = useState<FilterOption[]>([]);

  const form = useForm<LibroFormValues>({
    mode: 'onTouched',
    defaultValues: {
      titulo: '',
      precio: 0,
      disponible: true,
      autor: '',
      genero: '',
      editorial: '',
      imagen: undefined, // Valor por defecto para la imagen
    }
  });
  const { register, handleSubmit, setValue, formState: { errors } } = form;

  
  const findOrCreateEntity = useCallback(async (
    entityType: 'autores' | 'generos' | 'editoriales',
    nombre: string,
    existingOptions: FilterOption[],
  ): Promise<number | null> => {

    if (!nombre.trim()) {
      setError(`El nombre del ${entityType} es requerido.`);
      return null;
    }

    const existing = existingOptions.find(opt => opt.nombre.toLowerCase() === nombre.trim().toLowerCase());
    if (existing) return existing.id;

    try {
      return await EntityService.create(nombre.trim(), token, entityType);
    } catch (err: any) {
      setError(`Error creando ${entityType}: ${err.message}`);
      return null;
    }
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [generosRes, autoresRes, editorialesRes] = await Promise.all([
          GenreService.getAll(token),
          AuthorService.getAll(token),
          EditorialService.getAll(token),
        ]);

        setGeneros(generosRes.data.data || []);
        setAutores(autoresRes.data.data || []);
        setEditoriales(editorialesRes.data.data || []);
      } catch (err: any) {
        setError('Error al cargar datos iniciales');
        if (err.response?.status === 401) logout();
      }
    };
    fetchData();
  }, [token, logout]);

 
  useEffect(() => {
    const loadLibro = async () => {
      if (!id || !token || autores.length === 0 || generos.length === 0 || editoriales.length === 0) return;
      setLoading(true);
      try {
        const libro = await BookService.getById(id, token); // Asume que librosApi.getById devuelve el objeto libro

        // Setea los valores del formulario usando setValue
        setValue('titulo', libro.titulo);
        setValue('precio', libro.precio);
        setValue('disponible', libro.disponible);
        setValue('autor', autores.find(a => a.id === libro.autorId)?.nombre || '');
        setValue('genero', generos.find(g => g.id === libro.generoId)?.nombre || '');
        setValue('editorial', editoriales.find(e => e.id === libro.editorialId)?.nombre || '');

        console.log(libro.imagenUrl)
        const frontendHost = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
        // Previsualiza la imagen existente (sin setear el File en RHF, solo la URL)
        const API_DEFAULT_BOOK_IMAGE = import.meta.env.VITE_DEFAULT_BOOK_IMAGE;

        (libro.imagenUrl) ? setImagePreview(libro.imagenUrl) : setImagePreview(`${frontendHost}${API_DEFAULT_BOOK_IMAGE}`);
        
        // IMPORTANTE: NO uses setValue('imagen', ...) aquí con el File del libro existente
        // porque no tienes el objeto File real, solo su URL.
        // El campo 'imagen' en RHF solo se llenará si el usuario selecciona un nuevo archivo.

      } catch (err: any) {
        setError('Error al cargar libro para edición.');
        if (err.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    loadLibro();
  }, [id, autores, generos, editoriales, token, logout, setValue]);

  const onSubmit = async (data: LibroFormValues) => {
    console.log("DATA: ",data)
  setLoading(true);
  setError(null);
  setSuccessMessage(null);

  // Asegúrate de que `token` esté disponible aquí.
  if (!token) {
    setError('No estás autenticado. Por favor, inicia sesión.');
    setLoading(false);
    return;
  }

  
  try {
    // Paso 2: Crear el objeto FormData para enviar al backend
    const body: BookCompletePayload = {
      titulo: data.titulo,
      autor: String(data.autor),
      editorial: String(data.editorial),
      genero: String(data.genero),
      precio: String(data.precio),
      disponible: String(data.disponible),
      imagen: data.imagen
    }

    // Paso 3: Adjuntar la imagen si existe
    // 'data.imagen' es un FileList de react-hook-form
    if (data.imagen && data.imagen.size > 0 && data.imagen instanceof File) {
      body.imagen = data.imagen
    }
   
    if (id) {

      const autorId = await findOrCreateEntity('autores', data.autor, autores);
      const generoId = await findOrCreateEntity('generos', data.genero, generos);
      const editorialId = await findOrCreateEntity('editoriales', data.editorial, editoriales);

      if (!autorId || !generoId || !editorialId) {
        setLoading(false);
        return; // Ya se habrá establecido un error en findOrCreateEntity
      }

      const bodyUpdate = {
        titulo: data.titulo,
        autorId: autorId,
        generoId: generoId,
        editorialId: editorialId,
        precio: data.precio,
        disponible: data.disponible,
      };
      await BookService.update(id, bodyUpdate, token); 

      setSuccessMessage('Libro actualizado correctamente.');

    } else {
      
      await BookService.createComplete(body, token);
      setSuccessMessage('Libro creado correctamente.');
    }
    navigate('/books'); // Redirige después de la operación
  } catch (err: any) {
    console.error('Error al guardar libro:', err);
    setError(err.response?.data?.message || 'Error al guardar libro.');
    if (err.response?.status === 401) logout();
  } finally {
    setLoading(false);
  }
};


  const handleImageSelect = (file: File | null, previewUrl: string | null) => {
    setSelectedImage(file);
    setImagePreview(previewUrl);
  };
  return {
    token,
    form,
    generos,
    autores,
    editoriales,
    id,
    register,
    handleSubmit,
    errors,
    onSubmit,
    selectedImage,
    setSelectedImage,
    imagePreview,
    setImagePreview,
    loading,
    error,
    successMessage,
    isEditMode: Boolean(id),
    handleImageSelect,
    setValue
  };
};
