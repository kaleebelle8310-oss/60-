import React from "react";
import { WorkoutRecord } from "../types";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  Cell
} from "recharts";
import { 
  Flame, 
  Calendar, 
  Clock, 
  Smile, 
  Activity, 
  TrendingUp, 
  Award,
  CircleCheck
} from "lucide-react";

interface WorkoutChartsProps {
  records: WorkoutRecord[];
}

export default function WorkoutCharts({ records }: WorkoutChartsProps) {
  // Sort records by date for accurate timeline plotting
  const sortedRecords = [...records].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Take last 7 records for focus display to not clutter the mobile screen
  const recentRecords = sortedRecords.slice(-7);

  // Format data for timeline
  const chartData = recentRecords.map(rec => {
    const formattedDate = rec.date.substring(5).replace("-", "/"); // e.g. "06/05"
    return {
      name: formattedDate,
      duration: rec.completedDuration,
      calories: rec.calories,
      rating: rec.rating,
      exercisesCount: rec.completedExercises?.length || 0,
      fullTitle: rec.routineTitle
    };
  });

  // Calculate totals
  const totalCal = records.reduce((sum, r) => sum + r.calories, 0);
  const totalMin = records.reduce((sum, r) => sum + r.completedDuration, 0);
  const totalCount = records.length;
  const avgRating = totalCount > 0 
    ? (records.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1) 
    : "0.0";

  // Weekly recommendation metrics (WHO recommends 150 mins moderate physical activity per week)
  const weeklyMinsGoal = 150;
  const weeklyProgressPercent = Math.min(100, Math.round((totalMin / weeklyMinsGoal) * 100));

  return (
    <div className="space-y-6" id="workout-charts-section">
      
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">누적 연소 칼로리</p>
            <p className="text-xl font-bold font-sans text-slate-800 tracking-tight mt-0.5">{totalCal} <span className="text-xs font-normal text-slate-500">kcal</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">누적 운동 시간</p>
            <p className="text-xl font-bold font-sans text-slate-800 tracking-tight mt-0.5">{totalMin} <span className="text-xs font-normal text-slate-500">분</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">총 처방 운동 횟수</p>
            <p className="text-xl font-bold font-sans text-slate-800 tracking-tight mt-0.5">{totalCount} <span className="text-xs font-normal text-slate-500">회</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
            <Smile className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">평균 건강 만족도</p>
            <p className="text-xl font-bold font-sans text-slate-800 tracking-tight mt-0.5">{avgRating} <span className="text-xs font-normal text-slate-500">/ 5.0</span></p>
          </div>
        </div>
      </div>

      {/* Goal gauge and description */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-3 items-center">
          <div className="w-11 h-11 bg-indigo-50/50 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-100 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">주간 건강 권장 운동량 달성도</h4>
            <p className="text-xs text-slate-400 mt-0.5">세계보건기구(WHO) 기준 주간 최저 적정 운동인 150분을 채우는 지표입니다.</p>
          </div>
        </div>
        <div className="w-full md:w-60 flex items-center gap-3">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
            <div 
              className="bg-indigo-600 h-full transition-all duration-500" 
              style={{ width: `${weeklyProgressPercent}%` }}
            ></div>
          </div>
          <span className="text-xs font-bold font-sans text-indigo-600 whitespace-nowrap shrink-0">{weeklyProgressPercent}% ({totalMin}분)</span>
        </div>
      </div>

      {/* Main Charts Deck Grid */}
      {records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 text-sm">
          시각화 차트를 그리기 위한 운동 기록 데이터가 부족합니다. 오늘의 루틴 처방을 시작하고 운동을 완료해 기록을 만들어보세요!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Chart 1: Daily Completed workout minutes */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="mb-4">
              <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Workout minutes</span>
              <h3 className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>일자별 실제 운동 수행시간 추이</span>
              </h3>
            </div>
            
            <div className="h-60 w-full" id="duration-chart-holder">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                    axisLine={false} 
                    tickLine={false}
                    unit="분"
                  />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#f59e0b' }}
                  />
                  <Bar 
                    dataKey="duration" 
                    fill="#6366f1" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={32}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#4f46e5' : '#818cf8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Calorie Burned (Area Chart) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="mb-4">
              <span className="text-[9px] bg-indigo-50 text-indigo-650 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Active Calories</span>
              <h3 className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1">
                <Flame className="w-4 h-4 text-indigo-600" />
                <span>트레이닝 칼로리 연소 곡선</span>
              </h3>
            </div>

            <div className="h-60 w-full" id="calories-chart-holder">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                    axisLine={false}
                    tickLine={false} 
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                    axisLine={false} 
                    tickLine={false}
                    unit="kcal"
                  />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#6366f1' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="calories" 
                    stroke="#4f46e5" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorCal)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Experience progression & ratings */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="mb-4">
              <span className="text-[9px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Bio Vitality Score</span>
              <h3 className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1">
                <Activity className="w-4 h-4 text-purple-600" />
                <span>일자별 운동 강도 및 활력 인덱스 추세</span>
              </h3>
            </div>

            <div className="h-60 w-full" id="rating-chart-holder">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                    axisLine={false}
                    tickLine={false} 
                  />
                  <YAxis 
                    domain={[0, 5]} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                    axisLine={false} 
                    tickLine={false}
                    unit="점"
                  />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="#a855f7" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Completed Exercises Volume */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="mb-4">
              <span className="text-[9px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Completed sets count</span>
              <h3 className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1">
                <CircleCheck className="w-4 h-4 text-purple-600" />
                <span>루틴별 수행 완료한 세부 운동 개수</span>
              </h3>
            </div>

            <div className="h-60 w-full" id="volume-chart-holder">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                    axisLine={false}
                    tickLine={false} 
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                    axisLine={false} 
                    tickLine={false}
                    unit="개"
                  />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar 
                    dataKey="exercisesCount" 
                    fill="#a855f7" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
