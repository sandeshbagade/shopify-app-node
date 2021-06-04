import React from 'react';
import { Card, ResourceList, ResourceItem,Avatar,TextStyle} from '@shopify/polaris';
import { ResourcePicker, TitleBar } from '@shopify/app-bridge-react';
import store from 'store-js';
import ResourceListWithProducts from '../components/ResourceList';
import moment from 'moment'


class Index extends React.Component {
  state = { open: false, report:undefined };
  componentDidMount(){
    var fetchUrl = "/api/reports";
 
  //   fetch(fetchUrl, { method: 'POST', body:{
  //     "report": {
  //       "name": "A UTM Campaign Source app report",
  //       "shopify_ql": "SHOW total_visitors, total_sessions OVER day FROM visits WHERE utm_campaign_source == 'opaEmail' SINCE -7d UNTIL today ORDER BY 'day' ASC LIMIT 1000"
  //       }
  //   }
  //  }).then(response => response.json())
  //  .then(json => console.log(json))
    fetch(fetchUrl, { method: 'GET' })
     .then(response => response.json())
    .then(json => {console.log(json);
      this.setState({ report: json.data.reports });
    })
}

  render() {
    const emptyState = !store.get('ids');

    return (
      <div>
        <Card>
          <div style={{margin:'20px'}}>
            <TextStyle variation="strong" >Reports</TextStyle>
          </div>

          {this.state.report?.length&&
            <ResourceList
              resourceName={{singular: 'customer', plural: 'customers'}}
              items={this.state.report}
              renderItem={(item) => {
                const {id, name, category, updated_at} = item;
                return (
                  <ResourceItem
                    id={id}
                    accessibilityLabel={`View details for ${name}`}
                  >
                    <h3>
                      <TextStyle variation="strong">{name}</TextStyle>
                    </h3>
                    <h5>
                    <a href={`https://sandeshbagade.myshopify.com/admin/reports/${id}`} target='_blank'>{id}</a></h5>
                    <div>Created At {moment(updated_at).utc().local().format('MMMM Do YYYY, [\n] h:mm:ss a')}</div>
                  </ResourceItem>
                );
              }}
            />}
          </Card>
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
