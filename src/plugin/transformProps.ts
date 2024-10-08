// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { ChartProps, TimeseriesDataRecord } from '@superset-ui/core';

  /**
   * This function is called after a successful response has been
   * received from the chart data endpoint, and is used to transform
   * the incoming data prior to being sent to the Visualization.
   *
   * The transformProps function is also quite useful to return
   * additional/modified props to your data viz component. The formData
   * can also be accessed from your PivotTableC.tsx file, but
   * doing supplying custom props here is often handy for integrating third
   * party libraries that rely on specific props.
   *
   * A description of properties in `chartProps`:
   * - `height`, `width`: the height/width of the DOM element in which
   *   the chart is located
   * - `formData`: the chart data request payload that was sent to the
   *   backend.
   * - `queriesData`: the chart data response payload that was received
   *   from the backend. Some notable properties of `queriesData`:
   *   - `data`: an array with data, each row with an object mapping
   *     the column/alias to its value. Example:
   *     `[{ col1: 'abc', metric1: 10 }, { col1: 'xyz', metric1: 20 }]`
   *   - `rowcount`: the number of rows in `data`
   *   - `query`: the query that was issued.
   *
   * Please note: the transformProps function gets cached when the
   * application loads. When making changes to the `transformProps`
   * function during development with hot reloading, changes won't
   * be seen until restarting the development server.
   */

export default function transformProps(chartProps: ChartProps) {

  const { 
    width, 
    height, 
    formData, 
    queriesData,
    filterState,
    hooks: { setDataMask = () => {} }
  } = chartProps;
  const { 
    boldText,
    headerFontSize, 
    cellFontSize,
    dimensions, 
    groupbyColumns, 
    groupbyRows,
    subtotalsColsOn,
    subtotalsRowsOn,
    subtotalsOn
  } = formData;
  const data = queriesData[0].data as TimeseriesDataRecord[];
  
  const collectMetrics = (formData:any, type:'def'|'aggs'|'fields') => {
    if (type === 'def') {
      return formData.metrics.map((metric:any) => {
        if (typeof metric === 'string') {
          return metric
        }
        return metric.label
      })
    }

    if (type === 'aggs') {
      const sqlAggs = Array.from(new Set(formData.metrics.map((metric:any) => {
        if (metric.expressionType === 'SIMPLE') {
          return metric.aggregate
        }
      }))).filter(el => el)
      
      const additionalAggs = [
        'COUNT',
        'SUM',
        'AVG',
        'MIN',
        'MAX',
        'COUNT_DISTINCT',
        // 'SUMSQRD', - должны быть одинаковыми с superset/superset/connectors/sql/models.py -> class SqlaTable -> sqla_aggregations
      ]
      additionalAggs.forEach((agg) => {
        if (!sqlAggs.includes(agg) && !sqlAggs.includes(agg + '(#)')) {
          sqlAggs.push(agg)
        }
      })
      return sqlAggs
    }


    if (type === 'fields') {
      return Array.from(new Set(formData.metrics.map((metric:any) => {
        if (metric.expressionType === 'SIMPLE') {
          return metric.column
        }
      }))).filter(el => el)
    }
  }

  return {
    width,
    height,
    data,
    boldText,
    headerFontSize,
    cellFontSize,
    formData,
    filterState,
    setDataMask,
    groupbyColumns,
    groupbyRows,
    dimensions,
    metrics: collectMetrics(formData, 'def'),
    metricsAggs: collectMetrics(formData, 'aggs'),
    metricsFields: collectMetrics(formData, 'fields'),
    subtotalsColsOn,
    subtotalsRowsOn,
    subtotalsOn
  };
}
