import React, { useState, useEffect } from "react";
import { UserCondition, WorkoutRoutine, WorkoutRecord } from "./types";
import WorkoutForm from "./components/WorkoutForm";
import ActiveRoutine from "./components/ActiveRoutine";
import WorkoutCharts from "./components/WorkoutCharts";
import HistoryList from "./components/HistoryList";
import { PRESEEDED_RECORDS } from "./utils/mockData";
import { 
  Sparkles, 
  TrendingUp, 
  History, 
  Dumbbell, 
  ShieldAlert, 
  Settings, 
  Play, 
  HelpCircle,
  HelpCircleIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [records, setRecords] = useState<WorkoutRecord[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<WorkoutRoutine | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<"generate" | "charts" | "history">("generate");
  const [apiError, setApiError] = useState<{ type: string; message: string; mode: "error" | "info" } | null>(null);
  const [currentUserWeight, setCurrentUserWeight] = useState(70);

  // Load records from local storage or pre-seed
  useEffect(() => {
    const local = localStorage.getItem("workout_history");
    if (local) {
      try {
        setRecords(JSON.parse(local));
      } catch (e) {
        setRecords(PRESEEDED_RECORDS);
      }
    } else {
      localStorage.setItem("workout_history", JSON.stringify(PRESEEDED_RECORDS));
      setRecords(PRESEEDED_RECORDS);
    }
  }, []);

  const saveToLocalStorage = (newRecords: WorkoutRecord[]) => {
    localStorage.setItem("workout_history", JSON.stringify(newRecords));
    setRecords(newRecords);
  };

  const handleSaveWorkoutRecord = (newRecord: WorkoutRecord) => {
    const updated = [newRecord, ...records];
    saveToLocalStorage(updated);
    setSelectedRoutine(null);
    setCurrentTab("charts"); // immediately direct to charts to let them see their graph in action!
  };

  const handleDeleteRecord = (id: string) => {
    const filtered = records.filter(rec => rec.id !== id);
    saveToLocalStorage(filtered);
  };

  const handleClearAllRecords = () => {
    saveToLocalStorage(PRESEEDED_RECORDS);
  };

  const handleAddManualRecord = (newRecord: WorkoutRecord) => {
    const updated = [newRecord, ...records];
    saveToLocalStorage(updated);
    setCurrentTab("charts");
  };

  // Generate Fallback customized program if Gemini API Key is missing or request fails
  const generateFallbackClientRoutine = (condition: UserCondition): WorkoutRoutine => {
    const { experience, fitnessGoal, painAreas, focusArea, equipment } = condition;
    
    // Choose dynamic minutes breakdown summing to 60 based on goals
    let warmup = 10;
    let cardio = 20;
    let strength = 25;
    let cooldown = 5;

    if (fitnessGoal === "fat_loss") {
      cardio = 30;
      strength = 15;
    } else if (fitnessGoal === "muscle_gain") {
      cardio = 10;
      strength = 35;
    } else if (fitnessGoal === "rehab_posture") {
      warmup = 15;
      cardio = 15;
      strength = 20;
      cooldown = 10;
    }

    // Build standard list of exercises tailored around painAreas & equipments
    const hasKneePain = painAreas.some(area => area.includes("무릎"));
    const hasBackPain = painAreas.some(area => area.includes("허리"));
    const hasShoulderPain = painAreas.some(area => area.includes("어깨") || area.includes("목"));
    const hasWristPain = painAreas.some(area => area.includes("손목") || area.includes("엘보우"));

    const exercises: any[] = [];
    let idx = 1;

    // Phase 1: Warmup
    exercises.push({
      id: `ex-${idx++}`,
      name: hasShoulderPain ? "가벼운 고관절 및 목 회전 서클" : "동적 관절 웜업 전신 스트레칭",
      type: "warmup",
      duration: Math.floor(warmup / 2),
      targetIntensity: "천천히 호흡하며 10회 왕복",
      description: "발을 어깨너비로 벌리고 관절 주위 긴장을 낮추기 위해 부드럽고 원형의 움직임으로 사지를 풀어줍니다.",
      safetyTip: hasShoulderPain 
        ? "어깨를 귀 밑까지 과도하게 끌어올리지 마시고, 가동 범위 내에서만 작게 늘립니다." 
        : "몸통을 비틀 때 허리에 순간적인 충격을 가하지 않도록 주의하세요."
    });

    exercises.push({
      id: `ex-${idx++}`,
      name: "체온 상승 제자리 가벼운 스텝",
      type: "warmup",
      duration: warmup - Math.floor(warmup / 2),
      targetIntensity: "심박수 가볍게 상승 유지",
      description: "팔을 앞뒤로 흔들며 가볍게 제자리 보행을 실시해 체온과 근육 온도를 점진적으로 올립니다.",
      safetyTip: hasKneePain 
        ? "발을 디딜 때 뒤꿈치부터 안전하게 접지하여 무릎 관절로의 직접 충격을 방지하세요." 
        : "척추를 바르게 수직으로 세우고 시선은 정면을 주시합니다."
    });

    // Phase 2: Cardio
    const cardioDur1 = Math.floor(cardio / 2);
    const cardioDur2 = cardio - cardioDur1;

    exercises.push({
      id: `ex-${idx++}`,
      name: hasKneePain ? "무충격 공중 가위차기" : "슬로우 버피 (Slow Burpee)",
      type: "cardio",
      duration: cardioDur1,
      targetIntensity: "일정한 속도로 지속 수행",
      description: hasKneePain 
        ? "매트에 누워 허리를 수평으로 바르게 밀착한 뒤 다리를 가볍게 공중에서 가위치기하듯 교차합니다."
        : "한 발씩 뒤로 뻗었다가 제자리로 돌아오면서 일어서는 저충격 전신 슬로우 버피 동작입니다.",
      safetyTip: hasKneePain 
        ? "무릎을 과하게 구부리지 마시고 30~45도 내에서만 가볍게 가위질 동작을 해줍니다."
        : hasBackPain 
          ? "다리를 뒤로 딛을 때 복부에 강한 힘을 주어 허리가 밑으로 부서지듯 가라앉지 않도록 통제하세요."
          : "손바닥 전체로 매트를 지지해 손목 부하를 분산해 줍니다."
    });

    exercises.push({
      id: `ex-${idx++}`,
      name: "하이 니 탭 (High Knees Tap)",
      type: "cardio",
      duration: cardioDur2,
      targetIntensity: "중속도 페이스 유지하며 호흡",
      description: "제자리에서 무릎을 골반 높이까지 차올리며 양손으로 올라오는 손바닥을 가볍게 터치합니다.",
      safetyTip: hasKneePain 
        ? "높게 들어 올리는 것이 관절에 불편하면, 무릎 높이를 골반 아래로 대폭 낮추고 보행 위주로 대체하세요." 
        : "지면에 닿는 디딤발 앞꿈치에 쿠션을 주듯 부드럽게 사뿐사뿐 착지합니다."
    });

    // Phase 3: Strength Focus
    const strengthDur1 = Math.floor(strength / 2);
    const strengthDur2 = strength - strengthDur1;

    // Adjust strength based on focus areas and pain
    let stEx1 = "정적 하프 월 스쿼트 (Static Wall Squat)";
    let stDesc1 = "벽에 등을 든든히 밀착한 뒤 무릎을 가볍게 90도 미만으로 가라앉히며 하체 대퇴사두근과 둔근 전체를 홀드합니다.";
    let stTip1 = "무릎이 발가락 앞으로 튀어나오지 않고 엉덩이가 벽을 강력히 밀어내도록 지탱하세요.";

    if (focusArea === "upper_body") {
      stEx1 = hasShoulderPain || hasWristPain ? "매트 버드독 복합 벨런스" : "무릎 대고 푸쉬업 (Knee Push-up)";
      stDesc1 = hasShoulderPain || hasWristPain 
        ? "네발기기 자세에서 대각선 방향의 팔과 다리를 몸통 수평까지 뻗어 척추기립근과 상하체 대칭 힘을 훈련합니다."
        : "바닥에 무릎을 완전 밀실히 댄 후 견갑골의 수축을 느끼며 가슴과 팔 뒤쪽 대흉근과 삼두근을 단련합니다.";
      stTip1 = hasShoulderPain || hasWristPain
        ? "손목이 불편하다면 주먹을 쥐고 지탱하거나 팔꿈치를 땅에 대는 엘보우 버드독으로 대체 가능합니다."
        : "엉덩이가 뒤로 쭉 빠지거나 허리가 U자 형태로 내려앉지 않도록 통제해 줍니다.";
    } else if (focusArea === "core") {
      stEx1 = hasBackPain ? "데드버그 코어 브릿지" : "매트 전신 기본 플랭크 (Plank)";
      stDesc1 = hasBackPain
        ? "바로 누워 양팔은 수직으로 들고 다리는 90도로 굽혀 가슴으로 정렬 후 대각선 팔다리를 바닥으로 내렸다가 원위치합니다."
        : "팔꿈치로 바닥을 바르게 밀실히 지탱하고 머리끝부터 뒤꿈치까지 일직선의 전신 수평 정렬을 유지합니다.";
      stTip1 = hasBackPain
        ? "동작 내내 아랫배를 지면으로 강하게 지눌러서 허리 요추와 장판 매트 사이에 들뜸 공간이 없도록 고정하세요!"
        : "어깨 밑에 정확히 팔꿈치가 수직 배치가 되었는지 거울로 체크하세요.";
    } else {
      // Full body or lower body
      if (hasKneePain) {
        stEx1 = "힙 브릿지 아치 홀드 (Hip Bridge)";
        stDesc1 = "하늘을 보고 누운 상태에서 양 무릎을 세워 발바닥을 골반 너비로 대고, 엉덩이와 척추 하부를 위로 둥글게 들어 올립니다.";
        stTip1 = "무릎에 전단력이 발생하지 않아 통증이 없으며, 허벅지 뒤쪽 햄스트링과 넓은 둔근의 강력한 수축에 의존합니다.";
      }
    }

    exercises.push({
      id: `ex-${idx++}`,
      name: stEx1,
      type: "strength",
      duration: strengthDur1,
      targetIntensity: "12회씩 3세트 (중간 1분 휴식)",
      description: stDesc1,
      safetyTip: stTip1
    });

    // Strength Exercise 2
    let stEx2 = "와이드 슬로우 스쿼트";
    let stDesc2 = "발 너비를 가볍게 어깨보다 더 넓게 벌린 후 발가락 끝을 바깥 30도로 열어 고관절의 경첩(안전 힌지)을 우선 깊게 접어 내려갑니다.";
    let stTip2 = "허벅지 안쪽(내전근)과 둔근 전체 자극에 극대화되며, 깊숙이 내려갈 때 무릎 중심선이 안으로 비틀리는 현상을 막으세요.";

    if (focusArea === "core") {
      stEx2 = "러시안 트위스트 (Russian Twist)";
      stDesc2 = "바닥에 상체를 45도 뒤로 비스듬히 기울인 뒤 어깨와 갈비뼈 몸통 전체를 좌우로 회전하여 복부 측면 복사근을 단련합니다.";
      stTip2 = hasBackPain
        ? "허리가 둥글게 굽어지면 추간판 부하가 오므로 척추를 완전히 가슴과 곧게 펴고 몸통 가동각도를 반으로 줄이세요."
        : "호흡을 멈추지 마시고 몸을 회전할 때 후-후- 규칙적으로 뱉어줍니다.";
    } else if (focusArea === "upper_body" || equipment.includes("dumbbells")) {
      stEx2 = equipment.includes("dumbbells") ? "덤벨 스탠딩 숄더 이완" : "W-Y 숄더 서포트 스트레칭";
      stDesc2 = equipment.includes("dumbbells")
        ? "아령 가벼운 무게를 쥐고 어깨 선상까지 위로 천천히 수직 프레스하며 상체 삼각근을 정교하게 자극합니다."
        : "등 벽에 기대어 날개뼈를 등 뒤로 완전 조여 내리며(W 자세) 다시 위로 뻗어(Y 자세) 굽은 등과 견갑을 펴주는 정밀 가이드 기법입니다.";
      stTip2 = "어깨 관절에 잡음이 나거나 충돌을 느낀다면 가슴 앞쪽으로 프레스하는 덤벨 체스트 프레스로 전환해 보십시오.";
    }

    exercises.push({
      id: `ex-${idx++}`,
      name: stEx2,
      type: "strength",
      duration: strengthDur2,
      targetIntensity: "10회씩 3세트 연속 수행",
      description: stDesc2,
      safetyTip: stTip2
    });

    // Phase 4: Cooldown
    exercises.push({
      id: `ex-${idx++}`,
      name: "피로 회복 전신 점진적 이완 스트레칭",
      type: "cooldown",
      duration: cooldown,
      targetIntensity: "충분히 호흡하며 길게 지탱",
      description: "허벅지 뒤쪽, 엉덩이, 옆구리 등 전신 근육 다발을 지긋이 15초 이상 멈추어 늘려 관절 긴장도를 정상으로 회복시킵니다.",
      safetyTip: "반동(바운스)을 절대 가하지 마시고, 끝까지 고요하게 코로 깊이 마시고 입으로 길게 뱉으며 심박을 자연스럽게 가라앉히세요."
    });

    return {
      title: `${hasKneePain || hasBackPain ? '관절 안전 최우선' : '맞춤 설계형'} 60분 전신 통합 순환 루틴`,
      totalDuration: 60,
      summary: `분석 결과, 현재 회원님은 ${experience === 'beginner' ? '체계적인 체력 증진이 요구되는 소중한 초보자' : '일정 운동 가이드 적응이 완료된 중우수'} 타겟으로 오늘 ${focusArea === 'full_body' ? '전체 전신' : focusArea}의 활력을 복구하기 위해 딱 1시간 효율로 운동이 수립되었습니다. 특히 ${painAreas.length > 0 ? painAreas.join(', ') + ' 부위 관절 스트레스 차단 방벽' : '기초 골근격계 부하가 완만히 조절'}된 것이 안전 설계의 특징입니다. 안심하고 안전하게 60분간 진행해보세요.`,
      warmupMinutes: warmup,
      cardioMinutes: cardio,
      strengthMinutes: strength,
      cooldownMinutes: cooldown,
      exercises,
      precautions: [
        "절대 무리한 관절 각도까지 무리해서 억지로 동작하지 마시고, 불편함을 인지하면 대체 자세 요령을 즉각 적극 수용하세요.",
        "수분 보충을 위해 한 모금씩 상시 음용하시고, 전신 통증이나 두통이 올 경우 즉시 루틴 timer를 pause하고 휴식하십시오.",
        "특히 관절 통증부위 주변은 정렬 유지를 위해 매번 올바른 지점을 거울로 눈맞춰가며 연습합니다."
      ]
    };
  };

  const handleCreateRoutine = async (condition: UserCondition) => {
    setIsLoading(true);
    setApiError(null);
    setCurrentUserWeight(condition.weight);

    try {
      const res = await fetch("/api/routine/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(condition),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "API_KEY_MISSING") {
          // Present custom informational notice, then generate a beautiful live local fallback program
          setApiError({
            type: "API_KEY_MISSING",
            message: "Gemini API 키가 아직 Secret으로 등록되지 않아, 대신 기기의 내장 스포츠 처방 엔진을 가동해 '100% 매칭형 즉석 실내 60분 루틴'을 한도 없이 작성해 드립니다!",
            mode: "info"
          });
          const localFallback = generateFallbackClientRoutine(condition);
          setSelectedRoutine(localFallback);
        } else {
          throw new Error(data.message || "An unexpected error occurred during AI generation");
        }
      } else {
        setSelectedRoutine(data);
        setApiError(null);
      }
    } catch (err: any) {
      console.error(err);
      setApiError({
        type: "GENERATION_ERROR",
        message: "AI 서버 호출 도중 실패했습니다. 기기 가용 연산 매트릭으로 '맞춤형 오프라인 1시간 케어 루틴'을 생성 완료했습니다.",
        mode: "info"
      });
      const localFallback = generateFallbackClientRoutine(condition);
      setSelectedRoutine(localFallback);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 font-sans">
      
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 py-5 px-6 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xs">
              P
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                <span>PulseMind</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.5 rounded-full">AI Studio Build</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">60분 건강 루틴 설계 & 진행 지표 대시보드</p>
            </div>
          </div>
          
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => { setSelectedRoutine(null); setCurrentTab("generate"); }}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === "generate" && !selectedRoutine
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>루틴 설계</span>
            </button>
            <button
              onClick={() => { setSelectedRoutine(null); setCurrentTab("charts"); }}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === "charts"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
              <span>진행 경향 시각화</span>
            </button>
            <button
              onClick={() => { setSelectedRoutine(null); setCurrentTab("history"); }}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === "history"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <History className="w-3.5 h-3.5 text-emerald-500" />
              <span>히스토리 일지 ({records.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 pb-20">
        
        {/* Persistent Informational banners for clean instructions */}
        <AnimatePresence>
          {apiError && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
                apiError.mode === "error" 
                  ? "bg-red-50 border-red-100 text-red-800" 
                  : "bg-indigo-50/50 border-indigo-100 text-indigo-950"
              }`}>
                <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <span>{apiError.type === "API_KEY_MISSING" ? "알림: 내장 안전 스포츠 처방 엔진 대체가동" : "네트워크 상태 알림"}</span>
                  </p>
                  <p className="opacity-90">{apiError.message}</p>
                </div>
                <button 
                  onClick={() => setApiError(null)}
                  className="p-1 hover:bg-slate-200/40 rounded-lg text-slate-500 hover:text-slate-800 ml-auto cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Daily Active Routine Screen OR Main Tab Container list */}
        {selectedRoutine ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
            <div className="border-b border-slate-200 pb-5 mb-5">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">
                Active Routine Trainer
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mt-3 tracking-tight">{selectedRoutine.title}</h2>
              <p className="text-xs text-slate-400 mt-1 lines-clamp-2 md:lines-clamp-none leading-relaxed">{selectedRoutine.summary}</p>
            </div>
            
            <ActiveRoutine 
              routine={selectedRoutine} 
              userWeight={currentUserWeight}
              onClose={() => setSelectedRoutine(null)}
              onSaveRecord={handleSaveWorkoutRecord}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {currentTab === "generate" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Form Input Block */}
                <div className="lg:col-span-8">
                  <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2 font-sans">
                    <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
                    <span>개인 신체 조건 기반 60분 건강 기획 </span>
                  </h3>
                  <WorkoutForm onSubmit={handleCreateRoutine} isLoading={isLoading} />
                </div>

                {/* Nice Informational sidecard to balance space */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-xs space-y-4">
                    <h4 className="font-bold text-sm tracking-tight text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Dumbbell className="w-4 h-4 text-indigo-600" />
                      <span>과학적 1시간 트레이닝 메커니즘</span>
                    </h4>
                    
                    <p className="text-slate-500 leading-relaxed">
                      본 프로그램은 임상 스포츠과학 생체 밸런스를 준용합니다. 입력한 신체 능력과 오늘의 통증 요소를 종합 진단해 안전 비율로 분화합니다.
                    </p>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center text-[11px] font-medium">
                        <span className="text-slate-700 font-bold">1단계 준비운동 (5-10m)</span>
                        <span className="text-indigo-600 font-bold">교감 자극</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-medium">
                        <span className="text-slate-700 font-bold">2단계 유산소 루틴 (15-25m)</span>
                        <span className="text-indigo-600 font-bold">지표 심폐</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-medium">
                        <span className="text-slate-700 font-bold">3단계 저항 근육운동 (20-30m)</span>
                        <span className="text-indigo-600 font-bold">골근격</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-medium">
                        <span className="text-slate-700 font-bold">4단계 정리 정돈 (5-10m)</span>
                        <span className="text-indigo-600 font-bold">요산 이완</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-indigo-700 bg-indigo-50/50 rounded-xl p-3 text-center leading-relaxed font-medium">
                      💡 통증 부위가 있으신가요? AI가 부상 위험도가 높은 자세들을 자동으로 원천 봉쇄해 드립니다.
                    </p>
                  </div>

                  {/* High Quality Launch banner */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-xs space-y-3">
                    <h4 className="font-bold text-slate-800">훈련 히스토리 최근 통계</h4>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xl font-bold text-indigo-600 font-sans">{records.length}</p>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">누적 로그 횟수</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xl font-bold text-slate-900 font-sans">
                          {records.reduce((sum, r) => sum + r.calories, 0)}
                        </p>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">누적 칼로리 kcal</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentTab("charts")}
                      className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all block text-center cursor-pointer"
                    >
                      상세 차트 대시보드 열기
                    </button>
                  </div>
                </div>

              </div>
            )}

            {currentTab === "charts" && (
              <div>
                <div className="mb-4">
                  <h3 className="text-base font-bold text-slate-800">퍼포먼스 진척 진단 시각화</h3>
                  <p className="text-xs text-slate-500 mt-0.5">최근 수행 일지 결과를 반응형 실시간 리차트(Recharts) 데이터 그래프로 한눈에 진척도를 점검하십시오.</p>
                </div>
                <WorkoutCharts records={records} />
              </div>
            )}

            {currentTab === "history" && (
              <HistoryList 
                records={records} 
                onDeleteRecord={handleDeleteRecord} 
                onClearAll={handleClearAllRecords}
                onAddManualRecord={handleAddManualRecord}
                userWeight={currentUserWeight}
              />
            )}
          </div>
        )}

      </main>

      {/* Persistent Footer */}
      <footer className="bg-white border-t border-slate-100 py-4 px-6 text-center text-[10px] text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-1.5 font-medium">
          <p>© 2026 AI 1시간 유산소 & 근육운동 처방전 일지. All Rights Reserved.</p>
          <p className="flex items-center gap-1 justify-center md:justify-end text-slate-300">
            <span>본 앱은 AI Studio 빌드 엔진 하에 최적화 설계되었습니다.</span>
          </p>
        </div>
      </footer>

    </div>
  );
}
