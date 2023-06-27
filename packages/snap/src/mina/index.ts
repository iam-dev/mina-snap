import { ESnapDialogType } from '../constants/snap-method.constant';
import { NetworkConfig, StakeTxInput, TxInput, ZkAppTxInput } from '../interfaces';
import { popupDialog, popupNotify } from '../util/popup.util';
import { getKeyPair } from './account';
import { submitPayment, submitStakeDelegation, signPayment, signStakeDelegation, signZkAppTx, submitZkAppTx } from './transaction';

export { getSnapConfiguration, changeNetwork, getNetworkConfig, resetSnapConfiguration } from './configuration';

export const sendPayment = async (args: TxInput, networkConfig: NetworkConfig) => {
  const { publicKey, privateKey } = await getKeyPair();

  const confirmation = await popupDialog(
    ESnapDialogType.CONFIRMATION,
    'Confirm payment transaction',
    `| From: ${publicKey}\n| To: ${args.to}\n| Amount: ${args.amount} ${networkConfig.token.symbol}\n| Fee: ${args.fee} ${networkConfig.token.symbol}`,
  );
  if (!confirmation) {
    await popupNotify('Payment rejected');
    return null;
  }

  const signedPayment = await signPayment(args, publicKey, privateKey, networkConfig);
  if (!signedPayment) {
    await popupNotify('Sign payment error');
    return null;
  }

  const payment = await submitPayment(signedPayment, networkConfig);
  if (!payment || payment.failureReason) {
    await popupNotify('Submit payment error');
    return null;
  }

  return payment;
};

export const sendStakeDelegation = async (args: StakeTxInput, networkConfig: NetworkConfig) => {
  const { publicKey, privateKey } = await getKeyPair();

  const confirmation = await popupDialog(
    ESnapDialogType.CONFIRMATION,
    'Confirm stake delegation transaction',
    `Block producer address: ${args.to}\n| From: ${publicKey}\n| Fee: ${args.fee} ${networkConfig.token.symbol}`,
  );
  if (!confirmation) {
    await popupNotify('Stake delegation transaction rejected');
    return null;
  }

  const signedStakeTx = await signStakeDelegation(args, publicKey, privateKey, networkConfig);
  if (!signedStakeTx) {
    await popupNotify('Sign stake delegation transaction error');
    return null;
  }

  const stakeTx = await submitStakeDelegation(signedStakeTx, networkConfig);
  if (!stakeTx || stakeTx.failureReason) {
    await popupNotify('Submit stake delegation error');
    return null;
  }

  return stakeTx;
}

export const sendZkAppTx = async (args: ZkAppTxInput, networkConfig: NetworkConfig) => {
  const { publicKey, privateKey } = await getKeyPair();
  let zkAppTransactionDetails = ''
  try {
    const transactionObject = JSON.parse(args.transaction)
    for (const updateData of transactionObject.accountUpdates) {
      const { publicKey, update } = updateData?.body
      zkAppTransactionDetails += `\n| ZkApp address: ${publicKey} \n| Update states: ${JSON.stringify(update?.appState)}`
    }
  } catch (error) {
    zkAppTransactionDetails = '\n| Failed to parse the zkApp transaction'
    console.error("Failed to parse the zkApp transaction details:", args.transaction)
  }
  const confirmation = await popupDialog(
    ESnapDialogType.CONFIRMATION,
    'Confirm ZKApp transaction',
    `You are going to submit a ZkApp transaction on ${networkConfig.name} \n| From: ${publicKey}\n| Fee: ${args.feePayer.fee} ${networkConfig.token.symbol} ${zkAppTransactionDetails}`,
  );
  if (!confirmation) {
    await popupNotify('Transaction rejected');
    return null;
  }

  const signedZkAppTx = await signZkAppTx(args, publicKey, privateKey, networkConfig);
  if (!signedZkAppTx) {
    await popupNotify('Sign ZkApp transaction error');
    return null;
  }

  const submitZkAppTxResult = await submitZkAppTx(signedZkAppTx, networkConfig);
  if (!submitZkAppTxResult || submitZkAppTxResult.failureReason) {
    await popupNotify('Submit ZkApp tx error');
    return null;
  }

  return submitZkAppTxResult;
}
