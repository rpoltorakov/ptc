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
  const aggs = metricsAggs.map(el => ({ value: el, label: el }))

  const fields = metricsFields.map(el => ({ value: el, label: el }))


  const field = metrics[i].match(/".*"/gi) ? metrics[i].match(/".*"/gi)[0] : '' 
  const [selectedAgg, setSelectedAgg] = React.useState(metrics[i].replaceAll(/".*?"/gi, '#')) // .replaceAll(/".*?"/gi, '#')

  const matched = metrics[i].match(/".*?"/gi) 
  const [selectedField, setSelectedField] = React.useState(matched ? matched[0].slice(1,-1) : 'fieldNotFound')
  
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
    <div style={{ display: 'flex', flexDirection: 'row', gap: '.35em', marginBottom:'0.5em' }}>
      <div>
        <Select
          // defaultValue={aggs[i].label}
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
          // defaultValue={fields[i].label}
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
          disabled={i===0?true:false}
        > Delete </Button>
      </div>
    </div>
  )
}