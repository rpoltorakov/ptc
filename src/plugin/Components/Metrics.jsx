import React from "react";
import Switch from "react-switch";
import { MetricSelect } from "./MetricSelect";
import { Button, Tooltip } from "antd";
import { InsertRowLeftOutlined, InsertRowAboveOutlined } from '@ant-design/icons';
import { MetricSQL } from "./MetricSQL";

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
  handleAddMetric,
  warning
}) => {
  console.log("🚀 ~ metrics:", metrics)
  // const sqlMetrics = metrics.slice(metricsFormData.filter(el => el.expressionType === 'SIMPLE').length)
  const sqlMetrics = metrics.filter((el, i) => {})
  console.log("🚀 ~ metricsFields:", metricsFields)
  console.log("🚀 ~ sqlMetrics:", sqlMetrics)
  return (
  <>
    <div
      className={`metrics ${isOpened ? 'metrics-opened' : ''}`}
    >
      <div style={{ marginBottom: '1em', display: 'flex' }}>
        <Tooltip placement="right" title={warning} visible={warning ? true : false}>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
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
        </Tooltip>
      </div>

      {metricsFields.map((metricField, i) => (
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

      {sqlMetrics.map((metric, i) => (
        <MetricSQL 
          metric={metric}
          i={i + metricsFields.length}
          key={i+'metricSQL'}
          handleDelete={handleDelete}
        />
      ))}

      <Button
        type="primary"
        onClick={handleAddMetric}
        style={{ marginTop: '1em' }}
        metrics={metrics}
      > + </Button>
    </div>
  </>)
}