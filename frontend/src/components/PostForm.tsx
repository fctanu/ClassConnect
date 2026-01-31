import React, { useEffect, useState } from 'react';
import { Button, Input } from './ui';
import { ImagePlus, Send, UploadCloud } from 'lucide-react';

interface PostFormProps {
  onCreate: (
    payload: FormData | { title: string; description?: string; images?: string[] }
  ) => Promise<void>;
}

export default function PostForm({ onCreate }: PostFormProps) {
  const MAX_FILES = 6;
  const MAX_FILE_SIZE = 3 * 1024 * 1024;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrls, setImageUrls] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');
  const [urlError, setUrlError] = useState('');
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function parseUrls(raw: string) {
    return raw
      .split(',')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);
  }

  function validateUrls(urls: string[]) {
    const invalid = urls.filter((url) => {
      try {
        new URL(url);
        return false;
      } catch {
        return true;
      }
    });
    if (invalid.length > 0) {
      setUrlError(`Invalid URL: ${invalid[0]}`);
      return false;
    }
    setUrlError('');
    return true;
  }

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    const tooLarge = selected.filter((file) => file.size > MAX_FILE_SIZE);
    const nonImage = selected.filter((file) => !file.type.startsWith('image/'));
    const limited = selected.slice(0, MAX_FILES);

    let message = '';
    if (nonImage.length > 0) {
      message = 'Only image files are allowed.';
    } else if (tooLarge.length > 0) {
      message = 'Each image must be 3MB or smaller.';
    } else if (selected.length > MAX_FILES) {
      message = `Maximum ${MAX_FILES} images allowed.`;
    }

    const valid = limited.filter(
      (file) => file.size <= MAX_FILE_SIZE && file.type.startsWith('image/'),
    );
    setFiles(valid);
    setFileError(message);
  }

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setFilePreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const urls = parseUrls(imageUrls);
    if (!validateUrls(urls)) return;
    if (fileError) return;
    if (urls.length + files.length > MAX_FILES) {
      setUrlError(`Maximum ${MAX_FILES} images total (URLs + uploads).`);
      return;
    }

    setLoading(true);
    try {
      if (files.length > 0) {
        const formData = new FormData();
        formData.append('title', title.trim());
        if (description.trim()) formData.append('description', description.trim());
        if (urls.length > 0) formData.append('imageUrls', urls.join(','));
        files.forEach((file) => formData.append('images', file));
        await onCreate(formData);
      } else {
        await onCreate({
          title: title.trim(),
          ...(description.trim() ? { description: description.trim() } : {}),
          ...(urls.length > 0 ? { images: urls } : {}),
        });
      }
      setTitle('');
      setDescription('');
      setImageUrls('');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-4 space-y-4">
      <Input
        label="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Share something with the community..."
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Write a short description..."
          className="input resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Image URLs
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <ImagePlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              placeholder="https://... , https://... (comma separated, up to 6)"
              className="input pl-9"
            />
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Paste image URLs separated by commas.
        </p>
        {urlError && (
          <p className="mt-1 text-xs text-red-600">{urlError}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Upload images (max 3MB each)
        </label>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <UploadCloud className="w-4 h-4" />
            <span>Select images</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
              className="hidden"
            />
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {files.length > 0 ? `${files.length} file(s) selected` : 'No files selected'}
          </span>
        </div>
        {fileError && (
          <p className="mt-1 text-xs text-red-600">{fileError}</p>
        )}
        {filePreviews.length > 0 && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filePreviews.map((previewUrl, index) => (
              <div
                key={`${previewUrl}-${index}`}
                className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
              >
                <img
                  src={previewUrl}
                  alt={`Selected upload ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading} disabled={!title.trim()}>
          Publish
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
