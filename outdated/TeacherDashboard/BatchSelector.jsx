import s from './teacherDashboardStyles'
const BatchSelector = ({ batches, selectedBatch, onChange }) => (
  <select value={selectedBatch} onChange={onChange} style={s.input}>
    {batches.map((b) => (
      <option key={b._id} value={b._id}>
        {b.batch_name}
      </option>
    ))}
  </select>
);

export default BatchSelector;