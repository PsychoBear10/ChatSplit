
import React, { useState } from 'react';

interface ReceiptUploaderProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ onUpload, isLoading, error }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto p-4 md:p-8">
      <div className="w-full text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800">AI Bill Splitter</h1>
        <p className="mt-4 text-lg text-slate-600">
          Upload a receipt photo, and I'll help you split the bill. Just tell me who had what.
        </p>
      </div>
      <form
        className="mt-10 w-full"
        onDragEnter={handleDrag}
        onSubmit={(e) => e.preventDefault()}
      >
        <label
          htmlFor="dropzone-file"
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-10 h-10 mb-4 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-slate-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500">PNG, JPG, or WEBP</p>
          </div>
          <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleChange} />
        </label>
        {isLoading && (
          <div className="mt-4 text-center">
            <p className="text-indigo-600 animate-pulse">Analyzing receipt, please wait...</p>
          </div>
        )}
        {error && (
          <div className="mt-4 text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </form>
      {dragActive && <div className="absolute w-full h-full top-0 left-0" onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
    </div>
  );
};

export default ReceiptUploader;
