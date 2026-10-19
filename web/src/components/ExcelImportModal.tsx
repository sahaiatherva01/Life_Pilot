import React, { useState } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  X, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { Category, ImportPreviewRow } from '../types';
import { api } from '../services/api';
import { sound } from '../utils/audio';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [filename, setFilename] = useState<string>('');
  const [autoPopulateToday, setAutoPopulateToday] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      setErrorMsg('Please select an Excel (.xlsx or .xls) file.');
      return;
    }

    setFile(selectedFile);
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await api.previewGuideExcel(selectedFile);
      setPreviewRows(res.rows);
      setFilename(res.filename);
      sound.playClick();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to preview Excel file.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (index: number, newCat: Category) => {
    setPreviewRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], category: newCat };
      return updated;
    });
  };

  const handleConfirm = async () => {
    if (previewRows.length === 0) return;
    setImporting(true);
    setErrorMsg(null);

    try {
      await api.confirmGuideImport(previewRows, autoPopulateToday);
      sound.playSuccess();
      onImportSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to confirm import.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(5, 7, 11, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '920px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-secondary)',
        border: '1px solid rgba(0, 242, 254, 0.3)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileSpreadsheet size={24} color="var(--neon-cyan)" />
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>
                Import <span className="neon-gradient-text">Guide.xlsx</span> Routine
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Seed recurring daily blocks into calendar and alarm schedules
              </span>
            </div>
          </div>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {errorMsg && (
            <div style={{
              background: 'rgba(255, 51, 102, 0.15)',
              border: '1px solid #FF3366',
              color: '#FF3366',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <AlertTriangle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload Area */}
          {!previewRows.length && (
            <div
              style={{
                border: '2px dashed rgba(0, 242, 254, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '48px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(0, 242, 254, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
              }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => {
                const el = document.getElementById('excel-file-input');
                if (el) el.click();
              }}
            >
              <input
                id="excel-file-input"
                type="file"
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(0, 242, 254, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Upload size={28} color="var(--neon-cyan)" />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  Click to choose or drag & drop <strong>Guide.xlsx</strong>
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Reads Column A (Time ranges or 0.5 midnight sleep) and Column B (Activity/Work)
                </p>
              </div>

              {loading && (
                <div style={{ color: 'var(--neon-cyan)', fontSize: '0.9rem', fontWeight: 600 }}>
                  Analyzing routine sheet...
                </div>
              )}
            </div>
          )}

          {/* Preview Table */}
          {previewRows.length > 0 && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Preview: {filename}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--neon-emerald)', marginLeft: '10px' }}>
                    ✓ {previewRows.length} routine blocks parsed
                  </span>
                </div>

                <button
                  className="btn-secondary"
                  onClick={() => { setPreviewRows([]); setFile(null); }}
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  Choose Different File
                </button>
              </div>

              {/* Table */}
              <div style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                overflowX: 'auto',
                maxHeight: '400px',
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.85rem',
                  textAlign: 'left',
                }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>#</th>
                      <th style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Raw Time</th>
                      <th style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Parsed (24h)</th>
                      <th style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Activity</th>
                      <th style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Category</th>
                      <th style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Subtasks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, idx) => (
                      <tr 
                        key={idx} 
                        style={{ 
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
                        }}
                      >
                        <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {row.row_index}
                        </td>
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          {row.original_time}
                        </td>
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', fontWeight: 600 }}>
                          {row.parsed_start} - {row.parsed_end} ({row.duration_minutes}m)
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {row.activity}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <select
                            value={row.category}
                            onChange={e => handleCategoryChange(idx, e.target.value as Category)}
                            style={{
                              background: 'rgba(0, 0, 0, 0.6)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-primary)',
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.8rem',
                            }}
                          >
                            {['Fitness', 'Study', 'Projects', 'Career', 'Sleep', 'Skill', 'Routine'].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          {row.subtasks.length > 0 ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--neon-emerald)' }}>
                              {row.subtasks.length} items (+)
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Options */}
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  id="auto-populate-checkbox"
                  type="checkbox"
                  checked={autoPopulateToday}
                  onChange={e => setAutoPopulateToday(e.target.checked)}
                  style={{ accentColor: 'var(--neon-cyan)', cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <label 
                  htmlFor="auto-populate-checkbox" 
                  style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  Auto-populate today's calendar immediately with these blocks
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {previewRows.length > 0 && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
          }}>
            <button
              className="btn-secondary"
              onClick={onClose}
              disabled={importing}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleConfirm}
              disabled={importing}
              style={{ padding: '10px 24px' }}
            >
              <Sparkles size={16} />
              <span>{importing ? 'Seeding Routine...' : 'Confirm & Seed Routine'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
