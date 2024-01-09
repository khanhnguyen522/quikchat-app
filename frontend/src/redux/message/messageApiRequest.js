import axios from "axios";
import {
  getMessagesStart,
  getMessagesSuccess,
  getMessagesFailed,
  sendMessageStart,
  sendMessageSuccess,
  sendMessageFailed,
} from "./messageSlice";

export const getAllMessages = async (
  chatId,
  dispatch,
  accessToken,
  axiosJWT
) => {
  //   console.log(typeof accessToken);
  dispatch(getMessagesStart());
  try {
    const res = await axiosJWT.get(`/v1/message/${chatId}`, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(getMessagesSuccess(res.data));
  } catch (err) {
    console.log(err);
    dispatch(getMessagesFailed());
  }
};

export const sendMessage = async (
  newMessage,
  dispatch,
  accessToken,
  axiosJWT
) => {
  dispatch(sendMessageStart());
  try {
    const res = await axiosJWT.post(`/v1/message/`, newMessage, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(sendMessageSuccess(res.data));
  } catch (err) {
    console.log(err);
    dispatch(sendMessageFailed());
  }
};
