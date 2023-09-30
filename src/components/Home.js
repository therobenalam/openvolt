// src/components/Home.js

import React, { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import './CountUpWidgets.css'; // Import your CSS file for styling
import { fetchDataOfJan } from '../services/api';
import { calculateTotalCO2EmissionsJan, calculateGenerationMixJan } from '../services/calculation'
import { NotificationManager } from 'react-notifications';




function Home() {
    const [totalConsumption, setTotalConsumption] = useState(0);
    const [co2Emissions, setCo2Emissionsn] = useState(0);
    const [generationMix, setGenerationMix] = useState({});
    const [isLoadingGeneration, setIsLoadingGeneration] = useState(0);
    const [isLoadingEmission, setIsLoadingEmission] = useState(0);

    let isDataFetched = false;

    useEffect(() => {
        // Check if data is already fetched
        if (isDataFetched) {
            return;
        }

        // Set the flag to prevent further calls
        isDataFetched = true;
        async function fetchData() {
            try {
                fetchDataOfJan().then((res) => {
                    let consumption = res.data
                    setTotalConsumption(consumption['data'][0].consumption)
                }).catch((err) => {
                    NotificationManager.error(err.message, 'Error', 3000);
                })
                setIsLoadingEmission(1)
                setIsLoadingGeneration(1)
                calculateTotalCO2EmissionsJan().then((emissions) => {
                    setCo2Emissionsn(emissions)
                    setIsLoadingEmission(0)
                }).catch((err) => {
                    setIsLoadingEmission(-1)
                    NotificationManager.error(err.message, 'Error fetching CO2 Emissions', 3000);

                })
                calculateGenerationMixJan().then((generationMix) => {
                    setGenerationMix(generationMix)
                    setIsLoadingGeneration(0)
                }).catch((err) => {
                    setIsLoadingGeneration(-1)
                    NotificationManager.error(err.message, 'Error fetching Generation Mix', 3000);

                })
            } catch (error) {
                console.error('Error fetching data:', error);
                NotificationManager.error('error', 'Error', 3000);

            }
        }
        fetchData();
    }, []);
    return (
        <div>
            {/* Header */}
            <header className="page-header">
                <h1>Openvolt</h1>
            </header>

            <div className="countup-widgets-container">
                <div className="countup-widget">
                    <h2>Energy consumed (kWh)</h2>
                    {totalConsumption === 0 ? (
                        <div className="loading-spinner"></div>
                    ) : (
                        <>
                            <CountUp start={0} end={totalConsumption} duration={2} separator="," className="countup-number" />
                        </>
                    )}
                </div>

                <div className="countup-widget">
                    <h2>CO2 (kgs) emitted</h2>
                    {isLoadingEmission === 1 ? (
                        <div className="loading-spinner"></div>
                    ) : isLoadingEmission === -1 ? (
                        <div className="error-message">Error: Failed to load emission data</div>
                    ) : (
                        <CountUp
                            start={0}
                            end={co2Emissions}
                            duration={2}
                            separator=","
                            className="countup-number"
                        />
                    )}
                </div>
            </div>
            <div className="countup-widgets-container">
                <div className="countup-widget">
                    <h2>Generation Mix</h2>
                    {
                        isLoadingGeneration === 1 ? (
                            <div className="loading-spinner"></div>
                        ) : isLoadingGeneration === -1 ? (
                            <div className="error-message">Error: Failed to load generation data</div>
                        ) : (
                            <div className='container'>
                                <ul style={{ padding: '0' }}>
                                    {Object.keys(generationMix).map((key) => (
                                        <li key={key} className='list-item'>
                                            <span className='key'>{key}:</span>
                                            <CountUp
                                                start={0}
                                                end={generationMix[key]}
                                                duration={2}
                                                decimals={1}
                                                suffix="%"
                                                style={{ fontSize: '1.2em' }}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    }

                </div>
            </div>
        </div>
    );
}

export default Home;