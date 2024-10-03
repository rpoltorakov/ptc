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
  const sqlMetricsFD = metricsFormData.filter(metric => metric.expressionType === 'SQL').map(el => el.label)
  const sqlMetrics = metrics.filter(el => sqlMetricsFD.includes(el))

  const simpleMetricsFD = metricsFormData.filter(metric => metric.expressionType === 'SIMPLE').map(el => el.label)
  const simpleMetrics = metrics.filter(el => simpleMetricsFD.includes(el))
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

      {metricsFormData.map((metric, i) => {
        if (metric.expressionType === 'SIMPLE') {
          return (
            <MetricSelect 
              metric={metric}
              metricsFields={metricsFields}
              metricsAggs={metricsAggs}
              metrics={metrics}
              i={i}
              key={i+'metrics'}
              metricsFormData={metricsFormData}
              handleMetricsChange={handleMetricsChange}
              handleDelete={handleDelete}
            />
          )
        } else if (metric.expressionType === 'SQL') {
          return (
            <MetricSQL 
              key={i+'metricSQL'}
              metric={metric}
              i={i}
              handleDelete={handleDelete}
              metrics={metrics}
            />
          )
        }
      })}

      <Button
        type="primary"
        onClick={handleAddMetric}
        style={{ marginTop: '1em' }}
        metrics={metrics}
      > + </Button>
    </div>
  </>)
}