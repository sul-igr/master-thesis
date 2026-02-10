/**
 * SubscriptionDelegate (EIP-7702 account implementation) ABI.
 * createSubscription(token, receiver, amount, interval, startTime, endTime, maxExecutions) → subscription id
 */
export const SUBSCRIPTION_DELEGATE_ABI = [
  {
    type: 'function',
    name: 'cancelSubscription',
    inputs: [{ name: 'id', type: 'uint256', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createSubscription',
    inputs: [
      { name: 'token', type: 'address', internalType: 'address' },
      { name: 'receiver', type: 'address', internalType: 'address' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
      { name: 'interval', type: 'uint64', internalType: 'uint64' },
      { name: 'startTime', type: 'uint64', internalType: 'uint64' },
      { name: 'endTime', type: 'uint64', internalType: 'uint64' },
      { name: 'maxExecutions', type: 'uint32', internalType: 'uint32' },
    ],
    outputs: [{ name: 'id', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'executeSubscription',
    inputs: [{ name: 'id', type: 'uint256', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getSubscription',
    inputs: [{ name: 'id', type: 'uint256', internalType: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct SubscriptionDelegate.Subscription',
        components: [
          { name: 'token', type: 'address', internalType: 'address' },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'amount', type: 'uint256', internalType: 'uint256' },
          { name: 'interval', type: 'uint64', internalType: 'uint64' },
          { name: 'nextExecutionTime', type: 'uint64', internalType: 'uint64' },
          { name: 'endTime', type: 'uint64', internalType: 'uint64' },
          { name: 'maxExecutions', type: 'uint32', internalType: 'uint32' },
          { name: 'executionCount', type: 'uint32', internalType: 'uint32' },
          { name: 'active', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'subscriptionCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
] as const
