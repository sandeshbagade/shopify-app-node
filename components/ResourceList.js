import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Context } from '@shopify/app-bridge-react';
import moment, { utc } from 'moment'
import OrderTable from './table'

const GET_PRODUCTS_BY_ID = gql`
  query getProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        title
        handle
        descriptionHtml
        id
        images(first: 1) {
          edges {
            node {
              originalSrc
              altText
            }
          }
        }
        variants(first: 1) {
          edges {
            node {
              price
              id
            }
          }
        }
      }
    }
  }
`;
const GET_MARKETING_ACTIVITY = gql`{
  marketingEvents(first:10) {
    edges {
      node {
        id
        startedAt
        utmCampaign
        utmSource
      }
    }
  }
}`
;

const GET_EVENT = gql`
query getProducts($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on Product {
      title
      handle
      descriptionHtml
      id
      images(first: 1) {
        edges {
          node {
            originalSrc
            altText
          }
        }
      }
      variants(first: 1) {
        edges {
          node {
            price
            id
          }
        }
      }
    }
  }
}
`;

const GET_CJ = gql`
query {
  orders(last:10, query:"tag:opaEmail") {
    edges {
      node {
        id
        discountCode
        tags
        customerJourneySummary{
          firstVisit{
            id
            landingPage
            utmParameters{
              campaign
              source
            }
            source
            occurredAt
            marketingEvent{
              id
              startedAt
              utmCampaign
              description
            }
          }
          lastVisit{
            id
            landingPage
            utmParameters{
              campaign
              source
            }
            source
            occurredAt
            marketingEvent{
              id
              startedAt
              utmCampaign
              description
            }
          }
          daysToConversion
        }
      }
    }
  }
}`
;
class ResourceListWithProducts extends React.Component {
  static contextType = Context;

  render() {

    return (
      <Query query={GET_CJ}>
        {({ data, loading, error }) => {
          console.log(data)
          const rows = []
          if (loading) return <div>Loading…...</div>;
          if (error) return <div>{error.message}</div>;
          data.orders.edges.map((val, i) => {
            const v = val.node;
            const cjs =val.node.customerJourneySummary
            rows.push([
              i+1,
              moment(cjs.firstVisit?.occurredAt).utc().local().format('MMMM Do YYYY, [\n] h:mm:ss a'),
              moment(cjs.lastVisit?.occurredAt).utc().local().format('MMMM Do YYYY, [\n] h:mm:ss a'),
              (cjs.firstVisit?.utmParameters?.source||cjs.lastVisit?.utmParameters?.source||''),
              cjs.daysToConversion|| 0,
              v.discountCode,
            ])

           })
          return (
            <div>
              <OrderTable data={rows}/>hiiidsss
              {/* <pre>{JSON.stringify(data,null, 2)}</pre> */}
            </div>
          );
        }}
      </Query>
    );
  }
}

export default ResourceListWithProducts;
