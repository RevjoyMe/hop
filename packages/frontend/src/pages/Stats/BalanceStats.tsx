import Box from '@mui/material/Box'
import React, { FC } from 'react'
import ethLogo from '#assets/logos/eth.svg'
import { CellWrapper, SortableTable } from '#components/Table/index.js'
import { CopyEthAddress } from '#components/ui/CopyEthAddress.js'
import { Icon } from '#components/ui/Icon.js'
import { commafy } from '#utils/index.js'
import { useStats } from '#pages/Stats/StatsContext.js'

export const populatePoolStats = (item: any) => {
  return {
    chain: item.network?.imageUrl,
    name: item.name,
    address: item.address,
    balance: commafy(item.balance),
  }
}
const BalanceStats: FC = () => {
  const { balances, fetchingBalances } = useStats()

  const columns = React.useMemo(
    () => [
      {
        Header: 'Native Token Balances',
        columns: [
          {
            Header: 'Chain',
            accessor: 'chain',
            Cell: ({ cell }) => {
              return (
                <CellWrapper cell={cell}>
                  <Icon src={cell.value} />
                </CellWrapper>
              )
            },
          },
          {
            Header: 'Name',
            accessor: 'name',
            Cell: ({ cell }) => {
              return <CellWrapper cell={cell}>{cell.value}</CellWrapper>
            },
          },
          {
            Header: 'Address',
            accessor: 'address',
            Cell: ({ cell }) => (
              <CellWrapper cell={cell}>
                <CopyEthAddress value={cell.value} />
              </CellWrapper>
            ),
          },
          {
            Header: 'Balance',
            accessor: 'balance',
            Cell: ({ cell }) => (
              <CellWrapper cell={cell}>
                <Icon mr={1} src={ethLogo} />
                {commafy(cell.value)}
              </CellWrapper>
            ),
          },
        ],
      },
    ],
    []
  )

  const error = balances?.map((item: any) => item.error).filter(Boolean).join('\n')

  return (
    <Box>
      <SortableTable
        stats={balances}
        columns={columns}
        populateDataFn={populatePoolStats}
        loading={fetchingBalances}
        error={error}
      />
    </Box>
  )
}

export default BalanceStats
