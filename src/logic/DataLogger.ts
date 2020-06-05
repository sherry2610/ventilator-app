import * as RNFS from 'react-native-fs';
import Alarms from '../constants/Alarms';
import SetParameter from '../interfaces/SetParameter';
import DataConfig from '../constants/DataConfig';
import { BreathingPhase } from '../enums/BreathingPhase';

// TODO: Add serial data packets also
export default function dataLogger() {
  const nowTimeStamp: string = new Date().toISOString().replace(/\.|:/g, '-');
  const logDirectory: string = `${RNFS.ExternalDirectoryPath}/sessions`;
  const logFile: string = `${nowTimeStamp}.csv`;
  const folderCreationPromise = RNFS.mkdir(logDirectory);
  let readingsCsv: string[] = [getDataHeaders()];
  const logFrequency: number =
    (DataConfig.graphLength / DataConfig.dataFrequency) * 1000; // log every time the graph clears

  setInterval(() => {
    if (readingsCsv.length > 0) {
      writeToLogFile(readingsCsv.length);
    }
  }, logFrequency);

  function getDataHeaders() {
    return [
      'Timestamp',
      'Measured Pressure',
      getSetParameterHeader('Peep'),
      getSetParameterHeader('PIP'),
      getSetParameterHeader('Plateau Pressure'),
      getSetParameterHeader('Patient Rate'),
      getSetParameterHeader('Tidal Volume'),
      'I/E Ratio',
      'VTi',
      'VTe',
      getSetParameterHeader('Minute Ventilation'),
      getSetParameterHeader('Fi O2'),
      'Flow Rate',
      'Ventilation Mode',
      'Breathing Phase',
      getAlarmHeaders(),
    ].join(',');
  }

  function getSetParameterHeader(parameterName: string) {
    return [
      `${parameterName} Set Value`,
      `${parameterName} Measured Value`,
      `${parameterName} Lower Limit`,
      `${parameterName} Upper Limit`,
    ].join(',');
  }

  function getAlarmHeaders() {
    return Alarms.join(',');
  }

  function onDataReading(reading: any) {
    const readingInCsv = getCsvFormat(reading);
    readingsCsv.push(readingInCsv);
  }

  function writeToLogFile(numberOfReadingsAdded: number) {
    const readingsToAdd: string = readingsCsv.join('\n');
    folderCreationPromise.then(() => {
      RNFS.write(`${logDirectory}/${logFile}`, readingsToAdd + '\n')
        .then(() => {
          console.log(`written to ${logFile}`);
          readingsCsv = readingsCsv.slice(numberOfReadingsAdded);
        })
        .catch((err) => {
          console.log(err.message);
        });
    });
  }

  function getCsvFormat(reading: any): string {
    const {
      peep,
      measuredPressure,
      plateauPressure,
      respiratoryRate,
      tidalVolume,
      ieRatio,
      vti,
      vte,
      minuteVentilation,
      fiO2,
      flowRate,
      pip,
      mode,
      alarms,
      breathingPhase,
    } = reading;
    let readingsString: string = [
      new Date().toISOString(),
      measuredPressure,
      getSetParameterCsvFormat(peep),
      getSetParameterCsvFormat(pip),
      getSetParameterCsvFormat(plateauPressure),
      getSetParameterCsvFormat(respiratoryRate),
      getSetParameterCsvFormat(tidalVolume),
      ieRatio,
      vti,
      vte,
      getSetParameterCsvFormat(minuteVentilation),
      getSetParameterCsvFormat(fiO2),
      flowRate,
      mode,
      BreathingPhase[breathingPhase],
      getAlarmsInCsvFormat(alarms),
    ].join(',');
    return readingsString;
  }

  function getSetParameterCsvFormat(paramter: SetParameter) {
    return [
      paramter.setValueText || paramter.setValue,
      paramter.value,
      paramter.lowerLimit,
      paramter.upperLimit,
    ].join(',');
  }

  function getAlarmsInCsvFormat(alarms: string[]): string {
    let alarmPresenceArray: boolean[] = new Array(Alarms.length).fill(false);
    for (let i = 0; i < Alarms.length; i++) {
      if (alarms.includes(Alarms[i])) {
        alarmPresenceArray[i] = true;
      }
    }
    return alarmPresenceArray.join(',');
  }

  return {
    onDataReading,
  };
}