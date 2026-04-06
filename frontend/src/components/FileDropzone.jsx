import { useRef, useState } from 'react';
import { Upload, X, FileVideo, FileAudio } from 'lucide-react';

const iconMap = {
  video: FileVideo,
  audio: FileAudio,
};

export default function FileDropzone({ label = 'Upload file', accept = '*', type = 'video', onFile }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const Icon = iconMap[type] || Upload;

  const handleFile = (f) => {
    setFile(f);
    onFile?.(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleRemove = () => {
    setFile(null);
    onFile?.(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className={`glass-card transition-all duration-200 ${
        isDragging ? 'border-primary-500/50 bg-primary-500/5' : ''
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {file ? (
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-primary-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-surface-200 truncate">{file.name}</p>
              <p className="text-xs text-surface-500">{formatSize(file.size)}</p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-1.5 rounded-lg text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-3 p-8 text-center cursor-pointer hover:bg-surface-800/30 transition-all rounded-2xl"
        >
          <div className="w-12 h-12 rounded-2xl bg-surface-800/60 flex items-center justify-center">
            <Upload className="w-5 h-5 text-surface-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-surface-300">{label}</p>
            <p className="text-xs text-surface-500 mt-1">Drag & drop or click to browse</p>
          </div>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </div>
  );
}
