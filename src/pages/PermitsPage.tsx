import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { usePermitStore } from '../store/usePermitStore';
import { FileCheck2, ShieldAlert, CheckCircle2, XCircle, Lock, User } from 'lucide-react';

export const PermitsPage: React.FC = () => {
  const { permits, selectedPermit, selectPermit, updatePermitStatus } = usePermitStore();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-brand-orange" /> Permit Intelligence & Work Authorization Hub
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            AI Pre-Evaluated Permits (PTW) • Spatial Overlap & Atmospheric Test Verification
          </p>
        </div>
        <Button variant="primary" size="sm">
          + Request New Work Permit
        </Button>
      </div>

      {/* Main Grid: Left Permit Table (7 Cols) + Right Selected Permit Analysis (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Work Permit Queue Table (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card variant="default" title="WORK PERMIT AUTHORIZATION QUEUE">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Permit ID</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Applicant</th>
                    <th className="py-2.5 px-3">Zone</th>
                    <th className="py-2.5 px-3">AI Score</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {permits.map((permit) => (
                    <tr
                      key={permit.permitId}
                      onClick={() => selectPermit(permit)}
                      className={`cursor-pointer transition-colors hover:bg-slate-850 ${
                        selectedPermit?.permitId === permit.permitId ? 'bg-slate-800/90 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-brand-blue font-bold">{permit.permitId}</td>
                      <td className="py-3 px-3">
                        <Badge variant={permit.permitType === 'HOT_WORK' ? 'CRITICAL' : 'info'} size="sm">
                          {permit.permitType.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-200">{permit.applicantName}</td>
                      <td className="py-3 px-3 text-slate-300">{permit.zoneName}</td>
                      <td className="py-3 px-3">
                        <span className={`font-bold ${permit.aiRiskScore > 75 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {permit.aiRiskScore}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Badge
                          variant={
                            permit.status === 'REJECTED' || permit.status === 'RECOMMENDED_REJECT'
                              ? 'CRITICAL'
                              : permit.status === 'APPROVED'
                              ? 'SAFE'
                              : 'WARNING'
                          }
                          size="sm"
                        >
                          {permit.status.replace('_', ' ')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: Selected Permit Deep Inspection Drawer (5 Cols) */}
        {selectedPermit && (
          <div className="lg:col-span-5 space-y-4">
            <Card variant="elevated" className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-100">{selectedPermit.permitId}</h3>
                  <span className="text-xs font-mono text-slate-400">{selectedPermit.permitType} • {selectedPermit.department}</span>
                </div>
                <Badge variant={selectedPermit.aiRiskScore > 75 ? 'CRITICAL' : 'SAFE'} pulse>
                  AI EVAL: {selectedPermit.aiRiskScore}% RISK
                </Badge>
              </div>

              {/* Applicant & Description */}
              <div className="space-y-2 text-xs">
                <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-mono">Work Description:</div>
                  <p className="text-slate-200">{selectedPermit.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-400 block">Applicant:</span>
                    <strong className="text-slate-200">{selectedPermit.applicantName}</strong>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-400 block">Location:</span>
                    <strong className="text-slate-200">{selectedPermit.zoneName}</strong>
                  </div>
                </div>
              </div>

              {/* Atmospheric Test Results */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 font-mono block uppercase">
                  Atmospheric Gas Sampling Test
                </span>
                <div className="grid grid-cols-3 gap-2 font-mono text-center">
                  <div className="bg-red-950/40 border border-red-800 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block">LEL Gas</span>
                    <strong className="text-red-400 text-sm">{selectedPermit.atmosphericTests.lelGas}%</strong>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block">Oxygen (O2)</span>
                    <strong className="text-emerald-400 text-sm">{selectedPermit.atmosphericTests.o2Percentage}%</strong>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block">H2S Gas</span>
                    <strong className="text-slate-200 text-sm">{selectedPermit.atmosphericTests.h2sPpm} PPM</strong>
                  </div>
                </div>
              </div>

              {/* Isolation Lock Statuses */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 font-mono block uppercase">
                  Lock-Out Tag-Out (LOTO) Verification
                </span>
                <div className="space-y-1.5 font-mono text-xs">
                  {selectedPermit.isolationLocks.map((lock) => (
                    <div key={lock.lockId} className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-brand-cyan" /> {lock.location}
                      </span>
                      <Badge variant={lock.status === 'LOCKED_VERIFIED' ? 'SAFE' : 'WARNING'} size="sm">
                        {lock.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => updatePermitStatus(selectedPermit.permitId, 'REJECTED')}
                >
                  REJECT PERMIT
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => updatePermitStatus(selectedPermit.permitId, 'APPROVED')}
                >
                  APPROVE PERMIT
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
