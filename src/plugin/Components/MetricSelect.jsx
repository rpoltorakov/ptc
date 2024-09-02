import React from "react";
import { DownOutlined, SmileOutlined  } from '@ant-design/icons';
import { Select, Space, Button } from 'antd';

export const MetricSelect = ({
  metrics, 
  i, 
  metricsAggs, 
  metricsFields, 
  metricsFormData, 
  handleMetricsChange,
  handleDelete
}) => {
  // console.log('metricsselect:',metricsAggs, metricsFields)
  const aggs = metricsAggs.map(el => ({ value: el, label: el }))
  const fields = metricsFields.map(el => ({ value: el, label: el }))
  
  const [selectedAgg, setSelectedAgg] = React.useState(aggs[i].label)
  const [selectedField, setSelectedField] = React.useState(fields[i].label)
  
  React.useEffect(() => {
    handleMetricsChange(metricsFormData, i, selectedAgg, `\"${selectedField}\"`);
  }, [selectedAgg, selectedField])
  

  const handleChangeAgg = (value) => {
    setSelectedAgg(value)
  };
  const handleChangeField = (value) => {
    setSelectedField(value)
  }
  const handleDeleteButton = () => {
    handleDelete(i)
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
          onChange={handleChangeField}
          options={fields}
        />
      </div>

      <div>
        <Button
          onClick={handleDeleteButton} 
          type="primary" 
          danger
        > Delete </Button>
      </div>
    </div>
  )
}