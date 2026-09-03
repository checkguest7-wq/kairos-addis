import React, { useState } from 'react';

interface VehicleMediaProps {
  imageSrc?: string;
  videoSrc?: string;
  alt: string;
  className?: string;
  videoClassName?: string;
}

/** Shows the vehicle image when available; if it is missing/unavailable, falls back to the vehicle video. */
export function VehicleMedia({ imageSrc, videoSrc, alt, className, videoClassName }: VehicleMediaProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageSrc && !imageFailed) {
    return (
      <img
        src={imageSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
        className={className}
      />
    );
  }

  if (videoSrc) {
    return (
      <video
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        aria-label={alt}
        className={videoClassName || className}
      />
    );
  }

  return null;
}
