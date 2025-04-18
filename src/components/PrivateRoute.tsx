import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth"; // ya separado como lo hiciste

type Props = {
  children: JSX.Element;
};

const PrivateRoute = ({ children }: Props) => {
  const { loggedIn } = useAuth();

  if (!loggedIn) {
    return <Navigate to="/user/login" replace />;
  }

  return children;
};

export default PrivateRoute;
