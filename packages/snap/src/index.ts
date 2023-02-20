import { OnRpcRequestHandler } from '@metamask/snap-types';
import { EMinaMethod } from './constants/mina-method.constant';
import { sendTransaction, getNetworkConfig, changeNetwork, resetSnapConfiguration } from './mina';
import { TxInput } from './interfaces';
import { popupDialog } from './util/popup.util';
import { changeAccount, getAccountInfo, getKeyPair, signMessage } from './mina/account';
import { ESnapDialogType } from './constants/snap-method.constant';
import { ENetworkName } from './constants/config.constant';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns .
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_confirm` call failed.
 */

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  const networkConfig = await getNetworkConfig(snap);
  console.log(`-networkConfig:`, networkConfig);
  switch (request.method) {
    case EMinaMethod.HELLO: {
      return popupDialog(ESnapDialogType.CONFIRMATION, 'Hello Mina', 'Hello');
    }

    case EMinaMethod.ACCOUNT_INFO: {
      const { publicKey } = await getKeyPair(networkConfig);
      const { account } = await getAccountInfo(publicKey, networkConfig);
      return account;
    }

    case EMinaMethod.CHANGE_NETWORK: {
      const { networkName } = request.params as { networkName: ENetworkName };
      const newNetwork = await changeNetwork(snap, networkName);
      return newNetwork;
    }

    case EMinaMethod.CHANGE_ACCOUNT: {
      const { accountIndex } = request.params as { accountIndex: number };
      const accountInfo = await changeAccount(accountIndex);
      return accountInfo;
    }

    // case EMinaMethod.IMPORT_ACCOUNT: {
    //   const { privateKey } = request.params as { privateKey: string }
    // }

    case EMinaMethod.NETWORK_CONFIG: {
      return networkConfig;
    }

    case EMinaMethod.SEND_PAYMENT: {
      const txInput = request.params as TxInput;
      const response = await sendTransaction(txInput, networkConfig);
      console.log('sendTxResponse:', response);

      return response;
    }

    case EMinaMethod.SIGN_MESSAGE: {
      const keyPair = await getKeyPair(networkConfig);
      const { message } = request.params as { message: string };
      const signature = await signMessage(message, keyPair, networkConfig);
      console.log('signature:', signature);

      return signature;
    }

    case EMinaMethod.RESET_CONFIG: {
      return resetSnapConfiguration(snap);
    }

    default:
      throw new Error('Method not found.');
  }
};
