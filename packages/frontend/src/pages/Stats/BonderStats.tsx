import Box from '@mui/material/Box'
import React from 'react'
import { CopyEthAddress } from '#components/ui/CopyEthAddress.js'
import { Icon } from '#components/ui/Icon.js'
import { RightAlignedValue, SortableTable } from '#components/Table/index.js'
import { useStats } from '#pages/Stats/StatsContext.js'

export const populateBonderStats = (item: any) => {
  return {
    chain: item.network?.imageUrl,
    token: item.token?.imageUrl,
    bonder: item.bonder,
    credit: item.credit,
    debit: item.debit,
    availableLiquidity: item.availableLiquidity,
    pendingAmount: item.pendingAmount,
    totalAmount: item.totalAmount,
    availableNative: item.availableNative,
  }
}

function BonderStats() {
  const { bonderStats, fetchingBonderStats } = useStats()

  const columns = React.useMemo(
    () => [
      {
        Header: 'Bonder Stats',
        columns: [
          {
            Header: 'Chain',
            accessor: 'chain',
            Cell: ({ cell }) => {
              return (
                <Box display="flex" justifyContent="center" {...cell.getCellProps()}>
                  <Icon src={cell.value} />
                </Box>
              )
            },
          },
          {
            Header: 'Token',
            accessor: 'token',
            Cell: ({ cell }) => {
              return (
                <Box display="flex" justifyContent="center" {...cell.getCellProps()}>
                  <Icon src={cell.value} />
                </Box>
              )
            },
          },
          {
            Header: 'Bonder',
            accessor: 'bonder',
            Cell: ({ cell }) => {
              return (
                <Box display="flex" justifyContent="center" {...cell.getCellProps()}>
                  <CopyEthAddress value={cell.value} />
                </Box>
              )
            },
          },
          {
            Header: 'Credit',
            accessor: 'credit',
            Cell: ({ cell }) => <RightAlignedValue cell={cell} />,
          },
          {
            Header: 'Debit',
            accessor: 'debit',
            Cell: ({ cell }) => <RightAlignedValue cell={cell} />,
          },
          {
            Header: 'Available Liquidity',
            accessor: 'availableLiquidity',
            Cell: ({ cell }) => <RightAlignedValue cell={cell} />,
          },
          {
            Header: 'Pending Amount',
            accessor: 'pendingAmount',
            Cell: ({ cell }) => <RightAlignedValue cell={cell} />,
          },
          {
            Header: 'Total Amount',
            accessor: 'totalAmount',
            Cell: ({ cell }) => <RightAlignedValue cell={cell} />,
          },
          {
            Header: 'Available Native',
            accessor: 'availableNative',
            Cell: ({ cell }) => <RightAlignedValue cell={cell} />,
          }
        ],
      },
    ],
    []
  )

  const error = bonderStats?.map((item: any) => item.error).filter(Boolean).join('\n')

  return (
    <Box overflow-x="scroll" alignSelf="center">
      <SortableTable
        stats={bonderStats}
        columns={columns}
        populateDataFn={populateBonderStats}
        loading={fetchingBonderStats}
        error={error}
      />
    </Box>
  )
}

export default BonderStats
