import "./index.css";
import "./fonts";
import { ClipCompositions } from "./Clips";
import { EssayCompositions } from "./Essay";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <EssayCompositions />
      <ClipCompositions />
    </>
  );
};
