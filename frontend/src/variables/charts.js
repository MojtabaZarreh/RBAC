
const dashboard24HoursPerformanceChart = {
  data: (canvas) => {
    return {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
      ],
      datasets: [
        {
          borderColor: "#6bd098",
          backgroundColor: "#6bd098",
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          data: [300, 310, 316, 322, 330, 326, 333, 345, 338, 354],
        },
        {
          borderColor: "#f17e5d",
          backgroundColor: "#f17e5d",
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          data: [320, 340, 365, 360, 370, 385, 390, 384, 408, 420],
        },
        {
          borderColor: "#fcc468",
          backgroundColor: "#fcc468",
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          data: [370, 394, 415, 409, 425, 445, 460, 450, 478, 484],
        },
      ],
    };
  },
  options: {
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      y: {
        ticks: {
          color: "#9f9f9f",
          beginAtZero: false,
          maxTicksLimit: 5,
        },
        grid: {
          drawBorder: false,
          display: false,
        },
      },
      x: {
        barPercentage: 1.6,
        grid: {
          drawBorder: false,
          display: false,
        },
        ticks: {
          padding: 20,
          color: "#9f9f9f",
        },
      },
    },
  },
};


module.exports = {
  dashboard24HoursPerformanceChart,
};
