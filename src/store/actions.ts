export type Action = {
    type: ActionType;
    item: any;
  };

export enum ActionType {
    // Common.
    CommonTriggerBootstrap,
    CommonAppWillBootstrap,
    CommonAppDidBootstrap,
    CommonTriggerShutdown,
    CommonDidShutdown,
    CommonWalletDidConnect,
    CommonWalletDidDisconnect,
    CommonWalletSetProvider,
    CommonSetNetwork,
    CommonOwnedTokenAccountsSet,
    CommonOwnedTokenAccountsUpdate,
    CommonWalletReset,

    // Accounts.
    AccountAdd,
    AccountUpdate,
}