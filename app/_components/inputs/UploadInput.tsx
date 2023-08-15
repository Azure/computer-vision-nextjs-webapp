'use client';

import { useToast } from '@/_hooks/useToast';
import { ArrowUpTrayIcon, PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { useState } from 'react';
import { Spinner } from '../Spinner';

const BG_COLOR_RESTING = 'bg-base-100';
const BG_COLOR_HOVER = 'bg-gray-300';

type Props = {
  file?: File;
  onChangeFile?: ((file?: File) => void) | ((file?: File) => Promise<void>);
  className?: string;
  isLoading?: boolean;
};

export const UploadInput = ({ file, onChangeFile, className, isLoading }: Props) => {
  const showToast = useToast();
  const [bgColor, setBgColor] = useState<string>(BG_COLOR_RESTING);

  const handleSetImageFile = (imageFile?: File) => {
    if (!imageFile || !imageFile?.type?.includes('image')) {
      showToast({
        text: 'Please upload a valid video file',
      });
      onChangeFile?.(undefined);
    } else {
      onChangeFile?.(imageFile);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.stopPropagation();
    e.preventDefault();

    setBgColor(BG_COLOR_RESTING);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.stopPropagation();
    e.preventDefault();

    setBgColor(BG_COLOR_HOVER);
  };

  const handleDropFile = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();

    handleSetImageFile(e.dataTransfer.files?.[0]);
    setBgColor(BG_COLOR_RESTING);
  };

  return (
    <>
      <label
        htmlFor="file-upload"
        className={classNames(
          'm-0 h-96 w-full rounded-md border-2 border-dashed border-gray-400 transition-all duration-100 ease-in-out',
          bgColor,
          className,
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropFile}
      >
        <div className="flex h-96 w-full flex-col items-center justify-center gap-4 border-dashed">
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <PhotoIcon height={100} className="text-gray-400" />
              <div className="text-center text-lg font-light">Drag to upload an image</div>
              <div className="text-center text-lg font-light">------- OR -------</div>
              <div className="btn-neutral btn mb-4">
                <ArrowUpTrayIcon height={20} />
                <p className="text-sm">Choose a file</p>
              </div>
            </>
          )}
        </div>
      </label>
      <input
        type="file"
        id="file-upload"
        accept="image/*"
        onChange={e => handleSetImageFile(e.target.files?.[0])}
        className="hidden"
      />
    </>
  );
};
