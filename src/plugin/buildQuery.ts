import { 
  AdhocColumn, 
  buildQueryContext, 
  QueryFormData,
  ensureIsArray 
} from '@superset-ui/core'; 

/**
 * The buildQuery function is used to create an instance of QueryContext that's
 * sent to the chart data endpoint. In addition to containing information of which
 * datasource to use, it specifies the type (e.g. full payload, samples, query) and
 * format (e.g. CSV or JSON) of the result and whether or not to force refresh the data from
 * the datasource as opposed to using a cached copy of the data, if available.
 *
 * More importantly though, QueryContext contains a property `queries`, which is an array of
 * QueryObjects specifying individual data requests to be made. A QueryObject specifies which
 * columns, metrics and filters, among others, to use during the query. Usually it will be enough
 * to specify just one query based on the baseQueryObject, but for some more advanced use cases
 * it is possible to define post processing operations in the QueryObject, or multiple queries
 * if a viz needs multiple different result sets.
 */

export default function buildQuery(formData: QueryFormData) {
  const { groupbyColumns=[], groupbyRows=[], extra_form_data } = formData;
  
  
  
  // return buildQueryContext(formData, (baseQueryObject: { ownState: any; }) => {
    return buildQueryContext(formData, baseQueryObject => {
    // console.log('formData in BQ:', formData)
    const { ownState } = baseQueryObject

    // Columns для агрегации данных, не колонки таблицы
    // В бекенд должно отправляться как атрибут "columns", результат обрабатывается в UI
    const columns = Array.from(
      new Set([
        ...ensureIsArray(groupbyColumns),
        ...ensureIsArray(groupbyRows),
      ]),
    ).map(col => {
      return {
        columnType: 'BASE_AXIS',
        sqlExpression: col,
        label: col,
        expressionType: 'SQL',
      } as AdhocColumn;
      return col
    })
    // Агрегация происходит только в атрибуте "columns"
    // Cols, rows, dimensions - нужны только в UI, 
    // для агрегации данных нужен только columns
    // console.log(formData)
    
    return [
    {
      ...baseQueryObject,
      // columns,
      groupby: columns
      // ownState
    },
  ]});
}
