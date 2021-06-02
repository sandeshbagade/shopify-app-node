import React from 'react';
import { EmptyState, Layout, Page } from '@shopify/polaris';
import { ResourcePicker, TitleBar } from '@shopify/app-bridge-react';
import store from 'store-js';
import ResourceListWithProducts from '../components/ResourceList';

class Index extends React.Component {
  state = { open: false };
  render() {

    return (
      <div>
         <ResourceListWithProducts />
      </div>
    );
  }
  handleSelection = (resources) => {
    console.log(resources)
    const idsFromResources = resources.selection.map((product) => product.id);
    this.setState({ open: false });
    store.set('ids', idsFromResources);
  };
}

export default Index;
