export class DefaultCompoundRenderer {
  constructor(rendererObj) {
    if(rendererObj) {
      this.rendererObject = rendererObj;
      this.config = rendererObj.config || {};
    }
  }

  createCompoundContainer() {
    return document.createElement('div');
  }

  createCompoundItemContainer() {
    return document.createElement('div');
  }

  attachCompoundItem(compoundCnt, compoundItemCnt) {
    compoundCnt.appendChild(compoundItemCnt);
  }
}

export class CustomCompoundRenderer extends DefaultCompoundRenderer {
  constructor(rendererObj) {
    super(rendererObj);
    if(rendererObj.use && rendererObj.use.extends) {
      this.superRenderer = resolveRenderer({
        use: rendererObj.use.extends,
        config: rendererObj.config
      });
    }
  }

  createCompoundContainer() {
    if(this.rendererObject.use.createCompoundContainer) {
      return this.rendererObject.use.createCompoundContainer(this.config, this.superRenderer);
    } else if (this.superRenderer) {
      return this.superRenderer.createCompoundContainer();
    }
    return super.createCompoundContainer();
  }

  createCompoundItemContainer(layoutConfig) {
    if(this.rendererObject.use.createCompoundItemContainer) {
      return this.rendererObject.use.createCompoundItemContainer(layoutConfig, this.config, this.superRenderer);
    } else if (this.superRenderer) {
      return this.superRenderer.createCompoundItemContainer(layoutConfig);
    }
    return super.createCompoundItemContainer(layoutConfig);
  }

  attachCompoundItem(compoundCnt, compoundItemCnt) {
    if(this.rendererObject.use.attachCompoundItem) {
      this.rendererObject.use.attachCompoundItem(compoundCnt, compoundItemCnt, this.superRenderer);
    } else if (this.superRenderer) {
      this.superRenderer.attachCompoundItem(compoundCnt, compoundItemCnt);
    } else {
      super.attachCompoundItem(compoundCnt, compoundItemCnt);
    }
  }
}

export class GridCompoundRenderer extends DefaultCompoundRenderer {
  createCompoundContainer() {
    const containerClass = '__lui_compound_' + new Date().getTime();
    const compoundCnt = document.createElement('div');
    compoundCnt.classList.add(containerClass);
    let mediaQueries = '';

    if(this.config.layouts) {
      this.config.layouts.forEach(el => {
        if(el.minWidth || el.maxWidth) {
          let mq = '@media only screen ';
          if(el.minWidth) {
            mq += `and (min-width: ${el.minWidth}px)`
          }
          if(el.maxWidth) {
            mq += `and (max-width: ${el.maxWidth}px)`
          }

          mq += `{
            .${containerClass} {
              grid-template-columns: ${el.columns || 'auto'};
              grid-template-rows: ${el.rows || 'auto'};
              grid-gap: ${el.gap || '0'};
            }
          }
          `;
          mediaQueries += mq;
        }
      });
    }

    compoundCnt.innerHTML = /*html*/`
        <style scoped>
          .${containerClass} {
            display: grid;
            grid-template-columns: ${this.config.columns || 'auto'};
            grid-template-rows: ${this.config.rows || 'auto'};
            grid-gap: ${this.config.gap || '0'};
            min-height: ${this.config.minHeight || 'auto'};
          }
          ${mediaQueries}
        </style>
    `;
    return compoundCnt;
  }

  createCompoundItemContainer(layoutConfig) {
    const config = layoutConfig || {};
    const compoundItemCnt = document.createElement('div');
    compoundItemCnt.setAttribute('style', `grid-row: ${config.row || 'auto'}; grid-column: ${config.column || 'auto'}`);
    return compoundItemCnt;
  }
}

export const resolveRenderer = (renderer) => {
  const rendererDef = renderer.use;
  if(rendererDef === 'grid') {
    return new GridCompoundRenderer(renderer);
  } else if(rendererDef.createCompoundContainer
    || rendererDef.createCompoundItemContainer
    || rendererDef.attachCompoundItem) {
    return new CustomCompoundRenderer(renderer);
  }
  return new DefaultCompoundRenderer(renderer);
};