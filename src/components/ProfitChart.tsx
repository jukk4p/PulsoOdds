'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ProfitChartProps {
  data: { date: string; profit: number }[];
}

export function ProfitChart({ data }: ProfitChartProps) {
  // Sort by date and calculate cumulative profit
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let currentCumulative = 0;
  const labels = sortedData.map(d => new Date(d.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }));
  const cumulativeProfits = sortedData.map(d => {
    currentCumulative += d.profit;
    return currentCumulative;
  });

  // Start from zero
  labels.unshift('Inicio');
  cumulativeProfits.unshift(0);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Evolución de Beneficios (Unidades)',
        data: cumulativeProfits,
        borderColor: '#00FF87',
        backgroundColor: 'rgba(0, 255, 135, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#00FF87',
        pointBorderColor: '#0A0A0F',
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1A1A2E',
        titleColor: '#00FF87',
        bodyColor: '#FFFFFF',
        borderColor: 'rgba(0, 255, 135, 0.2)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.4)',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.4)',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
    },
  };

  return (
    <div className="h-[400px] w-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
