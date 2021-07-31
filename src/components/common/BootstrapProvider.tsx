import React, {
    PropsWithChildren,
    ReactNode,
    useEffect,
    useCallback,
  } from 'react';
  import { useDispatch, useSelector } from 'react-redux';
  import { useSnackbar } from 'notistack';
  import { PublicKey } from '@solana/web3.js';
  import {
    token,
    parseMintAccount,
    parseTokenAccount,
  } from '@project-serum/common';
  import * as anchor from '@project-serum/anchor';
  import { State as StoreState, ProgramAccount } from '../../store/reducer';
  import { ActionType } from '../../store/actions';
  import { useWallet } from './WalletProvider';
  import { TokenInstructions } from '@project-serum/serum';
  const { TOKEN_PROGRAM_ID, sleep, getTokenAccount, createMint, createTokenAccount, mintToAccount } = require('../../utils');

  export default function BootstrapProvider(props: PropsWithChildren<ReactNode>) {
    const { bootstrapTrigger, shutdownTrigger, network } = useSelector(
      (state: StoreState) => {
        return {
          bootstrapTrigger: state.common.bootstrapTrigger,
          shutdownTrigger: state.common.shutdownTrigger,
          network: state.common.network
        };
      },
    );
    const dispatch = useDispatch();
    const { wallet, idoClient} = useWallet();
    const { enqueueSnackbar } = useSnackbar();
  
    // Entry point for bootstrapping all the data for the app.
    const bootstrap = useCallback(async () => {
      enqueueSnackbar(`Connecting to ${network.label}`, {
        variant: 'info',
        autoHideDuration: 2500,
      });
  
      dispatch({
        type: ActionType.CommonAppWillBootstrap,
        item: {},
      });

      await refreshAccounts({
        dispatch,
        idoClient,
        network,
        wallet
      });
  
      dispatch({
        type: ActionType.CommonAppDidBootstrap,
        item: {},
      });
  
      enqueueSnackbar(`Connection established`, {
        variant: 'success',
        autoHideDuration: 2500,
      });
    }, [
      dispatch,
      enqueueSnackbar,
      idoClient,
      network,
      wallet,
    ]);
  
    const shutdown = useCallback(async () => {
      wallet.disconnect();
      dispatch({
        type: ActionType.CommonDidShutdown,
        item: {},
      });
    }, [dispatch, wallet]);
  
    useEffect(() => {
      if (bootstrapTrigger) {
        bootstrap().catch(err => {
          console.error(err);
          enqueueSnackbar(`Error bootstrapping application: ${err.toString()}`, {
            variant: 'error',
          });
        });
      }
      if (shutdownTrigger) {
        shutdown().catch(err => {
          console.error(err);
          enqueueSnackbar(`Error shutting down application: ${err.toString()}`, {
            variant: 'error',
          });
        });
      }
    }, [bootstrapTrigger, bootstrap, shutdownTrigger, shutdown, enqueueSnackbar]);
  
    return <>{props.children}</>;
  }

export async function refreshAccounts({
  dispatch,
  idoClient,
  network,
  wallet
}: any) {
  const poolAddress: PublicKey = network.idoPool;

  // All registrars.
  const poolAccounts: ProgramAccount[] = (
    await anchor.utils.rpc.getMultipleAccounts(
      idoClient.provider.connection,
      [poolAddress],
    )
  ).map(raw => {
    const account = idoClient.coder.accounts.decode(
      'PoolAccount',
      raw!.account.data,
    );
    return {
      publicKey: raw!.publicKey,
      account,
    };
  });

  console.log('Pool Account', poolAccounts[0]);

  // Mint for each registrar.
  const mints: ProgramAccount[] = (
    await anchor.utils.rpc.getMultipleAccounts(
      idoClient.provider.connection,
      poolAccounts.flatMap(r => [r.account.watermelonMint, r.account.redeemableMint]),
    )
  ).map(raw => {
    const account = parseMintAccount(raw!.account.data);
    return {
      publicKey: raw!.publicKey,
      account,
    };
  });

  console.log('Watermelon Mint',mints[0]);

    // All token accounts owned by the current user.
  const fetchOwnedTokenAccounts = async () => {
    const ownedTokenAccounts = await token.getOwnedTokenAccounts(
      idoClient.provider.connection,
      wallet.publicKey,
    );
    // dispatch({
    //   type: ActionType.CommonOwnedTokenAccountsSet,
    //   item: {
    //     ownedTokenAccounts,
    //   },
    // });
    return ownedTokenAccounts;
  };
  
  const [_poolSigner, nonce] = await anchor.web3.PublicKey.findProgramAddress(
    [mints[0].publicKey.toBuffer()],
    idoClient.programId
  );
  const poolSigner = _poolSigner;
  console.log('Pool Signer', poolSigner.toString());

  const firstDeposit = new anchor.BN(10_000_349);
  const poolAccount = poolAccounts[0];

  const redeemableMint: PublicKey = poolAccount.account.redeemableMint;
  const poolUsdc: PublicKey = poolAccount.account.poolUsdc;

  const usdcMint: PublicKey = new anchor.web3.PublicKey('B3QNZAzzCopug5veJ5r8uKT4q4kyBEUmEGWg7cECHsJp');

  const ownedTokenAccounts = await fetchOwnedTokenAccounts();

  const userUsdcs = ownedTokenAccounts.filter(tokenAccount => tokenAccount.account.mint.toString() === usdcMint.toString())
  let userUsdc: PublicKey
  if (userUsdcs.length > 0) {
    userUsdc = userUsdcs[0].publicKey;
  } else {
    userUsdc = await createTokenAccount(
      idoClient.provider,
      usdcMint,
      wallet.publicKey
    );
  }

  const userRedeemables = ownedTokenAccounts.filter(tokenAccount => tokenAccount.account.mint.toString() === redeemableMint.toString())
  let userRedeemable: PublicKey
  if (userRedeemables.length > 0) {
    userRedeemable = userRedeemables[0].publicKey;
  } else {
    userRedeemable = await createTokenAccount(
      idoClient.provider,
      redeemableMint,
      wallet.publicKey
    );
  }

  try {
    const tx = await idoClient.rpc.exchangeUsdcForRedeemable(firstDeposit, {
      accounts: {
        poolAccount: poolAccount.publicKey,
        poolSigner,
        redeemableMint,
        poolUsdc,
        userAuthority: wallet.publicKey,
        userUsdc,
        userRedeemable,
        tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      },
    });
    console.log(tx);
  } catch (err) {
    console.log("This is the error message", err.toString());
  }
}