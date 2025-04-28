import { useState } from "react";

type MessageType = "error" | "success" | "warning";

interface TemporaryMessage {
  type: MessageType;
  message: string;
}

const useTemporaryMessage = () => {
  const [message, setMessage] = useState<TemporaryMessage | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showTemporaryMessage = (
    type: MessageType,
    messageText: string,
    duration = 2500
  ) => {
    setMessage({ type, message: messageText });

    // ⚡ Activar la visibilidad en el siguiente "tick" para que aplique bien el fade-in
    setTimeout(() => {
      setIsVisible(true);
    }, 0);

    // 👇 Después del tiempo de duración, hacer fade-out
    setTimeout(() => {
      setIsVisible(false);
    }, duration);

    // 👇 Luego de que termine el fade-out (ej: 500ms más), borrar el mensaje
    setTimeout(() => {
      setMessage(null);
    }, duration + 500);
  };

  return { message, isVisible, showTemporaryMessage };
};

export default useTemporaryMessage;
