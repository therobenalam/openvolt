// src/services/api.js
import axios from 'axios';
import { OPENVOLT_API_ENDPOINT, CARBON_INTENSITE_API_ENDPOINT, ACCESS_TOKEN } from '../config/config';
const moment = require('moment');

export async function fetchDataOfJan() {
    return axios.get(`${OPENVOLT_API_ENDPOINT}/interval-data`, {
        params: {
            meter_id: '6514167223e3d1424bf82742',
            granularity: 'month',
            start_date: '2023-01-01',
            end_date: '2023-01-31',
        },
        headers: {
            accept: 'application/json',
            'x-api-key': ACCESS_TOKEN,
        }
    });
}

export async function fetchDataOfJanHh() {
    try {
        const response = await axios.get(`${OPENVOLT_API_ENDPOINT}/interval-data`, {
            params: {
                meter_id: '6514167223e3d1424bf82742',
                granularity: 'hh',
                start_date: '2023-01-01',
                end_date: '2023-01-31',
            },
            headers: {
                accept: 'application/json',
                'x-api-key': ACCESS_TOKEN,
            }
        });
        return response.data;
    } catch (error) {
        throw error; // Handle errors in the component that calls this function
    }
}

async function fetchCarbonIntensityHh(from, to) {
    return axios.get(`${CARBON_INTENSITE_API_ENDPOINT}/intensity/${from}/${to}`);
}

export async function fetchCarbonIntensityHhInterval(startDate, endDate) {
    return new Promise(async (resolve, reject) => {
        const intensityData = [];
        
        const chunkSizeInDays = 14;
        let currentDate = moment(startDate);
        const endDateMoment = moment(endDate);
        let promiseList = []
        while (currentDate.isBefore(endDateMoment)) {
            const chunkStartDate = currentDate.format('YYYY-MM-DD');
            let chunkEndDate = moment(currentDate).add(chunkSizeInDays - 1, 'days').format('YYYY-MM-DD');
            if (endDateMoment.isBefore(chunkEndDate))
                chunkEndDate = endDateMoment.format('YYYY-MM-DD');
            promiseList.push(fetchCarbonIntensityHh(chunkStartDate, chunkEndDate));

            currentDate.add(chunkSizeInDays - 1, 'days');
        }
        Promise.all(promiseList).then((res) => {
            for (let i = 0; i < res.length; i++) {
                let intensity = res[i].data
                intensityData.push(...intensity.data);
            }
            resolve({
                'data': intensityData
            })
        }).catch((err) => {
            reject(err)
        })
    })
}





async function fetchGenerationMixHh(from, to) {

    return axios.get(`${CARBON_INTENSITE_API_ENDPOINT}/generation/${from}/${to}`);
}

export async function fetchGenerationMixHhInterval(startDate, endDate) {
    return new Promise(async (resolve, reject) => {
        const generationMixData = [];
        const chunkSizeInDays = 14;
        let currentDate = moment(startDate);
        const endDateMoment = moment(endDate);
        let promiseList = []
        while (currentDate.isBefore(endDateMoment)) {
            const chunkStartDate = currentDate.format('YYYY-MM-DD');
            let chunkEndDate = moment(currentDate).add(chunkSizeInDays - 1, 'days').format('YYYY-MM-DD');
            if (endDateMoment.isBefore(chunkEndDate))
                chunkEndDate = endDateMoment.format('YYYY-MM-DD');
            promiseList.push(fetchGenerationMixHh(chunkStartDate, chunkEndDate));

            currentDate.add(chunkSizeInDays - 1, 'days');
        }
        Promise.all(promiseList).then((res) => {
            for (let i = 0; i < res.length; i++) {
                let generationMix = res[i].data
                generationMixData.push(...generationMix.data);
            }
            resolve({
                'data': generationMixData
            })
        }).catch((err) => {
            reject(err)
        })
    })
}
