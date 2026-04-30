import { Icon } from './Icon';

export function LayersPanel() {
  return (
    <section className="panel" aria-label="Layers panel">
      <div className="panel-head-row">
        <h2 className="panel-title">Layers</h2>
        <div className="layer-head-actions">
          <button type="button" className="icon-button mini icon-only" disabled title="Add layer (not in MVP)">
            <Icon name="add" size={14} className="ui-icon" />
          </button>
          <button
            type="button"
            className="icon-button mini icon-only"
            disabled
            title="Layer options (not in MVP)"
          >
            <Icon name="more" size={14} className="ui-icon" />
          </button>
        </div>
      </div>

      <div className="layer-controls">
        <select disabled aria-label="Blend mode">
          <option>Normal</option>
        </select>
        <select disabled aria-label="Layer opacity">
          <option>100%</option>
        </select>
      </div>

      <ul className="layers-list">
        <li className="layer-row active">
          <span className="layer-icon" aria-hidden="true">
            <Icon name="eye" size={14} className="ui-icon" />
          </span>
          <span className="layer-name">Layer 1</span>
          <span className="layer-lock" aria-hidden="true" />
        </li>
        <li className="layer-row disabled">
          <span className="layer-icon" aria-hidden="true">
            <Icon name="eye-off" size={14} className="ui-icon" />
          </span>
          <span className="layer-name">Background</span>
          <span className="layer-lock" aria-hidden="true">
            <Icon name="lock" size={14} className="ui-icon" />
          </span>
        </li>
      </ul>
    </section>
  );
}
