import {Card, Page, DataTable} from '@shopify/polaris';
export default function OrderTable({data}) {
  
    return (
      <Page title="Customer Journey">
        <Card>
          <DataTable
            columnContentTypes={[
              'numeric',
              'text',
              'text',
              'text',
              'text',
              'numeric',
            ]}
            headings={[
              '',
              'First Visit',
              'Last Visit',
              'UTM Parameter',
              'Days To Conversion',
              'Discount Code',
            ]}
            rows={data}
            // totals={['', '', '', 255, '$155,830.00']}
          />
        </Card>
      </Page>
    );
  }