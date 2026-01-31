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
  const [isFocused, setIsFocused] = useState(false);

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
      // Reset form
      setTitle('');
      setDescription('');
      setImageUrls('');
      setFiles([]);
      setIsFocused(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className={`relative rounded-2xl border transition-all duration-300 p-6 space-y-5 bg-card ${isFocused ? 'ring-2 ring-primary/20 border-primary/50 shadow-lg' : 'border-border shadow-sm'
        }`}
      onFocus={() => setIsFocused(true)}
    >
      <div className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's on your mind?"
          required
          className="text-lg font-medium border-0 px-0 rounded-none border-b border-border/50 focus:border-primary focus:ring-0 bg-transparent transition-colors"
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5 sr-only">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Tell us more about it..."
            className="w-full bg-transparent border-0 resize-none focus:ring-0 p-0 text-muted-foreground placeholder:text-muted-foreground/50 leading-relaxed"
          />
        </div>
      </div>

      {(isFocused || title || description || files.length > 0) && (
        <div className="animate-in pt-4 border-t border-border/50 space-y-4">
          {/* Image Input Section */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image URLs</label>
              <div className="relative">
                <ImagePlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={imageUrls}
                  onChange={(e) => setImageUrls(e.target.value)}
                  placeholder="https://..."
                  className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 pl-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              {urlError && <p className="text-xs text-destructive">{urlError}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upload</label>
              <div className="flex items-center gap-3">
                <label className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors text-sm text-muted-foreground hover:text-primary">
                  <UploadCloud className="w-4 h-4" />
                  <span>Choose Files</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesChange}
                    className="hidden"
                  />
                </label>
              </div>
              {fileError && <p className="text-xs text-destructive">{fileError}</p>}
            </div>
          </div>

          {/* Previews */}
          {files.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {filePreviews.map((url, i) => (
                <div key={i} className="relative flex-none w-20 h-20 rounded-lg overflow-hidden border border-border">
                  <img src={url} className="w-full h-full object-cover" alt="Preview" />
                </div>
              ))}
              <div className="flex-none flex items-center justify-center w-20 h-20 rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                {files.length} selected
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-muted-foreground">
              {files.length > 0 || imageUrls ? 'Images added' : 'Add text or liquid ideas'}
            </span>
            <Button type="submit" loading={loading} disabled={!title.trim()} className="rounded-full px-6">
              Publish
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
