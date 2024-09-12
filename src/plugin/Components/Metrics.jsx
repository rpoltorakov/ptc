import React from "react";
import Switch from "react-switch";
import { MetricSelect } from "./MetricSelect";
import { Button } from "antd";
import { InsertRowLeftOutlined, InsertRowAboveOutlined } from '@ant-design/icons';

export const Metrics = ({
  isOpened, 
  handleChange, 
  checked, 
  metrics, 
  metricsAggs, 
  metricsFields, 
  metricsFormData,
  handleMetricsChange,
  handleDelete,
  handleAddMetric
}) => {
  return (
  <>
    <div
      className={`metrics ${isOpened ? 'metrics-opened' : ''}`}
    >
      <div style={{ marginBottom: '1em', display: 'flex' }}>
        <InsertRowLeftOutlined style={{ color: '#555555', fontSize: '2em', margin: '0 0.3em auto 0' }} />
        <label>
          <Switch 
            onChange={handleChange} 
            checked={checked}
            uncheckedIcon
            checkedIcon
            onColor='#888'
          />
        </label>
        <InsertRowAboveOutlined style={{ color: '#555555', fontSize: '2em', margin: '0 0 auto 0.3em'}} />
      </div>

      {metrics.map((metric, i) => (
        <MetricSelect 
          metricsFields={metricsFields}
          metricsAggs={metricsAggs}
          metrics={metrics}
          i={i}
          key={i+'metrics'}
          metricsFormData={metricsFormData}
          handleMetricsChange={handleMetricsChange}
          handleDelete={handleDelete}
        />
      ))}

      <Button
        type="primary"
        onClick={handleAddMetric}
        style={{ marginTop: '1em' }}
      > + </Button>
    </div>
  </>)
}