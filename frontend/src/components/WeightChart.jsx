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
          line: { color: '#0052FF', width: 2.5 },
          marker: { size: 5, color: '#0052FF' },
        },
        {
          x: predDates,
          y: predWeights,
          type: 'scatter',
          mode: 'lines+markers',
          name: '7-day forecast',
          line: { color: '#4D7CFF', dash: 'dot', width: 2 },
          marker: { size: 5, symbol: 'diamond', color: '#4D7CFF' },
        },
      ]}
      layout={{
        font: { family: 'Inter, system-ui, sans-serif', size: 12, color: '#64748B' },
        xaxis: {
          title: { text: 'Date', font: { size: 12 } },
          gridcolor: '#F1F5F9',
          linecolor: '#E2E8F0',
          tickfont: { size: 11, color: '#94A3B8' },
          showgrid: true,
          zeroline: false,
        },
        yaxis: {
          title: { text: 'Weight (kg)', font: { size: 12 } },
          gridcolor: '#F1F5F9',
          linecolor: '#E2E8F0',
          tickfont: { size: 11, color: '#94A3B8' },
          showgrid: true,
          zeroline: false,
        },
        legend: { orientation: 'h', y: -0.28, font: { size: 12 } },
        margin: { t: 16, r: 20, b: 72, l: 56 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
      }}
      style={{ width: '100%', height: '340px' }}
      config={{ responsive: true, displayModeBar: false }}
    />
  )
}
