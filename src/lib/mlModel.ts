interface HabitLog {
  date: string;
  status: boolean;
}

export function predictHabitCompletion(logs: HabitLog[]): number {
  if (logs.length === 0) return 0;

  const features = extractFeatures(logs);

  const weights = trainLogisticRegression(features);

  const tomorrowFeatures = generateTomorrowFeatures(logs);

  const prediction = predict(tomorrowFeatures, weights);

  return Math.round(prediction * 100);
}

function extractFeatures(logs: HabitLog[]): number[][] {
  const features: number[][] = [];

  logs.forEach((log, index) => {
    const date = new Date(log.date);
    const dayOfWeek = date.getDay();

    const previousDayCompletion = index > 0 ? (logs[index - 1].status ? 1 : 0) : 0;

    let streak = 0;
    for (let i = index; i >= 0; i--) {
      if (logs[i].status) {
        streak++;
      } else {
        break;
      }
    }

    const weekendFlag = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;

    const recentCompletionRate = calculateRecentRate(logs, index, 7);

    features.push([
      1,
      dayOfWeek / 7,
      previousDayCompletion,
      Math.min(streak / 10, 1),
      weekendFlag,
      recentCompletionRate,
    ]);
  });

  return features;
}

function calculateRecentRate(logs: HabitLog[], currentIndex: number, days: number): number {
  const startIndex = Math.max(0, currentIndex - days);
  const recentLogs = logs.slice(startIndex, currentIndex + 1);

  if (recentLogs.length === 0) return 0;

  const completed = recentLogs.filter((log) => log.status).length;
  return completed / recentLogs.length;
}

function trainLogisticRegression(features: number[][]): number[] {
  const numFeatures = features[0]?.length || 6;
  const weights = Array(numFeatures).fill(0);

  const learningRate = 0.01;
  const iterations = 100;

  for (let iter = 0; iter < iterations; iter++) {
    const gradients = Array(numFeatures).fill(0);

    features.forEach((feature) => {
      const prediction = sigmoid(dotProduct(feature, weights));
      const error = prediction - 1;

      feature.forEach((f, i) => {
        gradients[i] += error * f;
      });
    });

    weights.forEach((w, i) => {
      weights[i] = w - learningRate * (gradients[i] / features.length);
    });
  }

  return weights;
}

function generateTomorrowFeatures(logs: HabitLog[]): number[] {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayOfWeek = tomorrow.getDay();

  const lastLog = logs[logs.length - 1];
  const previousDayCompletion = lastLog?.status ? 1 : 0;

  let streak = 0;
  for (let i = logs.length - 1; i >= 0; i--) {
    if (logs[i].status) {
      streak++;
    } else {
      break;
    }
  }

  const weekendFlag = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;

  const recentCompletionRate = calculateRecentRate(logs, logs.length - 1, 7);

  return [
    1,
    dayOfWeek / 7,
    previousDayCompletion,
    Math.min(streak / 10, 1),
    weekendFlag,
    recentCompletionRate,
  ];
}

function predict(features: number[], weights: number[]): number {
  return sigmoid(dotProduct(features, weights));
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}
