// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { t, validateNonEmpty } from '@superset-ui/core';
import { ControlPanelConfig, sharedControls } from '@superset-ui/chart-controls';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'dimensions',
            config: {
              ...sharedControls.groupby,
              label: t('Dimensions pool'),
              description: t('Dimensions available for grouping'),
            },
          },
          
        ],
        [
          {
            name: 'groupbyColumns',
            config: {
              ...sharedControls.groupby,
              label: t('Columns'),
              description: t('Columns to group by on the columns'),
              validators: [validateNonEmpty],
            },
          },
        ],
        [
          {
            name: 'groupbyRows',
            config: {
              ...sharedControls.groupby,
              label: t('Rows'),
              description: t('Columns to group by on the rows'),
              validators: [validateNonEmpty],
            },
          },
        ],
        [
          {
            name: 'metrics',
            config: {
              ...sharedControls.metrics,
              validators: [validateNonEmpty],
            },
          },
        ],
        ['adhoc_filters'],
        [
          {
            name: 'row_limit',
            config: sharedControls.row_limit,
          },
        ],
      ],
      
    },
    {
      label: 'Subtotals',
      expanded: true,
      tabOverride: 'data',
      controlSetRows: [
        [
          {
            name: 'subtotalsRowsOn',
            config: {
              type: 'CheckboxControl',
              label: 'Enable column subtotals',
              default: false,
              renderTrigger: true,
              description: 'Enable column subtotals',
            },
          }
        ], [
          {
            name: 'subtotalsColsOn',
            config: {
              type: 'CheckboxControl',
              label: 'Enable row subtotals',
              default: false,
              renderTrigger: true,
              description: 'Enable row subtotals',
            },
          },
        ],
      ]
    },
    {
      label: 'Text Controls',
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'header_font_size',
            config: {
              type: 'TextControl',
              label: 'Header Font Size',
              default: '14px',
              renderTrigger: true,
              description: 'The size of header font',
            },
          },
          {
            name: 'cell_font_size',
            config: {
              type: 'TextControl',
              label: 'Cell Font Size',
              default: '14px',
              renderTrigger: true,
              description: 'The size of cell font',
            },
          }
        ],
      ],
    },
  ],
};

export default config;
