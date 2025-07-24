import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Stack,
    Paper,
    Chip,
    Fade,
} from '@mui/material';

//  Speedometer Canvas Drawing
const Speedometer = ({ value = 0, maxValue = 200, units = 'cpm' }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 250;

        const centerX = canvas.width / 2;
        const centerY = canvas.height * 0.8;
        const radius = 90;
        const startAngle = Math.PI;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, 0);
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 10;
        ctx.stroke();

        // Needle
        const angle = startAngle + (value / maxValue) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + radius * 0.9 * Math.cos(angle),
            centerY + radius * 0.9 * Math.sin(angle)
        );
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Value text
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(`${value.toFixed(1)} ${units}`, centerX, centerY + 30);
    }, [value, maxValue, units]);

    return <canvas ref={canvasRef} />;
};

const Task = () => {
    const unitsList = ['CPS', 'CPM', 'µSv/h'];
    const [data, setData] = useState([0, 0, 0]);
    const [unitIndex, setUnitIndex] = useState(0);
    const [low, setLow] = useState('');
    const [medium, setMedium] = useState('');
    const [high, setHigh] = useState('');

    const currentUnit = unitsList[unitIndex];
    const currentValue = data[unitIndex] || 0;

    // New random values for every 2 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            const simulated = Array.from({ length: 3 }, () => Math.random() * 200);
            setData(simulated);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Alarm status (only for CPS)
    const getAlarmStatus = () => {
        const l = parseFloat(low);
        const m = parseFloat(medium);
        const h = parseFloat(high);
        const v = currentValue;

        if (isNaN(l) || isNaN(m) || isNaN(h)) {
            return { label: '⚪ Normal', color: 'default' };
        }
        if (v > h) {
            return { label: '🔴 High', color: 'error' };
        }
        if (v > m) {
            return { label: '🟡 Medium', color: 'warning' };
        }
        if (v > l) {
            return { label: '🟢 Low', color: 'success' };
        }
        return { label: '⚪ Normal', color: 'default' };
    };

    const alarm = getAlarmStatus();

    return (
        <Paper
            elevation={4}
            sx={{
                padding: 4,
                maxWidth: 600,
                margin: 'auto',
                mt: 4,
                transition: 'background-color 0.5s ease',
            }}
        >
            <Typography variant="h5" align="center" gutterBottom>
                Simple Speedometer
            </Typography>

            <Box display="flex" justifyContent="center" mt={2} mb={2}>
                <Speedometer value={currentValue} maxValue={200} units={currentUnit} />
            </Box>

            {/* CPS Only: Alarm Chip */}
            {currentUnit === 'CPS' && (
                <Box textAlign="center" mb={2}>
                    <Fade in>
                        <Chip
                            label={`${alarm.label} (${currentValue.toFixed(1)} CPS)`}
                            color={alarm.color}
                            sx={{ fontSize: '1rem', px: 2, py: 1 }}
                        />
                    </Fade>
                </Box>
            )}

            {/* Unit Switch Buttons */}
            <Stack direction="row" spacing={2} justifyContent="center" my={3}>
                {unitsList.map((unit, idx) => (
                    <Button
                        key={unit}
                        variant={unitIndex === idx ? 'contained' : 'outlined'}
                        onClick={() => setUnitIndex(idx)}
                    >
                        {unit}
                    </Button>
                ))}
            </Stack>

            {/* Alarm Threshold Inputs */}
            <Box>
                <Typography variant="subtitle1" gutterBottom align="center">
                    Alarm Thresholds (Applicable only in CPS)
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                    <TextField
                        type="number"
                        label="Low"
                        value={low}
                        onChange={(e) => setLow(e.target.value)}
                        size="small"
                    />
                    <TextField
                        type="number"
                        label="Medium"
                        value={medium}
                        onChange={(e) => setMedium(e.target.value)}
                        size="small"
                    />
                    <TextField
                        type="number"
                        label="High"
                        value={high}
                        onChange={(e) => setHigh(e.target.value)}
                        size="small"
                    />
                </Stack>
            </Box>
        </Paper>
    );
};

export default Task;
