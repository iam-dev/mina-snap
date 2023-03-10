import styled from 'styled-components';
import mina from 'assets/logo/mina-sm.svg';
import logo from 'assets/logo/logo.png';
import DropdownCommon from 'components/common/dropdown';
import wallet from 'assets/icons/wallet.png';
import { OPTIONS_NETWORK } from 'utils/constants';
import { PopperTooltipView } from 'components/common/tooltip';
import ButtonCommon from 'components/common/button';
import iconCreate from 'assets/icons/icon-create.svg';
import iconImport from 'assets/icons/icon-import.svg';
import CardAccount from 'components/modules/CardAccount';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { Box } from '@mui/material';
import React from 'react';
import { useMinaSnap } from 'services';
import ModalCommon from 'components/common/modal';
import CreatNameAccount from 'components/children/CreatNameAccount';
import { setActiveAccount, setIsLoading, setTransactions } from 'slices/walletSlice';
import LinearProgress from '@mui/material/LinearProgress';
import { ResultCreateAccount } from 'types/account';
import DetailsAccoust from 'components/children/DetailsAccoust';
import { ethers } from 'ethers';

const Header = () => {
  const { ChangeAccount, getAccountInfors, getTxHistory } = useMinaSnap();
  const { isShowListAccount } = useAppSelector((state) => state.modals);
  const { accounts, activeAccount, isLoading } = useAppSelector((state) => state.wallet);
  const dispatch = useAppDispatch();
  const [openModal, setOpenModal] = React.useState(false);
  const [typeModal, setTypeModal] = React.useState('create');
  const [isShowDetail, setIsShowDetail] = React.useState(false);

  const handleChangeAccount = async (item: any) => {
    dispatch(setIsLoading(true));
    const payload = {
      accountIndex: item.index,
      isImported: item.isImported,
    };

    await ChangeAccount(payload);
    const accountInfor = await getAccountInfors();
    const txList = await getTxHistory();
    dispatch(setTransactions(txList));
    dispatch(
      setActiveAccount({
        activeAccount: accountInfor.publicKey as string,
        balance: ethers.utils.formatUnits(accountInfor.balance.total, 'gwei') as string,
        accountName: accountInfor.name as string,
        inferredNonce: accountInfor.inferredNonce as string,
      }),
    );

    dispatch(setIsLoading(false));
  };

  const closeModal = (accounts: ResultCreateAccount) => {
    setOpenModal(false);

    dispatch(
      setActiveAccount({
        activeAccount: accounts.address as string,
        balance: accounts.balance as string,
        accountName: accounts.name as string,
        inferredNonce: accounts.inferredNonce as string,
      }),
    );
  };

  const styleActive = {
    padding: '2px 8px 4px 9px',
    borderRadius: '50%',
    background: '#D9D9D9',
  };

  const styleInactive = {
    padding: '2px 8px 4px 9px',
    borderRadius: '50%',
  };

  const handleClickCreat = () => {
    setIsShowDetail(false);
    setOpenModal(true);
    setTypeModal('create');
  };

  const handleClickImport = () => {
    setIsShowDetail(false);
    setOpenModal(true);
    setTypeModal('import');
  };

  const showDetails = () => {
    setIsShowDetail(true);
    setOpenModal(true);
  };

  return (
    <>
      <Wrapper>
        <BoxLogo>
          <Logo />
          <Title />
        </BoxLogo>
        <WDropDown>
          <DropDownNetwork options={OPTIONS_NETWORK} />
          <AccountDetails
            closeTrigger="click"
            offSet={[-140, 10]}
            content={
              <AccountDetailsContent>
                <Label>Account Management</Label>
                {isLoading && <LinearProgressCustom />}
                <WAccount className={isLoading ? 'disable' : ''}>
                  {accounts.map((item, index) => {
                    return (
                      <Box
                        key={index}
                        onClick={() => {
                          handleChangeAccount(item);
                        }}
                      >
                        <CardAccount
                          handleShowDetail={showDetails}
                          active={activeAccount === item.address}
                          data={item}
                          imported={item.isImported}
                        ></CardAccount>
                      </Box>
                    );
                  })}
                </WAccount>
                <WButton>
                  <ButtonCreate className={isLoading ? 'disable' : ''} onClick={handleClickCreat}>
                    <ICreate />
                    Create
                  </ButtonCreate>
                  <ButtonImport className={isLoading ? 'disable' : ''} onClick={handleClickImport}>
                    <IImport />
                    Import
                  </ButtonImport>
                </WButton>
              </AccountDetailsContent>
            }
          >
            <Box style={isShowListAccount ? styleActive : styleInactive}>
              <Wallet />
            </Box>
          </AccountDetails>
        </WDropDown>
      </Wrapper>
      <ModalCommon
        open={openModal}
        title={isShowDetail ? 'Account Details' : 'Account Name'}
        setOpenModal={() => {
          setOpenModal(false);
        }}
      >
        {isShowDetail ? (
          <DetailsAccoust></DetailsAccoust>
        ) : (
          <CreatNameAccount
            type={typeModal}
            onCloseModal={(accounts) => {
              closeModal(accounts);
            }}
            index={accounts.length + 1}
          ></CreatNameAccount>
        )}
      </ModalCommon>
    </>
  );
};

const Wrapper = styled.div`
  font-family: 'Inter Regular';
  background-color: ${(props) => props.theme.palette.grey.grey3};
  position: fixed;
  width: 1040px;
  height: 124px;
  left: 50%;
  transform: translate(-50%, 0);
  display: flex;
  justify-content: space-between;
  @media (max-width: 1024px) {
    width: 896px;
  }
`;

const BoxLogo = styled.div`
  padding-top: 40px;
  display: flex;
  align-items: center;
  height: 100%;
`;

const Logo = styled.img.attrs(() => ({
  src: logo,
}))`
  padding-right: 4px;
  width: 32px;
`;

const Title = styled.img.attrs(() => ({
  src: mina,
}))``;

const WDropDown = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

const DropDownNetwork = styled(DropdownCommon)`
  width: 170px;
  height: 32px;
  margin-right: 20px;
`;

const AccountDetails = styled(PopperTooltipView)`
  padding: 2px 8px 4px 9px;
  border-radius: 50%;
  background: #d9d9d9;
`;

const AccountDetailsContent = styled.div`
  font-family: 'Inter Regular';
  display: flex;
  flex-direction: column;
  min-width: 300px;
`;

const Label = styled.div`
  line-height: 17px;
  font-size: 17px;
  color: #000;
  font-weight: 600;
  padding: 16px 0;
`;

const WAccount = styled.div`
  max-height: 330px;
  overflow-y: auto;
  padding: 16px;
  .disable {
    background-color: palegreen !important;
  }
`;

const WButton = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px 16px;
`;

const ButtonCreate = styled(ButtonCommon)`
  width: 118px;
  height: 34px;
  background: ${(props) => props.theme.palette.default.main};
  color: ${(props) => props.theme.palette.default.contrastText};
  font-size: ${(props) => props.theme.typography.p1.fontSize};
  font-weight: ${(props) => props.theme.typography.p1.fontWeight};
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonImport = styled(ButtonCommon)`
  width: 118px;
  height: 34px;
  background: ${(props) => props.theme.palette.default.contrastText};
  color: ${(props) => props.theme.palette.default.main};
  font-size: ${(props) => props.theme.typography.p1.fontSize};
  font-weight: ${(props) => props.theme.typography.p1.fontWeight};
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ICreate = styled.img.attrs(() => ({
  src: iconCreate,
}))`
  padding-right: 8px;
`;

const IImport = styled.img.attrs(() => ({
  src: iconImport,
}))`
  padding-right: 8px;
`;

const Wallet = styled.img.attrs(() => ({
  src: wallet,
}))`
  margin-top: 6px;
  width: 36px;

  :hover {
    cursor: pointer;
  }
`;
const LinearProgressCustom = styled(LinearProgress)({
  height: '2px !important',
});
export default Header;
