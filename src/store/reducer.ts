import { PublicKey } from '@solana/web3.js';
import { AccountInfo as TokenAccount } from '@solana/spl-token';
import { ProgramAccount as CommonProgramAccount } from '@project-serum/common';
import { Action, ActionType } from './actions';
import { networks, Network } from './config';

export enum BootstrapState {
    NeedsBootstrap,
    IsBootstrapping,
    Bootstrapped,
};

export type ProgramAccount<T = any> = CommonProgramAccount<T>;

export type CommonState = {
    walletProvider?: string;
    isWalletConnected: boolean;
    bootstrapTrigger: boolean;
    bootstrapState: BootstrapState;
    shutdownTrigger: boolean;
    network: Network;
    ownedTokenAccounts: ProgramAccount<TokenAccount>[];
};

export type State = {
    common: CommonState;
    accounts: { [pubkey: string]: any };
};

export const initialState: State = {
    common: {
      bootstrapTrigger: false,
      shutdownTrigger: false,
      isWalletConnected: false,
      walletProvider: 'https://www.sollet.io',
      bootstrapState: BootstrapState.NeedsBootstrap,
      network: networks.devnet,
      ownedTokenAccounts: [],
    },
    accounts: {},
};

export default function reducer(
    state: State = initialState,
    action: Action,
  ): State {
    let newState = {
      common: { ...state.common },
      accounts: { ...state.accounts },
    };
    switch (action.type) {
      // Common.
      case ActionType.CommonAppWillBootstrap:
        newState.common.bootstrapState = BootstrapState.IsBootstrapping;
        newState.common.bootstrapTrigger = false;
        return newState;
      case ActionType.CommonAppDidBootstrap:
        newState.common.bootstrapState = BootstrapState.Bootstrapped;
        return newState;
      case ActionType.CommonWalletSetProvider:
        newState.common.walletProvider = action.item.walletProvider;
        return newState;
      case ActionType.CommonWalletDidConnect:
        newState.common.isWalletConnected = true;
        return newState;
      case ActionType.CommonWalletDidDisconnect:
        newState.common.isWalletConnected = false;
        return newState;
      case ActionType.CommonSetNetwork:
        if (newState.common.network.label !== action.item.network.label) {
          newState.common.network = action.item.network;
          newState.common.bootstrapState = BootstrapState.NeedsBootstrap;
          newState.common.shutdownTrigger = true;
          const network = networks[action.item.networkKey];
        //   newState.registry.registrar = Object.values(network.registrars)[0];
        }
        return newState;
      case ActionType.CommonTriggerBootstrap:
        newState.common.bootstrapState = BootstrapState.NeedsBootstrap;
        newState.common.bootstrapTrigger = true;
        return newState;
      case ActionType.CommonTriggerShutdown:
        newState.common.bootstrapState = BootstrapState.NeedsBootstrap;
        newState.common.shutdownTrigger = true;
        return newState;
      case ActionType.CommonDidShutdown:
        // Reset everything except network and registrar.
        let s = {
          ...initialState,
        };
        s.common.network = newState.common.network;
        // s.registry.registrar = newState.registry.registrar;
        return s;
      case ActionType.CommonOwnedTokenAccountsSet:
        newState.common.ownedTokenAccounts = action.item.ownedTokenAccounts;
        return newState;
  
      case ActionType.CommonOwnedTokenAccountsUpdate:
        newState.common.ownedTokenAccounts = newState.common.ownedTokenAccounts.map(
          programAccount => {
            if (programAccount.publicKey.equals(action.item.account.publicKey)) {
              return action.item.account;
            } else {
              return programAccount;
            }
          },
        );
        return newState;
      case ActionType.AccountAdd:
        newState.accounts[action.item.account.publicKey.toString()] =
          action.item.account.account;
        return newState;
      case ActionType.AccountUpdate:
        newState.accounts[action.item.account.publicKey.toString()] =
          action.item.account.account;
        return newState;
      default:
        return newState;
    }
  }