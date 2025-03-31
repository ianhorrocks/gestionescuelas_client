import { useState } from "react";

type MessageType = "error" | "success" | "warning";

interface TemporaryMessage {
  type: MessageType;
  message: string;
}

const useTemporaryMessage = () => {
  const [message, setMessage] = useState<TemporaryMessage | null>(null);

  const showTemporaryMessage = (
    type: MessageType,
    message: string,
    duration = 3000
  ) => {
    setMessage({ type, message });
    setTimeout(() => {
      setMessage(null);
    }, duration);
  };

  return { message, showTemporaryMessage };
};

export default useTemporaryMessage;
