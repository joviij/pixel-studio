import { useEffect, useRef } from 'react';
import { renderDocumentToExportCanvas, type ProjectDocument } from '../pixel-grid';
import { Icon } from './Icon';

type PreviewPanelProps = {
  projectDocument: ProjectDocument;
};

const PREVIEW_SIZE = 144;

export function PreviewPanel({ projectDocument }: PreviewPanelProps) {
  const previewRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const source = renderDocumentToExportCanvas(projectDocument);
    ctx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(source, 0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
  }, [projectDocument]);

  return (
    <section className="panel" aria-label="Preview panel">
      <div className="panel-head-row">
        <h2 className="panel-title">Preview</h2>
        <button
          type="button"
          className="icon-button mini icon-only"
          disabled
          title="Preview settings placeholder"
        >
          <Icon name="more" size={14} className="ui-icon" />
        </button>
      </div>
      <div className="preview-stage">
        <canvas ref={previewRef} width={PREVIEW_SIZE} height={PREVIEW_SIZE} className="preview-canvas" />
      </div>
      <div className="preview-footer">
        <input type="range" min="1" max="32" value="16" disabled aria-label="Preview zoom" />
        <span>16x</span>
      </div>
    </section>
  );
}
