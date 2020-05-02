export default function dummyDataGenerator(
  updateReadingStateFunction: (value: any) => void,
  intervalFrequency: number,
) {
  let intervalFunction: number;

  function getRandomValue(range: number, valueToSubtract = 0) {
    return Math.round(Math.random() * range - valueToSubtract);
  }

  function generateDummyReadings() {
    return {
      peep: getRandomValue(10),
      peakPressure: getRandomValue(100, 100),
      // patientRate: getRandomValue(220),
      plateauPressure: getRandomValue(20),
      patientRate: 80,
      vte: getRandomValue(700),
      inspiratoryTime: getRandomValue(3),
      expiratoryTime: getRandomValue(5).toFixed(1),
      oxygen: getRandomValue(100),
      flow: getRandomValue(30, 10),
    };
  }

  function startGenerating() {
    intervalFunction = setInterval(() => {
      const newReadings = generateDummyReadings();
      updateReadingStateFunction(newReadings);
    }, intervalFrequency);
  }

  function stopGenerating() {
    clearInterval(intervalFunction);
  }

  return {
    startGenerating,
    stopGenerating,
  };
}