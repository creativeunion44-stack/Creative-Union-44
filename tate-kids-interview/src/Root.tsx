import "./index.css";
import { MyComposition } from "./Composition";
import { SegmentCompositions } from "./Segments";
import { BackgroundLoopComposition } from "./BackgroundLoop";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <SegmentCompositions />
      <BackgroundLoopComposition />
    </>
  );
};
