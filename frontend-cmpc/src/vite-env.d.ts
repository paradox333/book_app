 
declare module '*.css';
declare module '*.png';
declare module '*.jpg';
declare module '*.svg';


interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_PORT: number;
  readonly VITE_DEFAULT_BOOK_IMAGE: string;

}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}