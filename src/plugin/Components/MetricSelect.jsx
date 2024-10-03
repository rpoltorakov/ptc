import React from "react";
import { DownOutlined, SmileOutlined  } from '@ant-design/icons';
import { Select, Space, Button } from 'antd';

export const MetricSelect = ({
  metric,
  metrics, 
  i, 
  metricsAggs, 
  metricsFields, 
  metricsFormData, 
  handleMetricsChange,
  handleDelete
}) => {
  const aggs = metricsAggs.map(el => ({ value: el, label: el }))
  const fields = metricsFields.map(el => ({ value: el.column_name, label: el.column_name }))

  const [selectedAgg, setSelectedAgg] = React.useState(metric.aggregate)
  const [selectedField, setSelectedField] = React.useState(metric.column.column_name)
  
  React.useEffect(() => {
    if (metricsFormData[i].expressionType === 'SIMPLE') {
      console.log(`
        Changed metric ${i}:
        agg: ${selectedAgg},
      `)
      console.log('field:', selectedField)
      handleMetricsChange(metricsFormData, i, selectedAgg, `\"${selectedField}\"`, selectedField);
    }
  }, [selectedAgg, selectedField])
  

  const handleChangeAgg = (value) => {
    setSelectedAgg(value)
  };
  const handleChangeField = (value) => {
    setSelectedField(metricsFields.find(el => el.column_name === value).column_name)
  }
  const handleDeleteButton = () => {
    handleDelete(i)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '.35em', marginBottom:'0.5em' }}>
      <div>
        <Select
          defaultValue={selectedAgg}
          style={{
            width: 200,
          }}
          onChange={handleChangeAgg}
          options={aggs}
        />

      </div>

      <div>
        <Select
          defaultValue={selectedField}
          style={{
            width: 200,
          }}
          onChange={handleChangeField}
          options={fields}
        />
      </div>

      <div style={{ marginLeft: '1em'}}>
        <Button
          onClick={handleDeleteButton} 
          type="primary" 
          danger
          disabled={metrics.length === 1 ? true : false}
        > Delete </Button>
      </div>
    </div>
  )
}