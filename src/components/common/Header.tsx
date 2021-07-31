import React, { useState, useEffect, ReactElement } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { networks } from '../../store/config';
import {
    State as StoreState,
    ProgramAccount,
    BootstrapState,
} from '../../store/reducer';
import { ActionType } from '../../store/actions';
import { useWallet } from './WalletProvider';

import { useSnackbar } from 'notistack';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Select from '@material-ui/core/Select';
import Menu from '@material-ui/core/Menu';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Button from '@material-ui/core/Button';
import PersonIcon from '@material-ui/icons/Person';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import RefreshIcon from '@material-ui/icons/Refresh';
import CircularProgress from '@material-ui/core/CircularProgress';

type HeaderProps = {
    isAppReady: boolean;
    member?: ProgramAccount;
};
  

export default function Header(props: HeaderProps) {
    const { isAppReady } = props;
    return (
        <AppBar
            position="static"
            style={{
                background: '#ffffff',
                color: '#272727',
                boxShadow: 'none',
                borderBottom: 'solid 1pt #ccc',
            }}
        >
            <Toolbar>
                <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                }}
                >
                    <NetworkSelector />
                    <WalletConnectButton
                        style={{
                        display: isAppReady ? 'none' : '',
                        }}
                    />
                    {isAppReady && <UserSelector />}
                </div>
            </Toolbar>
        </AppBar>
    )
}

function NetworkSelector() {
    const network = useSelector((state: StoreState) => {
      return state.common.network;
    });
    const dispatch = useDispatch();
    const [anchorEl, setAnchorEl] = useState(null);
  
    const handleClose = () => {
      setAnchorEl(null);
    };
  
    return (
      <div
        style={{
          marginRight: '10px',
          fontSize: '15px',
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Button
          color="inherit"
          onClick={e =>
            setAnchorEl(
              // @ts-ignore
              e.currentTarget,
            )
          }
        >
          <BubbleChartIcon />
          <Typography style={{ marginLeft: '5px', fontSize: '15px' }}>
            {network.label}
          </Typography>
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          style={{
            marginLeft: '12px',
            color: 'white',
          }}
        >
          {Object.keys(networks).map((n: string) => (
            <MenuItem
              key={n}
              onClick={() => {
                handleClose();
                dispatch({
                  type: ActionType.CommonSetNetwork,
                  item: {
                    network: networks[n],
                    networkKey: n,
                  },
                });
              }}
            >
              <Typography>{networks[n].label}</Typography>
            </MenuItem>
          ))}
        </Menu>
      </div>
    );
  }

type WalletConnectButtonProps = {
    style?: any;
};  

export function WalletConnectButton(
    props: WalletConnectButtonProps,
  ): ReactElement {
    const { showDisconnect } = useSelector((state: StoreState) => {
      return {
        showDisconnect: state.common.isWalletConnected,
      };
    });
    const dispatch = useDispatch();
    const { wallet, idoClient } = useWallet();
    const { enqueueSnackbar } = useSnackbar();
  
    // Wallet connection event listeners.
    useEffect(() => {
      wallet.on('disconnect', () => {
        enqueueSnackbar('Disconnected from wallet', {
          variant: 'info',
          autoHideDuration: 2500,
        });
        dispatch({
          type: ActionType.CommonWalletDidDisconnect,
          item: {},
        });
        dispatch({
          type: ActionType.CommonTriggerShutdown,
          item: {},
        });
      });
      wallet.on('connect', async () => {
        dispatch({
          type: ActionType.CommonWalletDidConnect,
          item: {},
        });
        dispatch({
          type: ActionType.CommonTriggerBootstrap,
          item: {},
        });
      });
    }, [wallet, dispatch, enqueueSnackbar, idoClient.provider.connection]);
  
    return showDisconnect ? (
      <Button
        style={props.style}
        color="inherit"
        onClick={() => wallet.disconnect()}
      >
        <ExitToAppIcon />
        <Typography style={{ marginLeft: '5px', fontSize: '15px' }}>
          Disconnect
        </Typography>
      </Button>
    ) : (
      <Button
        style={props.style}
        color="inherit"
        onClick={() => wallet.connect()}
      >
        <PersonIcon />
        <Typography style={{ marginLeft: '5px', fontSize: '15px' }}>
          Connect wallet
        </Typography>
      </Button>
    );
  }

  function UserSelector() {
    const { wallet } = useWallet();
  
    return (
      <Select
        displayEmpty
        renderValue={() => {
          return (
            <Typography style={{ overflow: 'hidden' }}>
              {wallet.publicKey?.toString()}
            </Typography>
          );
        }}
        style={{
          marginLeft: '12px',
          width: '150px',
        }}
        onChange={e => {
          if (e.target.value === 'disconnect') {
            wallet.disconnect();
          }
        }}
      >
        <MenuItem value="disconnect">
          <IconButton color="inherit">
            <ExitToAppIcon />
            <Typography style={{ marginLeft: '15px' }}>Disconnect</Typography>
          </IconButton>
        </MenuItem>
      </Select>
    );
  }
  