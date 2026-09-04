import React from 'react';

interface GoogleIconProps {
  name: string;
  className?: string;
  size?: number | string;
  fill?: boolean;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  title?: string;
}

export const GoogleIcon: React.FC<GoogleIconProps> = ({
  name,
  className = '',
  size = 18,
  fill = false,
  weight = 400,
  title,
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <span
      className={`material-symbols-outlined select-none inline-flex items-center justify-center shrink-0 align-middle ${className}`}
      style={{
        fontSize: pixelSize,
        width: pixelSize,
        height: pixelSize,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
      }}
      title={title}
      aria-hidden={!title}
    >
      {name}
    </span>
  );
};
