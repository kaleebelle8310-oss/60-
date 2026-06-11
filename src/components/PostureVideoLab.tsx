import React, { useState, useEffect, useRef } from "react";
import { ExerciseItem } from "../types";
import { 
  Play, 
  Pause, 
  Activity, 
  ShieldAlert, 
  Lightbulb, 
  Info,
  ExternalLink,
  Flame,
  CheckCircle2,
  Tv2,
  Sliders,
  Sparkles,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PostureVideoLabProps {
  exercise: ExerciseItem;
}

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

export default function PostureVideoLab({ exercise }: PostureVideoLabProps) {
  const [activeTab, setActiveTab] = useState<"visual" | "spec">("visual");
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(1.0); // 0.5, 1.0, 1.5
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [timeCounter, setTimeCounter] = useState(0);
  const [viewMode, setViewMode] = useState<"vector" | "video">("video");

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // When clicking an exercise list button (switching exercise), reset mode to showing video play directly
  useEffect(() => {
    setViewMode("video");
    setIsPlaying(true);
  }, [exercise.id]);

  // Keep video playback speed updated in sync with user select range
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed, viewMode, exercise.id]);

  // Sync isPlaying switch with video play/pause
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, viewMode, exercise.id]);

  // Biomechanical animation cycle
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      if (isPlaying) {
        const delta = (now - lastTime) / 1000;
        // Increment time based on delta, speed multiplier, and normalization constant
        setTimeCounter(prev => (prev + delta * 2.5 * speed) % (Math.PI * 2));
      }
      lastTime = now;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isPlaying, speed]);

  // Keyword-based exercise category detector
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

  const category = getExerciseCategory(exercise.name, exercise.type);

  // Hardcoded curated expert guides for common movements to maximize precision
  const getExpertContent = (name: string, cat: ExerciseCategory) => {
    const defaultData = {
      descriptionSteps: [
        "지면에 올바르게 정렬하여 부상을 방지하고 타겟 근육의 긴장감을 인지합니다.",
        "천천히 호흡을 고르게 분배하며 원하는 자극 지점을 머릿속으로 시각화합니다.",
        "속도보다는 정확한 자세 제어를 목적으로 왕복 리듬을 고요하게 통제해 줍니다."
      ],
      safetyPoints: [
        exercise.safetyTip || "동작 시 관절에 찌릿한 격통이 감지되면 즉시 가동 범위를 반으로 낮추거나 멈추세요.",
        "허리와 목이 심하게 과신전 또는 라운딩 현상이 오지 않도록 척추 중립을 수립합니다."
      ],
      proTips: [
        "세트 사이 규칙적으로 물 한 모금씩 상시 섭취하여 순환 대사를 윤활하게 흐르게 합니다.",
        "수축 가동 최대범위 지점에서 약 1초간 호흡을 참으며 마인드 머슬 커넥션을 끌어올리세요."
      ],
      targetMuscles: "전신 근결합 네트워크 및 관절 안정군",
      angleLabel: "지면 정렬각"
    };

    const n = name.toLowerCase();

    if (cat === 'squat') {
      return {
        descriptionSteps: [
          "발을 어깨너비 또는 그보다 살짝 넓게 벌리고, 발끝은 15-30도 외측으로 부드럽게 열어 정렬합니다.",
          "골반 경첩(힙 힌지)을 뒤로 깊이 접어내리듯 엉덩이를 안착시키며 대퇴 쿼드가 평행이 될 때까지 무릎을 굽혀 수축합니다.",
          "뒷꿈치 뼈대에 단단히 중심축을 고정하고, 지면을 수직으로 강력하게 밀착 격파하며 원래 선 상태로 복원합니다."
        ],
        safetyPoints: [
          "무릎 관절이 안쪽으로 X자 붕괴가 되는 변형 압력을 원천 통제하세요. 발끝 방향으로 무릎 끝이 외장되도록 유도합니다.",
          "요추 부위가 구부정하게 아래로 흘러내리는 '벗윙크'가 우려되면 주저앉는 가동 깊이를 하프 포지션 수준으로 제한하세요."
        ],
        proTips: [
          "허벅지가 타오르는 하단 지점에서 가볍게 1.5초를 스태틱 안착 홀딩하면 둔근 속근섬유 활성도가 극대화됩니다.",
          "수축 시 복벽 전체에 70% 강도의 발살바 복압 벨트를 채워 척추 전체 관절 지탱 구조를 보완하세요."
        ],
        targetMuscles: "대퇴사두근 (허벅지 앞막), 대둔근 (엉덩이 힙), 햄스트링",
        angleLabel: "고관절 접힘각"
      };
    }

    if (cat === 'plank') {
      return {
        descriptionSteps: [
          "어깨 바로 하부에 수직 정렬로 팔꿈치를 90각 배치하고 매트 표면을 밀도가 높게 손목까지 완전 접지합니다.",
          "발바닥 앞코를 구두굽처럼 단단히 디디고 꼬리뼈부터 머리 꼭지선 전체를 완전 일직선 수평 축으로 세팅합니다.",
          "중력이 복부를 아래로 잡아당기는 힘에 반하여, 복벽을 시트처럼 위로 꽉 움켜쥐고 고정 호흡을 분배합니다."
        ],
        safetyPoints: [
          "골반이 지나치게 처져 허리가 활처럼 휘어질 경우 즉각 추간판에 수직 마찰이 옵니다. 즉시 엉덩이를 살짝 들고 홀딩하세요.",
          "어깨를 밑으로 둥글게 비틀며 귀 뒤쪽으로 말려 올라가지 않도록, 등 뒤 날개뼈를 세로축 하단으로 무겁게 내려놓습니다."
        ],
        proTips: [
          "단순히 초 세기 버티기가 아닌, 팔꿈치와 양쪽 발가락을 서로 배꼽 한가운데로 강력하게 끌어당기는 내압 마찰을 동반해야 코어가 극대화됩니다.",
          "호흡을 절대로 통으로 멈추지 마시고, 얇고 길게 날카로운 소리를 내며 갈비뼈 입출 구조를 통제하세요."
        ],
        targetMuscles: "복직근 (식스팩 코어), 복사근, 전거근 (갈비뼈 자극군)",
        angleLabel: "척추 수평각"
      };
    }

    if (cat === 'pushup') {
      return {
        descriptionSteps: [
          "손바닥 가슴 외측 라인에 어깨너비보다 1.5배 넓게 두며 손목 압력 분산을 위해 외회전 그립 토크를 걸어 땅을 움켜쥡니다.",
          "가슴 중심뼈가 손끝 가상의 가로막 통제선에 착륙하듯 팔꿈치를 외측 45도 후방 사각 방향으로 구부려 침강시킵니다.",
          "손바닥 전체로 매트 장판지를 옆으로 갈기갈기 찢어 벌린다는 가상의 모션 텐션으로 강하게 수직 리클라이닝 밀어냅니다."
        ],
        safetyPoints: [
          "겨드랑이 팔각도를 어깨선에 수평 정렬 일자가 되거나 90도 날개뼈를 들이받는 경우 충돌을 야기하므로 항상 팔 상완 각도를 후하방 45도로 고정해야 합니다.",
          "손목 관절에 꺾임 흉강 통증이 심한 환자는 푸쉬업 바 기구를 이용해 일자 손목을 수립하거나 무릎 지탱을 이용하십시오."
        ],
        proTips: [
          "밀어낼 때 등 가슴 근육의 수축 폭을 깊이 가져가기 위해 날개뼈가 지면 방향으로 솟구치지 않고 뒤판에서 넓게 펴지도록 평평한 등을 마지막에 달성합니다.",
          "내려갈 때 3초간 가슴 근육에 장력을 걸어 덤프 하강(버리는 하강)이 안 되게 주의하세요."
        ],
        targetMuscles: "대흉근 (가슴), 삼각근 전면 (어깨 앞), 상완삼두근 (팔 뒷군)",
        angleLabel: "팔꿈치 가동각"
      };
    }

    if (cat === 'dumbbell') {
      return {
        descriptionSteps: [
          "척추를 직립 기둥 형태로 세우고 발바닥 접지를 고르게 분배한 뒤, 중량 아령을 손바닥 외경에 꽉 차게 쥐어 정렬합니다.",
          "팔꿈치를 옆구리 안쪽 포켓 공간에 유격 없이 가볍게 고정한 뒤, 상완 자극에만 포커스를 두며 위로 정밀 회전 컬링합니다.",
          "올려친 최정점 자극 지점에서 이두 삼두의 자이언트 결을 인지한 뒤, 무겁게 브레이크 저항을 걸며 원래 위치로 하강 이완합니다."
        ],
        safetyPoints: [
          "무게 욕심에 허리의 반동(치팅)을 과도하게 주어 허릴 활 모양으로 튕기지 마십시오. 등뼈가 활처럼 비틀리면 요추 디스크 부하를 유발합니다.",
          "손목이 뒤로 툭 꺾인 상태로 덤벨 하중을 지탱하면 수근관 신경에 영구 가위 눌림 증상을 유발하니 일직선 주먹선을 유지합니다."
        ],
        proTips: [
          "덤벨을 감아 올릴 때 새끼손가락 측면 날을 천장 방향으로 약간 바깥 비틀기(외전) 회전력을 더하면 이두 안쪽 봉우리가 최대 수축됩니다.",
          "서서 통제가 힘들다면 의자 등받이에 등을 수용하는 시티드 덤벨 훈련으로 허리 반동 차단망을 설정하세요."
        ],
        targetMuscles: "상완이두근 (알통), 상완근, 전완굴근 (전팔 근막)",
        angleLabel: "상완 굴곡각"
      };
    }

    if (cat === 'cardio') {
      return {
        descriptionSteps: [
          "상체의 무게중심을 5도 정도 앞으로 숙여 가용 유연성을 주며, 양발을 지면 앞코 탄성을 십분 이용하여 사뿐하게 교차 작동합니다.",
          "팔은 옆구리를 무심하게 가르고 치는 러닝 스윙 진자를 그리며 코어 배꼽 중심 뒤틀림을 상반 상쇄시킵니다.",
          "발바닥 뒤꿈치의 충격 마찰이 수막으로 직결되지 않도록 앞꿈치를 먼저 연착륙 쿠션 서스펜션으로 씁니다."
        ],
        safetyPoints: [
          "무릎 마찰이나 발목 관찰 마모가 감지되면 제자리에서 뛰는 하이점프 동작을 즉각 중지하고, 발바닥을 바닥에서 떼지 않는 하프 워킹 보행으로 변환하십시오.",
          "착지 시 쿵-쿵 보행 타격을 크게 내면 하부 아랫층 층간 마모 스트레스는 물론 족저근막에 미세 염증을 자극하므로 무소음 사뿐 디딤을 완수합니다."
        ],
        proTips: [
          "일정한 주기로 마시고 뱉는 규칙적인 더블 흡기법 (습-습-후-후) 호흡 레벨링을 동기화하면 젖산 발생과 가쁜 호흡 정체를 사전에 차단합니다.",
          "지방 연소 효율을 최고 유도로 끌어올리기 위해 양팔을 크게 날갯짓하듯 고가용 반경으로 위아래 저항을 더하세요."
        ],
        targetMuscles: "심폐 지구력 서큘레이션, 대퇴 사두근, 가자미근 (칼로리 버스터)",
        angleLabel: "심박 동기페이스"
      };
    }

    if (cat === 'bridge') {
      return {
        descriptionSteps: [
          "바닥에 바로 누워 무릎을 세워 무릎 밑에 뒤꿈치가 정확히 수직 낙하 정렬을 이루도록 배치하고 손바닥을 골반 밑에 둡니다.",
          "허리 틈새의 여백을 매트에 짓눌러 고정시킨 뒤, 뒤꿈치를 깊게 말뚝 박듯이 누르며 골반과 일자 엉덩이 경사를 위로 올립니다.",
          "꼬리뼈 근막을 안쪽으로 오려내듯 압착하여, 허벅지 뒤편 햄스트링과 넓은 둔근 등 전체 후면 사슬 체인을 강타 응집합니다."
        ],
        safetyPoints: [
          "골반뼈를 치켜 올릴 때 날개뼈 목 등판 경추 라인이 짓눌릴 정도로 과하게 등 상부를 공중 구름다리처럼 띄우면 목디스크 압박을 동반합니다.",
          "밀고 올라올 때 무릎 가랑이가 바깥으로 부질없이 벌어지면 내전근 연결이 수그러드니 무릎 간격을 주먹 두 개 크기로 자로 잰 듯 락인하세요."
        ],
        proTips: [
          "뒤꿈치 뼈대에 무게배분을 90% 집중시키고 발가락 10개를 하늘로 슬쩍 드는 기립 자세를 주입하면 힙과 햄스트링에 자극 토크가 1.8배 폭증합니다.",
          "골반 끝단을 공중에서 가볍게 둥글게 밀며 미세 진동으로 조이면 엉덩이 깊은 안쪽 속근육까지 입체 피로도가 전달됩니다."
        ],
        targetMuscles: "대둔근 (엉덩이 메인), 햄스트링, 기립근 하부 벨트",
        angleLabel: "고관절 전방 경사각"
      };
    }

    if (cat === 'stretch') {
      return {
        descriptionSteps: [
          "가동 스트레칭 관절의 중심뼈를 척추 곧은 중립 방향에 수직 장전하고, 양 사지를 편안히 가동 범위 극한까지 이완합니다.",
          "반동(바운스 지렛대)을 완전히 삭제하고, 오직 근섬유 단백 필라멘트가 고무줄처럼 부드럽고 가늘어지게 늘어남을 마찰 인지합니다.",
          "들이키는 호흡 시 근결을 확장시키고, 뱉는 긴 이완 호흡에 맞춰 2mm씩 아주 미세하게 연골 마디의 슬릿 공간을 확대합니다."
        ],
        safetyPoints: [
          "가벼운 찌릿 늘어남이 아닌, 인대나 힘줄에 불처럼 뜨거운 작열 화끈 통증이 오는 점은 맹목적 과도 스트레칭 인대 파열 경고이니 즉각 긴장 장력을 풉니다.",
          "추위에 몸이 차갑게 굳은 상태에서 갑자기 당겨 늘리면 근육 파열을 수반하므로 체온 스텝을 거치거나 미지근한 상태에서 진행해야 가볍습니다."
        ],
        proTips: [
          "가장 지탱하기 고통스러운 피크 신장 지점에서 눈을 감고, 폐 가득 따스한 산소가 근결 깊은 곳의 젖산을 녹여 나간다는 자율 이완 이미징 피드백을 적용하세요.",
          "각 동작마다 최소 15초 이상 유지해야 근육 내 고유수용기(골지건 organ)가 안심하여 수축 브레이크를 정상 해제하고 복구 영역에 진입시킵니다."
        ],
        targetMuscles: "유연 가동성 전신 근막 이완망 및 회복 림프 순환로",
        angleLabel: "가동 한계각"
      };
    }

    return defaultData;
  };

  const expert = getExpertContent(exercise.name, category);

  // Biomechanical coordinate calculations based on generic LERP
  const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

  // Render SVG Skeletal Joints and biomechanics lines
  const renderBiomechanicalModel = () => {
    const sinVal = Math.sin(timeCounter);
    const progress = (sinVal + 1) / 2; // Normalised 0 to 1 loop

    // Theme color based on exercise type page
    const getJointColor = () => {
      switch (exercise.type) {
        case 'warmup': return '#0d9488'; // teal
        case 'cardio': return '#4f46e5'; // indigo
        case 'strength': return '#9333ea'; // purple
        case 'cooldown': return '#db2777'; // pink
        default: return '#6366f1';
      }
    };

    const color = getJointColor();

    if (category === "squat") {
      // standing hip (100, 105), knee (100, 140), ankle (100, 175). squatting pushes hip back-down to (85, 135) and knee slightly forward to (112, 142)
      const headX = lerp(100, 88, progress);
      const headY = lerp(45, 80, progress);
      const shoulderX = lerp(100, 90, progress);
      const shoulderY = lerp(60, 92, progress);
      const hipX = lerp(100, 80, progress);
      const hipY = lerp(105, 135, progress);
      const kneeX = lerp(100, 114, progress);
      const kneeY = lerp(140, 140, progress);
      const ankleX = 100;
      const ankleY = 175;

      const elbowX = lerp(120, 125, progress);
      const elbowY = lerp(75, 92, progress);

      // Angling calculation representation
      const kneeAngle = Math.round(lerp(178, 92, progress));

      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Floor grid */}
          <line x1="20" y1="175" x2="180" y2="175" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
          
          {/* Joint connection lines */}
          {/* Spine & Head */}
          <line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.9" />
          <line x1={shoulderX} y1={shoulderY} x2={headX} y2={headY} stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          
          {/* Legs & Hip */}
          <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} stroke={color} strokeWidth="5" strokeLinecap="round" />
          <line x1={kneeX} y1={kneeY} x2={ankleX} y2={ankleY} stroke={color} strokeWidth="5" strokeLinecap="round" />

          {/* Arms projection */}
          <line x1={shoulderX} y1={shoulderY} x2={elbowX} y2={elbowY} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
          <line x1={elbowX} y1={elbowY} x2={lerp(140, 150, progress)} y2={lerp(70, 92, progress)} stroke="#64748b" strokeWidth="2.5" />

          {/* Skeletal tracking markers */}
          {showSkeleton && (
            <>
              {/* Joint Dots */}
              <circle cx={headX} cy={headY} r="7" fill="#f8fafc" stroke={color} strokeWidth="2" className="animate-pulse" />
              <circle cx={shoulderX} cy={shoulderY} r="5" fill={color} />
              <circle cx={hipX} cy={hipY} r="5" fill={color} />
              <circle cx={kneeX} cy={kneeY} r="6" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
              <circle cx={ankleX} cy={ankleY} r="5" fill="#334155" />

              {/* Angle arc overlay representation */}
              <path d={`M ${kneeX-10} ${kneeY} A 15 15 0 0 1 ${kneeX} ${kneeY-15}`} fill="none" stroke="#4ade80" strokeWidth="1.5" />
              <text x={kneeX + 10} y={kneeY - 10} fill="#4ade80" className="text-[9px] font-mono font-bold" textAnchor="start">
                {kneeAngle}°
              </text>
              
              {/* Force weight arrow guides */}
              <line x1={kneeX} y1={kneeY - 25} x2={kneeX} y2={kneeY} stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <text x={hipX - 18} y={hipY + 5} fill="#60a5fa" className="text-[8px] font-mono font-bold">HIP HINGE</text>

              {/* Active hot zones */}
              <path d={`M ${hipX} ${hipY} Q ${lerp(100, 97, progress)} ${lerp(120, 137, progress)} ${kneeX} ${kneeY}`} fill="none" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" opacity={lerp(0.1, 0.45, progress)} />
            </>
          )}

          {/* Definitions */}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
            </marker>
          </defs>
        </svg>
      );
    }

    if (category === "plank") {
      const offset = sinVal * 1.5; // very micro breath vibration
      const headX = 155;
      const headY = 110 + offset * 0.3;
      const shoulderX = 135;
      const shoulderY = 118 + offset * 0.4;
      const hipX = 95;
      const hipY = 126 + offset;
      const kneeX = 65;
      const kneeY = 134 + offset * 0.5;
      const ankleX = 35;
      const ankleY = 142;
      const elbowX = 135;
      const elbowY = 148;

      const angleVal = Math.round(175 + offset * 0.8);

      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Mat line base */}
          <line x1="20" y1="150" x2="180" y2="150" stroke="#475569" strokeWidth="3" />
          
          {/* Main Spine alignment */}
          <line x1={headX} y1={headY} x2={shoulderX} y2={shoulderY} stroke="#94a3b8" strokeWidth="2.5" />
          <line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} stroke={color} strokeWidth="4" strokeLinecap="round" />
          <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} stroke={color} strokeWidth="4" strokeLinecap="round" />
          <line x1={kneeX} y1={kneeY} x2={ankleX} y2={ankleY} stroke={color} strokeWidth="4" strokeLinecap="round" />

          {/* Arm supporting block */}
          <line x1={shoulderX} y1={shoulderY} x2={elbowX} y2={elbowY} stroke={color} strokeWidth="4" />
          <line x1={elbowX} y1={elbowY} x2={155} y2={148} stroke={color} strokeWidth="4" strokeLinecap="round" />

          {showSkeleton && (
            <>
              {/* Nodes */}
              <circle cx={headX} cy={headY} r="6" fill="#fff" stroke={color} strokeWidth="1.5" />
              <circle cx={shoulderX} cy={shoulderY} r="4.5" fill={color} />
              <circle cx={hipX} cy={hipY} r="5.5" fill="#f59e0b" stroke="#fff" strokeWidth="1" className="animate-pulse" />
              <circle cx={kneeX} cy={kneeY} r="4" fill={color} />
              <circle cx={ankleX} cy={ankleY} r="4" fill="#475569" />
              <circle cx={elbowX} cy={elbowY} r="4" fill={color} />

              {/* Spine flat vector ray */}
              <line x1={ankleX} y1={ankleY - 14} x2={headX} y2={headY - 14} stroke="#4ade80" strokeWidth="1" strokeDasharray="2 4" />
              <text x="95" y="93" fill="#4ade80" className="text-[8px] font-mono font-bold text-center" textAnchor="middle">
                FLAT SPINE NEUTRAL ({angleVal}°)
              </text>

              {/* Glowing tension zone at abs */}
              <circle cx={hipX + 5} cy={hipY + 12} r="14" fill="#ef4444" opacity="0.32" className="animate-ping" style={{ animationDuration: '3s' }} />
              <text x={hipX - 10} y={hipY + 28} fill="#ef4444" className="text-[7.5px] font-bold">AB ENGAGE</text>
            </>
          )}
        </svg>
      );
    }

    if (category === "pushup") {
      // tilt cycle standing (up) and push (down)
      const headX = lerp(160, 163, progress);
      const headY = lerp(85, 128, progress);
      const shoulderX = lerp(138, 140, progress);
      const shoulderY = lerp(96, 137, progress);
      const hipX = lerp(95, 96, progress);
      const hipY = lerp(110, 141, progress);
      const kneeX = lerp(65, 65, progress);
      const kneeY = lerp(124, 144, progress);
      const ankleX = 35;
      const ankleY = 145; // static rotation point

      const handX = 138;
      const handY = 145; // fixed ground placement

      // bent elbow coordinates
      const elbowX = lerp(115, 110, progress);
      const elbowY = lerp(118, 140, progress);

      const armAngle = Math.round(lerp(165, 88, progress));

      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Mat floor */}
          <line x1="20" y1="145" x2="180" y2="145" stroke="#475569" strokeWidth="2" />

          {/* Skeletal rods */}
          <line x1={headX} y1={headY} x2={shoulderX} y2={shoulderY} stroke="#94a3b8" strokeWidth="2.5" />
          <line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} stroke={color} strokeWidth="4.5" strokeLinecap="round" />
          <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} stroke={color} strokeWidth="4.5" strokeLinecap="round" />
          <line x1={kneeX} y1={kneeY} x2={ankleX} y2={ankleY} stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray="none" />

          {/* Arms linkage */}
          <line x1={shoulderX} y1={shoulderY} x2={elbowX} y2={elbowY} stroke={color} strokeWidth="4" />
          <line x1={elbowX} y1={elbowY} x2={handX} y2={handY} stroke={color} strokeWidth="4" />

          {showSkeleton && (
            <>
              {/* Joint anchors */}
              <circle cx={headX} cy={headY} r="6" fill="#fff" stroke={color} strokeWidth="2" />
              <circle cx={shoulderX} cy={shoulderY} r="4" fill={color} />
              <circle cx={hipX} cy={hipY} r="4" fill={color} />
              <circle cx={kneeX} cy={kneeY} r="3.5" fill={color} />
              <circle cx={ankleX} cy={ankleY} r="4" fill="#334155" />
              <circle cx={elbowX} cy={elbowY} r="4.5" fill="#f43f5e" stroke="#fff" strokeWidth="1" />
              <circle cx={handX} cy={handY} r="4" fill="#334155" />

              {/* Real-time angle readout */}
              <text x={elbowX - 10} y={elbowY - 10} fill="#ef4444" className="text-[9px] font-mono font-bold" textAnchor="end">
                ELBOW {armAngle}°
              </text>
              <path d={`M ${elbowX} ${elbowY - 8} A 8 8 0 0 1 ${elbowX + 8} ${elbowY}`} fill="none" stroke="#ef4444" strokeWidth="1" />

              <text x="110" y="70" fill="#60a5fa" className="text-[8px] font-mono font-bold" textAnchor="middle">
                SHOULDER ALIGN ({Math.round(lerp(45, 48, progress))}°)
              </text>
            </>
          )}
        </svg>
      );
    }

    if (category === "dumbbell") {
      // standing dumbbell curl
      const shoulderX = 100;
      const shoulderY = 55;
      const elbowX = 100;
      const elbowY = 100; // static pivot elbow is tucked in

      // wrist wraps down and curls up to (128, 70)
      const handX = lerp(100, 126, progress);
      const handY = lerp(142, 75, progress);

      const curlAngle = Math.round(lerp(175, 45, progress));

      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Spine vertical column */}
          <line x1="100" y1="35" x2="100" y2="165" stroke="#334155" strokeWidth="3" strokeDasharray="4 2" />
          <line x1="85" y1="165" x2="115" y2="165" stroke="#475569" strokeWidth="2.5" />

          {/* Active Curl Arm rods */}
          <line x1={shoulderX} y1={shoulderY} x2={elbowX} y2={elbowY} stroke="#94a3b8" strokeWidth="3" opacity="0.8" />
          <line x1={elbowX} y1={elbowY} x2={handX} y2={handY} stroke={color} strokeWidth="5" strokeLinecap="round" />

          {/* Flex muscle loop indicator */}
          <path 
            className="transition-all"
            d={`M ${elbowX} ${elbowY} Q ${lerp(96, 114, progress)} ${lerp(120, 84, progress)} ${handX} ${handY}`} 
            fill="none" 
            stroke="#f43f5e" 
            strokeWidth={lerp(1.5, 9, progress)} 
            opacity={lerp(0.1, 0.7, progress)} 
          />

          {/* Glowing Weight (Dumbbell) */}
          <g transform={`translate(${handX}, ${handY})`}>
            {/* Dumbbell bar */}
            <line x1="-12" y1="0" x2="12" y2="0" stroke="silver" strokeWidth="3" />
            {/* Dumbbell weights */}
            <rect x="-17" y="-8" width="5" height="16" rx="1.5" fill="#1e293b" stroke={color} strokeWidth="1" />
            <rect x="12" y="-8" width="5" height="16" rx="1.5" fill="#1e293b" stroke={color} strokeWidth="1" />
            {/* Dynamic weight load text */}
            <circle cx="0" cy="0" r="2.5" fill="#10b981" />
          </g>

          {showSkeleton && (
            <>
              {/* Joint nodes */}
              <circle cx="100" cy="38" r="6" fill="#fff" stroke="#475569" strokeWidth="1.5" />
              <circle cx={shoulderX} cy={shoulderY} r="4" fill="#475569" />
              <circle cx={elbowX} cy={elbowY} r="4.5" fill={color} />
              <circle cx={handX} cy={handY} r="3.5" fill="#fff" stroke="#1e293b" strokeWidth="1" />

              {/* Bicep contraction readout */}
              <text x={handX + 20} y={handY + 5} fill={color} className="text-[10px] font-sans font-black">
                {curlAngle}°
              </text>
              <text x="100" y="178" fill="#10b981" className="text-[8px] font-mono font-bold" textAnchor="middle">
                ISOLATED FLEX ({Math.round(progress * 100)}%)
              </text>
            </>
          )}
        </svg>
      );
    }

    if (category === "cardio") {
      // cardio active alternating legs movement
      const offset = sinVal;
      const stepL = progress;
      const stepR = 1 - progress;

      const headBounceY = 48 + Math.abs(offset) * 5;
      const hipY = 110 + Math.abs(offset) * 2;

      // Leg 1 (Left Leg)
      const knee1X = lerp(75, 115, stepL);
      const knee1Y = lerp(130, 115, stepL);
      const ankle1X = lerp(70, 110, stepL);
      const ankle1Y = lerp(168, 145, stepL);

      // Leg 2 (Right Leg)
      const knee2X = lerp(115, 75, stepR);
      const knee2Y = lerp(118, 134, stepR);
      const ankle2X = lerp(110, 70, stepR);
      const ankle2Y = lerp(148, 172, stepR);

      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Ground */}
          <line x1="20" y1="172" x2="180" y2="172" stroke="#475569" strokeWidth="2.5" />

          {/* Torso */}
          <line x1="100" y1={headBounceY + 12} x2="100" y2={hipY} stroke="#94a3b8" strokeWidth="3" />
          <circle cx="100" cy={headBounceY} r="7" fill="#fff" stroke={color} strokeWidth="1.5" />

          {/* Leg L (Left) */}
          <line x1="100" y1={hipY} x2={knee1X} y2={knee1Y} stroke={color} strokeWidth="4.5" strokeLinecap="round" />
          <line x1={knee1X} y1={knee1Y} x2={ankle1X} y2={ankle1Y} stroke={color} strokeWidth="4.5" strokeLinecap="round" />

          {/* Leg R (Right) */}
          <line x1="100" y1={hipY} x2={knee2X} y2={knee2Y} stroke={color} strokeWidth="4.5" strokeLinecap="round" opacity="0.65" />
          <line x1={knee2X} y1={knee2Y} x2={ankle2X} y2={ankle2Y} stroke={color} strokeWidth="4.5" strokeLinecap="round" opacity="0.65" />

          {/* Velocity arrow vector */}
          {showSkeleton && (
            <>
              <line x1="140" y1="100" x2="160" y2="100" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow-green)" />
              <text x="150" y="90" fill="#10b981" className="text-[8px] font-mono font-bold" textAnchor="middle">
                AEROBIC CADENCE
              </text>
              <text x="100" y="25" fill="#f43f5e" className="text-[9px] font-mono font-black text-center" textAnchor="middle">
                CARDIO BURN ({Math.round(110 + 25 * Math.abs(sinVal))} BPM)
              </text>
              
              {/* Force ring effect */}
              <circle cx={ankle1X} cy={ankle1Y} r={lerp(2, 12, stepL)} fill="none" stroke="#ef4444" strokeWidth="1.5" opacity={lerp(0.8, 0.1, stepL)} />
              <circle cx={ankle2X} cy={ankle2Y} r={lerp(2, 12, stepR)} fill="none" stroke="#ef4444" strokeWidth="1.5" opacity={lerp(0.8, 0.1, stepR)} />
            </>
          )}

          <defs>
            <marker id="arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
            </marker>
          </defs>
        </svg>
      );
    }

    if (category === "bridge") {
      // Pelvic bridge raising up
      const shoulderX = 65;
      const shoulderY = 150;
      const headX = 45;
      const headY = 145;

      const hipX = 110;
      const hipY = lerp(150, 105, progress); // raising up
      
      const kneeX = 145;
      const kneeY = 115;
      const footX = 155;
      const footY = 150;

      const pelvicAngle = Math.round(lerp(180, 130, progress));

      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Mat */}
          <line x1="20" y1="150" x2="180" y2="150" stroke="#475569" strokeWidth="3" />

          {/* Spine & Head */}
          <line x1={shoulderX} y1={shoulderY} x2={headX} y2={headY} stroke="#94a3b8" strokeWidth="2.5" />
          <line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} stroke={color} strokeWidth="5" strokeLinecap="round" />

          {/* Leg hinge */}
          <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} stroke={color} strokeWidth="5" strokeLinecap="round" />
          <line x1={kneeX} y1={kneeY} x2={footX} y2={footY} stroke={color} strokeWidth="5" strokeLinecap="round" />

          {/* Glute muscle pressure glow */}
          <circle cx={hipX - 10} cy={hipY + 12} r={lerp(5, 14, progress)} fill="#f43f5e" opacity={lerp(0.1, 0.45, progress)} />

          {showSkeleton && (
            <>
              <circle cx={headX} cy={headY} r="7" fill="#fff" stroke="#475569" strokeWidth="1.5" />
              <circle cx={shoulderX} cy={shoulderY} r="4.5" fill="#475569" />
              <circle cx={hipX} cy={hipY} r="5" fill="#ef4444" stroke="#fff" strokeWidth="1" />
              <circle cx={kneeX} cy={kneeY} r="4.5" fill={color} />
              <circle cx={footX} cy={footY} r="4" fill="#475569" />

              <text x={hipX - 2} y={hipY - 14} fill="#e11d48" className="text-[9px] font-mono font-bold" textAnchor="middle">
                GLUTE CONTRACT ({pelvicAngle}°)
              </text>
              <line x1={hipX} y1={hipY + 25} x2={hipX} y2={hipY} stroke="#e11d48" strokeWidth="1.2" markerEnd="url(#arrow)" />
            </>
          )}
        </svg>
      );
    }

    // Default Respiratory/stretch circulatory animation
    const breathFactor = 1.3 + 0.3 * sinVal;
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Abstract Concentric respiratory rings */}
        <circle cx="100" cy="100" r={40 * breathFactor} fill="none" stroke={color} strokeWidth="1" opacity={0.15} />
        <circle cx="100" cy="100" r={25 * breathFactor} fill="none" stroke={color} strokeWidth="1.5" opacity={0.3} />
        <circle cx="100" cy="100" r={10 * breathFactor} fill={color} opacity={0.06} />

        {/* Dynamic Holographic pulse wave */}
        <path 
          d={`M 30,100 Q 65,${100 - sinVal * 35} 100,100 T 170,100`} 
          fill="none" 
          stroke={color} 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          opacity="0.85" 
        />
        <path 
          d={`M 30,100 Q 65,${100 + sinVal * 25} 100,100 T 170,100`} 
          fill="none" 
          stroke="#10b981" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          opacity="0.5" 
          strokeDasharray="4 2"
        />

        {/* Bio node indicators */}
        <circle cx="100" cy="100" r="5" fill="#fff" stroke={color} strokeWidth="2.5" className="animate-ping" />
        <circle cx="65" cy={100 - sinVal * 15} r="3" fill={color} />
        <circle cx="135" cy={100 + sinVal * 15} r="3" fill={color} />

        {showSkeleton && (
          <>
            <text x="100" y="32" fill={color} className="text-[9.5px] font-sans font-bold uppercase tracking-widest text-center" textAnchor="middle">
              REAL-TIME BIO FEEDBACK
            </text>
            <text x="100" y="172" fill="#94a3b8" className="text-[8.5px] font-mono leading-none tracking-tight" textAnchor="middle">
              HOLOGRAPHIC WAVE SIMULATOR
            </text>
          </>
        )}
      </svg>
    );
  };

  const renderCinemaVideoModel = () => {
    const sinVal = Math.sin(timeCounter);
    const progress = (sinVal + 1) / 2; // Normalised 0 to 1 loop

    // Choose different colors for different kinds of model demo rendering
    const getThemeColors = () => {
      switch (exercise.type) {
        case 'warmup': return { primary: '#14b8a6', accent: '#0d9488', bg: 'from-teal-950 via-slate-900 to-indigo-950' };
        case 'cardio': return { primary: '#6366f1', accent: '#4f46e5', bg: 'from-violet-950 via-slate-900 to-slate-950' };
        case 'strength': return { primary: '#a855f7', accent: '#9333ea', bg: 'from-fuchsia-950 via-slate-900 to-slate-950' };
        case 'cooldown': return { primary: '#ec4899', accent: '#db2777', bg: 'from-pink-950 via-slate-900 to-slate-950' };
        default: return { primary: '#6366f1', accent: '#4f46e5', bg: 'from-slate-900 via-indigo-950 to-slate-950' };
      }
    };

    const colors = getThemeColors();

    const drawTrainerSilhouette = () => {
      if (category === "squat") {
        // Render a beautiful, thick-pill graphic style silhouette squatting!
        const hipY = lerp(100, 130, progress);
        const kneeY = 135;
        const kneeX = lerp(100, 115, progress);
        const shoulderY = lerp(60, 88, progress);
        const shoulderX = lerp(95, 88, progress);
        const headY = lerp(45, 70, progress);
        const headX = lerp(95, 85, progress);

        return (
          <g>
            {/* Wooden Floor & Accent Shadow */}
            <ellipse cx="100" cy="165" rx={lerp(45, 55, progress)} ry="8" fill="rgba(0,0,0,0.4)" />
            <line x1="40" y1="165" x2="160" y2="165" stroke="#334155" strokeWidth="2.5" />
            
            {/* Back thigh muscular load indicator */}
            <path d={`M85,${hipY} Q ${kneeX - 8},${lerp(hipY, kneeY, 0.5)} ${kneeX},${kneeY}`} fill="none" stroke="#f43f5e" strokeWidth="12" strokeLinecap="round" opacity="0.3" />

            {/* Skeleton / Body muscles of the trainer */}
            {/* Thigh (Hip to Knee) */}
            <line x1="85" y1={hipY} x2={kneeX} y2={kneeY} stroke="#f8fafc" strokeWidth="10" strokeLinecap="round" />
            
            {/* Calf/Shin (Knee to Ankle) */}
            <line x1={kneeX} y1={kneeY} x2="100" y2="165" stroke="#f1f5f9" strokeWidth="9" strokeLinecap="round" />
            
            {/* Spine (Hip to Shoulder) */}
            <line x1="85" y1={hipY} x2={shoulderX} y2={shoulderY} stroke="#e2e8f0" strokeWidth="11" strokeLinecap="round" />
            
            {/* Arms (Shoulder to Hands) */}
            <line x1={shoulderX} y1={shoulderY} x2={lerp(125, 140, progress)} y2={lerp(65, 85, progress)} stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />

            {/* Head */}
            <circle cx={headX} cy={headY} r="10" fill="#f8fafc" />

            {/* Target Muscle Load Indicator Star */}
            <circle cx="92" cy={hipY + 5} r="4" fill="#ef4444" className="animate-ping" />
            
            {/* Joint Highlight markers */}
            <circle cx="85" cy={hipY} r="4.5" fill={colors.accent} />
            <circle cx={kneeX} cy={kneeY} r="4.5" fill={colors.accent} />
          </g>
        );
      }

      if (category === "plank") {
        const offset = sinVal * 1.5;
        const hipY = 122 + offset;
        const chestY = 114 + offset * 0.4;
        
        return (
          <g>
            {/* Shadows */}
            <ellipse cx="100" cy="155" rx="72" ry="6" fill="rgba(0,0,0,0.5)" />
            {/* Mat */}
            <line x1="30" y1="150" x2="170" y2="150" stroke="#a855f7" strokeWidth="3.5" opacity="0.6" />
            
            {/* Back Leg */}
            <line x1="45" y1="145" x2="70" y2={hipY + 5} stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
            {/* Front Leg */}
            <line x1="70" y1={hipY} x2="115" y2={hipY - 2} stroke="#f8fafc" strokeWidth="10" strokeLinecap="round" />
            {/* Torso */}
            <line x1="110" y1={hipY - 1} x2="142" y2={chestY} stroke="#f1f5f9" strokeWidth="11" strokeLinecap="round" />
            {/* Arm support */}
            <line x1="142" y1={chestY} x2="142" y2="148" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
            
            {/* Head */}
            <circle cx="158" cy={chestY - 8} r="10" fill="#f8fafc" />

            {/* Glowing Abs Grid (Core) */}
            <ellipse cx="110" cy={hipY + 4} rx="16" ry="10" fill="#f59e0b" opacity="0.45" className="animate-pulse" />
          </g>
        );
      }

      if (category === "pushup") {
        const shoulderY = lerp(96, 134, progress);
        const hipY = lerp(110, 138, progress);
        const headY = lerp(85, 122, progress);
        const elbowX = lerp(115, 105, progress);
        const elbowY = lerp(118, 138, progress);

        return (
          <g>
            {/* Mat floor */}
            <line x1="30" y1="146" x2="170" y2="146" stroke="#4b5563" strokeWidth="3" />
            <ellipse cx="100" cy="150" rx="66" ry="5" fill="rgba(0,0,0,0.4)" />

            {/* Leg (Ankle to Hip) */}
            <line x1="40" y1="142" x2="95" y2={hipY} stroke="#f1f5f9" strokeWidth="9.5" strokeLinecap="round" />
            
            {/* Torso & Spinal frame */}
            <line x1="95" y1={hipY} x2="136" y2={shoulderY} stroke="#f8fafc" strokeWidth="11" strokeLinecap="round" />
            
            {/* Arms support (Shoulder to Elbow, Elbow to Ground) */}
            <line x1="136" y1={shoulderY} x2={elbowX} y2={elbowY} stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
            <line x1={elbowX} y1={elbowY} x2="136" y2="142" stroke="#cbd5e1" strokeWidth="7" strokeLinecap="round" />

            {/* Head */}
            <circle cx="152" cy={headY} r="10" fill="#f8fafc" />

            {/* Active chest glow ring */}
            <circle cx="128" cy={shoulderY + 6} r="15" fill="#ef4444" opacity={lerp(0.1, 0.45, progress)} />
          </g>
        );
      }

      if (category === "dumbbell") {
        const handX = lerp(100, 126, progress);
        const handY = lerp(142, 75, progress);
        const bicepBulge = lerp(4, 16, progress);

        return (
          <g>
            {/* Center Grid */}
            <line x1="100" y1="35" x2="100" y2="165" stroke="#334155" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.4" />
            <line x1="75" y1="165" x2="125" y2="165" stroke="#4b5563" strokeWidth="2.5" />

            {/* Body Backbone Column */}
            <line x1="88" y1="65" x2="88" y2="165" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" opacity="0.6" />
            
            {/* Arm Shoulder */}
            <circle cx="95" cy="65" r="9" fill="#94a3b8" />
            
            {/* Upper Arm (Shoulder to Elbow) */}
            <line x1="95" y1="65" x2="95" y2="105" stroke="#f1f5f9" strokeWidth="9" />

            {/* Bulging Muscle (Bicep Frame) under load */}
            <path 
              d={`M95,65 Q ${95 + bicepBulge},85 ...`} 
              fill="none" 
              stroke="#ef4444" 
              strokeWidth={lerp(1, 10, progress)} 
              opacity={lerp(0.1, 0.8, progress)} 
            />

            {/* Forearm (Elbow to dynamic Hand) */}
            <line x1="95" y1="105" x2={handX} y2={handY} stroke="#f8fafc" strokeWidth="8" strokeLinecap="round" />

            {/* Metal Dumbbell weight */}
            <g transform={`translate(${handX}, ${handY})`}>
              <line x1="-15" y1="0" x2="15" y2="0" stroke="#e2e8f0" strokeWidth="4" />
              <rect x="-19" y="-12" width="6" height="24" rx="2" fill="#334155" />
              <rect x="13" y="-12" width="6" height="24" rx="2" fill="#334155" />
              <circle cx="0" cy="0" r="3.5" fill="#10b981" />
            </g>
          </g>
        );
      }

      if (category === "cardio") {
        const offset = sinVal;
        const stepL = progress;
        const stepR = 1 - progress;

        const headY = 48 + Math.abs(offset) * 4;
        const hipY = 110 + Math.abs(offset) * 1.5;

        // Runner Leg 1
        const knee1X = lerp(75, 115, stepL);
        const knee1Y = lerp(130, 115, stepL);
        const ankle1X = lerp(70, 110, stepL);
        const ankle1Y = lerp(165, 142, stepL);

        // Runner Leg 2
        const knee2X = lerp(112, 78, stepR);
        const knee2Y = lerp(118, 134, stepR);
        const ankle2X = lerp(105, 72, stepR);
        const ankle2Y = lerp(148, 168, stepR);

        return (
          <g>
            <line x1="30" y1="168" x2="170" y2="168" stroke="#cbd5e1" strokeWidth="2.5" />
            
            {/* Speed wind vector lines */}
            <path d="M 140,80 L 120,80 M 150,110 L 132,110 M 135,135 L 120,135" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" opacity="0.32" />

            {/* Alternating legs depth style */}
            <line x1="100" y1={hipY} x2={knee2X} y2={knee2Y} stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
            <line x1={knee2X} y1={knee2Y} x2={ankle2X} y2={ankle2Y} stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" opacity="0.5" />

            {/* Core & spine */}
            <line x1="100" y1={headY + 12} x2="100" y2={hipY} stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
            
            {/* Front legs on top */}
            <line x1="100" y1={hipY} x2={knee1X} y2={knee1Y} stroke="#f8fafc" strokeWidth="9.5" strokeLinecap="round" />
            <line x1={knee1X} y1={knee1Y} x2={ankle1X} y2={ankle1Y} stroke="#f8fafc" strokeWidth="9.5" strokeLinecap="round" />

            {/* Head */}
            <circle cx="100" cy={headY} r="10" fill="#f8fafc" />

            {/* Glowing Cardio Impact bubble helper */}
            <circle cx={ankle1X} cy={ankle1Y} r="8" fill="#6366f1" opacity="0.25" className="animate-ping" style={{ animationDuration: '1.2s' }} />
          </g>
        );
      }

      if (category === "bridge") {
        const hipY = lerp(150, 105, progress);

        return (
          <g>
            {/* Floor mat */}
            <line x1="30" y1="150" x2="170" y2="150" stroke="#db2777" strokeWidth="3" opacity="0.6" />
            <ellipse cx="100" cy="154" rx="70" ry="4" fill="rgba(0,0,0,0.4)" />

            {/* Shoulders static on floor */}
            <line x1="60" y1="148" x2="44" y2="144" stroke="#94a3b8" strokeWidth="8" />
            <circle cx="40" cy="142" r="9" fill="#f8fafc" />

            {/* Raised Spine (Shoulder to Hip) */}
            <line x1="60" y1="148" x2="110" y2={hipY} stroke="#f1f5f9" strokeWidth="11" strokeLinecap="round" />
            
            {/* Thigh (Hip to Knee) */}
            <line x1="110" y1={hipY} x2="140" y2="115" stroke="#f8fafc" strokeWidth="10.5" strokeLinecap="round" />
            
            {/* Calf (Knee to Foot) */}
            <line x1="140" y1="115" x2="150" y2="148" stroke="#cbd5e1" strokeWidth="8.5" strokeLinecap="round" />

            {/* Glute highlight zone (grows under pelvic lift) */}
            <ellipse cx="98" cy={hipY + 8} rx="12" ry="8" fill="#f43f5e" opacity={lerp(0.1, 0.5, progress)} />
          </g>
        );
      }

      // Default Warmup or restorative stretch pose
      const breathCircle = 1.3 + 0.35 * sinVal;
      return (
        <g>
          {/* Relaxing Zen nature graphic */}
          <circle cx="100" cy="100" r={42 * breathCircle} fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
          <circle cx="100" cy="100" r={25 * breathCircle} fill="rgba(34,197,94,0.06)" />
          
          {/* Standard stylized stretching stick figure */}
          <line x1="100" y1="145" x2="100" y2="90" stroke="#f1f5f9" strokeWidth="9" strokeLinecap="round" />
          <line x1="100" y1="90" x2="135" y2="55" stroke="#f8fafc" strokeWidth="7" strokeLinecap="round" />
          <line x1="100" y1="90" x2="65" y2="55" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
          <line x1="100" y1="145" x2="80" y2="175" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
          <line x1="100" y1="145" x2="120" y2="175" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
          
          <circle cx="100" cy="38" r="11" fill="#f8fafc" />
          <circle cx="100" cy="100" r="14" fill="#a855f7" opacity="0.32" className="animate-ping" style={{ animationDuration: '4s' }} />
        </g>
      );
    };

    return (
      <svg viewBox="0 0 200 200" className="w-full h-full relative overflow-hidden rounded-2xl">
        {/* Cinematic rich gradient background */}
        <defs>
          <radialGradient id="studioGlow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#13112b" />
            <stop offset="60%" stopColor="#080612" />
            <stop offset="100%" stopColor="#020005" />
          </radialGradient>
        </defs>
        
        <rect width="200" height="200" fill="url(#studioGlow)" />

        {/* Video recording grids and framing lines */}
        <line x1="10" y1="15" x2="25" y2="15" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <line x1="10" y1="15" x2="10" y2="30" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <line x1="190" y1="15" x2="175" y2="15" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <line x1="190" y1="15" x2="190" y2="30" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <line x1="10" y1="185" x2="25" y2="185" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <line x1="10" y1="185" x2="10" y2="170" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <line x1="190" y1="185" x2="175" y2="185" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <line x1="190" y1="185" x2="190" y2="170" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

        {/* Scan lines Simulation */}
        <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        <line x1="10" y1="50" x2="190" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        <line x1="10" y1="150" x2="190" y2="150" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

        {/* Video metadata labels inside HUD */}
        <text x="15" y="27" fill="#ef4444" className="text-[7.5px] font-mono font-black tracking-widest animate-pulse">REC🔴</text>
        <text x="185" y="27" fill="rgba(255,255,255, 0.5)" className="text-[7px] font-mono font-bold" textAnchor="end">1080P FHD</text>
        
        {/* Draw the trainer */}
        {drawTrainerSilhouette()}

        {/* Video progress indicator & current frame seconds mockup info */}
        <text x="15" y="178" fill="rgba(255,255,255,0.3)" className="text-[7px] font-mono">00:0{Math.floor(progress * 8)} / 00:08</text>
        <text x="185" y="178" fill={colors.primary} className="text-[7.5px] font-mono font-black" textAnchor="end">STUDIO HD DEMO</text>

        {/* Simulated sound bar peaks in corner */}
        <g transform="translate(152, 172)" opacity="0.6">
          <rect x="0" y={lerp(4, 0, progress)} width="1.5" height="4" fill="#10b981" />
          <rect x="2" y={lerp(2, 0, progress)} width="1.5" height="6" fill="#10b981" />
          <rect x="4" y={lerp(5, 0, progress)} width="1.5" height="3" fill="#10b981" />
        </g>
      </svg>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl" id="posture-lab-card">
      
      {/* Banner Title */}
      <div className="bg-gradient-to-r from-slate-950 to-slate-900 border-b border-slate-850 px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg flex items-center justify-center shrink-0">
            <Tv2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>PulseMind 실시간 AI 자세 연구소</span>
              <span className="text-[8.5px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-1 py-0.5 rounded uppercase">Live Biomechanics</span>
            </h3>
            <p className="text-[10px] text-slate-400">맞춤형 바이오 피드백, 모션 시뮬레이션 및 전문가 티칭 데이터</p>
          </div>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-slate-900 p-0.5 border border-slate-800 rounded-md self-start md:self-center">
          <button 
            onClick={() => setActiveTab("visual")}
            className={`text-[10px] font-bold px-3 py-1.5 rounded transition-all cursor-pointer ${
              activeTab === "visual" 
                ? "bg-slate-800 text-white shadow-xs" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            모션 시뮬레이터 (Loop)
          </button>
          <button 
            onClick={() => setActiveTab("spec")}
            className={`text-[10px] font-bold px-3 py-1.5 rounded transition-all cursor-pointer ${
              activeTab === "spec" 
                ? "bg-slate-800 text-white shadow-xs" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            해부학적 자극부위 (Spec)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Column (5/12): Real-time Player Visual Viewport */}
        <div 
          onClick={() => setViewMode(prev => prev === "vector" ? "video" : "vector")}
          className="group md:col-span-5 bg-slate-950 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-850 min-h-[300px] cursor-pointer hover:border-indigo-500/20 transition-all duration-300 relative select-none"
          title="클릭하여 모드 전환 (AI 관절 뼈대 ↔ 실제 시범 비디오)"
        >
          
          {/* Top Info Bar */}
          <div className="p-3 bg-slate-950/80 border-b border-white/[0.03] flex justify-between items-center text-[9px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${viewMode === 'video' ? 'bg-red-500 animate-ping' : 'bg-emerald-400 animate-pulse'} shrink-0`} />
              <span className="font-bold tracking-wider text-slate-200">
                {viewMode === "video" ? "🎬 스튜디오 시범 비디오" : "📡 실시간 AI 뼈대 분석"}
              </span>
            </span>
            
            {/* View Mode Switcher inside Info Bar */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-md p-0.5" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setViewMode("vector")}
                className={`text-[8px] font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  viewMode === "vector"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                AI 뼈대
              </button>
              <button
                onClick={() => setViewMode("video")}
                className={`text-[8px] font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === "video"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>시범영상</span>
                <span className="w-1 h-1 rounded-full bg-red-400 animate-ping" />
              </button>
            </div>
          </div>

          {/* Animation View Canvas wrapper */}
          <div className="relative flex-1 flex items-center justify-center p-4 w-full h-full min-h-[240px]">
            {viewMode === "video" ? (
              <div className="w-full h-full min-h-[224px] flex items-center justify-center relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-900/50 shadow-inner">
                <video
                  ref={videoRef}
                  src={VIDEO_URLS[category] || VIDEO_URLS.default}
                  key={category}
                  autoPlay
                  loop
                  muted
                  playsInline
                  referrerPolicy="no-referrer"
                  className="w-full h-full min-h-[224px] max-h-[260px] object-cover rounded-2xl"
                />
                
                {/* REC Overlay */}
                <div className="absolute top-2.5 left-2.5 bg-black/65 px-2 py-0.5 rounded border border-white/5 text-[7.5px] font-mono text-red-400 font-bold flex items-center gap-1 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <span>DEMO LOOP (1m)</span>
                </div>
              </div>
            ) : (
              <div className="w-48 h-48 md:w-56 md:h-56">
                {renderBiomechanicalModel()}
              </div>
            )}

            {/* Click to Toggle overlay badge */}
            <div className="absolute inset-x-0 top-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-250">
              <span className="text-[8px] font-bold bg-indigo-650/95 text-white px-2.5 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1">
                <span>클릭: {viewMode === 'vector' ? '🎬 시범 비디오 모드' : '📡 AI 뼈대 주적 모드'} 전환</span>
              </span>
            </div>

            {/* Click assistance hint */}
            <div className="absolute top-2 right-3 opacity-30 group-hover:opacity-80 transition-opacity duration-250">
              <span className="text-[7.5px] text-slate-500 font-bold border border-slate-800 bg-slate-950 bg-opacity-75 px-1.5 py-0.5 rounded">
                CLICK COVER
              </span>
            </div>

            {/* Subtitles Overlay */}
            {isPlaying && (
              <div className="absolute bottom-3 left-4 right-4 bg-slate-950/75 border border-slate-800/60 backdrop-blur-xs rounded-xl p-2.5 text-center pointer-events-none">
                <p className="text-[10px] text-slate-300 leading-tight font-medium">
                  {viewMode === "video" && (
                    <span className="text-indigo-400 font-bold mr-1">
                      [PLAYING DEMO]
                    </span>
                  )}
                  <span>
                    {category === "squat" && "엉덩이를 벽에 밀치듯이 고관절 경첩을 깊게 접어 내려갑니다."}
                    {category === "plank" && "척추 라인이 구부러지지 않도록 아랫배 복압을 계속 수축 유지하세요."}
                    {category === "pushup" && "겨드랑이 각도를 약 45도 후하방으로 유지해 어깨충돌을 차단합니다."}
                    {category === "dumbbell" && "옆구리에 팔꿈치를 완수 락인시키고 고립된 상완 텐션에 기댑니다."}
                    {category === "cardio" && "뒷꿈치 낙하 타격을 차단하고 앞꿈치 쿠션 서스펜션을 활용하세요."}
                    {category === "bridge" && "허리를 뒤로 과꺾지 마시고 오직 뒤꿈치 말뚝 힘으로 골반을 올립니다."}
                    {category === "stretch" && "바운스 반동을 완전히 포기하고 긴 호흡에 맞춰 2mm씩 전진하세요."}
                    {category === "default" && "안전 중심의 체계적인 직립 자세와 폐호흡 결합을 인지하며 진행합니다."}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Player controls deck */}
          <div className="p-3 bg-slate-950/90 border-t border-white/[0.03] flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-1.5 rounded-md cursor-pointer transition-all ${
                  isPlaying 
                    ? "bg-slate-800 text-white hover:bg-slate-700" 
                    : "bg-indigo-600 text-white hover:bg-indigo-500 animate-pulse"
                }`}
                title={isPlaying ? "일시정지" : "시뮬레이션 재생"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>
              
              {/* Speed select */}
              <button 
                onClick={() => setSpeed(prev => prev === 0.5 ? 1.0 : prev === 1.0 ? 1.5 : 0.5)}
                className="text-[9px] font-bold font-mono px-2 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-300 rounded-md cursor-pointer transition-colors"
                title="시뮬레이션 배속 설정"
              >
                {speed.toFixed(1)}x
              </button>
            </div>

            {/* Skeleton details switch */}
            <button
              onClick={() => setShowSkeleton(!showSkeleton)}
              className={`text-[9px] font-semibold px-2 py-1.5 rounded-md transition-all border cursor-pointer flex items-center gap-1 ${
                showSkeleton 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "bg-slate-900 text-slate-500 border-slate-800"
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>관절 추적 오버레이 {showSkeleton ? "ON" : "OFF"}</span>
            </button>
          </div>

        </div>

        {/* Right Column (7/12): Structured Posture Instructions, Warnings & Tips */}
        <div className="md:col-span-7 p-5 flex flex-col justify-between gap-5 bg-slate-900">
          
          <AnimatePresence mode="wait">
            {activeTab === "visual" ? (
              <motion.div 
                key="step-by-step"
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                className="space-y-4 flex-1"
              >
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5 mb-2.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    <span>정확한 자세와 운동 순서 (Biomechanics Blueprint)</span>
                  </h4>
                  <div className="space-y-2.5">
                    {expert.descriptionSteps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 bg-slate-850/60 p-3 rounded-xl border border-slate-800/40 hover:border-slate-800 transition-colors">
                        <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          0{idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">
                            {idx === 0 && "준비 자세 (Set-up)"}
                            {idx === 1 && "핵심 수행 동작 (Movement)"}
                            {idx === 2 && "수축 및 마무리 (Action Lock)"}
                          </p>
                          <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="anatomical-spec"
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                className="space-y-4 flex-1"
              >
                {/* Target Muscles */}
                <div className="bg-slate-850/50 p-4 border border-slate-800/60 rounded-xl">
                  <h4 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span>주요 타겟 자극 근육군</span>
                  </h4>
                  <p className="text-sm font-bold text-white mt-1">{expert.targetMuscles}</p>
                  
                  {/* Visual gauge indicators of focus regions */}
                  <div className="mt-4 space-y-2 text-[10px] font-semibold text-slate-300">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>근골격 주 기여도 (Primary Engagement)</span>
                        <span className="text-indigo-400">85%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>부 협응근 개입성 (Secondary Stability)</span>
                        <span className="text-emerald-400">45%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: '45%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specific Angle spec */}
                <div className="bg-slate-850/30 p-4 border border-slate-800/40 rounded-xl flex gap-3.5 items-center justify-between">
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400">인간 비구(Joint) 통제 가속</h5>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">자극 각도를 제어하여 관절 내부 압력 충돌을 영구 정지시킵니다.</p>
                  </div>
                  <div className="text-right whitespace-nowrap shrink-0">
                    <span className="text-[9px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/25">
                      {expert.angleLabel}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid content footer (Precautions & Tips in 2 split rows) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-850">
            {/* Precautions */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3">
              <h5 className="text-[11px] font-bold text-red-400 flex items-center gap-1 mb-1.5">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>핵심 안전 주의사항</span>
              </h5>
              <ul className="space-y-1.5 text-[10px] text-red-200/90 leading-relaxed list-none">
                {expert.safetyPoints.map((pt, idx) => (
                  <li key={idx} className="flex gap-1.5 items-start">
                    <span className="text-red-400 shrink-0 select-none">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro Trainer Tips */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3">
              <h5 className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mb-1.5">
                <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                <span>체력 증강 효과적 꿀팁</span>
              </h5>
              <ul className="space-y-1.5 text-[10px] text-emerald-200/90 leading-relaxed list-none">
                {expert.proTips.map((tip, idx) => (
                  <li key={idx} className="flex gap-1.5 items-start">
                    <span className="text-emerald-400 shrink-0 select-none">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* YouTube Video Assist launcher */}
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40 px-4 py-3 border border-slate-850 rounded-xl">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-400 fill-current animate-pulse" />
              <span className="text-[10px] font-medium text-slate-300">자세 시범을 비디오 검색(Youtube 등)으로 바로 매칭해 보세요.</span>
            </span>
            <a 
              href={`https://www.youtube.com/results?search_query=올바른+${encodeURIComponent(exercise.name)}+자세+튜토리얼`}
              target="_blank" 
              rel="noreferrer"
              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1 shrink-0 bg-indigo-500/5 px-2.5 py-1 rounded-md border border-indigo-500/20"
            >
              <span>시범 비디오 검색</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>

      </div>

    </div>
  );
}
