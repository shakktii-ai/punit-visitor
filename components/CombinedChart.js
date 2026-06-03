import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const CombinedChart = ({
  labels = ["January", "February", "March", "April", "May"],
  barData = [40, 45, 60, 50, 70],
  lineData = [35, 40, 70, 60, 75],
  barLabel = "Visitors",
  lineLabel = "Trend",
}) => {
  const chartData = {
    labels,
    datasets: [
      {
        type: "bar",
        label: barLabel,
        data: barData,
        backgroundColor: "rgba(249, 115, 22, 0.7)",
        hoverBackgroundColor: "rgba(249, 115, 22, 0.9)",
        borderColor: "#F97316",
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        order: 2,
      },
      {
        type: "line",
        label: lineLabel,
        data: lineData,
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        pointBackgroundColor: "#3B82F6",
        pointBorderColor: "#1E293B",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: true,
        order: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: "#94a3b8",
          font: { size: 12 },
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.06)" },
        ticks: { color: "#94a3b8", font: { size: 11 } },
        border: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.06)" },
        ticks: { color: "#94a3b8", font: { size: 11 } },
        border: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  return (
    <div className="w-full p-6 bg-transparent rounded-2xl">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default CombinedChart;
