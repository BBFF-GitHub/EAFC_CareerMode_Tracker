//External Modules
import { Injectable } from "@angular/core";

@Injectable()
export class ChartsService {

  //REGION: chart build methods
  buildBarChart(labels: string[], xData: any[], yData: any[]) {
    let barChart: any = {
      labels: labels,
      datasets: []
    };

    xData.forEach(x => {
      barChart.datasets.push({ type: 'bar', label: x.label, backgroundColor: x.bgColor, xAxisID: 'x', data: x.data });
    });
    yData.forEach(y => {
      barChart.datasets.push({ type: 'bar', label: y.label, backgroundColor: y.bgColor, yAxisID: 'y', data: y.data });
    });

    return barChart;
  }

  buildDonutChart(labels: string[], data: any[]) {
    let donutChart = {
      labels: labels,
      datasets: [
        {
          data: data.map(x => x.data),
          backgroundColor: data.map(x => x.bgColor),
          hoverBackgroundColor: data.map(x => x.hoverBGColor)
        }
      ]
    };

    return donutChart;
  }

  buildLineChart(labels: string[], data: any[]) {
    let lineChart: any = {
      labels: labels,
      datasets: []
    };

    data.forEach(x => {
      lineChart.datasets.push({ label: x.label, fill: false, borderColor: x.color, tension: 0.4, data: x.data });
    });

    return lineChart;
  }
  //END REGION

  //REGION: chart options methods
  getBarChartOptions(maxValue: number, hideLegend: boolean = false) {
    let barChartOptions = {
      indexAxis: 'x',
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          display: !hideLegend,
          labels: {
            color: '#495057'
          }
        },
        tooltips: {
          mode: 'index',
          intersect: true
        }
      },
      scales: {
        x: {
          ticks: {
            display: true,
            color: '#495057'
          },
          grid: {
            color: '#ebedef',
            drawBorder: true
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef',
            drawBorder: true
          },
          max: maxValue
        }
      }
    };

    return barChartOptions;
  }

  getDonutChartOptions(hideLegend: boolean = false) {
    let donutChartOptions = {
      cutout: '60%',
      plugins: {
        legend: {
          display: !hideLegend,
          labels: {
            color: '#495057'
          }
        }
      }
    };

    return donutChartOptions;
  }

  getLineChartOptions(minValue: number, maxValue: number, hideLegend: boolean = false) {
    let lineChartOptions = {
      stacked: false,
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          display: !hideLegend,
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: "#495057"
          },
          grid: {
            color: "#ebedef"
          }
        },
        y: {
          type: 'linear',
          display: true,
          ticks: {
            color: "#495057"
          },
          grid: {
            color: "#ebedef"
          },
          min: minValue,
          max: maxValue
        }
      }
    };

    return lineChartOptions;
  }

  getStackedBarChartOptions(maxValue: number, hideLegend: boolean = false) {
    return {
      indexAxis: 'y',
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        tooltips: {
          mode: 'index',
          intersect: false
        },
        legend: {
          display: !hideLegend
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            display: false
          },
          grid: {
            color: "#ebedef",
            drawBorder: false
          },
          max: maxValue
        },
        y: {
          stacked: true,
          ticks: {
            color: "#495057"
          },
          grid: {
            color: "#ebedef",
            drawBorder: false
          }
        }
      }
    }
  };
  //END REGION

}
