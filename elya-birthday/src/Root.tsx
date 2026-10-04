import "./index.css";
import { Composition } from "remotion";
import { Birthday, FPS, TOTAL_FRAMES } from "./Birthday";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ElyaBirthday"
      component={Birthday}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};
