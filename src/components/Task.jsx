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
        const endAngle = 0;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle)
        ctx.strokeStyle = '#cbd5e1'
        ctx.lineWidth = 12
        ctx.stroke()

        // Tick marks and labels from 0 to 200
        const numTicks = 10
        for (let i = 0; i <= numTicks; i++) {
            const angle = startAngle + (i / numTicks) * Math.PI
            const inner = radius - 6
            const outer = radius + 6

            const x1 = centerX + inner * Math.cos(angle);
            const y1 = centerY + inner * Math.sin(angle);
            const x2 = centerX + outer * Math.cos(angle);
            const y2 = centerY + outer * Math.sin(angle);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Tick label
            const labelValue = Math.round((i / numTicks) * maxValue);
            const lx = centerX + (radius + 18) * Math.cos(angle);
            const ly = centerY + (radius + 18) * Math.sin(angle);
            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#334155';
            ctx.textAlign = 'center';
            ctx.fillText(labelValue.toString(), lx, ly + 4);
        }

        // Draw needle based on actual value
        const angle = startAngle + (value / maxValue) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + radius * 0.9 * Math.cos(angle),
            centerY + radius * 0.9 * Math.sin(angle)
        );
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#1e293b';
        ctx.fill();

        // Value display
        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(`${value.toFixed(1)} ${units}`, centerX, centerY + 35);
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
            elevation={6}
            sx={{
                padding: 4,
                maxWidth: 700,
                margin: 'auto',
                mt: 5,
                borderRadius: 4,
                background: 'linear-gradient(to right, #f5f7fa, #c3cfe2)',
                boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
            }}
        >
            <Typography
                variant="h4"
                align="center"
                gutterBottom
                sx={{ fontWeight: 'bold', color: '#333' }}
            >
                Simple Speedometer
            </Typography>

            {/* Speedometer */}
            <Box display="flex" justifyContent="center" mt={3} mb={2}>
                <Speedometer value={currentValue} maxValue={200} units={currentUnit} />
            </Box>

            {/* Alarm Status only for CPS */}
            {currentUnit === 'CPS' && (
                <Box textAlign="center" mb={3}>
                    <Fade in>
                        <Chip
                            label={`${alarm.label} (${currentValue.toFixed(1)} CPS)`}
                            color={alarm.color}
                            sx={{
                                fontSize: '1rem',
                                px: 3,
                                py: 1.5,
                                fontWeight: 600,
                                letterSpacing: 0.5,
                            }}
                        />
                    </Fade>
                </Box>
            )}

            {/* Unit Switch */}
            <Typography variant="subtitle1" align="center" gutterBottom>
                Select Unit
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center" mb={3}>
                {unitsList.map((unit, idx) => (
                    <Button
                        key={unit}
                        variant={unitIndex === idx ? 'contained' : 'outlined'}
                        onClick={() => setUnitIndex(idx)}
                        sx={{
                            px: 3,
                            py: 1,
                            fontWeight: 600,
                            borderRadius: 2,
                            textTransform: 'none',
                        }}
                    >
                        {unit}
                    </Button>
                ))}
            </Stack>

            {/* Alarm Threshold Inputs */}
            <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontWeight: 500 }}>
                Alarm Thresholds (Only for CPS)
            </Typography>
            <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                flexWrap="wrap"
                sx={{ mt: 2 }}
            >
                <TextField
                    type="number"
                    label="Low"
                    value={low}
                    onChange={(e) => setLow(e.target.value)}
                    size="small"
                    variant="outlined"
                    sx={{
                        minWidth: 120,
                        backgroundColor: '#fff',
                        borderRadius: 2,
                        boxShadow: 1,
                    }}
                />
                <TextField
                    type="number"
                    label="Medium"
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    size="small"
                    variant="outlined"
                    sx={{
                        minWidth: 120,
                        backgroundColor: '#fff',
                        borderRadius: 2,
                        boxShadow: 1,
                    }}
                />
                <TextField
                    type="number"
                    label="High"
                    value={high}
                    onChange={(e) => setHigh(e.target.value)}
                    size="small"
                    variant="outlined"
                    sx={{
                        minWidth: 120,
                        backgroundColor: '#fff',
                        borderRadius: 2,
                        boxShadow: 1,
                    }}
                />
            </Stack>
        </Paper>

    );
};

export default Task;
