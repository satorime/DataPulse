import Plot from 'react-plotly.js'

export default function WeightChart({ records, predictions }) {
  const historical = records
    .filter(r => r.weight != null)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const histDates = historical.map(r => r.date.slice(0, 10))
  const histWeights = historical.map(r => r.weight)

  const predDates = predictions.map(p => p.date.slice(0, 10))
  const predWeights = predictions.map(p => p.weight)

  return (
    <Plot
      data={[
        {
          x: histDates,
          y: histWeights,
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Recorded',
          line: { color: '#3b82f6', width: 2 },
          marker: { size: 5 },
        },
        {
          x: predDates,
          y: predWeights,
          type: 'scatter',
          mode: 'lines+markers',
          name: '7-day forecast',
          line: { color: '#ef4444', dash: 'dash', width: 2 },
          marker: { size: 5, symbol: 'diamond' },
        },
      ]}
      layout={{
        title: { text: 'Weight Trend & Forecast', font: { size: 15 } },
        xaxis: { title: 'Date' },
        yaxis: { title: 'Weight (kg)' },
        legend: { orientation: 'h', y: -0.2 },
        margin: { t: 50, r: 20, b: 60, l: 60 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
      }}
      style={{ width: '100%', height: '360px' }}
      config={{ responsive: true, displayModeBar: false }}
    />
  )
}
