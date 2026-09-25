import "./index.css";
import { MyComposition } from "./Composition";
import { SegmentCompositions } from "./Segments";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <SegmentCompositions />
    </>
  );
};
