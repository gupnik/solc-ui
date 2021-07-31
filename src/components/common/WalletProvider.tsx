import React, {
    PropsWithChildren,
    ReactElement,
    ReactNode,
    useMemo,
    useContext,
  } from 'react';
  import { useSelector } from 'react-redux';
  import { Connection, ConfirmOptions } from '@solana/web3.js';
  // @ts-ignore
  import Wallet from '@project-serum/sol-wallet-adapter';
  import { Idl, Program, Provider } from '@project-serum/anchor';
  import { State as StoreState } from '../../store/reducer';
  import IdoIdl from '../../idl/ido_pool.json';
  
  export function useWallet(): WalletContextValues {
    const w = useContext(WalletContext);
    if (!w) {
      throw new Error('Missing wallet context');
    }
    return w;
  }
  
  const WalletContext = React.createContext<null | WalletContextValues>(null);
  
  type WalletContextValues = {
    wallet: Wallet;
    idoClient: Program;
  };
  
  export default function WalletProvider(
    props: PropsWithChildren<ReactNode>,
  ): ReactElement {
    const { walletProvider, network } = useSelector((state: StoreState) => {
      return {
        walletProvider: state.common.walletProvider,
        network: state.common.network,
      };
    });
  
    const {
      wallet,
      idoClient
    } = useMemo(() => {
      const opts: ConfirmOptions = {
        preflightCommitment: 'recent',
        commitment: 'recent',
      };
      const connection = new Connection(network.url, opts.preflightCommitment);
      const wallet = new Wallet(walletProvider, network.url);
      // @ts-ignore
      const provider = new Provider(connection, wallet, opts);
  
      const idoClient = new Program(
        IdoIdl as Idl,
        network.idoProgramId,
        provider,
      );
  
      return {
        wallet,
        idoClient
      };
    }, [walletProvider, network]);
  
    return (
      <WalletContext.Provider
        value={{ wallet, idoClient }}
      >
        {props.children}
      </WalletContext.Provider>
    );
  }
  