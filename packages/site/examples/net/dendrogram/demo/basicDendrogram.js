import G6 from '@antv/g6';

const layoutConfigs = {
  LR: {
    type: 'dendrogram',
    direction: 'LR', // H / V / LR / RL / TB / BT
    nodeSep: 40,
    rankSep: 100,
  },
  TB: {
    type: 'dendrogram',
    direction: 'TB', // H / V / LR / RL / TB / BT
    nodeSep: 40,
    rankSep: 100,
  },
};

const container = document.getElementById('container');
const width = container.scrollWidth;
const height = container.scrollHeight || 500;

fetch('https://gw.alipayobjects.com/os/antvdemo/assets/data/algorithm-category.json')
  .then((res) => res.json())
  .then((data) => {
    const graph = new G6.Graph({
      container,
      width,
      height,
      transform: ['transform-v4-data'],
      layout: {
        type: 'force',
        preventOverlap: true,
        nodeSize: 32,
        workerEnabled: true,
      },
      modes: {
        default: ['drag-canvas', 'zoom-canvas', 'drag-node', 'collapse-expand-tree'],
      },
      node: (model) => {
        const configRelatedToLayout =
          model.data.layoutDirection === 'TB'
            ? {
                labelShape: {
                  text: model.id,
                  position: 'bottom',
                  offsetX: 0,
                },
                anchorPoints: [
                  [0.5, 0],
                  [0.5, 1],
                ],
              }
            : {
                labelShape: {
                  text: model.id,
                  position: model.data.childrenIds?.length ? 'left' : 'right',
                  offsetX: model.data.childrenIds?.length ? -10 : 10,
                  maxWidth: '300%',
                },
                anchorPoints: [
                  [0, 0.5],
                  [1, 0.5],
                ],
              };
        return {
          id: model.id,
          data: {
            ...model.data,
            labelBackgroundShape: {},
            ...configRelatedToLayout,
            animates: {
              update: [
                {
                  fields: ['x', 'y'],
                  duration: 500,
                  shapeId: 'group',
                  order: 0,
                },
              ],
              hide: [
                {
                  fields: ['opacity'],
                  duration: 200,
                  shapeId: 'keyShape',
                },
                {
                  fields: ['opacity'],
                  duration: 200,
                  shapeId: 'labelShape',
                },
              ],
              show: [
                {
                  fields: ['opacity'],
                  duration: 1000,
                  shapeId: 'keyShape',
                },
                {
                  fields: ['opacity'],
                  duration: 1000,
                  shapeId: 'labelShape',
                },
              ],
            },
          },
        };
      },
      edge: {
        type: 'cubic-horizontal-edge',
      },
      layout: layoutConfigs.LR,
      autoFit: 'view',
      data: {
        type: 'treeData',
        value: data,
      },
    });

    const btnContainer = document.createElement('div');
    btnContainer.style.position = 'absolute';
    container.appendChild(btnContainer);
    const tip = document.createElement('span');
    tip.innerHTML = '👉 Change configs:';
    btnContainer.appendChild(tip);

    Object.keys(layoutConfigs).forEach((name, i) => {
      const btn = document.createElement('a');
      btn.innerHTML = name;
      btn.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
      btn.style.padding = '4px';
      btn.style.marginLeft = i > 0 ? '24px' : '8px';
      btnContainer.appendChild(btn);
      btn.addEventListener('click', () => {
        const updateEdges = graph.getAllEdgesData().map((edge) => ({
          id: edge.id,
          data: {
            type: name === 'LR' ? 'cubic-horizontal-edge' : 'cubic-vertical-edge',
          },
        }));
        const updateNodes = graph.getAllNodesData().map((node) => ({
          id: node.id,
          data: {
            layoutDirection: name,
          },
        }));
        graph.updateData('node', updateNodes);
        graph.updateData('edge', updateEdges);
        graph.layout(layoutConfigs[name]);
      });
    });

    if (typeof window !== 'undefined')
      window.onresize = () => {
        if (!graph || graph.destroyed) return;
        if (!container || !container.scrollWidth || !container.scrollHeight) return;
        graph.setSize([container.scrollWidth, container.scrollHeight]);
      };
  });
