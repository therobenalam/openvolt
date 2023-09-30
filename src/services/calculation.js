import { fetchDataOfJanHh, fetchCarbonIntensityHhInterval, fetchGenerationMixHhInterval } from '../services/api';
const moment = require('moment');


export async function calculateTotalCO2EmissionsJan() {
    return new Promise(async (resolve, reject) => {
            Promise.all([
                fetchDataOfJanHh(),
                fetchCarbonIntensityHhInterval('2023-01-01', '2023-02-01')
            ])
                .then(([consumption, intensity]) => {
                    let consumptionData = consumption['data'];
                    let intensityData = intensity['data'];

                    // Initialize total CO2 emissions
                    let totalCO2Emissions = 0;

                    // Iterate through each consumption data point
                    for (let i = 0; i < consumptionData.length; i++) {
                        const consumptionItem = consumptionData[i];
                        const formattedDateTime = moment(consumptionItem.start_interval).format("YYYY-MM-DDTHH:mm[Z]");
                        // Find the corresponding intensity data point based on the timestamp
                        const matchingIntensity = intensityData.find(intensityItem => {
                            return (
                                intensityItem.from === formattedDateTime);
                        });
                        if (matchingIntensity && consumptionItem.consumption_units === 'kWh') {
                            // Calculate CO2 emissions for the consumption data point and add it to the total
                            const emissions =
                                parseFloat(consumptionItem.consumption) *
                                (matchingIntensity.intensity.actual / 1000);
                            totalCO2Emissions += emissions;
                        } else {
                            console.log('Missing data')
                        }
                    }
                    resolve(totalCO2Emissions);
                }).catch((err)=>{
                    console.log("ERRRR", err)
                    reject(err)
                })
    })
}

function sortObjectByValue(obj) {
    const keyValueArray = Object.entries(obj);

    keyValueArray.sort((a, b) => b[1] - a[1]);

    const sortedObject = Object.fromEntries(keyValueArray);


    return sortedObject;
}

export async function calculateGenerationMixJan() {
    return new Promise(async (resolve, reject) => {
        try {
            Promise.all([
                fetchDataOfJanHh(),
                fetchGenerationMixHhInterval('2023-01-01', '2023-02-01')
            ])
                .then(([consumption, generationMix]) => {
                    let consumptionData = consumption['data']
                    let generationMixData = generationMix['data']
                    // Initialize total Generational Mix
                    let totalGenerationalMix = {};
                    let totalConsumption = 0
                    // Iterate through each consumption data point
                    for (let i = 0; i < consumptionData.length; i++) {
                        const consumptionItem = consumptionData[i];
                        const formattedDateTime = moment(consumptionItem.start_interval).format("YYYY-MM-DDTHH:mm[Z]");
                        // Find the corresponding generationMix data point based on the timestamp
                        const matchinggenerationMix = generationMixData.find(generationMixItem => {
                            return (
                                generationMixItem.from === formattedDateTime);
                        });
                        if (matchinggenerationMix && consumptionItem.consumption_units === 'kWh') {
                            // Calculate Geration Mix for the consumption data point and add it to the total
                            let consumption = parseFloat(consumptionItem.consumption)

                            for (let j = 0; j < matchinggenerationMix.generationmix.length; j++) {
                                let element = matchinggenerationMix.generationmix[j]
                                let value = element.perc * consumption / 100
                                if (totalGenerationalMix.hasOwnProperty(element.fuel)) {
                                    totalGenerationalMix[element.fuel] += value
                                } else {
                                    totalGenerationalMix[element.fuel] = value
                                }
                            };

                            totalConsumption += consumption



                        } else {
                            console.log('Missing data')
                        }
                    }

                    Object.keys(totalGenerationalMix).forEach((el) => {
                        totalGenerationalMix[el] = (totalGenerationalMix[el] / totalConsumption) * 100
                    })
                    totalGenerationalMix = sortObjectByValue(totalGenerationalMix);
                    resolve(totalGenerationalMix);
                })
        } catch (error) {
            reject(error)
        }
    })
}
