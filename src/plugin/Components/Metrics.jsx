import React from "react";
import ToggleSwitch from "./ToggleSwitch";
import Switch from "react-switch";
import { checkedIcon, uncheckedIcon, UncheckedIconC, CheckedIconC } from "./styles";
import { MetricSelect } from "./MetricSelect";
import { Button, Space } from "antd";
import Icon, { ArrowUpOutlined, ArrowLeftOutlined } from '@ant-design/icons';

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
  // console.log('metrics', metricsAggs, metricsFields)

  return (
  <>
    <div
      className={`metrics ${isOpened ? 'metrics-opened' : ''}`}
    >
      <div style={{ marginBottom: '1em', display: 'flex' }}>
        {/* <uncheckedIcon /> */}
        {/* <Icon component={UncheckedIconC} style={{ margin: 'auto 0.3em auto 0' }}/> */}
        <ArrowLeftOutlined style={{ color: '#156378', fontSize: '2em', margin: '0 0.3em auto 0' }} />
        <label>
          <Switch 
            onChange={handleChange} 
            checked={checked}
            uncheckedIcon
            checkedIcon
            onColor='#888'
          />
        </label>
        {/* <Icon component={CheckedIconC} style={{ margin: 'auto 0 auto 0.3em'}}/> */}
        <ArrowUpOutlined style={{ color: '#156378', fontSize: '2em', margin: '0 0 auto 0.3em'}} />
        {/* <checkedIcon /> */}
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