import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables from .env if present
dotenv.config();

const ROOT_DIR = process.cwd();
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // API router / endpoints
  app.post("/api/routine/generate", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        return res.status(400).json({
          error: "API_KEY_MISSING",
          message: "Gemini API 키가 설정되지 않았습니다. AI Studio 우측 상단의 Settings -> Secrets 패널에서 GEMINI_API_KEY를 등록해주세요."
        });
      }

      const {
        gender,
        age,
        height,
        weight,
        experience,
        focusArea,
        fitnessGoal,
        todayCondition,
        painAreas,
        equipment,
        customRequest
      } = req.body;

      if (!gender || !age || !height || !weight || !experience || !focusArea || !fitnessGoal || !todayCondition) {
        return res.status(400).json({
          error: "INVALID_REQUEST",
          message: "필수 입력 항목이 누락되었습니다."
        });
      }

      // Initialize Gemini API client inside the request handler to prevent startup crashes if key is omitted
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Map codes to Korean strings for better prompt understanding
      const expMap = { beginner: "초보자 (체력 낮음)", intermediate: "중급자 (일반 체력)", advanced: "상급자 (체력 우수)" };
      const areaMap = { upper_body: "상체 위주", lower_body: "하체 위주", core: "코어/복부 위주", full_body: "전신 균형" };
      const goalMap = {
        muscle_gain: "근육량 가이드 및 스트렝스 향상",
        fat_loss: "체지방 적극 연소 및 유산소 강화",
        stamina: "기초 체력 및 지구력 향상",
        rehab_posture: "관절 무리 차단 및 체형 교정/재활 가이드"
      };
      const condMap = {
        excellent: "최상 (강도 높은 운동 가능)",
        normal: "보통 (일반적인 컨디션)",
        tired: "피곤하고 지침 (피로도가 높아 가볍고 활력을 더하는 구성을 원함)",
        pain: "특정 부위 불편함/통증 있음"
      };

      const transEquipment = equipment.map((eq: string) => {
        if (eq === 'none') return '맨몸';
        if (eq === 'dumbbells') return '덤벨';
        if (eq === 'gym_machines') return '헬스장 기구';
        if (eq === 'bands') return '저항 밴드';
        return eq;
      }).join(", ");

      const prompt = `
        다음 사용자 정보와 컨디션을 바탕으로 **딱 1시간(60분) 동안 수행할 수 있는 완벽한 유산소 + 근육운동 맞춤 루틴**을 설계해줘:

        [사용자 프로필]
        - 성별: ${gender}
        - 나이: 만 ${age}세
        - 신체 스펙: 키 ${height}cm / 몸무게 ${weight}kg
        - 운동 숙련도: ${expMap[experience as keyof typeof expMap] || experience}
        - 오늘 집중하고 싶은 부위: ${areaMap[focusArea as keyof typeof areaMap] || focusArea}
        - 목표: ${goalMap[fitnessGoal as keyof typeof goalMap] || fitnessGoal}
        - 기구 환경: ${transEquipment || "맨몸 운동"}
        
        [오늘의 컨디션]
        - 현재 몸 상태: ${condMap[todayCondition as keyof typeof condMap] || todayCondition}
        - 통증 및 불편한 신체 부위: ${painAreas && painAreas.length > 0 ? painAreas.join(", ") : "없음"}
        - 추가 요청사항: ${customRequest || "없음"}

        [지침 사항]
        1. 전체 루틴 시간은 Warm-up(웜업), Cardio(유산소), Strength(근육운동), Cool-down(정리운동) 4가지 단계를 합쳐 정확히 60분으로 작성해줘.
        2. 사용자가 표시한 통증 부위(예: 무릎 knee, 허리 waist, 어깨 shoulder 등)가 있다면, 해당 관절과 근육에 무리가 주는 동작(예: 무릎 통증 시 깊은 피스톨 스쿼트, 허리 통증 시 과도한 레그레이즈 등)은 절대 피하고 대체 운동(예: 벽 스쿼트, 버드독 등)으로 추천해야 해. 운동별 safetyTip과 precautions에 이를 대단히 구체적으로 명시해줘.
        3. 운동 경험수준(초보자 등)에 맞게 강도를 과학적으로 조절해줘.
        4. 모든 텍스트(설명, 주의사항, 팁 등)는 한국어로 자연스럽고 가독성 좋게 적어줘.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `당신은 최고 수준의 맞춤형 퍼스널 트레이너이자 임상 운동처방사입니다. 
          상황별 근골격계 안전지침을 완벽하게 인지하고 있으며, 인체의 피로도와 신체 통증 부위를 과학적으로 진단해 맞춤식 1시간 유산소 및 근력 통합 트레이닝 솔루션을 설계해 줍니다.
          총 합계 시간은 빈틈없이 60분이어야 하며, 한국어 존댓말로 답변합니다.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "루틴 제목 예시: '어깨 통증 완화를 위한 상체 및 슬로우 유산소 루틴'" },
              totalDuration: { type: Type.INTEGER, description: "총 신체 움직임 시간 (항상 60)" },
              summary: { type: Type.STRING, description: "이 루틴이 오늘의 신체 조건, 통증 부위, 기구에 맞추어 왜 이렇게 설계되었는지 친절하게 진단 설명해주는 요약 글 (3~4문장)" },
              warmupMinutes: { type: Type.INTEGER, description: "준비 운동 시간 (분 단위)" },
              cardioMinutes: { type: Type.INTEGER, description: "유산소 운동 시간 (분 단위)" },
              strengthMinutes: { type: Type.INTEGER, description: "근육/근력 운동 시간 (분 단위)" },
              cooldownMinutes: { type: Type.INTEGER, description: "정리 운동/스트레칭 시간 (분 단위)" },
              exercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "ex-1, ex-2 등으로 정렬순서 표기" },
                    name: { type: Type.STRING, description: "운동의 직관적인 국문 명칭" },
                    type: { type: Type.STRING, description: "phase 구분: 'warmup', 'cardio', 'strength', 'cooldown' 중 하나" },
                    duration: { type: Type.INTEGER, description: "해당 운동 진행 시간 (분 단위)" },
                    targetIntensity: { type: Type.STRING, description: "목표 횟수/세트수/속도 또는 심박 가이드 (예: '10회씩 3세트', '심박수 110-120 유지하며 가볍게', '양쪽 15초씩 2회')" },
                    description: { type: Type.STRING, description: "정확하고 안전한 운동 수행방법 설명 (바른 정렬, 호흡 팁 포함)" },
                    safetyTip: { type: Type.STRING, description: "사용자의 통증부위나 기구를 감안할 때 특히 조심해야 할 꿀팁과 대체자세" }
                  },
                  required: ["id", "name", "type", "duration", "targetIntensity", "description", "safetyTip"]
                }
              },
              precautions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "오늘 운동하면서 전체적으로 지켜야 될 중요 예방/안전 가이드라인 수칙들"
              }
            },
            required: ["title", "totalDuration", "summary", "warmupMinutes", "cardioMinutes", "strengthMinutes", "cooldownMinutes", "exercises", "precautions"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }

      // Return parsed dynamic JSON
      const routineData = JSON.parse(responseText.trim());
      return res.json(routineData);

    } catch (err: any) {
      console.error("Error generating workout routine:", err);
      return res.status(500).json({
        error: "GENERATION_FAILED",
        message: "AI 루틴을 작성하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        details: err.message || err
      });
    }
  });

  // Serve static UI assets or connect Dev server middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode. Mounting Vite...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode.");
    const distPath = path.join(ROOT_DIR, "dist");
    app.use(express.static(distPath));
    // Serve index.html for all other routes to support client routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical error starting Express fullstack server:", err);
});
