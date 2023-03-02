import Button from 'components/common/button';
import ModalCommon from 'components/common/modal';
import { ethers } from 'ethers';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import React from 'react';
import { useMinaSnap } from 'services';
import { connectWallet, setActiveAccount, setIsLoading, setListAccounts } from 'slices/walletSlice';
import styled from 'styled-components';
import { payloadSendTransaction } from 'types/transaction';

interface ModalProps {
  open: boolean;
  clickOutSide: boolean;
  setOpenModal: () => void;
  txInfoProp: payloadSendTransaction;
  closeSucces: () => void;
}
type ContainerProps = React.PropsWithChildren<Omit<ModalProps, 'closeSucces'>>;

const ModalConfirm = ({ open, clickOutSide, setOpenModal, txInfoProp, closeSucces }: ModalProps) => {
  const { SendTransaction, AccountList, getAccountInfors } = useMinaSnap();
  const { activeAccount } = useAppSelector((state) => state.wallet);
  const dispatch = useAppDispatch();

  const handleSend = async () => {
    dispatch(setIsLoading(true));
    await SendTransaction(txInfoProp)
      .then(async () => {
        const accountList = await AccountList();
        const accountInfor = await getAccountInfors();
        await dispatch(setListAccounts(accountList));
        dispatch(
          setActiveAccount({
            activeAccount: accountInfor.publicKey as string,
            balance: ethers.utils.formatUnits(accountInfor.balance.total, 'gwei') as string,
            accountName: accountInfor.name as string,
          }),
        );
        closeSucces();
      })
      .catch((e) => {
        console.log(e);
        dispatch(setIsLoading(false));
      })
      .finally(() => {
        dispatch(setIsLoading(false));
      });
  };
  return (
    <Modal
      open={open}
      title="Confirm Transaction  "
      clickOutSide={clickOutSide}
      setOpenModal={setOpenModal}
      txInfoProp={txInfoProp}
    >
      <WTransactionConfirm>
        <BoxAmount>
          <TitleAmount>Amount</TitleAmount>
          <Amount>{txInfoProp?.amount}</Amount>
        </BoxAmount>
        <BoxInfo>
          To
          <Content>{txInfoProp?.to}</Content>
        </BoxInfo>
        <BoxInfo>
          From
          <Content>{activeAccount}</Content>
        </BoxInfo>
        <BoxInfo>
          Fee
          <Content>{txInfoProp?.fee} MINA</Content>
        </BoxInfo>
        {txInfoProp?.nonce && (
          <BoxInfo>
            Nonce
            <Content>{txInfoProp.nonce}</Content>
          </BoxInfo>
        )}
        {txInfoProp?.memo && (
          <BoxInfo>
            Memo
            <Content>{txInfoProp.memo}</Content>
          </BoxInfo>
        )}
        <Button onClick={handleSend}>Confirm</Button>
      </WTransactionConfirm>
    </Modal>
  );
};

const Modal = styled(ModalCommon)<ContainerProps>`
  max-height: 300px;
`;

const WTransactionConfirm = styled.div`
  display: flex;
  flex-direction: column;
`;

const BoxAmount = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0px;
`;

const TitleAmount = styled.div`
  font-family: 'Inter Regular';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 15px;
`;

const Amount = styled.div`
  font-style: normal;
  font-weight: 500;
  font-size: 22px;
  line-height: 27px;
  color: #000000;
`;

const BoxInfo = styled.div`
  font-style: normal;
  font-weight: 300;
  font-size: 12px;
  line-height: 15px;
  color: #767677;
  padding: 10px 0;
`;

const Content = styled.div`
  max-width: 100%;
  word-wrap: break-word;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #000000;
`;
export default ModalConfirm;
