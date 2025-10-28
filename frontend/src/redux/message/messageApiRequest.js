import {
  getMessagesStartFor,
  getMessagesSuccessFor,
  getMessagesFailedFor,
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
  dispatch(getMessagesStartFor(chatId)); // keep items; just flip isFetching
  try {
    const res = await axiosJWT.get(`/v1/message/${chatId}`, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(getMessagesSuccessFor({ chatId, messages: res.data }));
  } catch (err) {
    console.log(err);
    dispatch(getMessagesFailedFor(chatId));
  }
};

// newMessage: { content, chatId }
export const sendMessage = async (
  newMessage,
  dispatch,
  accessToken,
  axiosJWT
) => {
  dispatch && dispatch(sendMessageStart());
  try {
    const res = await axiosJWT.post(`/v1/message/`, newMessage, {
      headers: { token: `Bearer ${accessToken}` },
    });

    // Immediately add the real message so it doesn't "disappear" waiting for socket echo
    dispatch &&
      dispatch(
        sendMessageSuccess({ chatId: newMessage.chatId, message: res.data })
      );
    return res.data;
  } catch (err) {
    console.log(err);
    dispatch && dispatch(sendMessageFailed());
  }
};
