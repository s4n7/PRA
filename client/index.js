const { useState } = React;
const { Chart } = window.ChartJS;
const { jsPDF } = window.jspdf;

function InputForm({ setData }) {
  const [crl, setCrl] = useState('');
  const [nt, setNt] = useState('');
  const [ga, setGa] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setData({ crl, nt, ga });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        CRL (mm):
        <input type="number" value={crl} onChange={(e) => setCrl(e.target.value)} />
      </label>
      <br />
      <label>
        NT (mm):
        <input type="number" value={nt} onChange={(e) => setNt(e.target.value)} />
      </label>
      <br />
      <label>
        GA (weeks):
        <input type="number" value={ga} onChange={(e) => setGa(e.target.value)} />
      </label>
      <br />
      <button type="submit">Submit</button>
    </form>
  );
}

function ResultGraph({ data }) {
  const chartData = {
    labels: ['Week 10', 'Week 11', 'Week 12', 'Week 13'],
    datasets: [
      {
        label: 'hCG (IU/mL)',
        data: [data.hcg, data.hcg, data.hcg, data.hcg],
        borderColor: 'red',
        fill: false,
      },
      {
        label: 'PAPP-A (ng/mL)',
        data: [data.pappA, data.pappA, data.pappA, data.pappA],
        borderColor: 'blue',
        fill: false,
      },
    ],
  };

  const canvas = document.getElementById('myChart');
  new Chart(canvas, {
    type: 'line',
    data: chartData,
  });

  return <canvas id="myChart" width="400" height="400"></canvas>;
}

function App() {
  const [data, setData] = useState({ crl: '', nt: '', ga: '', hcg: 0, pappA: 0 });

  return (
    <div>
      <h1>First Trimester Maternal Serum Screening</h1>
      <InputForm setData={setData} />
      <ResultGraph data={data} />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
