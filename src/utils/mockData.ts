import { WorkoutRecord } from "../types";

export const PRESEEDED_RECORDS: WorkoutRecord[] = [
  {
    id: "rec-1",
    date: "2026-06-05",
    routineTitle: "체지방 적극 연소를 위한 60분 전신 순환 루틴",
    plannedDuration: 60,
    completedDuration: 60,
    rating: 5,
    calories: 420,
    todayCondition: "excellent",
    completedExercises: ["가벼운 조깅", "점핑클라이머", "슬로우 버피", "덤벨 스쿼트", "전신 하프 플랭크", "정리 스트레칭"],
    notes: "매우 개운하고 컨디션 최고! 온몸에 땀이 흠뻑 나서 보람찬 하루였음."
  },
  {
    id: "rec-2",
    date: "2026-06-06",
    routineTitle: "피로 회복 목적의 60분 가벼운 하체 중심 밴드 루틴",
    plannedDuration: 60,
    completedDuration: 45,
    rating: 4,
    calories: 210,
    todayCondition: "tired",
    completedExercises: ["어깨 및 손목 웜업", "가만히 서서 제자리 걷기", "저항 밴드 클램쉘", "월 스쿼트 가늘게 홀딩", "폼롤러 허벅지 이완"],
    notes: "퇴근하고 너무 피곤했지만, 추천해준 가벼운 루틴 덕분에 무리하지 않고 스트레칭 위주로 완료했다. 몸이 한결 가벼워짐."
  },
  {
    id: "rec-3",
    date: "2026-06-07",
    routineTitle: "무릎 관절 보호용 60분 코어 집중 교정 루틴",
    plannedDuration: 60,
    completedDuration: 55,
    rating: 4,
    calories: 280,
    todayCondition: "pain",
    completedExercises: ["고관절 회전 격려 웜업", "암 워킹 (무릎 접지)", "버드독 코어 밸런스", "브릿지 홀드", "누워서 자전거 타기", "장요근 정적 스트레칭"],
    notes: "평소 무릎 통증이 걱정스러웠는데 관절에 저충격 자극만 주는 맞춤 루틴이 나와서 참 좋았다. 끝까지 골반 수평 유지하며 수행함."
  },
  {
    id: "rec-4",
    date: "2026-06-09",
    routineTitle: "상체 강화 중심 60분 파워 스트렝스 루틴",
    plannedDuration: 60,
    completedDuration: 60,
    rating: 5,
    calories: 390,
    todayCondition: "normal",
    completedExercises: ["가벼운 어깨 가동성 서클", "섀도우 복싱 웜업", "덤벨 숄더 프레스", "벤트오버 덤벨 로우", "푸시업 플랭크", "가슴 스트레칭"],
    notes: "덤벨을 활용한 상체 집중 운동이었다. 트레이너의 대체동작 설명 덕에 올바른 자세로 자극을 강하게 느꼈음."
  },
  {
    id: "rec-5",
    date: "2026-06-10",
    routineTitle: "지구력 한계 극복 60분 고강도 인터벌 루틴",
    plannedDuration: 60,
    completedDuration: 60,
    rating: 5,
    calories: 490,
    todayCondition: "excellent",
    completedExercises: ["동적 사이드 스텝 웜업", "고강도 버피 테스트", "마운틴 클라이머 스피디", "맨몸 점프 스쿼트", "푸시업 앤 탭", "온몸 전신 코브라 스태틱"],
    notes: "컨디션 최상이라 강도 높게 달려보았다. 칼로리 연소가 극대화되어 엄청 짜릿하게 운동 완료!"
  }
];

// Helper to calculate estimated calories based on intensity metrics
export function estimateCalories(
  weight: number,
  durationMin: number,
  experience: 'beginner' | 'intermediate' | 'advanced',
  goal: 'muscle_gain' | 'fat_loss' | 'stamina' | 'rehab_posture',
  condition: 'excellent' | 'normal' | 'tired' | 'pain'
): number {
  // Simple scientific MET based estimation model
  let baseMET = 5.0; // moderate cardio + light strength average
  
  if (goal === 'fat_loss' || goal === 'stamina') {
    baseMET += 1.5;
  } else if (goal === 'rehab_posture') {
    baseMET -= 1.5;
  }

  if (experience === 'advanced') {
    baseMET += 1.0;
  } else if (experience === 'beginner') {
    baseMET -= 0.5;
  }

  if (condition === 'excellent') {
    baseMET += 0.5;
  } else if (condition === 'tired') {
    baseMET -= 1.0;
  }

  // Formula: kcal = MET * 3.5 * weightKg / 200 * durationMin
  const kcal = baseMET * 3.5 * weight * durationMin / 200;
  return Math.round(kcal);
}
