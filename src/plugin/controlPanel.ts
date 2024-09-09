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
              label: 'Enable row subtotals',
              default: false,
              renderTrigger: true,
              description: 'Enable row subtotals',
            },
          }
        ], [
          {
            name: 'subtotalsColsOn',
            config: {
              type: 'CheckboxControl',
              label: 'Enable column subtotals',
              default: false,
              renderTrigger: true,
              description: 'Enable column subtotals',
            },
          },
        ],
      ]
    },
    {
      label: 'Text Controls',
      expanded: true,
      controlSetRows: [
        // [
        //   {
        //     name: 'header_text',
        //     config: {
        //       type: 'TextControl',
        //       default: 'Hello, World!',
        //       renderTrigger: true,
        //       label: t('Header Text'),
        //       description: t('The text you want to see in the header'),
        //     },
        //   },
        // ],
        // [
        //   {
        //     name: 'bold_text',
        //     config: {
        //       type: 'CheckboxControl',
        //       label: t('Bold Text'),
        //       renderTrigger: true,
        //       default: true,
        //       description: t('A checkbox to make the '),
        //     },
        //   },
        // ],
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
