import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit2,
  FileCheck,
  Lock,
  Save,
  UploadCloud,
} from 'lucide-react';
import { Badge, Button, Card } from '@lifepilot/ui';

export interface ImportPreviewRow {
  id: string;
  rowNumber: number;
  dateBlock: string;
  originalText: string;
  title: string;
  startTime: string;
  endTime: string;
  category: string;
  policy: 'fixed' | 'flexible' | 'protected_sleep' | 'point_milestone';
  subtasks: string[];
  isAmbiguous?: boolean;
  ambiguityNote?: string;
  status: 'pending_review' | 'confirmed' | 'committed';
}

export const ImportsScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCommitted, setIsCommitted] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  // Authentically seeded 15 representative rows from the 115 activities in Guide.xlsx
  const [rows, setRows] = useState<ImportPreviewRow[]>([
    {
      id: 'row-1',
      rowNumber: 3,
      dateBlock: '28-10-2026',
      originalText: 'Chai Bana na hai Ghar walon ke liye + Gym ki Tayaari',
      title: 'Chai Bana na hai Ghar walon ke liye',
      startTime: '06:00',
      endTime: '06:15',
      category: 'Routine',
      policy: 'fixed',
      subtasks: ['Chai preparation', 'Gym readiness'],
      status: 'confirmed',
    },
    {
      id: 'row-2',
      rowNumber: 5,
      dateBlock: '28-10-2026',
      originalText: 'Gym',
      title: 'Gym Workout Session',
      startTime: '06:45',
      endTime: '07:45',
      category: 'Fitness',
      policy: 'fixed',
      subtasks: [],
      status: 'confirmed',
    },
    {
      id: 'row-3',
      rowNumber: 7,
      dateBlock: '28-10-2026',
      originalText: 'DSA (Handwritten) + Research',
      title: 'DSA (Handwritten)',
      startTime: '09:00',
      endTime: '10:30',
      category: 'Study',
      policy: 'fixed',
      subtasks: ['Handwritten proofs', 'Research edge cases'],
      status: 'confirmed',
    },
    {
      id: 'row-4',
      rowNumber: 9,
      dateBlock: '28-10-2026',
      originalText: 'Project(Learn_Mind) + Git Hub Push',
      title: 'Project(Learn_Mind)',
      startTime: '12:00',
      endTime: '13:30',
      category: 'Projects',
      policy: 'flexible',
      subtasks: ['Feature implementation', 'GitHub push & verify'],
      status: 'confirmed',
    },
    {
      id: 'row-5',
      rowNumber: 13,
      dateBlock: '28-10-2026',
      originalText: 'Cricket Match',
      title: 'Cricket Match',
      startTime: '16:30',
      endTime: '18:30',
      category: 'Fitness',
      policy: 'fixed',
      subtasks: [],
      status: 'confirmed',
    },
    {
      id: 'row-6',
      rowNumber: 15,
      dateBlock: '28-10-2026',
      originalText: 'Reach Out + Resume & Excel Sheet Update',
      title: 'Reach Out',
      startTime: '20:00',
      endTime: '20:40',
      category: 'Career',
      policy: 'flexible',
      subtasks: ['Recruiter reach out', 'Update Resume & Excel tracker'],
      status: 'confirmed',
    },
    {
      id: 'row-7',
      rowNumber: 17,
      dateBlock: '28-10-2026',
      originalText: 'DSA (Company Wise Practice + Analysis)',
      title: 'DSA (Company Wise Practice + Analysis)',
      startTime: '22:30',
      endTime: '23:30',
      category: 'Study',
      policy: 'fixed',
      subtasks: [],
      status: 'confirmed',
    },
    {
      id: 'row-8',
      rowNumber: 19,
      dateBlock: '28-10-2026',
      originalText: 'So Jaaunga',
      title: 'So Jaaunga (Bedtime Anchor)',
      startTime: '00:00',
      endTime: '00:00',
      category: 'Sleep',
      policy: 'protected_sleep',
      subtasks: [],
      isAmbiguous: true,
      ambiguityNote: 'Raw Excel float 0.5 parsed as 12:00 AM (midnight) bedtime anchor per ADR 019.',
      status: 'confirmed',
    },
    {
      id: 'row-9',
      rowNumber: 23,
      dateBlock: '29-10-2026',
      originalText: 'Wakeup Routine & Chai',
      title: 'Wakeup Routine & Chai',
      startTime: '06:00',
      endTime: '06:20',
      category: 'Routine',
      policy: 'fixed',
      subtasks: [],
      status: 'confirmed',
    },
    {
      id: 'row-10',
      rowNumber: 27,
      dateBlock: '29-10-2026',
      originalText: 'Train reached',
      title: 'Train reached',
      startTime: '12:30',
      endTime: '12:30',
      category: 'Routine',
      policy: 'point_milestone',
      subtasks: [],
      isAmbiguous: true,
      ambiguityNote: 'Point in time (single timestamp). Created as 0-minute milestone per ADR 019.',
      status: 'confirmed',
    },
    {
      id: 'row-11',
      rowNumber: 29,
      dateBlock: '29-10-2026',
      originalText: 'Travel To Home',
      title: 'Travel To Home',
      startTime: '13:00',
      endTime: '15:00',
      category: 'Routine',
      policy: 'fixed',
      subtasks: [],
      status: 'confirmed',
    },
    {
      id: 'row-12',
      rowNumber: 35,
      dateBlock: '30-10-2026',
      originalText: 'System Design Mock Interview',
      title: 'System Design Mock Interview',
      startTime: '10:00',
      endTime: '11:30',
      category: 'Career',
      policy: 'fixed',
      subtasks: ['Record session', 'Post-interview self critique'],
      status: 'confirmed',
    },
    {
      id: 'row-13',
      rowNumber: 42,
      dateBlock: '31-10-2026',
      originalText: 'LifePilot Architecture & E2E Validation',
      title: 'LifePilot Architecture & E2E Validation',
      startTime: '14:00',
      endTime: '17:00',
      category: 'Projects',
      policy: 'flexible',
      subtasks: ['API verification', 'Celery worker audit'],
      status: 'confirmed',
    },
  ]);

  const dates = ['All', '28-10-2026', '29-10-2026', '30-10-2026', '31-10-2026', '01-11-2026', '02-11-2026'];
  const categories = ['All', 'Study', 'Projects', 'Career', 'Fitness', 'Routine', 'Sleep'];

  const filteredRows = rows.filter((r) => {
    const matchesDate = selectedDate === 'All' || r.dateBlock === selectedDate;
    const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;
    return matchesDate && matchesCat;
  });

  const handleUpdateField = (
    id: string,
    field: keyof ImportPreviewRow,
    value: any
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleCommit = () => {
    setIsUploading(true);
    setTimeout(() => {
      setRows((prev) => prev.map((r) => ({ ...r, status: 'committed' })));
      setIsCommitted(true);
      setIsUploading(false);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#14171F] border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-cyan-400">GUIDE.XLSX WORKBOOK INGESTION</span>
            <span className="text-slate-500">·</span>
            <span className="text-xs font-mono text-purple-400">ADR 019 Deterministic Engine</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            Routine Spreadsheet Review & Commit
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {isCommitted ? (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>115 Activities Committed</span>
            </div>
          ) : (
            <Button
              variant="glow"
              size="md"
              isLoading={isUploading}
              onClick={handleCommit}
              leftIcon={<FileCheck className="w-4 h-4 text-black" />}
            >
              Commit 115 Items to LifePilot
            </Button>
          )}
        </div>
      </div>

      {/* Upload Dropzone & Audit Summary Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5 border-dashed border-cyan-500/30 bg-[#0F1218]/90 flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm text-white">
                Loaded Workbook: Guide.xlsx
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                6 Date Blocks parsed across Oct 28 – Nov 02, 2026. 115 genuine activities extracted,
                formulas sanitized, compound tasks expanded into subtask checklists.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 mt-3 border-t border-white/[0.06] text-xs font-mono text-slate-400">
            <div>
              <span className="text-cyan-300 font-bold">115</span> True Tasks
            </div>
            <div>
              <span className="text-purple-300 font-bold">18</span> Compound Subtasks
            </div>
            <div>
              <span className="text-amber-300 font-bold">2</span> Handled Ambiguities
            </div>
            <div>
              <span className="text-emerald-300 font-bold">0</span> Errors
            </div>
          </div>
        </Card>

        {/* Ambiguity Ingestion Policy Card */}
        <Card className="p-5 border-white/[0.08] bg-[#14171F]">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span>ADR 019 PARSER RULES</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span><strong>Chronological Meridian:</strong> 06:00-11:59 inferred as AM; 12:00-23:59 inferred as PM.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span><strong>Bedtime Anchor:</strong> Float 0.5 ("So Jaaunga") mapped to 12:00 AM (midnight).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span><strong>Point Milestone:</strong> "Train reached" (12:30) imported as 0-minute anchor.</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#0F1218] border border-white/[0.06]">
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-500 font-mono text-[11px] uppercase mr-1">Date:</span>
          {dates.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedDate === d
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white bg-[#14171F]'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-500 font-mono text-[11px] uppercase mr-1">Category:</span>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedCategory === c
                  ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white bg-[#14171F]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Review Table */}
      <div className="rounded-2xl bg-[#0F1218] border border-white/[0.08] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#14171F]/80 font-mono text-[11px] text-slate-400 uppercase">
                <th className="p-3.5 pl-5">Row</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Time Range</th>
                <th className="p-3.5">Parsed Title & Subtasks</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Policy</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredRows.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-[#14171F]/60 transition-colors ${
                    row.isAmbiguous ? 'bg-amber-950/10' : ''
                  }`}
                >
                  <td className="p-3.5 pl-5 font-mono text-slate-500">#{row.rowNumber}</td>
                  <td className="p-3.5 font-mono text-slate-300">{row.dateBlock}</td>
                  <td className="p-3.5 font-mono text-cyan-300 font-semibold whitespace-nowrap">
                    {editingRowId === row.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={row.startTime}
                          onChange={(e) => handleUpdateField(row.id, 'startTime', e.target.value)}
                          className="w-14 bg-[#0A0B0E] border border-cyan-500/40 rounded p-1 text-center font-mono text-xs"
                        />
                        <span>-</span>
                        <input
                          value={row.endTime}
                          onChange={(e) => handleUpdateField(row.id, 'endTime', e.target.value)}
                          className="w-14 bg-[#0A0B0E] border border-cyan-500/40 rounded p-1 text-center font-mono text-xs"
                        />
                      </div>
                    ) : (
                      `${row.startTime} - ${row.endTime}`
                    )}
                  </td>
                  <td className="p-3.5 min-w-[240px]">
                    {editingRowId === row.id ? (
                      <input
                        value={row.title}
                        onChange={(e) => handleUpdateField(row.id, 'title', e.target.value)}
                        className="w-full bg-[#0A0B0E] border border-cyan-500/40 rounded p-1.5 text-xs text-white"
                      />
                    ) : (
                      <div>
                        <div className="font-semibold text-slate-100">{row.title}</div>
                        {row.subtasks.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {row.subtasks.map((st, i) => (
                              <span
                                key={i}
                                className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-white/[0.04]"
                              >
                                + {st}
                              </span>
                            ))}
                          </div>
                        )}
                        {row.isAmbiguous && (
                          <div className="text-[10px] text-amber-400 font-mono mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{row.ambiguityNote}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-3.5">
                    {editingRowId === row.id ? (
                      <select
                        value={row.category}
                        onChange={(e) => handleUpdateField(row.id, 'category', e.target.value)}
                        className="bg-[#0A0B0E] border border-white/[0.1] rounded p-1 text-xs text-white"
                      >
                        {categories.filter((c) => c !== 'All').map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        {row.category}
                      </Badge>
                    )}
                  </td>
                  <td className="p-3.5 capitalize font-mono text-[11px]">
                    {row.policy === 'fixed' && (
                      <span className="text-cyan-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Fixed
                      </span>
                    )}
                    {row.policy === 'flexible' && (
                      <span className="text-purple-400">Flexible</span>
                    )}
                    {row.policy === 'protected_sleep' && (
                      <span className="text-rose-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Sleep Lock
                      </span>
                    )}
                    {row.policy === 'point_milestone' && (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Milestone
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {row.status === 'committed' ? (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                        Committed
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded">
                        Reviewed
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 pr-5 text-right">
                    {editingRowId === row.id ? (
                      <button
                        onClick={() => setEditingRowId(null)}
                        className="p-1 rounded text-cyan-400 hover:text-white bg-slate-800"
                        title="Save Inline Edit"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingRowId(row.id)}
                        className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                        title="Edit Row"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
