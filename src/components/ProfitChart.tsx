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
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let currentCumulative = 0;
  const labels = sortedData.map(d => new Date(d.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }));
  const cumulativeProfits = sortedData.map(d => {
    currentCumulative += d.profit;
    return currentCumulative;
  });

  labels.unshift('Inicio');
  cumulativeProfits.unshift(0);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Unidades',
        data: cumulativeProfits,
        borderColor: '#C8FF00',
        backgroundColor: 'rgba(200, 255, 0, 0.05)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#C8FF00',
        pointHoverBorderColor: '#0D0F12',
        pointHoverBorderWidth: 3,
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(10, 17, 26, 0.95)',
        titleFont: {
          family: 'JetBrains Mono',
          size: 11,
          weight: 'bold' as const,
        },
        bodyFont: {
          family: 'JetBrains Mono',
          size: 14,
          weight: '900' as const,
        },
        titleColor: 'rgba(255, 255, 255, 0.5)',
        bodyColor: '#C8FF00',
        borderColor: 'rgba(200, 255, 0, 0.3)',
        borderWidth: 1,
        padding: 16,
        displayColors: false,
        cornerRadius: 2,
        callbacks: {
          label: (context: any) => `${context.parsed.y > 0 ? '▲' : '▼'} ${context.parsed.y.toFixed(2)} UNIDADES`
        }
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.3)',
          font: {
            family: 'JetBrains Mono',
            size: 10,
            weight: 'bold' as const,
          },
          callback: (value: any) => `${value > 0 ? '+' : ''}${value}u`
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.2)',
          font: {
            family: 'JetBrains Mono',
            size: 10,
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
      },
    },
  };

  return (
    <div className="h-full w-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
