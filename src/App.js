// @ts-ignore
import React from 'react';
import PieChart from './PieChart';

const data = [
  { name: 'PAKISTAN', value: 3},
  { name: 'USA', value: 4.2},
  { name: 'CHINA', value: 8.5 },
  { name: 'BRAZIL', value: 2.5 }
];

function App() {
  return (
      <div className="App">
        <PieChart data={data} width={700} height={700} />
      </div>
  );
}

export default App;