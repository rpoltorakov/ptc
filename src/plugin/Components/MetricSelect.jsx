import React from "react";
import { DownOutlined, SmileOutlined  } from '@ant-design/icons';
import { Select, Space, Button } from 'antd';

export const MetricSelect = ({ metrics, i }) => {
  const parseMetrics = (metrics) => {
    return metrics.map((m) => {
      const valueMatched = m.match(/.*(?=\()/gi)
      const value = valueMatched ? valueMatched[0] : 'null' // .slice(0, -1)
      return { value: value, label: value }
    })
  }

  const parseMetricsValues = (metrics) => {
    return metrics.map((m) => {
      const valueMatched = m.match(/\(.*\)/gi)
      const value = valueMatched ? valueMatched[0].slice(1, -1) : 'null'
      return { value: value, label: value }
    })
  }  

  const aggregationsArr = parseMetrics(metrics)
  const metricsArr = parseMetricsValues(metrics)

  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '1em' }}>
      <div>
        <Select
          defaultValue={aggregationsArr[i].label}
          style={{
            width: 120,
          }}
          onChange={handleChange}
          options={aggregationsArr}
        />

      </div>

      <div>
        <Select
          defaultValue={metricsArr[i].label}
          style={{
            width: 120,
          }}
          onChange={handleChange}
          options={metricsArr}
        />
      </div>

      <div>
        <Button type="primary" danger> Delete </Button>
      </div>
    </div>
  )
}