import { useMemo, useState } from 'react';
import type { Layer } from '../pixel-grid';
import { Icon } from './Icon';

type LayersPanelProps = {
  layers: Layer[];
  activeLayerId: string;
  activeLayerOpacity: number;
  canDeleteLayer: boolean;
  canMoveLayerUp: boolean;
  canMoveLayerDown: boolean;
  onAddLayer: () => void;
  onDeleteLayer: () => void;
  onMoveLayerUp: () => void;
  onMoveLayerDown: () => void;
  onSelectLayer: (layerId: string) => void;
  onToggleVisibility: (layerId: string, visible: boolean) => void;
  onToggleLock: (layerId: string, locked: boolean) => void;
  onRenameLayer: (layerId: string, name: string) => void;
  onSetOpacity: (opacity: number) => void;
};

export function LayersPanel({
  layers,
  activeLayerId,
  activeLayerOpacity,
  canDeleteLayer,
  canMoveLayerUp,
  canMoveLayerDown,
  onAddLayer,
  onDeleteLayer,
  onMoveLayerUp,
  onMoveLayerDown,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onRenameLayer,
  onSetOpacity
}: LayersPanelProps) {
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const layersInDisplayOrder = useMemo(() => [...layers].reverse(), [layers]);

  const commitRename = (layerId: string, fallback: string) => {
    const trimmed = editingName.trim();
    if (trimmed.length > 0 && trimmed !== fallback) {
      onRenameLayer(layerId, trimmed);
    }

    setEditingLayerId(null);
    setEditingName('');
  };

  return (
    <section className="panel" aria-label="Layers panel">
      <div className="panel-head-row">
        <h2 className="panel-title">Layers</h2>
        <div className="layer-head-actions">
          <button type="button" className="icon-button mini icon-only" onClick={onAddLayer} title="Add layer">
            <Icon name="add" size={14} className="ui-icon" />
          </button>
          <button
            type="button"
            className="icon-button mini"
            onClick={onDeleteLayer}
            disabled={!canDeleteLayer}
            title="Delete active layer"
          >
            Del
          </button>
          <button
            type="button"
            className="icon-button mini"
            onClick={onMoveLayerUp}
            disabled={!canMoveLayerUp}
            title="Move layer up"
          >
            Up
          </button>
          <button
            type="button"
            className="icon-button mini"
            onClick={onMoveLayerDown}
            disabled={!canMoveLayerDown}
            title="Move layer down"
          >
            Down
          </button>
        </div>
      </div>

      <div className="layer-controls">
        <select disabled aria-label="Blend mode">
          <option>Normal</option>
        </select>
      </div>

      <div className="layer-opacity">
        <label htmlFor="active-layer-opacity">Opacity</label>
        <input
          id="active-layer-opacity"
          type="range"
          min={0}
          max={100}
          value={activeLayerOpacity}
          onChange={(event) => onSetOpacity(Number(event.target.value))}
        />
        <span>{activeLayerOpacity}%</span>
      </div>

      <ul className="layers-list">
        {layersInDisplayOrder.map((layer) => {
          const isActive = layer.id === activeLayerId;
          const isEditing = layer.id === editingLayerId;

          return (
            <li key={layer.id} className={`layer-row${isActive ? ' active' : ''}${!layer.visible ? ' disabled' : ''}`}>
              <button
                type="button"
                className="layer-icon-button"
                aria-label={layer.visible ? `Hide ${layer.name}` : `Show ${layer.name}`}
                title={layer.visible ? 'Hide layer' : 'Show layer'}
                onClick={() => onToggleVisibility(layer.id, !layer.visible)}
              >
                <Icon name={layer.visible ? 'eye' : 'eye-off'} size={14} className="ui-icon" />
              </button>
              <button
                type="button"
                className="layer-name-button"
                onClick={() => onSelectLayer(layer.id)}
                onDoubleClick={() => {
                  setEditingLayerId(layer.id);
                  setEditingName(layer.name);
                }}
                title={layer.name}
              >
                {isEditing ? (
                  <input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    onBlur={() => commitRename(layer.id, layer.name)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        commitRename(layer.id, layer.name);
                      }

                      if (event.key === 'Escape') {
                        setEditingLayerId(null);
                        setEditingName('');
                      }
                    }}
                    autoFocus
                    aria-label="Layer name"
                  />
                ) : (
                  <span className="layer-name">{layer.name}</span>
                )}
              </button>
              <button
                type="button"
                className="layer-icon-button"
                aria-label={layer.locked ? `Unlock ${layer.name}` : `Lock ${layer.name}`}
                title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                onClick={() => onToggleLock(layer.id, !layer.locked)}
              >
                {layer.locked ? (
                  <Icon name="lock" size={14} className="ui-icon" />
                ) : (
                  <span className="layer-unlocked-dot" aria-hidden="true" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
