import React, { useState, useEffect, useRef } from "react";
import { WorkoutRoutine, ExerciseItem, WorkoutRecord } from "../types";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  ChevronRight, 
  Award, 
  ArrowLeft, 
  Smile, 
  ShieldAlert, 
  Timer, 
  Flame, 
  SkipForward, 
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import PostureVideoLab from "./PostureVideoLab";

type ExerciseCategory = 'squat' | 'plank' | 'pushup' | 'dumbbell' | 'cardio' | 'bridge' | 'stretch' | 'default';

const VIDEO_URLS: Record<ExerciseCategory, string> = {
  squat: "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c05d00db0b472ae0755a40b9003b50c6&profile_id=139&oauth2_token_id=57447761",
  plank: "https://player.vimeo.com/external/434045526.sd.mp4?s=c27db23ede4caacffd36ce4ebd19c054dc7abeee&profile_id=139&oauth2_token_id=57447761",
  pushup: "https://player.vimeo.com/external/435674703.sd.mp4?s=7fbf9303d8aa536b567d266e744ec1c54b0c793f&profile_id=139&oauth2_token_id=57447761",
  dumbbell: "https://player.vimeo.com/external/517652701.sd.mp4?s=346da245a44cd6eefdcb62a1ab01fc1ca0f4cb6e&profile_id=139&oauth2_token_id=57447761",
  cardio: "https://player.vimeo.com/external/355912443.sd.mp4?s=2d50697ad92ee90b0e3eed22df9360822184e27f&profile_id=139&oauth2_token_id=57447761",
  bridge: "https://player.vimeo.com/external/540051151.sd.mp4?s=bd44bf9146dfd8eebe98ea24bdc3fafe3e86da91&profile_id=139&oauth2_token_id=57447761",
  stretch: "https://player.vimeo.com/external/430642939.sd.mp4?s=6a2006a1a1dbde8ca2acda74be8bc5e18ef4fb61&profile_id=139&oauth2_token_id=57447761",
  default: "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c05d00db0b472ae0755a40b9003b50c6&profile_id=139&oauth2_token_id=57447761"
};

const getExerciseCategory = (name: string, type: string): ExerciseCategory => {
  const n = name.toLowerCase();
  const t = type.toLowerCase();
  
  if (n.includes("스쿼트") || n.includes("squat") || n.includes("런지") || n.includes("lunge") || n.includes("하체")) {
    return "squat";
  }
  if (n.includes("플랭크") || n.includes("plank") || n.includes("트위스트") || n.includes("twist") || n.includes("데드버그") || n.includes("버드독") || n.includes("core") || n.includes("코어")) {
    return "plank";
  }
  if (n.includes("푸쉬업") || n.includes("push") || n.includes("팔굽혀") || n.includes("프레스") || n.includes("가슴") || n.includes("어깨") || n.includes("shouler")) {
    return "pushup";
  }
  if (n.includes("덤벨") || n.includes("아령") || n.includes("컬") || n.includes("curl") || n.includes("삼두") || n.includes("이두") || n.includes("lift") || n.includes("레이즈") || n.includes("raise")) {
    return "dumbbell";
  }
  if (n.includes("버피") || n.includes("burpee") || n.includes("스텝") || n.includes("step") || n.includes("달리기") || n.includes("러닝") || t === "cardio") {
    return "cardio";
  }
  if (n.includes("브릿지") || n.includes("bridge") || n.includes("힙")) {
    return "bridge";
  }
  if (n.includes("스트레칭") || n.includes("stretch") || n.includes("요가") || n.includes("회전") || n.includes("서클") || t === "warmup" || t === "cooldown") {
    return "stretch";
  }
  return "default";
};

interface ActiveRoutineProps {
  routine: WorkoutRoutine;
  onClose: () => void;
  onSaveRecord: (record: WorkoutRecord) => void;
  userWeight: number; // to compute scientific custom calories
}

export default function ActiveRoutine({ routine, onClose, onSaveRecord, userWeight }: ActiveRoutineProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isCompleted, setIsCompleted] = useState(false);
  const [fastMode, setFastMode] = useState(false); // 10x speed booster for testing

  // State to track completed exercises
  const [exerciseStatus, setExerciseStatus] = useState<Record<string, 'todo' | 'done'>>({});

  // Session stats for logging
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState("");
  const [actualDuration, setActualDuration] = useState(60);

  const currentExercise = routine.exercises[currentIdx];
  const timerRef = useRef<any>(null);

  // Initialize status map
  useEffect(() => {
    const freshStatus: Record<string, 'todo' | 'done'> = {};
    routine.exercises.forEach(ex => {
      freshStatus[ex.id] = 'todo';
    });
    setExerciseStatus(freshStatus);
    setCurrentIdx(0);
    setIsPlaying(false);
    setIsCompleted(false);
  }, [routine]);

  // Handle current exercise timer load
  useEffect(() => {
    if (currentExercise) {
      setTimeLeft(currentExercise.duration * 60);
      setIsPlaying(false);
    }
  }, [currentIdx, currentExercise]);

  // Main countdown timer ticked
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const scaleSpeed = fastMode ? 50 : 1000; // 50ms instead of 1000ms if fast mode is active
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, scaleSpeed);
    } else if (timeLeft === 0 && isPlaying) {
      handleExerciseFinished();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, timeLeft, fastMode]);

  const handleExerciseFinished = () => {
    setIsPlaying(false);
    setExerciseStatus(prev => ({ ...prev, [currentExercise.id]: 'done' }));

    // Auto audio alert (using web audio api to avoid iframe asset restrictions)
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.value = 880; // A5 pitch
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.warn("Audio Context alert blocked or unsupported:", e);
    }

    // Go to next exercise if has more
    if (currentIdx < routine.exercises.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const skipCurrentExercise = () => {
    setExerciseStatus(prev => ({ ...prev, [currentExercise.id]: 'done' }));
    if (currentIdx < routine.exercises.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleFinishRoutineEarly = () => {
    const confirmFinish = window.confirm("아직 남은 시간과 운동이 있습니다. 지금 루틴을 완료하고 오늘의 운동 기록으로 저장하시겠습니까?");
    if (confirmFinish) {
      // mark remaining as done as well just for ease or keep as todo
      const updated = { ...exerciseStatus };
      for (let i = currentIdx; i < routine.exercises.length; i++) {
        updated[routine.exercises[i].id] = 'done';
      }
      setExerciseStatus(updated);
      setIsCompleted(true);
    }
  };

  const saveWorkoutLog = () => {
    // calculate estimated calories based on active minutes
    // Base calories factor roughly 5-8 kcal per minute based on weight
    const intensityWeightKcal = Math.round(userWeight * 0.08 * actualDuration * (rating / 4.5));
    
    const record: WorkoutRecord = {
      id: "rec-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      routineTitle: routine.title,
      plannedDuration: routine.totalDuration,
      completedDuration: actualDuration,
      rating,
      calories: Math.max(80, intensityWeightKcal),
      todayCondition: "normal",
      completedExercises: routine.exercises
        .filter(ex => exerciseStatus[ex.id] === 'done')
        .map(ex => ex.name),
      notes: notes.trim() || `${routine.title}을 기분 좋게 완료했습니다.`
    };

    onSaveRecord(record);
  };

  // Timer helpers
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = (type: string) => {
    switch (type) {
      case 'warmup': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'cardio': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'strength': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'cooldown': return 'bg-pink-50 text-pink-700 border-pink-100';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getPhaseName = (type: string) => {
    switch (type) {
      case 'warmup': return '준비 운동 (Warm-up)';
      case 'cardio': return '유산소 루틴 (Cardio)';
      case 'strength': return '스트렝스 근육운동 (Strength)';
      case 'cooldown': return '정리 운동 (Cool-down)';
      default: return '트레이닝';
    }
  };

  return (
    <div className="space-y-6">
      {/* Back to selector button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors bg-white hover:bg-slate-50 px-3 py-1.5 border border-slate-100 rounded-lg cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>다른 조건으로 재처방 받기</span>
        </button>
        <div className="flex items-center gap-2">
          {/* Fast mode toggler */}
          <button
            onClick={() => setFastMode(!fastMode)}
            className={`text-[10px] px-2 py-1 rounded-md font-semibold select-none flex items-center gap-1 transition-all border ${
              fastMode 
                ? "bg-indigo-600 text-white border-indigo-600 animate-pulse" 
                : "bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600"
            }`}
            title="10배 빠른 속도로 타이머를 테스트해볼 수 있는 검증용 편의 스위치입니다."
          >
            <Timer className="w-3 h-3" />
            <span>테스트 가속 {fastMode ? "ON (50배속)" : "OFF"}</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isCompleted ? (
          <motion.div
            key="active-session"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left: Interactive exercise counter & details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 text-white rounded-3xl shadow-sm overflow-hidden p-6 md:p-8 flex flex-col justify-between min-h-[460px] border border-slate-800" id="session-timer-board">
                
                {/* Header line info */}
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-indigo-300 uppercase bg-indigo-500/20 border border-indigo-400/20 px-2 py-0.5 rounded">
                        {getPhaseName(currentExercise.type)}
                      </span>
                      <h2 className="text-2xl font-bold tracking-tight text-white mt-2 font-sans leading-tight">
                        {currentExercise.name}
                      </h2>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-slate-300 font-mono">
                        {currentIdx + 1}
                      </span>
                      <span className="text-xs text-slate-500 font-medium"> / {routine.exercises.length}</span>
                    </div>
                  </div>

                  {/* Sub exercise guideline */}
                  <div className="space-y-4 my-6">
                    <div className="bg-slate-850 rounded-xl p-4 border border-slate-800">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">트레이닝 목표치</p>
                      <p className="text-sm font-semibold text-indigo-200">{currentExercise.targetIntensity}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-slate-300 text-xs leading-relaxed">
                        {currentExercise.description}
                      </p>
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex gap-2.5 items-start">
                        <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-indigo-400">관절 및 신체 안전수칙</p>
                          <p className="text-[11px] text-indigo-100/90 leading-relaxed mt-0.5">{currentExercise.safetyTip}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Huge Timer Screen */}
                <div className="my-8 flex flex-col items-center justify-center">
                  <div className="text-6xl md:text-7xl font-extrabold tracking-widest text-white font-mono bg-slate-950/40 px-8 py-5 border border-slate-700/30 rounded-2xl shadow-inner min-w-[240px] text-center">
                    {formatTime(timeLeft)}
                  </div>
                  {/* Visual completion bar */}
                  <div className="w-full max-w-[240px] bg-slate-700/60 h-1.5 rounded-full overflow-hidden mt-4">
                    <div 
                      className="bg-indigo-400 h-full transition-all duration-300" 
                      style={{ width: `${Math.min(100, Math.max(0, (timeLeft / (currentExercise.duration * 60)) * 100))}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action operations bar */}
                <div className="flex justify-between items-center gap-3 pt-4 border-t border-slate-800">
                  <button
                    onClick={handleFinishRoutineEarly}
                    className="px-4 py-2.5 rounded-lg border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-all cursor-pointer"
                  >
                    기록 저장 후 종료
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setTimeLeft(currentExercise.duration * 60); setIsPlaying(false); }}
                      className="p-3 bg-slate-850 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors cursor-pointer"
                      title="타이머 초기화"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`px-8 py-3 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg ${
                        isPlaying 
                          ? "bg-slate-100 hover:bg-white text-slate-900 shadow-white/5" 
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-5 h-5" />
                          <span>일시정지</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 fill-current" />
                          <span>타이머 시작</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={skipCurrentExercise}
                      className="p-3 bg-slate-850 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors cursor-pointer"
                      title="이 운동 완료 및 다음"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Real-time AI Posture, Tutorial & Video Lab */}
              <PostureVideoLab exercise={currentExercise} />
            </div>

            {/* Right: Routine overview pipeline breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-1 font-sans">{routine.title}</h3>
                <p className="text-xs text-slate-400 mb-4">{routine.summary}</p>
                
                {/* Visual duration distribution slider */}
                <div className="bg-slate-50 rounded-xl p-3 mb-5 border border-slate-100 grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div className="p-1 rounded bg-teal-500/5 text-teal-600">
                    <p className="font-bold font-mono text-sm">{routine.warmupMinutes}m</p>
                    <p className="text-[9px] font-semibold">준비운동</p>
                  </div>
                  <div className="p-1 rounded bg-indigo-500/5 text-indigo-600">
                    <p className="font-bold font-mono text-sm">{routine.cardioMinutes}m</p>
                    <p className="text-[9px] font-semibold">유산소</p>
                  </div>
                  <div className="p-1 rounded bg-purple-500/5 text-purple-600">
                    <p className="font-bold font-mono text-sm">{routine.strengthMinutes}m</p>
                    <p className="text-[9px] font-semibold">근근력</p>
                  </div>
                  <div className="p-1 rounded bg-pink-500/5 text-pink-600">
                    <p className="font-bold font-mono text-sm">{routine.cooldownMinutes}m</p>
                    <p className="text-[9px] font-semibold">정리운동</p>
                  </div>
                </div>

                {/* Vertical Exercises steps */}
                <div className="space-y-2 max-h-[310px] overflow-y-auto pr-1">
                  {routine.exercises.map((item, i) => {
                    const isPassed = i < currentIdx;
                    const isNow = i === currentIdx;
                    const status = exerciseStatus[item.id];
                    const category = getExerciseCategory(item.name, item.type);
                    
                    return (
                      <div
                        key={item.id}
                        onClick={() => setCurrentIdx(i)}
                        className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                          isNow 
                            ? "bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-200/20 shadow-xs" 
                            : isPassed
                              ? "bg-slate-50 border-slate-100 opacity-65"
                              : "bg-white border-slate-100"
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center justify-center shrink-0">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold font-sans ${
                              isNow
                                ? "bg-indigo-600 text-white"
                                : isPassed || status === 'done'
                                  ? "bg-slate-300 text-white"
                                  : "bg-slate-100 text-slate-400 border border-slate-200"
                            }`}>
                              {status === 'done' || isPassed ? "✓" : i + 1}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-center gap-1">
                              <h4 className={`text-xs font-bold truncate ${isNow ? "text-indigo-900" : "text-slate-700"}`}>
                                {item.name}
                              </h4>
                              <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-150 px-1.5 py-0.5 rounded">
                                {item.duration}분
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.targetIntensity}</p>
                          </div>
                        </div>

                        {/* Expandable video demo right below the clicked buttons */}
                        <AnimatePresence>
                          {isNow && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="relative rounded-lg overflow-hidden bg-slate-950 border border-slate-200 shadow-xs aspect-video mt-1">
                                <video
                                  src={VIDEO_URLS[category]}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2 bg-black/75 px-1.5 py-0.5 rounded text-[8px] font-mono text-red-400 font-bold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                                  <span>실시간 시범 루프</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total details bar */}
              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>합계 소요시간</span>
                <span className="font-bold text-slate-800 font-mono text-sm">{routine.totalDuration}분 (정확히 1시간)</span>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Routine Completed congratulatory view */
          <motion.div
            key="congratulations"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl mx-auto bg-white rounded-3xl border border-slate-250 overflow-hidden shadow-xs"
          >
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-8 text-center text-white relative">
              <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">
                Workout Complete
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white animate-bounce" />
              </div>
              <h2 className="text-xl font-bold mb-2 font-sans">오늘의 운동 대단히 수고하셨습니다!</h2>
              <p className="text-white/80 text-xs leading-relaxed max-w-sm mx-auto font-medium">
                몸 상태에 맞춘 60분 간의 전문 트레이닝 코스를 멋지게 끝마치셨네요. 기록 일지를 작성해보세요!
              </p>
            </div>

            <div className="p-6 md:p-8 space-y-5">
              {/* Actual completed minutes customizer */}
              <div>
                <label className="block text-slate-700 text-xs font-bold uppercase mb-1.5">실제 완수 시간 (분)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={5}
                    max={120}
                    value={actualDuration}
                    onChange={(e) => setActualDuration(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-sm font-bold font-mono shrink-0 bg-slate-100 px-3 py-1.5 rounded-lg text-slate-700">
                    {actualDuration}분
                  </span>
                </div>
              </div>

              {/* Intensity feeling rating index */}
              <div>
                <label className="block text-slate-700 text-xs font-bold uppercase mb-2">운동 강도 만족도</label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => setRating(stars)}
                      className="p-1 focus:outline-none focus:scale-110 transition-all cursor-pointer"
                    >
                      <Smile 
                        className={`w-8 h-8 transition-transform ${
                          rating >= stars 
                            ? "text-indigo-600 fill-indigo-100" 
                            : "text-slate-200"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-1.5 font-medium">
                  {rating === 1 && "너무 힘들어 힘들었습니다"}
                  {rating === 2 && "동작 수행이 다소 매끄럽지 못했습니다"}
                  {rating === 3 && "일반적이고 무난히 따라할 만했습니다"}
                  {rating === 4 && "적절한 타격 자극과 가속감을 느꼈습니다"}
                  {rating === 5 && "관절에 무리 없이 완벽하고 뿌듯합니다!"}
                </p>
              </div>

              {/* Personal notes */}
              <div>
                <label className="block text-slate-700 text-xs font-bold uppercase mb-1.5">오늘의 운동 일지 / 피드백 메모</label>
                <textarea
                  placeholder="예: 허리 아픈 동작 없이 안전하게 운동할 수 있어서 좋았습니다. 다음에도 어깨 가동성을 늘리는 운동 위주로 받아보고 싶어요!"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-24 p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-xs leading-relaxed text-slate-700 bg-slate-50/50"
                />
              </div>

              {/* Completed exercises list */}
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase mb-1.5">기록될 완료 운동 목록</p>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                  {routine.exercises.map((ex) => {
                    const isDone = exerciseStatus[ex.id] === 'done';
                    return (
                      <span 
                        key={ex.id}
                        className={`text-[10px] px-2 py-1 rounded-md border inline-flex items-center gap-1 ${
                          isDone 
                            ? "bg-green-50 text-green-700 border-green-200 font-medium" 
                            : "bg-slate-50 text-slate-400 border-slate-100"
                        }`}
                      >
                        <CheckCircle className={`w-3 h-3 ${isDone ? "text-green-500" : "text-slate-300"}`} />
                        <span>{ex.name}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Submit / Cancel logs button */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 border border-slate-200 text-slate-500 rounded-xl font-semibold hover:bg-slate-50 text-xs transition-colors cursor-pointer"
                >
                  기록 취소하고 닫기
                </button>
                <button
                  onClick={saveWorkoutLog}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Flame className="w-4 h-4 fill-current animate-pulse" />
                  <span>일지에 운동 저장하기</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
