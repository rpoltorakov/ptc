import React from "react";
import { DownOutlined, SmileOutlined  } from '@ant-design/icons';
import { Select, Space } from 'antd';

export const MetricSelect = ({ metrics }) => {
  console.log('metric:', metric)
  const parseMetrics = (m) => {
    const valueMatched = m.match(/.*\(/gi)
    const value = valueMatched ? valueMatched[0].slice(0, -1) : 'null'
    return { value: value, label: value }
  }

  const parseMetricsValues = (m) => {
    const valueMatched = m.match(/\(.*\)/gi)
    const value = valueMatched ? valueMatched[0].slice(1, -1) : 'null'
    return { value: value, label: value }
  }  

  const getDefaultSelect = (m) => {
    const aggMatched = m.match(/.*\(/gi)
    const agg = aggMatched ? aggMatched[0].slice(0, -1) : ''

    const metricMatched = m.match(/\(.*\)/gi)
    const metric = metricMatched ? metricMatched[0].slice(1, -1) : ''
    return { agg, metric: m }
  }

  const aggregationsArr = parseMetrics(metric)
  const metricsArr = parseMetricsValues(metric)

  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };

  return (
    <div style={{display: 'flex', flexDirection: 'row'}}>
      <div style={{ width: '15em'}}>
        <Select
          defaultValue={getDefaultSelect(metric).agg}
          style={{
            width: 120,
          }}
          onChange={handleChange}
          options={aggregationsArr}
        />

      </div>

      <div style={{ width: '15em'}}>
        <Select
          defaultValue={getDefaultSelect(metric).metric}
          style={{
            width: 120,
          }}
          onChange={handleChange}
          options={metricsArr}
        />
      </div>

      <div>
        DELETE
      </div>
    </div>
  )
}