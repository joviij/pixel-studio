import { Icon } from './Icon';

type ColorPanelProps = {
  primaryColor: string;
  secondaryColor: string;
  onPrimaryColorChange: (color: string) => void;
};

const DEFAULT_SWATCHES = [
  '#000000', '#262626', '#525252', '#737373', '#a3a3a3', '#d4d4d4', '#f5f5f5', '#ffffff',
  '#7f1d1d', '#b91c1c', '#dc2626', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#166534', '#0f766e', '#06b6d4', '#0284c7', '#2563eb', '#4338ca', '#7c3aed', '#a21caf',
  '#be185d', '#db2777', '#ef4444', '#ea580c', '#ca8a04', '#65a30d', '#16a34a', '#0d9488'
];

export function ColorPanel({ primaryColor, secondaryColor, onPrimaryColorChange }: ColorPanelProps) {
  return (
    <section className="panel color-panel" aria-label="Color panel">
      <h2 className="panel-title">Colors</h2>

      <div className="color-chip-row">
        <div className="color-slot">
          <span className="slot-label">Primary</span>
          <div
            className="color-chip"
            style={{ backgroundColor: primaryColor }}
            aria-label={`Primary color ${primaryColor}`}
          />
        </div>
        <button type="button" className="icon-button mini icon-only" title="Swap colors" disabled>
          <Icon name="swap" size={14} className="ui-icon" />
        </button>
        <div className="color-slot">
          <span className="slot-label">Secondary</span>
          <div
            className="color-chip"
            style={{ backgroundColor: secondaryColor }}
            aria-label={`Secondary color ${secondaryColor}`}
          />
        </div>
      </div>

      <label className="color-picker-row" htmlFor="primary-color-input">
        <span className="slot-label">Primary Color</span>
        <input
          id="primary-color-input"
          type="color"
          value={primaryColor}
          onChange={(event) => onPrimaryColorChange(event.target.value)}
          aria-label="Pick primary color"
        />
      </label>

      <div className="palette-head">
        <span className="panel-title">Palette</span>
        <div className="palette-actions">
          <button type="button" className="icon-button mini icon-only" title="Add palette color" disabled>
            <Icon name="add" size={14} className="ui-icon" />
          </button>
          <button type="button" className="icon-button mini icon-only" title="Edit palette" disabled>
            <Icon name="edit" size={14} className="ui-icon" />
          </button>
        </div>
      </div>

      <div className="palette-grid" role="list" aria-label="Palette swatches">
        {DEFAULT_SWATCHES.map((swatch) => (
          <button
            key={swatch}
            type="button"
            className={`swatch${swatch.toLowerCase() === primaryColor.toLowerCase() ? ' selected' : ''}`}
            style={{ backgroundColor: swatch }}
            title={`Use ${swatch}`}
            onClick={() => onPrimaryColorChange(swatch)}
          />
        ))}
      </div>
    </section>
  );
}
