import React from "react";
import { DownOutlined, SmileOutlined  } from '@ant-design/icons';
import { Select, Space, Button } from 'antd';

export const MetricSelect = ({ metrics, i, metricsAggs, metricsFields, metricsFormData, handleMetricsChange }) => {
  // const parseMetrics = (metrics) => {
  //   return metrics.map((m) => {
  //     const valueMatched = m.match(/.*(?=\()/gi)
  //     const value = valueMatched ? valueMatched[0] : 'null' // .slice(0, -1)
  //     return { value: value, label: value }
  //   })
  // }

  // const parseMetricsValues = (metrics) => {
  //   return metrics.map((m) => {
  //     const valueMatched = m.match(/\(.*\)/gi)
  //     const value = valueMatched ? valueMatched[0].slice(1, -1) : 'null'
  //     return { value: value, label: value }
  //   })
  // }  

  // console.log('handleMetricsChange',handleMetricsChange)
  const aggs = metricsAggs.map(el => ({ value: el, label: el }))
  const fields = metricsFields.map(el => ({ value: el, label: el }))
  
  const [selectedAgg, setSelectedAgg] = React.useState(aggs[i].label)
  const [selectedField, setSelectedField] = React.useState(fields[i].label)
  
  React.useEffect(() => {
    handleMetricsChange(metricsFormData, i, selectedAgg, selectedField);
  }, [selectedAgg, selectedField])
  

  const handleChangeAgg = (value) => {
    setSelectedAgg(value)
  };
  const handleCHangeField = (value) => {
    setSelectedField(value)
  }

  

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '1em' }}>
      <div>
        <Select
          defaultValue={aggs[i].label}
          style={{
            width: 200,
          }}
          onChange={handleChangeAgg}
          options={aggs}
        />

      </div>

      <div>
        <Select
          defaultValue={fields[i].label}
          style={{
            width: 200,
          }}
          onChange={handleCHangeField}
          options={fields}
        />
      </div>

      <div>
        <Button type="primary" danger> Delete </Button>
      </div>
    </div>
  )
}