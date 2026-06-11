import React, { useState } from "react";
import { WorkoutRecord } from "../types";
import { 
  Trash2, 
  Smile, 
  Flame, 
  Clock, 
  Calendar, 
  NotebookPen, 
  Award, 
  RotateCcw,
  PlusCircle,
  X,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HistoryListProps {
  records: WorkoutRecord[];
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onAddManualRecord: (rec: WorkoutRecord) => void;
  userWeight: number; // default fallback weight to compute manually logged calories
}

export default function HistoryList({ records, onDeleteRecord, onClearAll, onAddManualRecord, userWeight }: HistoryListProps) {
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualData, setManualData] = useState({
    title: "",
    duration: 60,
    rating: 5,
    notes: "",
    completedExercises: ""
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualData.title.trim()) {
      alert("운동 루틴 제목을 입력해주세요.");
      return;
    }

    // Rough calorie estimation: 5.5 kcal/min/kg approx
    const estCal = Math.round(userWeight * 0.08 * manualData.duration * (manualData.rating / 4.5));

    const newRec: WorkoutRecord = {
      id: "manual-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      routineTitle: manualData.title.trim(),
      plannedDuration: 60,
      completedDuration: manualData.duration,
      rating: manualData.rating,
      calories: Math.max(50, estCal),
      todayCondition: "normal",
      completedExercises: manualData.completedExercises
        ? manualData.completedExercises.split(",").map(s => s.trim()).filter(s => s.length > 0)
        : ["맞춤 일반 운동"],
      notes: manualData.notes.trim() || "수동 기록 추가"
    };

    onAddManualRecord(newRec);
    setShowManualForm(false);
    setManualData({
      title: "",
      duration: 60,
      rating: 5,
      notes: "",
      completedExercises: ""
    });
  };

  return (
    <div className="space-y-6" id="history-section">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-800">훈련 히스토리 다이어리</h3>
          <p className="text-xs text-slate-400 mt-0.5">그동안 수행 완료한 모든 운동 기록들을 보관하고 편집합니다.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowManualForm(true)}
            className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 justify-center"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>수동 기록 추가</span>
          </button>
          
          {records.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("주의! 정말로 그동안 쌓은 모든 히스토리 기록을 삭제하고 초기 시드 데이터로 리셋하시겠습니까?")) {
                  onClearAll();
                }
              }}
              className="flex-1 sm:flex-none px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>기록 초기 리셋</span>
            </button>
          )}
        </div>
      </div>

      {/* Manual Entry Modal Dialog */}
      <AnimatePresence>
        {showManualForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-2xl overflow-hidden"
            >
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <NotebookPen className="w-4 h-4 text-indigo-600" />
                  <span>수동으로 개인 운동 기록 추가</span>
                </h4>
                <button 
                  onClick={() => setShowManualForm(false)} 
                  className="p-1 hover:bg-slate-200/50 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleManualSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-650 mb-1">루틴 및 운동 대단원 제목</label>
                  <input
                    placeholder="예: 퇴근길 가벼운 덤벨 컬 헬스 루틴"
                    required
                    value={manualData.title}
                    onChange={(e) => setManualData({ ...manualData, title: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-650 mb-1">실제 완수 운동 시간 (분)</label>
                  <input
                    type="number"
                    min={1}
                    max={240}
                    value={manualData.duration}
                    onChange={(e) => setManualData({ ...manualData, duration: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-650 mb-1">만족 상태 평가 (1~5점)</label>
                  <select
                    value={manualData.rating}
                    onChange={(e) => setManualData({ ...manualData, rating: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 최고 (매우 개운하고 안전함)</option>
                    <option value={4}>⭐⭐⭐⭐ 훌륭 (가볍고 기분전환)</option>
                    <option value={3}>⭐⭐⭐ 보통 (무난하고 따라할 지장 없음)</option>
                    <option value={2}>⭐⭐ 아쉬움 (컨디션 제어로 조금 힘듦)</option>
                    <option value={1}>⭐ 힘듦 (관절 부담 또는 심각한 피로)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-650 mb-1">완료한 핵심 세부동작 (콤마로 구분)</label>
                  <input
                    placeholder="예: 덤벨 컬, 오버헤드 익스텐션, 가벼운 제자리 플랭크"
                    value={manualData.completedExercises}
                    onChange={(e) => setManualData({ ...manualData, completedExercises: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-650 mb-1">오늘의 간단 코멘트 일지</label>
                  <textarea
                    placeholder="운동하며 느꼈던 기분이나 몸의 활력 기록"
                    value={manualData.notes}
                    onChange={(e) => setManualData({ ...manualData, notes: e.target.value })}
                    className="w-full text-xs h-16 p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowManualForm(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-xs text-center cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
                  >
                    추가저장
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Render records lists */}
      {records.length === 0 ? (
          <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-10 text-center text-slate-400">
          <Award className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold">아직 저장된 훈련일지 기록이 없습니다.</p>
          <p className="text-xs text-slate-400 mt-1">상단 AI 처방 폼을 통해 맞춤 처방을 유도하고 멋지게 운동해 보거나 수동 기록을 적어 수립해보세요!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {[...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((rec) => (
              <motion.div
                key={rec.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row gap-4 justify-between"
              >
                {/* Left block info */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{rec.date}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {rec.id.substring(0, 8)}</span>
                    <span className="text-indigo-600 text-xs font-semibold">{"⭐".repeat(rec.rating)}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800 tracking-tight">{rec.routineTitle}</h4>
                    {rec.notes && (
                      <p className="text-xs text-slate-500 leading-relaxed mt-1.5 p-3 rounded-xl bg-slate-50/60 border border-slate-100/50 flex gap-2">
                        <NotebookPen className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{rec.notes}</span>
                      </p>
                    )}
                  </div>

                  {/* Subcompleted exercises tags array picker */}
                  {rec.completedExercises && rec.completedExercises.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">포함 수행한 핵심 운동목록</p>
                      <div className="flex flex-wrap gap-1">
                        {rec.completedExercises.map((ex, i) => (
                          <span 
                            key={i} 
                            className="bg-slate-50 text-[10px] border border-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right stats indicators and deletion */}
                <div className="flex md:flex-col justify-between items-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-50">
                  <div className="flex flex-row md:flex-col gap-4 text-right shrink-0">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">수행 소요시간</p>
                      <div className="flex items-center justify-end gap-1 font-mono font-bold text-slate-705 text-sm mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rec.completedDuration}분</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">피트니스 소모량</p>
                      <div className="flex items-center justify-end gap-1 font-mono font-black text-indigo-600 text-sm mt-0.5">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{rec.calories} kcal</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm("다이어리에서 해당 운동 기록을 완전히 영구 삭제하시겠습니까?")) {
                        onDeleteRecord(rec.id);
                      }
                    }}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg border border-transparent hover:border-red-100 transition-colors cursor-pointer"
                    title="기록 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
