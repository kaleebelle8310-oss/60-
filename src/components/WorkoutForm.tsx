import React, { useState } from "react";
import { UserCondition } from "../types";
import { 
  Dumbbell, 
  Activity, 
  User, 
  Target, 
  Flame, 
  AlertTriangle, 
  Sparkles, 
  Check, 
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WorkoutFormProps {
  onSubmit: (condition: UserCondition) => void;
  isLoading: boolean;
}

export default function WorkoutForm({ onSubmit, isLoading }: WorkoutFormProps) {
  const [formData, setFormData] = useState<UserCondition>({
    gender: "male",
    age: 28,
    height: 175,
    weight: 70,
    experience: "intermediate",
    focusArea: "full_body",
    fitnessGoal: "fat_loss",
    todayCondition: "normal",
    painAreas: [],
    equipment: ["none"],
    customRequest: ""
  });

  const [activeTab, setActiveTab] = useState<"profile" | "goals" | "condition">("profile");

  const togglePainArea = (area: string) => {
    setFormData(prev => {
      const exists = prev.painAreas.includes(area);
      const updated = exists 
        ? prev.painAreas.filter(a => a !== area)
        : [...prev.painAreas, area];
      return { ...prev, painAreas: updated };
    });
  };

  const toggleEquipment = (eq: 'none' | 'dumbbells' | 'gym_machines' | 'bands') => {
    setFormData(prev => {
      // If toggled 'none'
      if (eq === 'none') {
        return { ...prev, equipment: ['none'] };
      }
      
      const filtered = prev.equipment.filter(e => e !== 'none');
      const exists = filtered.includes(eq);
      const updated = exists 
        ? filtered.filter(e => e !== eq)
        : [...filtered, eq];
        
      return { 
        ...prev, 
        equipment: updated.length === 0 ? ['none'] : (updated as any) 
      };
    });
  };

  const currentTabIsValid = () => {
    if (activeTab === "profile") {
      return formData.age > 0 && formData.height > 0 && formData.weight > 0;
    }
    return true;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Loading Status Messages to cycle through
  const loadingMessages = [
    "인공지능 트레이너가 체형 정보를 분석하고 있습니다...",
    "선택한 기구와 신체 부위에 맞는 운동 가동 범위를 점검중입니다...",
    "오늘의 관절 피로도와 통증 부위를 보호하는 대안 동작을 설계하고 있습니다...",
    "유산소와 근력운동 비율을 황금 시간대로 나누는 중입니다 (딱 60분)...",
    "개인별 특이 고려사항에 꼭 맞춘 디테일한 안전 수칙을 생성하고 있습니다..."
  ];
  
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  
  React.useEffect(() => {
    let timer: any;
    if (isLoading) {
      timer = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % loadingMessages.length);
      }, 3500);
    } else {
      setLoadingMsgIdx(0);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden" id="workout-form-container">
      {isLoading ? (
        <div className="p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[450px]">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3 font-sans">AI 맞춤 운동 처방전 작성 중</h3>
          <p className="text-slate-500 text-sm max-w-sm h-12 leading-relaxed">
            {loadingMessages[loadingMsgIdx]}
          </p>
          <div className="mt-8 flex gap-2 justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-bounce"></span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleFormSubmit}>
          {/* Navigation Tab Header */}
          <div className="flex border-b border-slate-100 bg-slate-50/75">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-4.5 px-4 text-center font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "border-indigo-600 text-indigo-600 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
              }`}
            >
              <User className="w-4 h-4" />
              <span>신체 정보 입력</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("goals")}
              className={`flex-1 py-4.5 px-4 text-center font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "goals"
                  ? "border-indigo-600 text-indigo-600 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
              }`}
            >
              <Target className="w-4 h-4" />
              <span>운동 목표 & 기구</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (currentTabIsValid()) setActiveTab("condition");
              }}
              className={`flex-1 py-4.5 px-4 text-center font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "condition"
                  ? "border-indigo-600 text-indigo-600 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
              } ${!currentTabIsValid() ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={!currentTabIsValid()}
            >
              <Activity className="w-4 h-4" />
              <span>오늘의 컨디션</span>
            </button>
          </div>

          {/* Form Contents */}
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <motion.div
                  key="profile-tab"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <p className="text-slate-500 text-sm">기본 신체 상태를 입력해주세요. 신진대사율과 운동 강도 처방 시 활용됩니다.</p>
                  
                  {/* Gender */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-2.5 text-xs uppercase tracking-wider">성별</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['male', 'female', 'other'] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setFormData({ ...formData, gender: g })}
                          className={`py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            formData.gender === g
                              ? "border-indigo-600 bg-indigo-50/50 text-indigo-600 font-bold shadow-xs"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {g === 'male' && "남성"}
                          {g === 'female' && "여성"}
                          {g === 'other' && "기타"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Physical attributes grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5 text-xs uppercase tracking-wider">나이 (만)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.age}
                          min={1}
                          max={120}
                          onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-sans [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-right pr-9"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">세</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5 text-xs uppercase tracking-wider">신장 (키)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.height}
                          min={50}
                          max={250}
                          onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-sans [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-right pr-9"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">cm</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5 text-xs uppercase tracking-wider">몸무게 (체중)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.weight}
                          min={20}
                          max={300}
                          onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-sans [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-right pr-9"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Level of experience */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-2.5 text-xs uppercase tracking-wider">운동 경험 & 숙련도</label>
                    <div className="space-y-2.5">
                      {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setFormData({ ...formData, experience: lvl })}
                          className={`w-full p-4.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                            formData.experience === lvl
                              ? "border-indigo-600 bg-indigo-50/20 text-slate-950 ring-1 ring-indigo-600/10"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <div>
                            <p className="font-bold text-sm text-slate-800">
                              {lvl === 'beginner' && "초급자 (Beginner)"}
                              {lvl === 'intermediate' && "중급자 (Intermediate)"}
                              {lvl === 'advanced' && "상급자 (Advanced)"}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5 font-medium leading-relaxed">
                              {lvl === 'beginner' && "체력이 다소 약하고, 올바른 운동 부위 자세를 배워나가는 단계"}
                              {lvl === 'intermediate' && "정기적으로 운동 중이며 올바른 기구 사용법과 자세를 숙지함"}
                              {lvl === 'advanced' && "고강도 운동 루틴 및 점진적 부하 트레이닝을 충분히 감당 가능한 체력"}
                            </p>
                          </div>
                          {formData.experience === lvl && (
                            <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                              <Check className="w-3.5 h-3.5 font-bold" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Next btn */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("goals")}
                      className="px-5 py-3 text-xs font-bold rounded-xl bg-slate-950 text-white hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>선택 완료 및 다음 단계</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === "goals" && (
                <motion.div
                  key="goals-tab"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <p className="text-slate-500 text-sm">설계하고자 하는 운동 목적 및 활용할 수 있는 주변 도구를 알려주세요.</p>
                  
                  {/* Fitness Goals */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-2.5 text-xs uppercase tracking-wider">트레이닝 목표</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "fat_loss", label: "체지방 적극 연소", desc: "유산소 비율 확장형" },
                        { id: "muscle_gain", label: "근육 및 스트렝스 향상", desc: "고부하 저항 운동 중심" },
                        { id: "stamina", label: "기초 동적 체력 증진", desc: "지구력 및 전신 밸런스" },
                        { id: "rehab_posture", label: "체형 교정 및 재활 가이드", desc: "저충격 안전 보강 운동" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, fitnessGoal: item.id as any })}
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            formData.fitnessGoal === item.id
                              ? "border-indigo-600 bg-indigo-50/30 text-indigo-950 font-bold"
                              : "border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <p className="text-sm font-bold text-slate-800">{item.label}</p>
                          <p className="text-xs text-slate-400 font-normal mt-0.5">{item.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Muscle focus parts */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-2.5 text-xs uppercase tracking-wider">핵심 집중 부위</label>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { id: "full_body", label: "전신 전반" },
                        { id: "upper_body", label: "상체 위주" },
                        { id: "lower_body", label: "하체 중심" },
                        { id: "core", label: "코어 & 복근" }
                      ].map((area) => (
                        <button
                          key={area.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, focusArea: area.id as any })}
                          className={`py-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                            formData.focusArea === area.id
                              ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {area.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Available Equipment */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-2 text-xs uppercase tracking-wider">지참 및 사용 가능 기구 (다중 선택)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "none", label: "맨몸 (도구 미활용)", icon: "🏃" },
                        { id: "dumbbells", label: "덤벨 / 아령", icon: "🏋️" },
                        { id: "bands", label: "저항 밴드 / 루프", icon: "🎗️" },
                        { id: "gym_machines", label: "헬스장 웨이트 머신", icon: "🏢" }
                      ].map((eq) => {
                        const isSelected = formData.equipment.includes(eq.id as any);
                        return (
                          <button
                            key={eq.id}
                            type="button"
                            onClick={() => toggleEquipment(eq.id as any)}
                            className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "border-indigo-600 bg-indigo-50/20 text-indigo-950 font-bold"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{eq.icon}</span>
                              <span className="text-sm font-bold text-slate-800">{eq.label}</span>
                            </div>
                            {isSelected && (
                              <span className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Back / Next flow control */}
                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("profile")}
                      className="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      신체정보 수정
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("condition")}
                      className="px-5 py-3 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>선택 완료 및 다음 단계</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === "condition" && (
                <motion.div
                  key="condition-tab"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <p className="text-slate-500 text-sm">가장 지켜야 할 안전 단계입니다. 관절 불편함이나 현재 지친 상태를 반영해 대체 운동을 처방합니다.</p>
                  
                  {/* Today energy index */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-2.5 text-xs uppercase tracking-wider">오늘 나의 전반적인 활력 상태</label>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { id: "excellent", label: "최상", icon: "⚡" },
                        { id: "normal", label: "보통", icon: "😊" },
                        { id: "tired", label: "피곤함", icon: "🥱" },
                        { id: "pain", label: "만성 통증", icon: "🩹" }
                      ].map((cond) => (
                        <button
                          key={cond.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, todayCondition: cond.id as any })}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            formData.todayCondition === cond.id
                              ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold shadow-xs"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <div className="text-lg mb-1">{cond.icon}</div>
                          <div className="text-xs font-bold">{cond.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Joint / body parts pain selector */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-emerald-600" />
                        <span>통증 / 지켜주고픈 특정 부위 (복수 선택)</span>
                      </label>
                      <span className="text-[9px] text-indigo-600 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">안전 대체처방 가동</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: "무릎 (Knee)", icon: "🦵" },
                        { id: "허리/골반 (Lower Back)", icon: "🪵" },
                        { id: "목/어깨 (Shoulder/Neck)", icon: "🧣" },
                        { id: "손목/엘보우 (Wrist/Elbow)", icon: "💪" },
                        { id: "발목/아킬레스 (Ankle)", icon: "🦶" },
                        { id: "해당사항 없음 (None)", icon: "✨" }
                      ].map((pain) => {
                        const isNone = pain.id.includes("None");
                        const isSelected = isNone 
                          ? formData.painAreas.length === 0
                          : formData.painAreas.includes(pain.id);
                        
                        return (
                          <button
                            key={pain.id}
                            type="button"
                            onClick={() => {
                              if (isNone) {
                                setFormData({ ...formData, painAreas: [] });
                              } else {
                                togglePainArea(pain.id);
                              }
                            }}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? "border-amber-400 bg-amber-50/50 text-amber-900 font-bold"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <span className="text-xs block text-center truncate font-semibold">{pain.icon} {pain.id.split(" ")[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add manual message / request */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5 text-xs uppercase tracking-wider">트레이너에게 한마디 (추가 희망사항)</label>
                    <textarea
                      placeholder="예: 홈트에 최적화된 층간 소음이 안 일어나는 매트 운동 위주로 해주시거나, 스트레칭 위주로 처방 부탁드려요!"
                      value={formData.customRequest}
                      onChange={(e) => setFormData({ ...formData, customRequest: e.target.value })}
                      className="w-full h-20 p-3 text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-xs leading-relaxed"
                    />
                  </div>

                  {/* Form Submission buttons */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("goals")}
                      className="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      목표정보 수정
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3.5 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-white animate-pulse" />
                      <span>60분 AI 맞춤 루틴 처방 시작</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      )}
    </div>
  );
}

