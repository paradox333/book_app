import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { BookService } from '../services/books.service';
import {GenreService} from '../services/genres.service'
import {AuthorService} from '../services/authors.service'
import {EditorialService} from '../services/editorials.service'
import {EntityService} from '../services/entity.service'

import { useAuth } from '../context/AuthContext';
import type { UpdateBook } from '../types/Book';

interface FilterOption {
  id: number;
  nombre: string;
}

interface LibroFormValues {
  titulo: string;
  autorName: string;
  generoName: string;
  editorialName: string;
  precio: number;
  disponible: boolean;
  imagenUrl?: string;
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
    mode: 'onTouched'
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
      if (!id || !autores.length || !generos.length || !editoriales.length) return;
      setLoading(true);
      try {
        const res = await BookService.getById(id, token);
        const libro = res;

        setValue('titulo', libro.titulo);
        setValue('precio', libro.precio);
        setValue('disponible', libro.disponible);
        setValue('autorName', autores.find(a => a.id === libro.autorId)?.nombre || '');
        setValue('generoName', generos.find(g => g.id === libro.generoId)?.nombre || '');
        setValue('editorialName', editoriales.find(e => e.id === libro.editorialId)?.nombre || '');
        setImagePreview(libro.imagenUrl || null);
      } catch (err: any) {
        setError('Error al cargar libro para edición');
        if (err.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    loadLibro();
  }, [id, autores, generos, editoriales, token, logout, setValue]);

  const onSubmit = async (data: LibroFormValues) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const autorId = await findOrCreateEntity('autores', data.autorName, autores);
    const generoId = await findOrCreateEntity('generos', data.generoName, generos);
    const editorialId = await findOrCreateEntity('editoriales', data.editorialName, editoriales);
    if (!autorId || !generoId || !editorialId) return setLoading(false);

    try {
      if (id) {
        console.log(data.titulo, String(autorId), String(generoId),String(editorialId),String(data.precio))
        
        const bodyUpdate: UpdateBook = {
          titulo: data.titulo,
          autorId: autorId,
          generoId: generoId,
          editorialId: editorialId,
          precio: data.precio,
          disponible: data.disponible,
          imagenUrl: selectedImage
        }
        
        await BookService.update(id, bodyUpdate, token);
        setSuccessMessage('Libro actualizado correctamente.');
      } else {
        await BookService.create({
          titulo: data.titulo,
          autorId,
          generoId,
          editorialId,
          precio: data.precio,
          disponible: data.disponible,
          imagenUrl: data.imagenUrl,
        }, token);
        setSuccessMessage('Libro creado correctamente.');
      }
      navigate('/books');
    } catch (err: any) {
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
    handleImageSelect
  };
};
