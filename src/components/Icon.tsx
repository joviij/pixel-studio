export type IconName =
  | 'brush'
  | 'eraser'
  | 'fill'
  | 'eyedropper'
  | 'undo'
  | 'redo'
  | 'save'
  | 'export'
  | 'zoom-in'
  | 'zoom-out'
  | 'eye'
  | 'eye-off'
  | 'lock'
  | 'new'
  | 'open'
  | 'fit'
  | 'more'
  | 'add'
  | 'swap'
  | 'edit';

type Props = {
  name: IconName;
  size?: number;
  className?: string;
};

const iconRegistry = import.meta.glob('../assets/icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

function getIconMarkup(name: IconName): string {
  const key = `../assets/icons/${name}.svg`;
  return iconRegistry[key] ?? '';
}

export function Icon({ name, size = 20, className }: Props) {
  const markup = getIconMarkup(name);

  return (
    <span
      className={className}
      style={{ width: size, height: size, display: 'inline-flex' }}
      dangerouslySetInnerHTML={{ __html: markup }}
      aria-hidden="true"
    />
  );
}
