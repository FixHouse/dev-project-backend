import { useEffect } from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { useAuthStore } from "./src/auth/auth.store";

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <AppNavigator />;
}
