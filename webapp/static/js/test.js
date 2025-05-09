function basic_sum(flow){
    const tags_count = {};

    flow.forEach(function(com) {
        if (com.tags != null){
            const tags = com.tags.split(",");

            tags.forEach(function(tag) {
                if (tags_count[tag]) {
                    tags_count[tag]++;
                  } else {
                    tags_count[tag] = 1;
                  }
            });
        }
    });

    return tags_count;
}

function basic_time(flow){    
    flow.forEach(f => {
        f.ts_start = f.ts_start / 1000;
        f.ts_end = f.ts_end / 1000;
    });

    const minTs = Math.min(...flow.map(f => f.ts_start));
    const maxTs = Math.max(...flow.map(f => f.ts_end));

    const step = 10000;
    const dataPoints = [];
  
    for (let t = minTs; t <= maxTs; t += step) {
      const count = flow.filter(f => f.ts_start <= t && f.ts_end > t).length;
      dataPoints.push({
        x: t / 10000,
        y: count
      });
    }

    return dataPoints;
}

function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = Math.floor((360 * i) / count);
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
}

async function fetchData() {
  try {
    const response = await fetch('http://0.0.0.0:8000/api/flow');
    if (!response.ok) {
      throw new Error('Erreur HTTP : ' + response.status);
    }
    const data = await response.json();

    const state_tag = basic_sum(data.flows);

    const canvas_camembert = document.getElementById('tag_camenbert').getContext('2d');

    const labels = Object.keys(state_tag);
    const value = Object.values(state_tag);

    const backgroundColors = generateColors(labels.length);

    const camembert = new Chart(canvas_camembert, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: 'Répartition',
            data: value,
            backgroundColor: backgroundColors,
            borderColor: 'white',
            borderWidth: 0
          }]
        },
        options: {
          responsive: false,
          plugins: {
            legend: {
              position: 'bottom'
            },
            title: {
              display: true,
              text: 'Repartition des tags'
            }
          }
        }
    });

    const state_time = basic_time(data.flows);

    const canvas_time = document.getElementById('tag_time').getContext('2d');

    const time = new Chart(canvas_time, {
        type: 'line',
        data: {
          datasets: [{
            label: 'Connexions actives',
            data: state_time,
            fill: true,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            pointRadius: 0,
            tension: 0.4
          }]
        },
        options: {
          responsive: false,
          parsing: false,
          plugins: {
            title: {
                display: true,
                text: 'Conection active'
            }
          },
          scales: {
            x: {
                type: 'linear',
                title: {
                  display: true,
                  text: 'Tick (brut * 10000)'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Connexions actives'
                }
            }
          }
        }
      });
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error);
  }
}

fetchData();