// pages/index.tsx
"use client";
import dynamic from 'next/dynamic';
import 'chart.js/auto';

// Dynamically import the Line component from react-chartjs-2 with SSR disabled
const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
  ssr: false,
});
interface DashboardChartProps {
  apiGraphData: Date[];
  selectedFilter: string;
  isApiData: boolean;
}

const DashBoardChart = (props: DashboardChartProps) => {

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let xAxisText = "Hours";

  const hoursFormat = (total_hours: number) => {
    const now = new Date();
    const start = now.getTime() - (total_hours - 1) * 60 * 60 * 1000;

    let labels: string[] = [];
    let hitsData: number[] = [];
    const hitCountMap = new Map();

    for (let i = start; i < now.getTime() + 1; i += 1000 * 60 * 60) {
      let tmp_date = new Date(i);
      let tmp_hr = tmp_date.getHours();
      labels.push(tmp_hr.toString());
      hitCountMap.set(tmp_hr, 0);
    }

    props.apiGraphData.forEach(
      (x) => {
        const date = new Date(x);
        let diff = Math.floor(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        const hours = date.getHours();
        if (diff < 1) {
          if (hitCountMap.has(hours)) {
            hitCountMap.set(hours, hitCountMap.get(hours) + 1);
          }
          else {
            hitCountMap.set(hours, 1);
          }
        }
      });
    for (let [key, value] of hitCountMap) {
      hitsData.push(value);
    }
    xAxisText = "Hours";
    return { labels, hitsData };
  };

  const DaysFormat = (total_days: number) => {

    const now = new Date();
    const start = now.getTime() - 1000 * 60 * 60 * 24 * (total_days - 1);

    let labels: string[] = [];
    let hitsData: number[] = [];
    const hitCountMap = new Map();

    for (let i = start; i < (now.getTime() + 1); i += 1000 * 60 * 60 * 24) {
      let tmp_date = new Date(i);
      let tmp_day = tmp_date.getDate();
      labels.push(tmp_day.toString());
      hitCountMap.set(tmp_day, 0);
    }

    props.apiGraphData.forEach(
      (x) => {
        const date = new Date(x);
        const days = date.getDate();
        if (hitCountMap.has(days)) {
          hitCountMap.set(days, hitCountMap.get(days) + 1);
        }
        else {
          hitCountMap.set(days, 1);
        }
      });
    for (let [key, value] of hitCountMap) {
      hitsData.push(value);
    }
    xAxisText = "Dates";
    return { labels, hitsData };
  };

  const MonthsFormat = (total_months: number) => {

    const now = new Date();
    const start = now.getMonth() - total_months + 2;

    let labels: string[] = [];
    let hitsData: number[] = [];
    const hitCountMap = new Map();

    for (let i = start; i <= now.getMonth() + 1; i++) {
      let tmp = (i + 12) % 12;
      labels.push(monthNames[(tmp - 1 + 12) % 12]);
      hitCountMap.set(tmp, 0);
    }

    props.apiGraphData.forEach(
      (x) => {
        const date = new Date(x);
        const months = date.getMonth() + 1;
        if (hitCountMap.has(months)) {
          hitCountMap.set(months, hitCountMap.get(months) + 1);
        }
        else {
          hitCountMap.set(months, 1);
        }
      });
    for (let [key, value] of hitCountMap) {
      hitsData.push(value);
    }
    xAxisText = "Months";
    return { labels, hitsData };
  };

  const processApiGraphData = () => {

    if (props.selectedFilter === '24-hours') {
      return hoursFormat(24);
    }
    else if (props.selectedFilter === '7-days') {
      return DaysFormat(7);
    }
    else if (props.selectedFilter === '1-month') {
      return DaysFormat(30);
    }
    else if (props.selectedFilter === '3-months') {
      return MonthsFormat(3);
    }
    else if (props.selectedFilter === '6-months') {
      return MonthsFormat(6);
    }
    else if (props.selectedFilter === '1-year') {
      return MonthsFormat(12);
    }
  };

  const { labels, hitsData } = processApiGraphData();
  const label = props.isApiData ? "API Hits" : "Form Submits";

  const data = {
    labels: labels, // X-axis labels (time durations)
    datasets: [
      {
        label: label,
        data: hitsData, // Y-axis data (hits)
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: xAxisText,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Total Hits',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="card bg-white">
      <div className="card-body">
        <div className='ml-5 mt-5 h-80 w-auto'>
          {data ? <Line data={data} options={options} /> : <p>Loading...</p>}
        </div>
      </div>
    </div>
  );
};

export default DashBoardChart;
