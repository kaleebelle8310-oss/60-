export type ExerciseType = 'warmup' | 'cardio' | 'strength' | 'cooldown';

export interface ExerciseItem {
  id: string;
  name: string;
  type: ExerciseType;
  duration: number; // in minutes
  targetIntensity: string; // target reps, intensity, or heart rate
  description: string;
  safetyTip: string;
}

export interface WorkoutRoutine {
  title: string;
  totalDuration: number; // always 60
  summary: string;
  warmupMinutes: number;
  cardioMinutes: number;
  strengthMinutes: number;
  cooldownMinutes: number;
  exercises: ExerciseItem[];
  precautions: string[];
}

export interface UserCondition {
  gender: 'male' | 'female' | 'other';
  age: number;
  height: number; // cm
  weight: number; // kg
  experience: 'beginner' | 'intermediate' | 'advanced';
  focusArea: 'upper_body' | 'lower_body' | 'core' | 'full_body';
  fitnessGoal: 'muscle_gain' | 'fat_loss' | 'stamina' | 'rehab_posture';
  todayCondition: 'excellent' | 'normal' | 'tired' | 'pain';
  painAreas: string[]; // knee, shoulder, waist, ankle, etc.
  equipment: ('none' | 'dumbbells' | 'gym_machines' | 'bands')[];
  customRequest?: string;
}

export interface WorkoutRecord {
  id: string;
  date: string; // ISO String or YYYY-MM-DD
  routineTitle: string;
  plannedDuration: number; // e.g. 60
  completedDuration: number; // actual minutes spent
  rating: number; // 1 to 5 stars
  calories: number; // estimated
  todayCondition: string;
  completedExercises: string[]; // names of completed exercises
  notes?: string;
}
