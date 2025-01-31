import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import React, { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

const LineChart = React.memo(({ chartData }: { chartData: any[]; }) => {
    const chartRef = useRef<any>(null); // Reference to the Chart.js instance

    useEffect(() => {
        if (chartRef.current) {
            const chartInstance = chartRef.current;

            // Update the chart data
            chartInstance.data.labels = chartData.map((item) => item.time); // Update labels
            chartInstance.data.datasets[0].data = chartData.map((item) => item.value); // Update dataset

            // Call update to apply changes
            chartInstance.update();
        }
        console.log({ chartData });
    }, [chartData]); // Trigger update when chartData changes

    const data = {
        labels: chartData.map((item) => item.time),
        datasets: [
            {
                label: "Transfer Data",
                data: chartData.map((item) => item.value),
                borderColor: chartData.map((item) => item.type === "receiver" ? "rgb(167, 139, 250)" : "blue"),
                backgroundColor: "rgb(167, 139, 250)",
                tension: 0.5, // Smooth curve
                pointRadius: 2, // Dots size on the line
                pointHoverRadius: 2, // Hover effect dot size
                pointStyle: "line", // No visible point but tooltip works
                borderWidth: 3, // Line width
            },
        ],
    };

    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 0, // Smooth transition duration
            easing: "easeOutQuart", // Smooth easing function
        },
        plugins: {
            legend: {
                display: false, // Hide legend for compact charts
            },
            title: {
                display: false, // Hide title for inline charts
            },
            tooltip: {
                enabled: true, // Enable tooltips on hover
                callbacks: {
                    label: (context: { raw: any; }) => `Value: ${context.raw}`, // Customize tooltip content
                },
            },
        },
        scales: {
            x: { display: false }, // Hide X-axis for compact charts
            y: { display: false }
        }
    };

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                overflow: "hidden", // Prevent overflow to keep chart steady
            }}
        >
            <Line ref={chartRef} data={data} options={options} />
        </div>
    );
});

export default LineChart;
