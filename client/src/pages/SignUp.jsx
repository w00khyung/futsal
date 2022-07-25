import Title from 'components/atoms/Title';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled, { keyframes } from 'styled-components';
import * as Api from 'api/api';
import Button from 'components/atoms/Button';
import ModalWrapper from 'components/atoms/AdminModalWrapper';
import ModalDiv from 'components/atoms/AdminModalDiv';
import Input from '../components/atoms/Input';

const SignUp = () => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const [isEmailValid, setIsEmailValid] = useState(false);

  const onSubmit = async (data) => {
    try {
      if (!isEmailValid) {
        alert('이메일 인증을 진행해주세요!');
        return;
      }
      const result = await Api.post('auth/signup', data);
      if (result.status === 200) {
        alert('회원가입에 성공하였습니다!');
      } else {
        alert(result.data.message);
      }
    } catch (err) {
      alert(err.response.data.reason);
    }
  };

  const [isOpenModal, setIsOpenModal] = useState(false);
  const toggleModal = () => {
    setIsOpenModal((prev) => !prev);
  };
  const validateEmail = async () => {
    const { email } = getValues();
    if (email) {
      try {
        const result = await Api.post('mail', { mail: email });
        if (result.status === 200) {
          setIsOpenModal(true);
        } else {
          alert(result.data.message);
        }
      } catch (err) {
        alert(err.response.data.reason);
      }
    }
  };

  const [emailCode, setEmailCode] = useState('');
  const handleValidEmailCode = async () => {
    try {
      const { email } = getValues();
      const result = await Api.post('mail/check-code', {
        code: emailCode,
        mail: email,
      });
      if (result.status === 200) {
        alert(result.data.message);
        setIsEmailValid(true);
        toggleModal();
      } else {
        alert(result.data.message);
      }
    } catch (err) {
      alert(err.response.data.reason);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <StyledTitle>회원 가입</StyledTitle>

      <InputTitle>이름</InputTitle>
      <StyledInput
        type='text'
        {...register('name', {
          required: '이름을 입력해주세요.',
          minLength: {
            value: 2,
            message: '이름은 최소 2글자 이상이어야 합니다.',
          },
        })}
        placeholder='이름을 입력해주세요. (최소 2자 이상)'
      />
      <ErrorMessage>{errors.name?.message}</ErrorMessage>

      <InputTitle>이메일</InputTitle>
      <Wrapper>
        <StyledInput
          type='email'
          {...register('email', {
            required: '이메일을 입력해주세요.',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: '이메일 형식으로 입력해주세요.',
            },
          })}
          placeholder='이메일을 입력해주세요.'
          disabled={isEmailValid}
        />
        <StyledButton
          type='button'
          onClick={validateEmail}
          disabled={isEmailValid}
        >
          {isEmailValid ? '인증 완료' : '이메일 인증'}
        </StyledButton>
      </Wrapper>
      <ErrorMessage>{errors.email?.message}</ErrorMessage>
      {isOpenModal && (
        <StyledModalWrapper onClick={toggleModal}>
          <EmailModal onClick={(e) => e.stopPropagation()}>
            <Title>인증 코드</Title>
            <Wrapper>
              <StyledInput
                type='number'
                placeholder='인증 코드를 입력해주세요..'
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
              />
              <StyledButton type='button' onClick={handleValidEmailCode}>
                확인
              </StyledButton>
            </Wrapper>
          </EmailModal>
        </StyledModalWrapper>
      )}

      <InputTitle>휴대전화 번호</InputTitle>
      <StyledInput
        type='number'
        {...register('phoneNumber', {
          required: '휴대전화 번호를 입력해주세요.',
          pattern: {
            value: /^[0-9\b]{0,11}$/,
            message: '올바른 휴대전화 형식이 아닙니다. (11자 초과)',
          },
        })}
        placeholder='"-"를 빼고 번호를 입력해주세요.'
      />
      <ErrorMessage>{errors.phoneNumber?.message}</ErrorMessage>

      <InputTitle>비밀번호</InputTitle>
      <StyledInput
        type='password'
        {...register('password', {
          required: '비밀번호를 입력해주세요.',
          minLength: {
            value: 8,
            message: '비밀번호는 최소 8자 이상이어야 합니다.',
          },
        })}
        placeholder='비밀번호를 입력해주세요. (최소 8자 이상)'
      />
      <ErrorMessage>{errors.password?.message}</ErrorMessage>

      <InputTitle>비밀번호 확인</InputTitle>
      <StyledInput
        type='password'
        {...register('passwordConfirmation', {
          required: '비밀번호를 확인해주세요.',
          validate: {
            matchesPreviousPassword: (value) => {
              const { password } = getValues();
              return password === value || '비밀번호가 일치하지 않습니다.';
            },
          },
        })}
        placeholder='비밀번호를 한번 더 입력해주세요.'
      />
      <ErrorMessage>{errors.passwordConfirmation?.message}</ErrorMessage>
      <SignUpButton type='submit' value='회원가입' />
    </Form>
  );
};

const Form = styled.form`
  width: 30rem;
  display: flex;
  flex-direction: column;
  margin: 2.5rem auto;
`;

const StyledTitle = styled(Title)`
  margin-bottom: 2rem;
`;

const InputTitle = styled.p`
  font-size: 1.2rem;
  margin: 1rem 0 0.5rem 0.3rem;
`;

const StyledInput = styled(Input)`
  &[type='number']::-webkit-inner-spin-button,
  &[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }
`;

const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledButton = styled(Button)`
  position: absolute;
  right: 0;
  height: 100%;
  border-radius: 0 4px 4px 0;

  :disabled {
    background: #868e96;
    pointer-events: none;
  }
`;

const ErrorMessage = styled.p`
  color: #f03e3e;
  margin: 0.5rem 0;
  text-align: right;
`;

const SignUpButton = styled(Input)`
  color: #ffffff;
  font-size: 1.5rem;
  background: #3563e9;
  margin-top: 1rem;
  cursor: pointer;
  &:hover {
    opacity: 0.7;
  }
`;

const StyledModalWrapper = styled(ModalWrapper)``;

const fadein = keyframes`
  0% {
    opacity: 0;
  } 100% {
    opacity: 1;
  }
`;

const EmailModal = styled(ModalDiv)`
  display: flex;
  justify-content: flex-start;
  align-items: baseline;
  width: 30%;
  height: 25%;
  top: 45%;
  left: 45%;
  padding: 2rem;
  animation: ${fadein} 0.3s ease-in;

  span {
    font-size: 27px;
    margin: 1rem 0;
  }

  div {
    width: 100%;
  }
`;

export default SignUp;
