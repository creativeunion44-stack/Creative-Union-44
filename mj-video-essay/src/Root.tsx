import "./index.css";
import "./fonts";
import { ClipCompositions } from "./Clips";
import { EssayCompositions } from "./Essay";
import { MindMapComposition } from "./MindMap";
import { RoughCutComposition } from "./RoughCut";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <EssayCompositions />
      <ClipCompositions />
      <RoughCutComposition />
      <MindMapComposition />
    </>
  );
};
