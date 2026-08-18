import React, { useRef, useState } from 'react';
import { UploadCloud, File, X, Check, AlertCircle, FileText, Image, Archive, Presentation, Table } from 'lucide-react';
import { formatFileSize } from '../../utils/formatters';

interface FileUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxSizeMB?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  files,
  onChange,
  maxSizeMB = 20,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const allowedExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'zip', 'rar', 'txt', 'png', 'jpg', 'jpeg'];

  const validateAndAddFiles = (newFiles: FileList | File[]) => {
    setErrorMessage(null);
    const valid: File[] = [];

    Array.from(newFiles).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const sizeMB = file.size / (1024 * 1024);

      if (!allowedExtensions.includes(ext)) {
        setErrorMessage(`File "${file.name}" type is not supported. Upload PDF, Word, PowerPoint, Excel, ZIP, RAR, or Images.`);
        return;
      }
      if (sizeMB > maxSizeMB) {
        setErrorMessage(`File "${file.name}" exceeds the maximum allowed size of ${maxSizeMB}MB.`);
        return;
      }
      valid.push(file);
    });

    if (valid.length > 0) {
      onChange([...files, ...valid]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return <FileText className="w-5 h-5 text-blue-600" />;
    if (['ppt', 'pptx'].includes(ext)) return <Presentation className="w-5 h-5 text-amber-600" />;
    if (['xls', 'xlsx'].includes(ext)) return <Table className="w-5 h-5 text-emerald-600" />;
    if (['png', 'jpg', 'jpeg'].includes(ext)) return <Image className="w-5 h-5 text-purple-600" />;
    if (['zip', 'rar'].includes(ext)) return <Archive className="w-5 h-5 text-indigo-600" />;
    return <File className="w-5 h-5 text-slate-600" />;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
            : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt,.png,.jpg,.jpeg"
          onChange={(e) => {
            if (e.target.files) validateAndAddFiles(e.target.files);
          }}
        />

        <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
          <UploadCloud className="w-6 h-6" />
        </div>

        <p className="text-sm font-semibold text-slate-900 mb-1">
          Click to upload <span className="font-normal text-slate-500">or drag and drop</span>
        </p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-2">
          Supporting PDF, Word, PowerPoint, Excel, ZIP, RAR, TXT, and Images (Max {maxSizeMB}MB)
        </p>

        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
          <span className="bg-slate-200/60 px-2 py-0.5 rounded-full">PDF</span>
          <span className="bg-slate-200/60 px-2 py-0.5 rounded-full">DOCX</span>
          <span className="bg-slate-200/60 px-2 py-0.5 rounded-full">PPTX</span>
          <span className="bg-slate-200/60 px-2 py-0.5 rounded-full">ZIP</span>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Attached Files ({files.length})
          </p>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 overflow-hidden bg-white">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-100 shrink-0">
                    {getFileIcon(file.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ready
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
