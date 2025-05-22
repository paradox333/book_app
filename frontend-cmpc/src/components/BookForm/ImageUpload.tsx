// src/components/BookForm/ImageUpload.tsx
import React, { useState, useEffect } from 'react';

interface ImageUploadProps {
  onImageSelect: (file: File | null, previewUrl: string | null) => void;
  initialImagePreview?: string | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, initialImagePreview }) => {
  const [preview, setPreview] = useState<string | null>(initialImagePreview || null);

  // Actualiza la previsualización si initialImagePreview cambia (ej. al cargar libro para edición)
  useEffect(() => {
    setPreview(initialImagePreview || null);
  }, [initialImagePreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        onImageSelect(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      onImageSelect(null, null);
    }
  };

  const handleClearImage = () => {
    setPreview(null);
    onImageSelect(null, null);
    // Limpiar el input file si es posible, aunque es difícil en React
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div style={{ marginBottom: '20px', border: '1px dashed #ccc', padding: '15px', borderRadius: '8px' }}>
      <label htmlFor="imageUpload" style={{ marginBottom: '10px' }}>Imagen del Libro:</label>
      <input
        type="file"
        id="imageUpload"
        accept="image/*" // Solo acepta archivos de imagen
        onChange={handleFileChange}
        style={{ display: 'block', marginBottom: '10px' }}
      />
      {preview && (
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <img src={preview} alt="Vista previa de la imagen" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} />
          <button type="button" onClick={handleClearImage} style={{ marginTop: '10px', backgroundColor: '#dc3545' }}>
            Eliminar Imagen
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;